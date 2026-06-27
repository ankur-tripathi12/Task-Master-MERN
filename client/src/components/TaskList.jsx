import TaskItem from './TaskItem';
import './TaskList.css';

export default function TaskList({ tasks, onEdit, onDelete, loading }) {
  if (loading) {
    return <p className="state-msg">Loading tasks...</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks yet. Create your first task above!</p>
      </div>
    );
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task._id}>
          <TaskItem task={task} onEdit={onEdit} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
