import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Skeleton from '../components/Skeleton';

export default function PublicPortfolio() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/portfolio/${username}`).then(({ data }) => setData(data)).catch(() => setError('This portfolio is private or does not exist.'));
  }, [username]);

  if (error) return <div className="container error-state" style={{ padding: '3rem 1.5rem' }}>{error}</div>;
  if (!data) return <div className="container" style={{ padding: '2rem 1.5rem' }}><Skeleton height={300} /></div>;

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: 720 }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h1 style={{ marginTop: 0 }}>{data.name}</h1>
        {data.summary && <p style={{ color: 'var(--color-text-muted)' }}>{data.summary}</p>}
        <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem' }}>
          {data.github && <a href={data.github} target="_blank" rel="noreferrer">GitHub</a>}
          {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
          {data.portfolio && <a href={data.portfolio} target="_blank" rel="noreferrer">Portfolio</a>}
        </div>

        {data.skills?.length > 0 && (
          <>
            <h3>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: '1.5rem' }}>
              {data.skills.map((s, i) => <span key={i} className="badge badge-level">{s.name}</span>)}
            </div>
          </>
        )}

        {data.education?.length > 0 && (
          <>
            <h3>Education</h3>
            {data.education.map((e, i) => <p key={i} style={{ margin: '.2rem 0' }}>{e.degree} — {e.college}</p>)}
          </>
        )}

        {data.completedCourses?.length > 0 && (
          <>
            <h3>Completed Courses</h3>
            <ul>{data.completedCourses.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </>
        )}

        {data.certificates?.length > 0 && (
          <>
            <h3>Certificates</h3>
            <ul>{data.certificates.map((c, i) => <li key={i}>{c.name} — {c.organization}</li>)}</ul>
          </>
        )}
      </div>
    </div>
  );
}
