import axios from 'axios';
import {
  getAllItems,
  getItem,
  saveItem,
  saveItems,
  deleteItem,
  queueAction,
  offlineDb
} from './offlineDb';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('skillhub_user') || 'null');
  } catch {
    return null;
  }
}

function getId(value) {
  return String(value?._id || value?.id || '');
}

async function cacheGetResponse(url, data) {
  try {
    if (url === '/courses' || url.startsWith('/courses?')) {
      if (Array.isArray(data?.courses)) {
        await saveItems('courses', data.courses);
      }
      return;
    }

    if (url.startsWith('/courses/')) {
      if (data?.course) {
        await saveItem('courses', data.course);
      }
      return;
    }

    if (url === '/saved-courses') {
      if (Array.isArray(data?.savedCourses)) {
        await offlineDb.savedCourses.clear();

        for (const item of data.savedCourses) {
          await saveItem('savedCourses', {
            ...item,
            id: getId(item)
          });
        }
      }
      return;
    }

    if (url === '/profile') {
      if (data?.user) {
        await saveItem('profile', {
          ...data.user,
          id: 'current'
        });
      }
      return;
    }

    if (url === '/resume') {
      if (data?.resume) {
        await saveItem('resume', {
          ...data.resume,
          id: 'current'
        });
      }
      return;
    }

    if (url === '/certificates') {
      if (Array.isArray(data?.certificates)) {
        await offlineDb.certificates.clear();

        for (const item of data.certificates) {
          await saveItem('certificates', {
            ...item,
            id: getId(item)
          });
        }
      }
    }
  } catch {
    // Cache failures must never break the online request.
  }
}

async function getOfflineResponse(url) {
  if (url === '/courses' || url.startsWith('/courses?')) {
    const courses = await getAllItems('courses');

    return {
      courses,
      total: courses.length,
      page: 1,
      pages: Math.max(1, Math.ceil(courses.length / 20))
    };
  }

  if (url.startsWith('/courses/')) {
    const id = url.split('/').pop();
    const courses = await getAllItems('courses');

    const course = courses.find(
      item => String(item._id || item.id) === String(id)
    );

    if (!course) {
      throw new Error('This course has not been cached for offline use yet.');
    }

    return {
      course,
      related: courses
        .filter(
          item =>
            String(item._id || item.id) !== String(id) &&
            item.category === course.category
        )
        .slice(0, 4)
    };
  }

  if (url === '/saved-courses') {
    return {
      savedCourses: await getAllItems('savedCourses')
    };
  }

  if (url === '/profile') {
    const profile = await getItem('profile', 'current');

    if (!profile) {
      throw new Error('Your profile has not been cached yet.');
    }

    const saved = await getAllItems('savedCourses');
    const certificates = await getAllItems('certificates');

    return {
      user: profile,
      stats: {
        coursesSaved: saved.length,
        coursesCompleted: saved.filter(s => s.completed).length,
        certificates: certificates.length,
        skills: Array.isArray(profile.skills) ? profile.skills.length : 0
      }
    };
  }

  if (url === '/resume') {
    const resume = await getItem('resume', 'current');

    if (!resume) {
      throw new Error('Your resume has not been cached yet.');
    }

    return {
      resume,
      autoPopulate: {
        skills: [],
        certifications: []
      }
    };
  }

  if (url === '/certificates') {
    return {
      certificates: await getAllItems('certificates')
    };
  }

  throw new Error('This data is not available offline yet.');
}

function makeSavedCourse(courseId, course) {
  const id = `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    _id: id,
    id,
    courseId: course || courseId,
    progress: 0,
    completed: false,
    offlinePending: true
  };
}

async function offlineWrite(config) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  let payload = config.data;

  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload);
    } catch {
      payload = {};
    }
  }

  if (method === 'post' && url === '/saved-courses') {
    const courses = await getAllItems('courses');
    const course = courses.find(
      c => String(c._id || c.id) === String(payload?.courseId)
    );

    const savedCourse = makeSavedCourse(payload?.courseId, course);

    await saveItem('savedCourses', savedCourse);

    await queueAction('SAVE_COURSE', {
      courseId: payload?.courseId,
      localSavedId: savedCourse._id
    });

    return {
      savedCourse
    };
  }

  if (method === 'put' && url.startsWith('/saved-courses/')) {
    const savedId = url.split('/').pop();
    const existing = await getItem('savedCourses', savedId);

    const updated = {
      ...(existing || {}),
      id: savedId,
      _id: existing?._id || savedId,
      completed: payload?.completed ?? existing?.completed ?? false,
      progress: payload?.progress ?? existing?.progress ?? 0
    };

    await saveItem('savedCourses', updated);

    await queueAction('COMPLETE_COURSE', {
      savedId
    });

    return {
      savedCourse: updated
    };
  }

  if (method === 'delete' && url.startsWith('/saved-courses/')) {
    const savedId = url.split('/').pop();

    await deleteItem('savedCourses', savedId);

    await queueAction('REMOVE_SAVED_COURSE', {
      savedId
    });

    return {
      message: 'Removed locally. It will sync when online.'
    };
  }

  if (method === 'put' && url === '/profile') {
    const current = await getItem('profile', 'current');
    const updated = {
      ...(current || getStoredUser() || {}),
      ...(payload || {}),
      id: 'current'
    };

    await saveItem('profile', updated);

    localStorage.setItem(
      'skillhub_user',
      JSON.stringify(updated)
    );

    await queueAction('UPDATE_PROFILE', {
      updates: payload
    });

    return {
      user: updated
    };
  }

  if (method === 'put' && url === '/resume') {
    const current = await getItem('resume', 'current');

    const updated = {
      ...(current || {}),
      ...(payload || {}),
      id: 'current'
    };

    await saveItem('resume', updated);

    await queueAction('UPDATE_RESUME', {
      updates: payload
    });

    return {
      resume: updated
    };
  }

  if (method === 'post' && url === '/certificates') {
    const id = `offline-cert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const certificate = {
      ...(payload || {}),
      _id: id,
      id,
      offlinePending: true
    };

    await saveItem('certificates', certificate);

    await queueAction('ADD_CERTIFICATE', {
      certificate: payload
    });

    return {
      certificate
    };
  }

  if (method === 'put' && url.startsWith('/certificates/')) {
    const id = url.split('/').pop();
    const current = await getItem('certificates', id);

    const certificate = {
      ...(current || {}),
      ...(payload || {}),
      _id: current?._id || id,
      id
    };

    await saveItem('certificates', certificate);

    await queueAction('UPDATE_CERTIFICATE', {
      id,
      certificate: payload
    });

    return {
      certificate
    };
  }

  if (method === 'delete' && url.startsWith('/certificates/')) {
    const id = url.split('/').pop();

    await deleteItem('certificates', id);

    await queueAction('DELETE_CERTIFICATE', {
      id
    });

    return {
      message: 'Certificate removed locally. It will sync when online.'
    };
  }

  throw new Error('This action is not available offline yet.');
}

api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('skillhub_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!navigator.onLine) {
    const method = (config.method || 'get').toLowerCase();

    if (method === 'get') {
      const data = await getOfflineResponse(config.url || '');

      return Promise.reject({
        __skillhubOfflineResponse: true,
        config,
        data,
        status: 200
      });
    }

    const data = await offlineWrite(config);

    return Promise.reject({
      __skillhubOfflineResponse: true,
      config,
      data,
      status: 200
    });
  }

  return config;
});

api.interceptors.response.use(
  async (res) => {
    if (res.config?.method?.toLowerCase() === 'get') {
      await cacheGetResponse(res.config.url || '', res.data);
    }

    return res;
  },
  async (err) => {
    if (err?.__skillhubOfflineResponse) {
      return Promise.resolve({
        data: err.data,
        status: 200,
        statusText: 'Offline',
        headers: {},
        config: err.config
      });
    }

    if (!err.response) {
      const method = (err.config?.method || 'get').toLowerCase();

      if (method === 'get') {
        try {
          const data = await getOfflineResponse(err.config?.url || '');

          return {
            data,
            status: 200,
            statusText: 'Offline fallback',
            headers: {},
            config: err.config
          };
        } catch {
          // Continue to the normal error below.
        }
      } else {
        try {
          const data = await offlineWrite(err.config);

          return {
            data,
            status: 200,
            statusText: 'Offline queued',
            headers: {},
            config: err.config
          };
        } catch {
          // Continue to normal error handling.
        }
      }
    }

    if (err.response?.status === 401) {
      localStorage.removeItem('skillhub_token');
      localStorage.removeItem('skillhub_user');

      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login?session=expired';
      }
    }

    return Promise.reject(err);
  }
);

export default api;

export const getErrorMessage = (err) => {
  if (err?.response?.data?.message) {
    return err.response.data.message;
  }

  if (err?.message) {
    return err.message;
  }

  if (err?.code === 'ERR_NETWORK' || !err?.response) {
    return `Can't reach the server at ${API_BASE_URL}.`;
  }

  return 'Something went wrong. Please try again.';
};
