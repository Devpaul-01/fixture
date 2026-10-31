import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as api from "../api/client";
import type { Task } from "../api/client";
import { NavBar } from "../components/NavBar";

export function TaskFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Task["status"]>("todo");
  const [assignee, setAssignee] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .fetchTask(id)
      .then((task) => {
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setAssignee(task.assignee);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load task"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode && id) {
        await api.updateTask(id, { title, description, status, assignee });
      } else {
        await api.createTask({ title, description, status, assignee });
      }
      navigate("/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <NavBar />
        <div className="page-content">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <NavBar />
      <div className="page-content">
        <h1>{isEditMode ? "Edit Task" : "New Task"}</h1>
        <form onSubmit={handleSubmit} data-testid="task-form">
          <label htmlFor="task-title">Title</label>
          <input
            id="task-title"
            data-testid="task-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            data-testid="task-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          <label htmlFor="task-status">Status</label>
          <select
            id="task-status"
            data-testid="task-status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as Task["status"])}
          >
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>

          <label htmlFor="task-assignee">Assignee</label>
          <input
            id="task-assignee"
            data-testid="task-assignee-input"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />

          {error && (
            <p className="error-message" data-testid="task-form-error">
              {error}
            </p>
          )}

          <div className="form-actions">
            <button type="submit" data-testid="task-form-submit" disabled={submitting}>
              {submitting ? "Saving..." : isEditMode ? "Save changes" : "Create task"}
            </button>
            {/* Fragile on purpose: Cancel button has no data-testid. */}
            <button type="button" onClick={() => navigate("/tasks")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
