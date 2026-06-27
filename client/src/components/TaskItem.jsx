import './TaskItem.css';

const STATUS_LABELS = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export default function TaskItem({ task, onEdit, onDelete }) {
  return (
    <div className={`task-item ${task.status === 'completed' ? 'task-completed' : ''}`}>
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-badges">
          <span className={`badge status-${task.status}`}>
            {STATUS_LABELS[task.status]}
          </span>
          <span className={`badge priority-${task.priority}`}>
            {PRIORITY_LABELS[task.priority]}
          </span>
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-footer">
        <span className="task-date">
          {new Date(task.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        <div className="task-actions">
          <button className="btn-edit" onClick={() => onEdit(task)}>
            Edit
          </button>
          <button className="btn-delete" onClick={() => onDelete(task._id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
