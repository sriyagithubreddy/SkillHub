export default function StatCard({ label, value, accent }) {
  return (
    <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: accent || 'var(--color-primary)' }}>{value}</div>
      <div style={{ fontSize: '.82rem', color: 'var(--color-text-muted)', marginTop: '.25rem' }}>{label}</div>
    </div>
  );
}
