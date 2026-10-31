import { test, expect } from "./fixtures/base";

test.describe("task detail modal", () => {
  test("modal is not present on the tasks list before navigating into a task", async ({
    loggedInPage: page,
  }) => {
    await page.goto("/tasks");
    // Conditionally rendered (fixture-app spec §3.3): this element simply
    // doesn't exist in the DOM yet, not just hidden.
    await expect(page.getByTestId("task-detail-modal")).toHaveCount(0);
  });

  test("opens the modal with full task info via a stable testid locator", async ({
    loggedInPage: page,
  }) => {
    await page.goto("/tasks/task-4");
    await expect(page.getByTestId("task-detail-modal")).toBeVisible();
    await expect(page.getByTestId("task-detail-title")).toHaveText("Add task detail modal");
    await expect(page.getByTestId("task-detail-description")).toHaveText(
      "Clicking a row opens a modal with full task info."
    );
    await expect(page.getByTestId("task-detail-status")).toHaveText("todo");
  });

  test("edit button in the modal navigates to the edit form for that task", async ({
    loggedInPage: page,
  }) => {
    await page.goto("/tasks/task-2");
    await page.getByTestId("modal-edit-button").click();
    await expect(page).toHaveURL(/\/tasks\/task-2\/edit$/);
  });

  test("close (fragile, no testid) returns to the tasks list and unmounts the modal", async ({
    loggedInPage: page,
  }) => {
    await page.goto("/tasks/task-1");
    await expect(page.getByTestId("task-detail-modal")).toBeVisible();
    // Fragile on purpose: this Close button is matched by class/text, not
    // data-testid — the modal has two different close affordances in the
    // DOM for exactly this reason (see fixture-app spec §4).
    await page.locator(".modal-close-text-btn", { hasText: "Close" }).click();

    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByTestId("task-detail-modal")).toHaveCount(0);
  });
});
