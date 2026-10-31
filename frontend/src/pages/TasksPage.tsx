import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as api from "../api/client";
import type { Task } from "../api/client";
import { NavBar } from "../components/NavBar";

const STATUS_LABEL: Record<Task["status"], string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    try {
      const data = await api.fetchTasks();
      setTasks(data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    await api.deleteTask(id);
    await load();
  }

  return (
    <div className="page">
      <NavBar />
      <div className="page-content">
        <div className="page-header">
          <h1>Tasks</h1>
          {/* Good, stable locator: data-testid */}
          <Link to="/tasks/new" data-testid="new-task-link">
            <button data-testid="new-task-button">+ New Task</button>
          </Link>
        </div>

        {loading && <p>Loading...</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {!loading && !errorMessage && (
          <table className="task-table" data-testid="task-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                // Each row is deliberately given a data-testid keyed by task id
                // (the stable strategy), but several action buttons inside the
                // row rely only on row position / text (the fragile strategy) —
                // see fixture-app spec §4.
                <tr key={task.id} data-testid={`task-row-${task.id}`}>
                  <td>
                    {/* Fragile on purpose: no data-testid on this link, just text */}
                    <span
                      className="task-title-link"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      role="link"
                      tabIndex={0}
                    >
                      {task.title}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${task.status}`}>
                      {STATUS_LABEL[task.status]}
                    </span>
                  </td>
                  <td>{task.assignee || "Unassigned"}</td>
                  <td className="task-row-actions">
                    {/* Stable: has data-testid */}
                    <button
                      data-testid={`edit-task-${task.id}`}
                      onClick={() => navigate(`/tasks/${task.id}/edit`)}
                    >
                      Edit
                    </button>
                    {/* Fragile on purpose: no data-testid, same text repeated
                        in every row — ambiguous without row scoping. */}
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !errorMessage && tasks.length === 0 && (
          <p data-testid="empty-state">No tasks yet.</p>
        )}
      </div>
    </div>
  );
}
