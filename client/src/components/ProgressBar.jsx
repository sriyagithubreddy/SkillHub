export default function ProgressBar({ label, value }) {
  return (
    <div style={{ marginBottom: '.9rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem', marginBottom: '.3rem' }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: 'var(--color-text-muted)' }}>{value}%</span>
      </div>
      <div style={{ background: '#eef0f5', borderRadius: 999, height: 8, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, background: 'var(--color-primary)', height: '100%', borderRadius: 999, transition: 'width .3s' }} />
      </div>
    </div>
  );
}
