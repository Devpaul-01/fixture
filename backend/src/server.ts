import express from "express";
import cors from "cors";
import * as store from "./store.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

// --- auth (fake, in-memory — see store.ts) ---------------------------------

app.post("/api/login", (req, res) => {
  const { username, password } = req.body ?? {};
  const user = store.findUser(username, password);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }
  const session = store.createSession(user.username);
  res.json({ token: session.token, user: { username: user.username, displayName: user.displayName } });
});

app.post("/api/logout", (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (token) store.deleteSession(token);
  res.status(204).end();
});

app.get("/api/me", (req, res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const session = store.getSession(token);
  if (!session) return res.status(401).json({ error: "Not authenticated" });
  res.json({ username: session.username });
});

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const session = store.getSession(token);
  if (!session) return res.status(401).json({ error: "Not authenticated" });
  next();
}

// --- tasks -------------------------------------------------------------

app.get("/api/tasks", requireAuth, (_req, res) => {
  res.json(store.listTasks());
});

app.get("/api/tasks/:id", requireAuth, (req, res) => {
  const task = store.getTask(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

app.post("/api/tasks", requireAuth, (req, res) => {
  const { title, description, status, assignee } = req.body ?? {};
  if (!title || typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }
  const task = store.createTask({
    title: title.trim(),
    description: description ?? "",
    status: status ?? "todo",
    assignee: assignee ?? "",
  });
  res.status(201).json(task);
});

app.put("/api/tasks/:id", requireAuth, (req, res) => {
  const { title, description, status, assignee } = req.body ?? {};
  if (title !== undefined && (!title || !String(title).trim())) {
    return res.status(400).json({ error: "title cannot be empty" });
  }
  const task = store.updateTask(req.params.id, { title, description, status, assignee });
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

app.delete("/api/tasks/:id", requireAuth, (req, res) => {
  const ok = store.deleteTask(req.params.id);
  if (!ok) return res.status(404).json({ error: "Task not found" });
  res.status(204).end();
});

// --- health check (used by the Playwright webServer readiness probe) -------

app.get("/api/_health", (_req, res) => {
  res.status(200).json({ ok: true });
});

// --- reset (test harness calls this before each run) -----------------------

app.post("/api/_reset", (_req, res) => {
  store.reset();
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`mini-app backend listening on http://localhost:${PORT}`);
});
