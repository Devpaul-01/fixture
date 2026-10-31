export type Task = {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  assignee: string;
  createdAt: string;
};

const API_BASE = "http://localhost:4000/api";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore parse errors, fall back to default message
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return handle<{ token: string; user: { username: string; displayName: string } }>(res);
}

export async function logout() {
  const res = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    headers: authHeaders(),
  });
  return handle<void>(res);
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks`, { headers: authHeaders() });
  return handle<Task[]>(res);
}

export async function fetchTask(id: string): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, { headers: authHeaders() });
  return handle<Task>(res);
}

export async function createTask(input: Omit<Task, "id" | "createdAt">): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  });
  return handle<Task>(res);
}

export async function updateTask(
  id: string,
  input: Partial<Omit<Task, "id" | "createdAt">>
): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(input),
  });
  return handle<Task>(res);
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handle<void>(res);
}
