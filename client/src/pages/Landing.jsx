import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const domains = ['Data Science', 'Artificial Intelligence', 'Machine Learning', 'Web Development', 'App Development', 'Cyber Security', 'Cloud Computing', 'Programming', 'Database', 'UI/UX', 'Business', 'Communication'];

export default function Landing() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/courses${query ? `?q=${encodeURIComponent(query)}` : ''}`);
  };

  return (
    <div>
      <section style={{ background: 'linear-gradient(135deg, #eef3ff, #f6f7fb)', padding: '4rem 1.5rem' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 720 }}>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '.75rem' }}>Learn. Build Skills. Get Career Ready.</h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
            Discover free courses, track your learning, manage your certifications, and build an ATS-friendly resume — all in one place.
          </p>

          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '.5rem', maxWidth: 480, margin: '0 auto 1.75rem' }}>
            <input className="input" placeholder="Search courses, skills, technologies…" value={query} onChange={e => setQuery(e.target.value)} />
            <button className="btn btn-primary">Search</button>
          </form>

          <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center' }}>
            <Link to="/courses" className="btn btn-primary">Explore Courses</Link>
            <Link to="/resume-builder" className="btn btn-secondary">Build Your Resume</Link>
          </div>
        </div>
      </section>

      <section className="container" style={{ padding: '3rem 1.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Popular Domains</h2>
        <div className="grid grid-4">
          {domains.map(d => (
            <Link key={d} to={`/courses?category=${encodeURIComponent(d)}`} className="card" style={{ padding: '1.1rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-text)' }}>
              {d}
            </Link>
          ))}
        </div>
      </section>

      <section className="container" style={{ padding: '3rem 1.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>How SkillHub Works</h2>
        <div className="grid grid-4">
          {[
            ['1. Explore', 'Search free courses across YouTube, SWAYAM, Microsoft Learn, freeCodeCamp, Cisco Skills for All and MIT OpenCourseWare.'],
            ['2. Track', 'Save courses, follow your progress, and mark them complete.'],
            ['3. Certify', 'Log certificates as you earn them — they sync automatically.'],
            ['4. Build', 'Turn your skills and certificates into an ATS-friendly resume.']
          ].map(([title, desc]) => (
            <div key={title} className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ marginTop: 0 }}>{title}</h4>
              <p style={{ fontSize: '.88rem', color: 'var(--color-text-muted)', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container" style={{ padding: '3rem 1.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Key Features</h2>
        <div className="grid grid-3">
          {[
            ['Smart search & filters', 'Filter by platform, domain, skill level, duration and cost.'],
            ['Progress tracking', 'Visual progress bars for every skill you\'re building.'],
            ['Certificate vault', 'Keep every certificate organized and resume-ready.'],
            ['ATS resume builder', 'Three professional templates with live preview and PDF export.'],
            ['Works offline', 'Saved courses and resume drafts are available without internet.'],
            ['Public portfolio', 'Share a clean, recruiter-friendly profile link.']
          ].map(([title, desc]) => (
            <div key={title} className="card" style={{ padding: '1.25rem' }}>
              <h4 style={{ marginTop: 0 }}>{title}</h4>
              <p style={{ fontSize: '.88rem', color: 'var(--color-text-muted)', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2rem', background: 'linear-gradient(135deg,#2f6fed,#1e4fc4)', color: '#fff', border: 'none' }}>
          <h2 style={{ marginTop: 0 }}>Works even when your connection doesn't</h2>
          <p style={{ opacity: .9, maxWidth: 520, margin: '0 auto 1rem' }}>
            SkillHub is a full Progressive Web App — install it on your device and keep access to saved courses and your resume draft offline.
          </p>
        </div>
      </section>
    </div>
  );
}

