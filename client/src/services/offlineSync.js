import api from './api';
import {
  getPendingActions,
  removePendingAction,
  saveItem,
  saveItems,
  deleteItem,
  offlineDb
} from './offlineDb';

let syncing = false;

async function replayAction(action) {
  const { type, payload } = action;

  switch (type) {
    case 'SAVE_COURSE': {
      const response = await api.post('/saved-courses', {
        courseId: payload.courseId
      });

      if (response.data?.savedCourse) {
        await saveItem('savedCourses', {
          ...response.data.savedCourse,
          id: String(
            response.data.savedCourse._id ||
            response.data.savedCourse.id
          )
        });
      }

      break;
    }

    case 'COMPLETE_COURSE': {
      if (!payload.savedId) break;

      const response = await api.put(
        `/saved-courses/${payload.savedId}`,
        { completed: true }
      );

      if (response.data?.savedCourse) {
        await saveItem('savedCourses', {
          ...response.data.savedCourse,
          id: String(
            response.data.savedCourse._id ||
            response.data.savedCourse.id
          )
        });
      }

      break;
    }

    case 'REMOVE_SAVED_COURSE': {
      if (!payload.savedId) break;

      await api.delete(`/saved-courses/${payload.savedId}`);
      await deleteItem('savedCourses', payload.savedId);

      break;
    }

    case 'UPDATE_PROFILE': {
      const response = await api.put('/profile', payload.updates);

      if (response.data?.user) {
        await saveItem('profile', {
          ...response.data.user,
          id: 'current'
        });

        localStorage.setItem(
          'skillhub_user',
          JSON.stringify(response.data.user)
        );
      }

      break;
    }

    case 'UPDATE_RESUME': {
      const response = await api.put('/resume', payload.updates);

      if (response.data?.resume) {
        await saveItem('resume', {
          ...response.data.resume,
          id: 'current'
        });
      }

      break;
    }

    case 'ADD_CERTIFICATE': {
      const response = await api.post(
        '/certificates',
        payload.certificate
      );

      if (response.data?.certificate) {
        await saveItem('certificates', {
          ...response.data.certificate,
          id: String(
            response.data.certificate._id ||
            response.data.certificate.id
          )
        });
      }

      break;
    }

    case 'UPDATE_CERTIFICATE': {
      const response = await api.put(
        `/certificates/${payload.id}`,
        payload.certificate
      );

      if (response.data?.certificate) {
        await saveItem('certificates', {
          ...response.data.certificate,
          id: String(
            response.data.certificate._id ||
            response.data.certificate.id
          )
        });
      }

      break;
    }

    case 'DELETE_CERTIFICATE': {
      await api.delete(`/certificates/${payload.id}`);
      await deleteItem('certificates', payload.id);
      break;
    }

    default:
      break;
  }
}

export async function syncOfflineData() {
  if (!navigator.onLine || syncing) return;

  syncing = true;

  try {
    const actions = await getPendingActions();

    for (const action of actions) {
      try {
        await replayAction(action);
        await removePendingAction(action.localId);
      } catch {
        // Stop here. The server may still be unavailable.
        break;
      }
    }
  } finally {
    syncing = false;
  }
}

export function startOfflineSync() {
  if (typeof window === 'undefined') return;

  window.addEventListener('online', () => {
    setTimeout(() => {
      syncOfflineData();
    }, 500);
  });

  if (navigator.onLine) {
    setTimeout(() => {
      syncOfflineData();
    }, 1000);
  }
}
