export default function EmptyState({ title, subtitle, action }) {
  return (
    <div className="empty-state">
      <h3 style={{ marginBottom: '.4rem' }}>{title}</h3>
      {subtitle && <p style={{ marginBottom: '1rem' }}>{subtitle}</p>}
      {action}
    </div>
  );
}
