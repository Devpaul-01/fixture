import { test as base, expect, type Page } from "@playwright/test";

const API_BASE = "http://localhost:4000/api";

/**
 * Resets the backend's in-memory store before every test, per fixture-app
 * spec §2 / §5: each test run (and each probe_live_dom replay) starts from
 * the same known baseline instead of accumulating state across runs.
 */
async function resetBackend(page: Page) {
  const res = await page.request.post(`${API_BASE}/_reset`);
  if (!res.ok()) {
    throw new Error(`Failed to reset backend: ${res.status()}`);
  }
}

async function loginAs(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByTestId("login-username").fill(username);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/tasks$/);
}

type Fixtures = {
  loggedInPage: Page;
};

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    await resetBackend(page);
    await use(page);
  },

  loggedInPage: async ({ page }, use) => {
    await loginAs(page, "ada", "lovelace");
    await use(page);
  },
});

export { expect };
export { loginAs, resetBackend };
