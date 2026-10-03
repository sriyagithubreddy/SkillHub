import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import Skeleton from '../components/Skeleton';

const emptyCourse = {
  title: '', description: '', platform: 'YouTube', category: 'Programming', skills: '',
  level: 'Beginner', durationHours: 1, url: '', thumbnail: '', free: true
};

export default function Admin() {
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [broken, setBroken] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyCourse);
  const [editingId, setEditingId] = useState(null);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/courses', { params: { limit: 50 } }),
      api.get('/admin/courses/broken')
    ]).then(([statsRes, usersRes, coursesRes, brokenRes]) => {
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setCourses(coursesRes.data.courses);
      setBroken(brokenRes.data.courses);
    }).catch(err => showToast(getErrorMessage(err), 'error')).finally(() => setLoading(false));
  };
  useEffect(loadAll, []);

  const resetForm = () => { setForm(emptyCourse); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean), durationHours: Number(form.durationHours) };
    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, payload);
        showToast('Course updated');
      } else {
        await api.post('/courses', payload);
        showToast('Course added');
      }
      resetForm();
      loadAll();
    } catch (err) { showToast(getErrorMessage(err), 'error'); }
  };

  const handleEdit = (course) => {
    setForm({ ...course, skills: course.skills.join(', ') });
    setEditingId(course._id);
    setTab('courses');
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/courses/${id}`);
      showToast('Course marked unavailable');
      loadAll();
    } catch (err) { showToast(getErrorMessage(err), 'error'); }
  };

  if (loading) return <div className="container" style={{ padding: '2rem 1.5rem' }}><Skeleton height={300} /></div>;

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <h1>Admin Dashboard</h1>

      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem' }}>
        {['overview', 'courses', 'users', 'broken-links'].map(t => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t)}>
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="grid grid-4">
          <StatCard label="Total Courses" value={stats.totalCourses} />
          <StatCard label="Active Courses" value={stats.activeCourses} accent="var(--color-success)" />
          <StatCard label="Broken Links" value={stats.brokenLinks} accent="var(--color-danger)" />
          <StatCard label="Registered Students" value={stats.registeredStudents} accent="var(--color-accent)" />
          <StatCard label="Completed Courses" value={stats.completedCourses} accent="var(--color-warning)" />
        </div>
      )}

      {tab === 'courses' && (
        <>
          <form onSubmit={handleSubmit} className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>{editingId ? 'Edit Course' : 'Add Course'}</h3>
            <div className="grid grid-2">
              <input className="input" placeholder="Title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <input className="input" placeholder="Instructor" value={form.instructor || ''} onChange={e => setForm({ ...form, instructor: e.target.value })} />
              <select className="input" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
                {['YouTube', 'SWAYAM', 'Microsoft Learn', 'freeCodeCamp', 'Cisco Skills for All', 'MIT OpenCourseWare'].map(p => <option key={p}>{p}</option>)}
              </select>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {['Data Science', 'Artificial Intelligence', 'Machine Learning', 'Web Development', 'App Development', 'Cyber Security', 'Cloud Computing', 'Programming', 'Database', 'UI/UX', 'Business', 'Communication'].map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="input" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
              </select>
              <input className="input" type="number" placeholder="Duration (hours)" value={form.durationHours} onChange={e => setForm({ ...form, durationHours: e.target.value })} />
              <input className="input" placeholder="Course URL" required value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
              <input className="input" placeholder="Thumbnail URL" value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} />
              <input className="input" placeholder="Skills (comma separated)" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} />
            </div>
            <textarea className="input" placeholder="Description" rows={2} style={{ margin: '.75rem 0' }} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button className="btn btn-primary">{editingId ? 'Update' : 'Add'} Course</button>
              {editingId && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>}
            </div>
          </form>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
            <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}><th>Title</th><th>Platform</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {courses.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '.5rem 0' }}>{c.title}</td>
                  <td>{c.platform}</td>
                  <td><span className={`badge ${c.status === 'active' ? 'badge-free' : 'badge-warning'}`}>{c.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(c)}>Edit</button>{' '}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === 'users' && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
          <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}><th>Name</th><th>Email</th><th>Role</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '.5rem 0' }}>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'broken-links' && (
        broken.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>No broken or flagged links right now.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
            <thead><tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-border)' }}><th>Title</th><th>URL</th><th>Status</th></tr></thead>
            <tbody>
              {broken.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '.5rem 0' }}>{c.title}</td><td>{c.url}</td><td><span className="badge badge-warning">{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}

