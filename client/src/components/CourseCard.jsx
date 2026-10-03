import { Link } from 'react-router-dom';

export default function CourseCard({ course, saveState, onSave, onMarkCompleted }) {
  const isUnavailable = course.status === 'unavailable' || course.status === 'broken';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <img
        src={course.thumbnail}
        alt={course.title}
        style={{ width: '100%', height: 140, objectFit: 'cover', background: '#eef1f7' }}
        loading="lazy"
      />
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.5rem', flex: 1 }}>
        <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
          <span className="badge badge-level">{course.level}</span>
          {course.free && <span className="badge badge-free">Free</span>}
          {isUnavailable && <span className="badge badge-warning">Link may be unavailable</span>}
        </div>

        <h4 style={{ margin: 0, fontSize: '1rem' }}>{course.title}</h4>
        <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>
          {course.platform} · {course.instructor}
        </div>
        <p style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', margin: 0, flex: 1 }}>
          {course.description?.slice(0, 90)}{course.description?.length > 90 ? '…' : ''}
        </p>
        <div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>
          {course.durationHours}h {course.rating ? `· ★ ${course.rating}` : ''}
        </div>

        {saveState?.saved && (
          <div style={{ fontSize: '.78rem', color: saveState.completed ? 'var(--color-success)' : 'var(--color-primary)', fontWeight: 600 }}>
            {saveState.completed ? 'Completed' : `In progress · ${saveState.progress || 0}%`}
          </div>
        )}

        <div style={{ display: 'flex', gap: '.5rem', marginTop: '.4rem' }}>
          <Link to={`/courses/${course._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>View Course</Link>
          {onSave && !saveState?.saved && (
            <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onSave(course._id)}>Save</button>
          )}
          {onMarkCompleted && saveState?.saved && !saveState?.completed && (
            <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onMarkCompleted(course._id)}>Mark Done</button>
          )}
        </div>
      </div>
    </div>
  );
}
