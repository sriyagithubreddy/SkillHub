import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import Skeleton from '../components/Skeleton';
import CourseCard from '../components/CourseCard';
import {
  cacheSavedCourses,
  getCachedSavedCourses
} from '../utils/offlineStore';
import { getAllItems } from '../services/offlineDb';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [saved, setSaved] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [resumeCompletion, setResumeCompletion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const resolveSavedCourses = async (savedCourses) => {
      const cachedCourses = await getAllItems('courses');

      return savedCourses.map((item) => {
        if (!item) return item;

        // Backend already populated courseId.
        if (
          item.courseId &&
          typeof item.courseId === 'object'
        ) {
          return item;
        }

        // Otherwise resolve the course from IndexedDB.
        const courseId =
          typeof item.courseId === 'object'
            ? item.courseId?._id || item.courseId?.id
            : item.courseId;

        const course = cachedCourses.find(
          (c) =>
            String(c._id || c.id) ===
            String(courseId)
        );

        return {
          ...item,
          courseId: course || null
        };
      });
    };

    const loadDashboard = async () => {
      try {
        const [
          profileRes,
          savedRes,
          resumeRes
        ] = await Promise.all([
          api.get('/profile'),
          api.get('/saved-courses'),
          api.get('/resume')
        ]);

        if (cancelled) return;

        setStats(profileRes.data.stats);

        const savedCourses =
          savedRes.data.savedCourses || [];

        const resolvedSaved =
          await resolveSavedCourses(savedCourses);

        if (cancelled) return;

        setSaved(resolvedSaved);

        cacheSavedCourses(savedCourses).catch(() => {});

        const resume =
          resumeRes.data.resume || {};

        const fields = [
          resume.personalInfo?.fullName,
          resume.summary,
          resume.education?.length,
          resume.skills?.length,
          resume.projects?.length
        ];

        const filled =
          fields.filter(Boolean).length;

        setResumeCompletion(
          Math.round(
            (filled / fields.length) * 100
          )
        );

        const skillNames = new Set(
          (user?.skills || []).map(
            (s) => s.name.toLowerCase()
          )
        );

        const category =
          user?.interests?.[0];

        api.get('/courses', {
          params: {
            limit: 4,
            category,
            sort: 'popular'
          }
        })
          .then(({ data }) => {
            setRecommended(
              (data.courses || [])
                .filter(
                  (course) =>
                    !course.skills?.some(
                      (skill) =>
                        skillNames.has(
                          skill.toLowerCase()
                        )
                    )
                )
                .slice(0, 4)
            );
          })
          .catch(() => {});
      } catch {
        const cachedSaved =
          await getCachedSavedCourses();

        const resolvedSaved =
          await resolveSavedCourses(cachedSaved);

        if (!cancelled) {
          setSaved(resolvedSaved);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: '2rem 1.5rem' }}
      >
        <Skeleton height={200} />
      </div>
    );
  }

  const inProgress = saved
    .filter(
      (item) =>
        !item.completed &&
        item.courseId &&
        typeof item.courseId === 'object'
    )
    .slice(0, 4);

  const skillProgress =
    (user?.skills || [])
      .slice(0, 5)
      .map((skill) => ({
        name: skill.name,
        value:
          skill.level === 'Advanced'
            ? 85
            : skill.level === 'Intermediate'
              ? 55
              : 25
      }));

  return (
    <div
      className="container"
      style={{ padding: '2rem 1.5rem' }}
    >
      <h1>
        Welcome back,{' '}
        {user?.name?.split(' ')[0]}!
      </h1>

      <div
        className="grid grid-4"
        style={{ marginBottom: '2rem' }}
      >

        <StatCard
          label="Courses Completed"
          value={
            stats?.coursesCompleted ??
            saved.filter(
              (item) => item.completed
            ).length
          }
          accent="var(--color-success)"
        />

        <StatCard
          label="Certificates"
          value={stats?.certificates ?? 0}
          accent="var(--color-accent)"
        />

        <StatCard
          label="Resume Completion"
          value={`${resumeCompletion}%`}
          accent="var(--color-warning)"
        />
      </div>

      <div
        className="grid grid-2"
        style={{
          gridTemplateColumns: '1.1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        <div
          className="card"
          style={{ padding: '1.5rem' }}
        >
          <h3 style={{ marginTop: 0 }}>
            Learning Progress
          </h3>

          {skillProgress.length === 0 ? (
            <p
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '.9rem'
              }}
            >
              Add skills or complete a course
              to see progress here.
            </p>
          ) : (
            skillProgress.map((skill) => (
              <ProgressBar
                key={skill.name}
                label={skill.name}
                value={skill.value}
              />
            ))
          )}
        </div>

        <div
          className="card"
          style={{ padding: '1.5rem' }}
        >
          <h3 style={{ marginTop: 0 }}>
            Quick Actions
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '.6rem'
            }}
          >
            <Link
              to="/courses"
              className="btn btn-secondary"
            >
              Explore Courses
            </Link>

            <Link
              to="/saved-courses"
              className="btn btn-secondary"
            >
              View Saved Courses
            </Link>

            <Link
              to="/resume-builder"
              className="btn btn-secondary"
            >
              Build Resume
            </Link>

            <Link
              to="/certificates"
              className="btn btn-secondary"
            >
              Add Certificate
            </Link>

            <Link
              to="/profile"
              className="btn btn-secondary"
            >
              Update Profile
            </Link>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '.75rem'
        }}
      >
        <h3 style={{ margin: 0 }}>
          Continue Learning
        </h3>

        {inProgress.length > 0 && (
          <Link
            to="/saved-courses"
            style={{ fontSize: '.9rem' }}
          >
            View all
          </Link>
        )}
      </div>{inProgress.length > 0 && ( <div
          className="grid grid-4"
          style={{ marginBottom: '2rem' }}
        >
          {inProgress.map((item) => (
            <CourseCard
              key={item._id}
              course={item.courseId}
              saveState={{
                saved: true,
                completed: item.completed,
                progress: item.progress
              }}
            />
          ))}
        </div>
      )}

      {recommended.length > 0 && (
        <>
          <h3>Recommended For You</h3>

          <div className="grid grid-4">
            {recommended.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}


