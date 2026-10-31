// In-memory data store. Nothing here ever touches disk or network.
//
// Rule from the spec (§2): no action a Playwright test performs should
// cause a durable, observable side effect that accumulates across runs.
// This module is the single place that owns all mutable app state, and
// reset() is the single place that clears it. A fresh process start (or
// a POST /api/_reset) always returns the app to the exact same baseline.

export type Task = {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  assignee: string;
  createdAt: string;
};

export type User = {
  username: string;
  password: string; // plaintext on purpose — this is fake auth for a test fixture, never real auth
  displayName: string;
};

export type Session = {
  token: string;
  username: string;
};

const SEED_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Set up project scaffolding",
    description: "Initialize the repo and get a basic build running.",
    status: "done",
    assignee: "ada",
    createdAt: "2026-01-05T09:00:00.000Z",
  },
  {
    id: "task-2",
    title: "Design the task list view",
    description: "Table layout with status badges and an edit action per row.",
    status: "in_progress",
    assignee: "grace",
    createdAt: "2026-01-06T10:30:00.000Z",
  },
  {
    id: "task-3",
    title: "Wire up the create task form",
    description: "Form should validate title is non-empty before submit.",
    status: "todo",
    assignee: "ada",
    createdAt: "2026-01-07T14:15:00.000Z",
  },
  {
    id: "task-4",
    title: "Add task detail modal",
    description: "Clicking a row opens a modal with full task info.",
    status: "todo",
    assignee: "linus",
    createdAt: "2026-01-08T11:00:00.000Z",
  },
];

const SEED_USERS: User[] = [
  { username: "ada", password: "lovelace", displayName: "Ada Lovelace" },
  { username: "grace", password: "hopper", displayName: "Grace Hopper" },
];

let tasks: Task[] = [];
let users: User[] = [];
let sessions: Map<string, Session> = new Map();
let nextTaskNumber = 1;

export function reset(): void {
  tasks = SEED_TASKS.map((t) => ({ ...t }));
  users = SEED_USERS.map((u) => ({ ...u }));
  sessions = new Map();
  nextTaskNumber = SEED_TASKS.length + 1;
}

// Initialize on module load so a fresh process start is already at baseline.
reset();

export function listTasks(): Task[] {
  return tasks;
}

export function getTask(id: string): Task | undefined {
  return tasks.find((t) => t.id === id);
}

export function createTask(input: Omit<Task, "id" | "createdAt">): Task {
  const task: Task = {
    ...input,
    id: `task-${nextTaskNumber++}`,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
}

export function updateTask(
  id: string,
  input: Partial<Omit<Task, "id" | "createdAt">>
): Task | undefined {
  const task = getTask(id);
  if (!task) return undefined;
  Object.assign(task, input);
  return task;
}

export function deleteTask(id: string): boolean {
  const before = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);
  return tasks.length < before;
}

export function findUser(username: string, password: string): User | undefined {
  return users.find((u) => u.username === username && u.password === password);
}

export function createSession(username: string): Session {
  const token = `sess-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  const session: Session = { token, username };
  sessions.set(token, session);
  return session;
}

export function getSession(token: string | undefined): Session | undefined {
  if (!token) return undefined;
  return sessions.get(token);
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}
