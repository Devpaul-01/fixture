# fixture

A minimal app-under-test for the self-healing E2E test agent (play-agent). Not a product — every design choice exists to serve the test agent project, not to be a good app in its own right. See the full spec in the original design doc; the summary below covers what's here and how to run it.

## Why this exists

1. **Statelessness by construction** — so `probe_live_dom` is safe to replay against, with no engineering needed to contain side effects.
2. **Predictable, explicit locators** — a deliberate mix of good (`data-testid`) and bad (text/structural) locators, so component-source resolution and locator-repair have something real to work with.

## Stack

- **Frontend**: React + TypeScript via Vite, source maps on (`build.sourcemap: true`). Plain SPA, no SSR/meta-framework.
- **Backend**: Express + TypeScript, pure in-memory store (no disk, no network, no real auth).
- **Tests**: Playwright (`@playwright/test`), TypeScript.

Runs as plain local processes — no Docker, by design (see the spec's §8 for why).

## Running it

```bash
# install everything
npm install --prefix backend
npm install --prefix frontend
npm install   # root: installs @playwright/test

# install Playwright's browser binary (needs real internet access)
npx playwright install chromium

# run backend + frontend manually, or just run the tests —
# playwright.config.ts starts both servers for you
npm test
```

Manual dev loop:

```bash
npm run dev --prefix backend    # http://localhost:4000
npm run dev --prefix frontend   # http://localhost:5173
```

Reset the backend's in-memory state at any time:

```bash
curl -X POST http://localhost:4000/api/_reset
```

Fake login users: `ada` / `lovelace`, `grace` / `hopper`.

## Structure

```
backend/     Express API, in-memory store, fake auth, /api/_reset
frontend/    Vite + React + TS SPA
tests/       Playwright suite (19 tests across 5 files)
```

## Features (spec §3)

1. **Task list/table** (`/tasks`) — rows rendered from an array; repeated similar elements (edit/delete buttons per row).
2. **Create/edit form** (`/tasks/new`, `/tasks/:id/edit`) — text inputs, select, submit, client-side validation.
3. **Detail modal** (`/tasks/:id`) — conditionally rendered, doesn't exist in the DOM until you navigate to it.
4. **Nav + fake-auth gate** — login → navigate → act is a full multi-step flow; `/tasks`, `/tasks/new`, `/tasks/:id`, `/tasks/:id/edit` are all behind the auth gate.

## Locator strategy (spec §4)

Deliberately mixed, on purpose:

- **Stable** (`data-testid`): login form fields, task rows (`task-row-<id>`), edit buttons (`edit-task-<id>`), task table, form inputs, modal fields.
- **Fragile** (text/structural only, no `data-testid`): the entire `NavBar`, the per-row Delete button (same text in every row — ambiguous without row scoping), the task title "link" in each row, the Cancel button on the form, one of the two Close affordances on the detail modal.

This mix is what the synthetic benchmark generator mutates against (attribute rename, DOM restructure, sibling reorder, element removal) to produce a ground-truth labeled benchmark for the test agent.

## Test suite (spec §5)

19 Playwright tests across 5 files, each targeting a specific element and interacting with it (not just checking page text), so they actually break under the mutation types above:

- `auth.spec.ts` — login success/failure, auth gate redirect, full login→nav→sign-out flow
- `task-list.spec.ts` — row count, stable-locator edit, scoped delete (avoiding the repeated-text trap), fragile title click, empty state
- `task-form.spec.ts` — create, validation, edit pre-population, save, fragile cancel
- `task-detail.spec.ts` — modal absent until navigated to, stable-locator open, edit-from-modal, fragile close
- `statelessness.spec.ts` — proves `/api/_reset` actually returns to the seeded baseline after mutation

Every test resets the backend first (see `tests/fixtures/base.ts`), so re-running the full suite from a fresh process start is idempotent.

## What's deliberately not here (spec §6)

No real persistence, no multi-tenant complexity, no CI/CD for this app beyond "tests run locally and in a container," no visual design effort, no real third-party integrations, no Dockerfile.
