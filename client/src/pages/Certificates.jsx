import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';

const emptyForm = { name: '', organization: '', course: '', issueDate: '', credentialId: '', credentialUrl: '' };

export default function Certificates() {
  const { showToast } = useToast();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/certificates').then(({ data }) => setCertificates(data.certificates))
      .catch(err => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { data } = await api.put(`/certificates/${editingId}`, form);
        setCertificates(cs => cs.map(c => c._id === editingId ? data.certificate : c));
        showToast('Certificate updated');
      } else {
        const { data } = await api.post('/certificates', form);
        setCertificates(cs => [data.certificate, ...cs]);
        showToast('Certificate added');
      }
      resetForm();
    } catch (err) { showToast(getErrorMessage(err), 'error'); }
  };

  const handleEdit = (cert) => {
    setForm({
      name: cert.name, organization: cert.organization, course: cert.course || '',
      issueDate: cert.issueDate?.slice(0, 10) || '', credentialId: cert.credentialId || '', credentialUrl: cert.credentialUrl || ''
    });
    setEditingId(cert._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/certificates/${id}`);
      setCertificates(cs => cs.filter(c => c._id !== id));
      showToast('Certificate deleted');
    } catch (err) { showToast(getErrorMessage(err), 'error'); }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Certificates</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(s => !s); }}>
          {showForm ? 'Cancel' : '+ Add Certificate'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="grid grid-2">
            <div className="form-group"><label>Certificate Name</label><input className="input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label>Issuing Organization</label><input className="input" required value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} /></div>
            <div className="form-group"><label>Related Course</label><input className="input" value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} /></div>
            <div className="form-group"><label>Issue Date</label><input className="input" type="date" required value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} /></div>
            <div className="form-group"><label>Credential ID</label><input className="input" value={form.credentialId} onChange={e => setForm({ ...form, credentialId: e.target.value })} /></div>
            <div className="form-group"><label>Credential URL</label><input className="input" value={form.credentialUrl} onChange={e => setForm({ ...form, credentialUrl: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary">{editingId ? 'Update' : 'Save'} Certificate</button>
        </form>
      )}

      {loading ? <Skeleton height={200} /> : certificates.length === 0 ? (
        <EmptyState title="No certificates yet" subtitle="Add certificates as you earn them — they'll sync into your resume automatically." />
      ) : (
        <div className="grid grid-3">
          {certificates.map(c => (
            <div key={c._id} className="card" style={{ padding: '1.1rem' }}>
              <h4 style={{ margin: '0 0 .3rem' }}>{c.name}</h4>
              <p style={{ margin: 0, fontSize: '.85rem', color: 'var(--color-text-muted)' }}>{c.organization}</p>
              {c.course && <p style={{ margin: '.3rem 0 0', fontSize: '.8rem' }}>Course: {c.course}</p>}
              <p style={{ margin: '.3rem 0 .75rem', fontSize: '.78rem', color: 'var(--color-text-muted)' }}>
                Issued {new Date(c.issueDate).toLocaleDateString()}
              </p>
              <div style={{ display: 'flex', gap: '.4rem' }}>
                {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">View</a>}
                <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(c)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
