import { test, expect, loginAs } from "./fixtures/base";

test.describe("authentication", () => {
  test("logs in with valid credentials and lands on the tasks page", async ({ page }) => {
    await loginAs(page, "ada", "lovelace");
    await expect(page.getByRole("heading", { name: "Tasks" })).toBeVisible();
  });

  test("shows an error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-username").fill("ada");
    await page.getByTestId("login-password").fill("wrong-password");
    await page.getByTestId("login-submit").click();
    await expect(page.getByTestId("login-error")).toContainText("Invalid username or password");
  });

  test("redirects unauthenticated visitors from a protected route to login", async ({ page }) => {
    await page.goto("/tasks");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("full flow: login, navigate via nav links, sign out", async ({ page }) => {
    // Fragile on purpose (fixture-app spec §4): NavBar has no data-testid,
    // so this exercises text-based locators against real nav structure.
    await loginAs(page, "grace", "hopper");

    await page.getByRole("link", { name: "New Task" }).click();
    await expect(page).toHaveURL(/\/tasks\/new$/);

    await page.getByRole("link", { name: "Tasks", exact: true }).click();
    await expect(page).toHaveURL(/\/tasks$/);

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
