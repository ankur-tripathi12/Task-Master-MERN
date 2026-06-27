import { useState, useEffect } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';
import './Home.css';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await getTasks();
      setTasks(data);
    } catch {
      setError('Failed to load tasks. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const { data } = await createTask(formData);
      setTasks((prev) => [data, ...prev]);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task.');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const { data } = await updateTask(editingTask._id, formData);
      setTasks((prev) => prev.map((t) => (t._id === data._id ? data : t)));
      setEditingTask(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      if (editingTask?._id === id) setEditingTask(null);
      setError('');
    } catch {
      setError('Failed to delete task.');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="home">
      <section className="form-section">
        <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onCancel={editingTask ? () => setEditingTask(null) : null}
        />
      </section>

      {error && (
        <div className="error-banner" role="alert">
          {error}
          <button onClick={() => setError('')} className="error-close">
            Dismiss
          </button>
        </div>
      )}

      <section className="list-section">
        <h2>
          All Tasks{' '}
          {!loading && <span className="task-count">({tasks.length})</span>}
        </h2>
        <TaskList
          tasks={tasks}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </section>
    </div>
  );
}
