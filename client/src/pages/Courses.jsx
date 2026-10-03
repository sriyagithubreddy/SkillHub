import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CourseCard from '../components/CourseCard';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { saveItems, getAllItems, queueAction } from '../services/offlineDb';

const platforms = ['YouTube', 'SWAYAM', 'Microsoft Learn', 'freeCodeCamp',  ];

const categories = [
  'Data Science',
  'Artificial Intelligence',
  'Machine Learning',
  'Web Development',
  'App Development',
  'Cyber Security',
  'Cloud Computing',
  'Programming',
  'Database',
  'UI/UX',
  'Business',
  'Communication'
];

const levels = ['Beginner', 'Intermediate', 'Advanced'];

const PAGE_SIZE = 9;

function filterOfflineCourses(allCourses, filters) {
  let result = [...allCourses];

  const q = filters.q.trim().toLowerCase();

  if (q) {
    result = result.filter(course => {
      const searchable = [
        course.title,
        course.description,
        course.instructor,
        course.platform,
        course.category,
        ...(course.skills || [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(q);
    });
  }

  if (filters.platform) {
    result = result.filter(course => course.platform === filters.platform);
  }

  if (filters.category) {
    result = result.filter(course => course.category === filters.category);
  }

  if (filters.level) {
    result = result.filter(course => course.level === filters.level);
  }


  if (filters.sort === 'duration') {
    result.sort((a, b) => (a.durationHours || 0) - (b.durationHours || 0));
  } else if (filters.sort === 'newest') {
    result.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
  } else if (filters.sort === 'popular') {
    result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  } else {
    result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  return result;
}

export default function Courses() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);

  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    pages: 1
  });

  const filters = {
    q: searchParams.get('q') || '',
    platform: searchParams.get('platform') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    sort: searchParams.get('sort') || 'relevance',
    page: searchParams.get('page') || '1'
  };

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    if (key !== 'page') {
      next.set('page', '1');
    }
    setSearchParams(next);
  };

  useEffect(() => {
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      setLoading(true);
      setError('');

      const params = {
        ...filters,
        limit: PAGE_SIZE
      };

      if (user) {
        params.userId = user._id;
      }

      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      // Try the server first when online.
      if (navigator.onLine) {
        try {
          const { data } = await api.get('/courses', { params });

          if (cancelled) return;

          setCourses(data.courses || []);

          setMeta({
            total: data.total || 0,
            page: data.page || 1,
            pages: data.pages || 1
          });

          // Save the complete returned course objects locally.
          await saveItems(
            'courses',
            (data.courses || []).map(course => ({
              ...course,
              id: course._id
            }))
          );

          setOfflineMode(false);
          setLoading(false);
          return;
        } catch (err) {
          // If the server cannot be reached, fall through to IndexedDB.
          if (cancelled) return;
        }
      }

      // Offline fallback.
      try {
        const cachedCourses = await getAllItems('courses');

        if (cancelled) return;

        if (cachedCourses.length === 0) {
          setCourses([]);
          setMeta({
            total: 0,
            page: 1,
            pages: 1
          });

          setError(
            'No courses are available offline yet. Connect to the internet once to download courses.'
          );

          setLoading(false);
          return;
        }

        const filtered = filterOfflineCourses(cachedCourses, filters);

        const page = Number(filters.page) || 1;
        const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

        const safePage = Math.min(page, pages);

        const start = (safePage - 1) * PAGE_SIZE;
        const pageCourses = filtered.slice(start, start + PAGE_SIZE);

        setCourses(pageCourses);

        setMeta({
          total: filtered.length,
          page: safePage,
          pages
        });

        setOfflineMode(true);
      } catch (err) {
        setError('Unable to load cached courses.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      cancelled = true;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user]);

  const handleSave = async courseId => {
    if (!user) {
      showToast('Log in to save courses', 'error');
      return;
    }

    try {
      if (navigator.onLine) {
        await api.post('/saved-courses', { courseId });

        showToast('Course saved');

        setCourses(current =>
          current.map(course =>
            course._id === courseId
              ? {
                  ...course,
                  saveState: {
                    saved: true,
                    completed: false,
                    progress: 0
                  }
                }
              : course
          )
        );

        return;
      }

      // Offline: queue the save operation.
      await queueAction('SAVE_COURSE', {
        courseId,
        userId: user._id
      });

      setCourses(current =>
        current.map(course =>
          course._id === courseId
            ? {
                ...course,
                saveState: {
                  saved: true,
                  completed: false,
                  progress: 0,
                  offlinePending: true
                }
              }
            : course
        )
      );

      showToast('Course saved offline. It will sync when you reconnect.');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <h1>Explore Courses</h1>

      {offlineMode && (
        <div
          className="card"
          style={{
            padding: '.75rem 1rem',
            marginBottom: '1rem',
            borderLeft: '4px solid var(--color-primary)'
          }}
        >
          <strong>Offline mode</strong>
          <div style={{ fontSize: '.85rem', marginTop: '.25rem' }}>
            Showing courses saved on this device.
          </div>
        </div>
      )}

      <div
        className="card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '.75rem',
          alignItems: 'center'
        }}
      >
        <input
          className="input"
          style={{ maxWidth: 260 }}
          placeholder="Search title, skill or tech…"
          defaultValue={filters.q}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              updateFilter('q', e.target.value);
            }
          }}
        />

        <select
          className="input"
          style={{ maxWidth: 160 }}
          value={filters.platform}
          onChange={e => updateFilter('platform', e.target.value)}
        >
          <option value="">All Platforms</option>
          {platforms.map(platform => (
            <option key={platform} value={platform}>
              {platform}
            </option>
          ))}
        </select>

        <select
          className="input"
          style={{ maxWidth: 180 }}
          value={filters.category}
          onChange={e => updateFilter('category', e.target.value)}
        >
          <option value="">All Domains</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="input"
          style={{ maxWidth: 150 }}
          value={filters.level}
          onChange={e => updateFilter('level', e.target.value)}
        >
          <option value="">All Levels</option>
          {levels.map(level => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>

        <select
          className="input"
          style={{ maxWidth: 150 }}
          value={filters.sort}
          onChange={e => updateFilter('sort', e.target.value)}
        >
          <option value="relevance">Relevance</option>
          <option value="duration">Duration</option>
          <option value="newest">Newest</option>
          <option value="popular">Popular</option>
        </select>

        
      </div>

      {error && <div className="error-state">{error}</div>}

      {loading ? (
        <div className="grid grid-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={260} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses match those filters"
          subtitle="Try broadening your search or clearing a filter."
        />
      ) : (
        <>
          <p
            style={{
              color: 'var(--color-text-muted)',
              fontSize: '.85rem'
            }}
          >
            {meta.total} course{meta.total !== 1 ? 's' : ''} found
          </p>

          <div className="grid grid-3">
            {courses.map(course => (
              <CourseCard
                key={course._id || course.id}
                course={course}
                saveState={course.saveState}
                onSave={handleSave}
              />
            ))}
          </div>

          {meta.pages > 1 && (() => {
            const currentPage = Number(meta.page) || 1;
            const totalPages = Number(meta.pages) || 1;

            const pageNumbers = [];

            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
              }
            } else {
              pageNumbers.push(1);

              if (currentPage > 4) {
                pageNumbers.push('...');
              }

              const start = Math.max(2, currentPage - 1);
              const end = Math.min(
                totalPages - 1,
                currentPage + 1
              );

              for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
              }

              if (currentPage < totalPages - 3) {
                pageNumbers.push('...');
              }

              pageNumbers.push(totalPages);
            }

            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '.4rem',
                  flexWrap: 'wrap',
                  marginTop: '2rem'
                }}
              >
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage === 1}
                  onClick={() =>
                    updateFilter(
                      'page',
                      String(Math.max(1, currentPage - 1))
                    )
                  }
                >
                  &lt; Previous
                </button>

                {pageNumbers.map((pageNumber, index) =>
                  pageNumber === '...' ? (
                    <span
                      key={`ellipsis-${index}`}
                      style={{
                        padding: '0 .35rem',
                        color: '#64748b',
                        fontWeight: 600
                      }}
                    >......</span>
                  ) : (
                    <button
                      key={pageNumber}
                      className={`btn btn-sm ${
                        currentPage === pageNumber
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                      onClick={() =>
                        updateFilter(
                          'page',
                          String(pageNumber)
                        )
                      }
                    >
                      {pageNumber}
                    </button>
                  )
                )}

                <button
                  className="btn btn-secondary btn-sm"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    updateFilter(
                      'page',
                      String(
                        Math.min(
                          totalPages,
                          currentPage + 1
                        )
                      )
                    )
                  }
                >
                  Next &gt;
                </button>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}





