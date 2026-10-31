import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as api from "../api/client";
import type { Task } from "../api/client";
import { NavBar } from "../components/NavBar";

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .fetchTask(id)
      .then(setTask)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load task"));
  }, [id]);

  function closeModal() {
    navigate("/tasks");
  }

  return (
    <div className="page">
      <NavBar />
      <div className="page-content">
        <h1>Tasks</h1>
        <p>Task detail is shown in a modal overlay.</p>
      </div>

      {/* Conditionally rendered: this modal only exists in the DOM once the
          task has loaded. Not present on first paint — see fixture-app spec
          §3.3 ("locators that only exist conditionally"). */}
      {error && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" data-testid="task-detail-modal" onClick={(e) => e.stopPropagation()}>
            <p className="error-message" data-testid="task-detail-error">
              {error}
            </p>
            <button data-testid="modal-close" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}

      {task && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" data-testid="task-detail-modal" onClick={(e) => e.stopPropagation()}>
            <h2 data-testid="task-detail-title">{task.title}</h2>
            <p className="task-detail-description" data-testid="task-detail-description">
              {task.description || "No description."}
            </p>
            <dl className="task-detail-meta">
              <dt>Status</dt>
              <dd data-testid="task-detail-status">{task.status}</dd>
              <dt>Assignee</dt>
              <dd>{task.assignee || "Unassigned"}</dd>
            </dl>
            <div className="modal-actions">
              <button
                data-testid="modal-edit-button"
                onClick={() => navigate(`/tasks/${task.id}/edit`)}
              >
                Edit
              </button>
              {/* Fragile on purpose: close button here found by text, not testid */}
              <button className="modal-close-text-btn" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
