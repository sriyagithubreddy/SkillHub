import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import CourseCard from '../components/CourseCard';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import { Link } from 'react-router-dom';
import { getCachedSavedCourses } from '../utils/offlineStore';
import { getAllItems } from '../services/offlineDb';

export default function SavedCourses() {
  const { showToast } = useToast();
  const [savedCourses, setSavedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);

    try {
      let saved;

      if (navigator.onLine) {
        const { data } = await api.get('/saved-courses');
        saved = data.savedCourses || [];
      } else {
        saved = await getCachedSavedCourses();
      }

      const cachedCourses = await getAllItems('courses');

      const resolved = saved.map(item => {
        if (
          item.courseId &&
          typeof item.courseId === 'object'
        ) {
          return item;
        }

        const courseId =
          typeof item.courseId === 'object'
            ? item.courseId?._id
            : item.courseId;

        const course = cachedCourses.find(
          c =>
            String(c._id || c.id) ===
            String(courseId)
        );

        return {
          ...item,
          courseId: course || item.courseId
        };
      });

      setSavedCourses(resolved);
    } catch (err) {
      try {
        const cached = await getCachedSavedCourses();
        const cachedCourses = await getAllItems('courses');

        const resolved = cached.map(item => {
          const courseId =
            typeof item.courseId === 'object'
              ? item.courseId?._id
              : item.courseId;

          const course = cachedCourses.find(
            c =>
              String(c._id || c.id) ===
              String(courseId)
          );

          return {
            ...item,
            courseId:
              course ||
              item.courseId
          };
        });

        setSavedCourses(resolved);
      } catch {
        showToast(
          getErrorMessage(err),
          'error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleComplete = async (savedId) => {
    try {
      const { data } = await api.put(
        `/saved-courses/${savedId}`,
        { completed: true }
      );

      setSavedCourses(cs =>
        cs.map(c =>
          c._id === savedId
            ? {
                ...c,
                ...data.savedCourse,
                courseId:
                  data.savedCourse?.courseId ||
                  c.courseId
              }
            : c
        )
      );

      showToast('Marked as completed');
    } catch (err) {
      showToast(
        getErrorMessage(err),
        'error'
      );
    }
  };

  const handleRemove = async (savedId) => {
    try {
      await api.delete(
        `/saved-courses/${savedId}`
      );

      setSavedCourses(cs =>
        cs.filter(c =>
          c._id !== savedId
        )
      );

      showToast(
        'Removed from saved courses'
      );
    } catch (err) {
      showToast(
        getErrorMessage(err),
        'error'
      );
    }
  };

  const filtered = savedCourses.filter(s =>
    filter === 'all'
      ? true
      : filter === 'completed'
        ? s.completed
        : !s.completed
  );

  return (
    <div
      className="container"
      style={{
        padding: '2rem 1.5rem'
      }}
    >
      <h1>Saved Courses</h1>

      <div
        style={{
          display: 'flex',
          gap: '.5rem',
          marginBottom: '1.5rem'
        }}
      >
        {[
          'all',
          'in-progress',
          'completed'
        ].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${
              filter === f
                ? 'btn-primary'
                : 'btn-secondary'
            }`}
            onClick={() =>
              setFilter(f)
            }
          >
            {f === 'all'
              ? 'All'
              : f === 'in-progress'
                ? 'In Progress'
                : 'Completed'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-3">
          {Array.from({
            length: 3
          }).map((_, i) => (
            <Skeleton
              key={i}
              height={260}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          subtitle="Save a course to start tracking your progress."
          action={
            <Link
              to="/courses"
              className="btn btn-primary"
            >
              Explore Courses
            </Link>
          }
        />
      ) : (
        <div className="grid grid-3">
          {filtered.map(s => {
            const course =
              s.courseId &&
              typeof s.courseId === 'object'
                ? s.courseId
                : null;

            if (!course) return null;

            return (
              <div key={s._id}>
                <CourseCard
                  course={course}
                  saveState={{
                    saved: true,
                    completed:
                      s.completed,
                    progress:
                      s.progress
                  }}
                  onMarkCompleted={() =>
                    handleComplete(
                      s._id
                    )
                  }
                />

                <button
                  className="btn btn-ghost btn-sm"
                  style={{
                    marginTop: '.4rem'
                  }}
                  onClick={() =>
                    handleRemove(
                      s._id
                    )
                  }
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
