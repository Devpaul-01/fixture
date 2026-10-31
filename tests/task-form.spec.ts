import { test, expect } from "./fixtures/base";

test.describe("task form", () => {
  test("creates a new task and lands back on the list with it visible", async ({
    loggedInPage: page,
  }) => {
    await page.goto("/tasks/new");
    await page.getByTestId("task-title-input").fill("Write onboarding docs");
    await page.getByTestId("task-description-input").fill("Cover setup and first PR.");
    await page.getByTestId("task-status-select").selectOption("in_progress");
    await page.getByTestId("task-assignee-input").fill("linus");
    await page.getByTestId("task-form-submit").click();

    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByTestId("task-table").locator("tbody tr")).toHaveCount(5);
    await expect(page.getByText("Write onboarding docs")).toBeVisible();
  });

  test("shows a validation error when title is empty", async ({ loggedInPage: page }) => {
    await page.goto("/tasks/new");
    await page.getByTestId("task-form-submit").click();
    await expect(page.getByTestId("task-form-error")).toHaveText("Title is required");
    await expect(page).toHaveURL(/\/tasks\/new$/);
  });

  test("edit form is pre-populated with the existing task's values", async ({
    loggedInPage: page,
  }) => {
    await page.goto("/tasks/task-3/edit");
    await expect(page.getByTestId("task-title-input")).toHaveValue(
      "Wire up the create task form"
    );
    await expect(page.getByTestId("task-status-select")).toHaveValue("todo");
    await expect(page.getByTestId("task-assignee-input")).toHaveValue("ada");
  });

  test("saving an edit updates the task and is reflected in the list", async ({
    loggedInPage: page,
  }) => {
    await page.goto("/tasks/task-3/edit");
    await page.getByTestId("task-status-select").selectOption("done");
    await page.getByTestId("task-form-submit").click();

    await expect(page).toHaveURL(/\/tasks$/);
    const row = page.getByTestId("task-row-task-3");
    await expect(row.locator(".status-badge")).toHaveText("Done");
  });

  test("cancel (fragile, no testid) discards changes and returns to the list", async ({
    loggedInPage: page,
  }) => {
    await page.goto("/tasks/task-1/edit");
    await page.getByTestId("task-title-input").fill("This change should not be saved");
    // Fragile on purpose: Cancel has no data-testid, located by role+text only.
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByText("This change should not be saved")).toHaveCount(0);
    await expect(page.getByText("Set up project scaffolding")).toBeVisible();
  });
});
