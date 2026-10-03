import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [course, setCourse] = useState(null);
  const [related, setRelated] = useState([]);
  const [savedCourse, setSavedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCertForm, setShowCertForm] = useState(false);
  const [certForm, setCertForm] = useState({ name: '', organization: '', issueDate: '' });

  useEffect(() => {
    setLoading(true);
    api.get(`/courses/${id}`)
      .then(({ data }) => { setCourse(data.course); setRelated(data.related); })
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));

    if (user) {
      api.get('/saved-courses').then(({ data }) => {
        const match = data.savedCourses.find(sc => sc.courseId?._id === id);
        setSavedCourse(match || null);
      }).catch(() => {});
    }
  }, [id, user]);

  const handleSave = async () => {
    if (!user) { showToast('Log in to save courses', 'error'); return; }
    try {
      const { data } = await api.post('/saved-courses', { courseId: id });
      setSavedCourse(data.savedCourse);
      showToast('Course saved to your list');
    } catch (err) { showToast(getErrorMessage(err), 'error'); }
  };

  const handleComplete = async () => {
    try {
      const { data } = await api.put(`/saved-courses/${savedCourse._id}`, { completed: true });
      setSavedCourse(data.savedCourse);
      showToast('Marked as completed — skills updated');
    } catch (err) { showToast(getErrorMessage(err), 'error'); }
  };

  const handleAddCertificate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/certificates', { ...certForm, course: course.title });
      showToast('Certificate added');
      setShowCertForm(false);
      setCertForm({ name: '', organization: '', issueDate: '' });
    } catch (err) { showToast(getErrorMessage(err), 'error'); }
  };

  if (loading) return <div className="container" style={{ padding: '2rem 1.5rem' }}><Skeleton height={320} /></div>;
  if (error || !course) return <div className="container error-state">{error || 'Course not found'}</div>;

  const isUnavailable = course.status === 'unavailable' || course.status === 'broken';

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div className="grid grid-2" style={{ gridTemplateColumns: '1fr 1.4fr', gap: '2rem' }}>
        <img src={course.thumbnail} alt={course.title} style={{ width: '100%', borderRadius: 14, background: '#eef1f7' }} />
        <div>
          <div style={{ display: 'flex', gap: '.4rem', marginBottom: '.5rem' }}>
            <span className="badge badge-level">{course.level}</span>
            {course.free && <span className="badge badge-free">Free</span>}
          </div>
          <h1 style={{ marginTop: 0 }}>{course.title}</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>{course.platform} · {course.instructor} · {course.durationHours}h</p>
          <p>{course.description}</p>

          <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {course.skills.map(s => <span key={s} className="badge badge-level">{s}</span>)}
          </div>

          {isUnavailable && (
            <div className="form-error" style={{ marginBottom: '1rem' }}>This course link may no longer be available.</div>
          )}

          <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
            <a href={course.url} target="_blank" rel="noreferrer" className="btn btn-primary">Start Course</a>
            {!savedCourse && <button className="btn btn-secondary" onClick={handleSave}>Save Course</button>}
            {savedCourse && !savedCourse.completed && <button className="btn btn-secondary" onClick={handleComplete}>Mark as Completed</button>}
            {savedCourse?.completed && <span className="badge badge-free">Completed ✓</span>}
            {user && <button className="btn btn-ghost" onClick={() => setShowCertForm(s => !s)}>Add Certificate</button>}
          </div>

          {showCertForm && (
            <form onSubmit={handleAddCertificate} className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label>Certificate Name</label>
                <input className="input" required value={certForm.name} onChange={e => setCertForm({ ...certForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Issuing Organization</label>
                <input className="input" required value={certForm.organization} onChange={e => setCertForm({ ...certForm, organization: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Issue Date</label>
                <input className="input" type="date" required value={certForm.issueDate} onChange={e => setCertForm({ ...certForm, issueDate: e.target.value })} />
              </div>
              <button className="btn btn-primary btn-sm">Save Certificate</button>
            </form>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <h3>Related Courses</h3>
          <div className="grid grid-4">
            {related.map(r => (
              <Link key={r._id} to={`/courses/${r._id}`} className="card" style={{ padding: '1rem', color: 'var(--color-text)' }}>
                <strong style={{ fontSize: '.9rem' }}>{r.title}</strong>
                <div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>{r.platform}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
