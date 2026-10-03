import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Skeleton from '../components/Skeleton';

const levels = ['Beginner', 'Intermediate', 'Advanced'];

export default function Profile() {
  const { user, updateUserLocal } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(null);
  const [stats, setStats] = useState(null);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Beginner' });
  const [newEdu, setNewEdu] = useState({ degree: '', college: '', branch: '', cgpa: '', startYear: '', endYear: '' });

  useEffect(() => {
    api.get('/profile').then(({ data }) => { setForm(data.user); setStats(data.stats); });
  }, []);

  if (!form) return <div className="container" style={{ padding: '2rem 1.5rem' }}><Skeleton height={300} /></div>;

  const save = async (updates) => {
    try {
      const { data } = await api.put('/profile', updates);
      setForm(data.user);
      updateUserLocal(data.user);
      showToast('Profile updated');
    } catch (err) { showToast(getErrorMessage(err), 'error'); }
  };

  const handleSaveDetails = (e) => {
    e.preventDefault();
    save({
      name: form.name, phone: form.phone, location: form.location, linkedin: form.linkedin,
      github: form.github, portfolio: form.portfolio, summary: form.summary,
      username: form.username, isPublicProfile: form.isPublicProfile
    });
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    const skills = [...form.skills, newSkill];
    setForm({ ...form, skills });
    save({ skills });
    setNewSkill({ name: '', level: 'Beginner' });
  };

  const removeSkill = (idx) => {
    const skills = form.skills.filter((_, i) => i !== idx);
    setForm({ ...form, skills });
    save({ skills });
  };

  const updateSkillLevel = (idx, level) => {
    const skills = form.skills.map((s, i) => i === idx ? { ...s, level } : s);
    setForm({ ...form, skills });
    save({ skills });
  };

  const addEducation = () => {
    if (!newEdu.degree.trim()) return;
    const education = [...form.education, newEdu];
    setForm({ ...form, education });
    save({ education });
    setNewEdu({ degree: '', college: '', branch: '', cgpa: '', startYear: '', endYear: '' });
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <h1>My Profile</h1>

      {stats && (
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}><strong>{stats.coursesCompleted}</strong><div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>Completed</div></div>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}><strong>{stats.certificates}</strong><div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>Certificates</div></div>
          <div className="card" style={{ padding: '1rem', textAlign: 'center' }}><strong>{stats.skills}</strong><div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>Skills</div></div>
        </div>
      )}

      <div className="grid grid-2" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        <form onSubmit={handleSaveDetails} className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Basic Details</h3>
          <div className="grid grid-2">
            <div className="form-group"><label>Full Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label>Email</label><input className="input" value={form.email} disabled /></div>
            <div className="form-group"><label>Phone</label><input className="input" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-group"><label>Location</label><input className="input" value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
            <div className="form-group"><label>LinkedIn</label><input className="input" value={form.linkedin || ''} onChange={e => setForm({ ...form, linkedin: e.target.value })} /></div>
            <div className="form-group"><label>GitHub</label><input className="input" value={form.github || ''} onChange={e => setForm({ ...form, github: e.target.value })} /></div>
            <div className="form-group"><label>Portfolio Link</label><input className="input" value={form.portfolio || ''} onChange={e => setForm({ ...form, portfolio: e.target.value })} /></div>
            <div className="form-group"><label>Public Portfolio Username</label><input className="input" placeholder="e.g. sriya-r" value={form.username || ''} onChange={e => setForm({ ...form, username: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Summary</label><textarea className="input" rows={3} value={form.summary || ''} onChange={e => setForm({ ...form, summary: e.target.value })} /></div>
          <label style={{ display: 'flex', gap: '.4rem', alignItems: 'center', fontSize: '.85rem', marginBottom: '1rem' }}>
            <input type="checkbox" checked={form.isPublicProfile} onChange={e => setForm({ ...form, isPublicProfile: e.target.checked })} />
            Make my portfolio public at /portfolio/{form.username || 'your-username'}
          </label>
          <button className="btn btn-primary">Save Details</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Skills</h3>
            {form.skills.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '.5rem' }}>
                <span style={{ flex: 1, fontSize: '.9rem' }}>{s.name}</span>
                <select className="input" style={{ width: 130 }} value={s.level} onChange={e => updateSkillLevel(i, e.target.value)}>
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <button className="btn btn-ghost btn-sm" onClick={() => removeSkill(i)}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '.5rem', marginTop: '.75rem' }}>
              <input className="input" placeholder="e.g. React" value={newSkill.name} onChange={e => setNewSkill({ ...newSkill, name: e.target.value })} />
              <select className="input" style={{ width: 130 }} value={newSkill.level} onChange={e => setNewSkill({ ...newSkill, level: e.target.value })}>
                {levels.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button className="btn btn-primary btn-sm" onClick={addSkill}>Add</button>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Education</h3>
            {form.education.map((e, i) => (
              <div key={i} style={{ fontSize: '.85rem', marginBottom: '.5rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--color-border)' }}>
                <strong>{e.degree}</strong>, {e.branch} — {e.college} ({e.startYear}–{e.endYear}) {e.cgpa && `· CGPA ${e.cgpa}`}
              </div>
            ))}
            <div className="grid grid-2" style={{ marginTop: '.5rem' }}>
              <input className="input" placeholder="Degree" value={newEdu.degree} onChange={e => setNewEdu({ ...newEdu, degree: e.target.value })} />
              <input className="input" placeholder="College" value={newEdu.college} onChange={e => setNewEdu({ ...newEdu, college: e.target.value })} />
              <input className="input" placeholder="Branch" value={newEdu.branch} onChange={e => setNewEdu({ ...newEdu, branch: e.target.value })} />
              <input className="input" placeholder="CGPA" value={newEdu.cgpa} onChange={e => setNewEdu({ ...newEdu, cgpa: e.target.value })} />
              <input className="input" placeholder="Start Year" value={newEdu.startYear} onChange={e => setNewEdu({ ...newEdu, startYear: e.target.value })} />
              <input className="input" placeholder="End Year" value={newEdu.endYear} onChange={e => setNewEdu({ ...newEdu, endYear: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-sm" style={{ marginTop: '.6rem' }} onClick={addEducation}>Add Education</button>
          </div>
        </div>
      </div>
    </div>
  );
}

