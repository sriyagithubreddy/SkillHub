import { Link } from 'react-router-dom';

export default function Footer() {
  const platforms = [
    'YouTube',
    'SWAYAM',
    'Microsoft Learn',
    'freeCodeCamp'
  ];

  return (
    <footer
      style={{
        background: '#161d2e',
        color: '#c7cede',
        marginTop: '3rem'
      }}
    >
      <div
        className="container"
        style={{
          padding: '2.5rem 1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ maxWidth: 280 }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: '1.15rem',
              color: '#fff',
              marginBottom: '.5rem'
            }}
          >
            SkillHub
          </div>

          <p
            style={{
              fontSize: '.85rem',
              lineHeight: 1.6
            }}
          >
            Free courses, learning tracking and an
            ATS-friendly resume builder, built for students.
          </p>
        </div>

        <div>
          <div
            style={{
              color: '#fff',
              fontWeight: 700,
              marginBottom: '.6rem',
              fontSize: '.9rem'
            }}
          >
            Explore
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '.4rem',
              fontSize: '.85rem'
            }}
          >
            <Link to="/courses">Courses</Link>
            <Link to="/resume-builder">Resume Builder</Link>
            <Link to="/register">Get Started</Link>
          </div>
        </div>

        <div style={{ minWidth: 280 }}>
          <div
            style={{
              color: '#fff',
              fontWeight: 700,
              marginBottom: '.6rem',
              fontSize: '.9rem'
            }}
          >
            Platforms Covered
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '.5rem 1.2rem',
              fontSize: '.85rem',
              lineHeight: 1.8
            }}
          >
            {platforms.map((platform) => (
              <span key={platform}>{platform}</span>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid #2a3348',
          textAlign: 'center',
          padding: '1rem',
          fontSize: '.78rem'
        }}
      >
        © {new Date().getFullYear()} SkillHub. Built as an academic project.
      </div>
    </footer>
  );
}
