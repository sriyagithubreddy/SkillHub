import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import { generateResumePdf } from '../utils/resumePdf';
import { cacheResumeDraft, getCachedResumeDraft } from '../utils/offlineStore';
import Skeleton from '../components/Skeleton';

const templates = [
  { id: 'simple-ats', label: 'Simple ATS' },
  { id: 'modern-professional', label: 'Modern Professional' },
  { id: 'minimal-student', label: 'Minimal Student' }
];

const blankProject = { title: '', description: '', technologies: '', link: '' };
const blankExperience = { organization: '', role: '', duration: '', description: '' };

export default function ResumeBuilder() {
  const { showToast } = useToast();
  const [resume, setResume] = useState(null);
  const [autoPopulate, setAutoPopulate] = useState({ skills: [], certifications: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newProject, setNewProject] = useState(blankProject);
  const [newExperience, setNewExperience] = useState(blankExperience);
  const [newAchievement, setNewAchievement] = useState('');

  useEffect(() => {
    api.get('/resume')
      .then(({ data }) => { setResume(data.resume); setAutoPopulate(data.autoPopulate); })
      .catch(async () => {
        const cached = await getCachedResumeDraft();
        if (cached) { setResume(cached); showToast('Loaded your last saved draft (offline)', 'error'); }
      })
      .finally(() => setLoading(false));
  }, []);

  // keep an offline draft copy any time resume changes
  useEffect(() => { if (resume) cacheResumeDraft(resume).catch(() => {}); }, [resume]);

  const persist = async (updates) => {
    setSaving(true);
    try {
      const { data } = await api.put('/resume', updates);
      setResume(data.resume);
    } catch (err) {
      showToast('Saved locally — will sync when you\'re back online', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '2rem 1.5rem' }}><Skeleton height={400} /></div>;
  if (!resume) return <div className="container error-state">Couldn't load your resume. Try again once you're online.</div>;

  const update = (field, value) => setResume(r => ({ ...r, [field]: value }));
  const updatePersonal = (field, value) => setResume(r => ({ ...r, personalInfo: { ...r.personalInfo, [field]: value } }));

  const applyAutoSkills = () => {
    const existing = new Set(resume.skills.map(s => s.name.toLowerCase()));
    const merged = [...resume.skills, ...autoPopulate.skills.filter(s => !existing.has(s.name.toLowerCase()))];
    update('skills', merged);
  };

  const applyAutoCerts = () => {
    const existing = new Set(resume.certifications.map(c => c.name.toLowerCase()));
    const merged = [...resume.certifications, ...autoPopulate.certifications.filter(c => !existing.has(c.name.toLowerCase()))];
    update('certifications', merged);
  };

  const addProject = () => {
    if (!newProject.title.trim()) return;
    update('projects', [...resume.projects, { ...newProject, technologies: newProject.technologies.split(',').map(t => t.trim()).filter(Boolean) }]);
    setNewProject(blankProject);
  };

  const addExperience = () => {
    if (!newExperience.organization.trim()) return;
    update('experience', [...resume.experience, newExperience]);
    setNewExperience(blankExperience);
  };

  const addAchievement = () => {
    if (!newAchievement.trim()) return;
    update('achievements', [...resume.achievements, newAchievement]);
    setNewAchievement('');
  };

  const removeAt = (field, idx) => update(field, resume[field].filter((_, i) => i !== idx));

  const handleSaveAll = () => persist({
    personalInfo: resume.personalInfo, summary: resume.summary, education: resume.education,
    skills: resume.skills, projects: resume.projects, certifications: resume.certifications,
    experience: resume.experience, achievements: resume.achievements, template: resume.template
  });

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.75rem', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0 }}>Resume Builder</h1>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button className="btn btn-secondary" disabled={saving} onClick={handleSaveAll}>{saving ? 'Saving…' : 'Save'}</button>
          <button className="btn btn-primary" onClick={() => generateResumePdf(resume, resume.template)}>Download PDF</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem' }}>
        {templates.map(t => (
          <button key={t.id} className={`btn btn-sm ${resume.template === t.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { update('template', t.id); persist({ template: t.id }); }}>{t.label}</button>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* LEFT: editing */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginTop: 0 }}>Personal Information</h3>
            <div className="grid grid-2">
              {['fullName', 'email', 'phone', 'location', 'linkedin', 'github', 'portfolio'].map(f => (
                <input key={f} className="input" placeholder={f} value={resume.personalInfo?.[f] || ''} onChange={e => updatePersonal(f, e.target.value)} />
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginTop: 0 }}>Career Objective / Summary</h3>
            <textarea className="input" rows={3} value={resume.summary || ''} onChange={e => update('summary', e.target.value)} />
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Skills</h3>
              {autoPopulate.skills.length > 0 && <button className="btn btn-secondary btn-sm" onClick={applyAutoSkills}>Import from SkillHub</button>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginTop: '.75rem' }}>
              {resume.skills.map((s, i) => (
                <span key={i} className="badge badge-level" style={{ display: 'flex', gap: '.3rem', alignItems: 'center' }}>
                  {s.name}{s.level ? ` (${s.level})` : ''}
                  <button onClick={() => removeAt('skills', i)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                </span>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginTop: 0 }}>Projects</h3>
            {resume.projects.map((p, i) => (
              <div key={i} style={{ fontSize: '.85rem', marginBottom: '.5rem', paddingBottom: '.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>{p.title}</strong> — {Array.isArray(p.technologies) ? p.technologies.join(', ') : p.technologies}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => removeAt('projects', i)}>✕</button>
              </div>
            ))}
            <input className="input" placeholder="Project title" style={{ marginBottom: '.5rem' }} value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
            <textarea className="input" placeholder="Description" rows={2} style={{ marginBottom: '.5rem' }} value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} />
            <input className="input" placeholder="Technologies (comma separated)" style={{ marginBottom: '.5rem' }} value={newProject.technologies} onChange={e => setNewProject({ ...newProject, technologies: e.target.value })} />
            <input className="input" placeholder="GitHub / demo link" style={{ marginBottom: '.5rem' }} value={newProject.link} onChange={e => setNewProject({ ...newProject, link: e.target.value })} />
            <button className="btn btn-primary btn-sm" onClick={addProject}>Add Project</button>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Certifications</h3>
              {autoPopulate.certifications.length > 0 && <button className="btn btn-secondary btn-sm" onClick={applyAutoCerts}>Import from SkillHub</button>}
            </div>
            {resume.certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '.85rem', marginTop: '.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>{c.name} — {c.organization}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => removeAt('certifications', i)}>✕</button>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginTop: 0 }}>Experience / Internships</h3>
            {resume.experience.map((ex, i) => (
              <div key={i} style={{ fontSize: '.85rem', marginBottom: '.5rem', display: 'flex', justifyContent: 'space-between' }}>
                <span><strong>{ex.role}</strong> — {ex.organization} ({ex.duration})</span>
                <button className="btn btn-ghost btn-sm" onClick={() => removeAt('experience', i)}>✕</button>
              </div>
            ))}
            <div className="grid grid-2" style={{ marginBottom: '.5rem' }}>
              <input className="input" placeholder="Organization" value={newExperience.organization} onChange={e => setNewExperience({ ...newExperience, organization: e.target.value })} />
              <input className="input" placeholder="Role" value={newExperience.role} onChange={e => setNewExperience({ ...newExperience, role: e.target.value })} />
              <input className="input" placeholder="Duration" value={newExperience.duration} onChange={e => setNewExperience({ ...newExperience, duration: e.target.value })} />
            </div>
            <textarea className="input" placeholder="Description" rows={2} style={{ marginBottom: '.5rem' }} value={newExperience.description} onChange={e => setNewExperience({ ...newExperience, description: e.target.value })} />
            <button className="btn btn-primary btn-sm" onClick={addExperience}>Add Experience</button>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ marginTop: 0 }}>Achievements</h3>
            {resume.achievements.map((a, i) => (
              <div key={i} style={{ fontSize: '.85rem', marginBottom: '.3rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>• {a}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => removeAt('achievements', i)}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <input className="input" placeholder="Add an achievement" value={newAchievement} onChange={e => setNewAchievement(e.target.value)} />
              <button className="btn btn-primary btn-sm" onClick={addAchievement}>Add</button>
            </div>
          </div>
        </div>

        {/* RIGHT: live preview */}
        <div>
          <div className="card" style={{ padding: '2rem', position: 'sticky', top: 80, fontFamily: 'Georgia, serif' }}>
            <ResumePreview resume={resume} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResumePreview({ resume }) {
  const accent = resume.template === 'modern-professional' ? '#2f6fed' : resume.template === 'minimal-student' ? '#16a596' : '#222';
  const p = resume.personalInfo || {};

  return (
    <div style={{ fontSize: '.85rem', lineHeight: 1.5 }}>
      {resume.template === 'modern-professional' && <div style={{ height: 6, background: accent, margin: '-2rem -2rem 1rem' }} />}
      <h2 style={{ color: accent, margin: '0 0 .2rem' }}>{p.fullName || 'Your Name'}</h2>
      <div style={{ color: '#666', fontSize: '.78rem', marginBottom: '.9rem' }}>
        {[p.email, p.phone, p.location, p.linkedin, p.github, p.portfolio].filter(Boolean).join(' | ')}
      </div>

      {resume.summary && <Section title="Summary" accent={accent}><p>{resume.summary}</p></Section>}

      {resume.education?.length > 0 && (
        <Section title="Education" accent={accent}>
          {resume.education.map((ed, i) => <div key={i}><strong>{ed.degree} {ed.branch && `- ${ed.branch}`}</strong><div>{ed.college} {ed.cgpa && `| CGPA ${ed.cgpa}`}</div></div>)}
        </Section>
      )}

      {resume.skills?.length > 0 && (
        <Section title="Skills" accent={accent}>
          <div>{resume.skills.map(s => s.name).join('  •  ')}</div>
        </Section>
      )}

      {resume.projects?.length > 0 && (
        <Section title="Projects" accent={accent}>
          {resume.projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: '.5rem' }}>
              <strong>{proj.title}</strong>
              <div>{proj.description}</div>
              <div style={{ color: '#888', fontSize: '.78rem' }}>{Array.isArray(proj.technologies) ? proj.technologies.join(', ') : proj.technologies}</div>
            </div>
          ))}
        </Section>
      )}

      {resume.certifications?.length > 0 && (
        <Section title="Certifications" accent={accent}>
          {resume.certifications.map((c, i) => <div key={i}>{c.name} — {c.organization}</div>)}
        </Section>
      )}

      {resume.experience?.length > 0 && (
        <Section title="Experience" accent={accent}>
          {resume.experience.map((ex, i) => <div key={i} style={{ marginBottom: '.4rem' }}><strong>{ex.role} - {ex.organization}</strong> ({ex.duration})<div>{ex.description}</div></div>)}
        </Section>
      )}

      {resume.achievements?.length > 0 && (
        <Section title="Achievements" accent={accent}>
          {resume.achievements.map((a, i) => <div key={i}>• {a}</div>)}
        </Section>
      )}
    </div>
  );
}

function Section({ title, accent, children }) {
  return (
    <div style={{ marginBottom: '.9rem' }}>
      <div style={{ fontWeight: 700, color: accent, fontSize: '.82rem', borderBottom: `1px solid ${accent}55`, marginBottom: '.4rem', paddingBottom: '.15rem' }}>{title.toUpperCase()}</div>
      {children}
    </div>
  );
}
