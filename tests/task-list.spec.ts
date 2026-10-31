import { test, expect } from "./fixtures/base";

test.describe("task list", () => {
  test("shows the seeded tasks in the table", async ({ loggedInPage: page }) => {
    await page.goto("/tasks");
    const rows = page.getByTestId("task-table").locator("tbody tr");
    await expect(rows).toHaveCount(4);
  });

  test("edit button is scoped per row via data-testid (stable locator)", async ({
    loggedInPage: page,
  }) => {
    await page.goto("/tasks");
    // Status badges reflect seeded data correctly.
    const doneRow = page.getByTestId("task-row-task-1");
    await expect(doneRow.locator(".status-badge")).toHaveText("Done");

    // Stable: the row and its edit button are both keyed by task id, so
    // this survives row reordering or sibling insertion.
    await page.getByTestId("edit-task-task-2").click();
    await expect(page).toHaveURL(/\/tasks\/task-2\/edit$/);
    await expect(page.getByTestId("task-title-input")).toHaveValue("Design the task list view");
  });

  test("delete removes only the targeted row, scoped to avoid the repeated-text trap", async ({
    loggedInPage: page,
  }) => {
    await page.goto("/tasks");
    // Fragile on purpose (fixture-app spec §4/§5): "Delete" has no
    // data-testid and the same text appears in every row, so this test
    // must scope the locator to a specific row rather than using a bare
    // getByText("Delete"), which would be ambiguous across 4 rows.
    const targetRow = page.getByTestId("task-row-task-3");
    await targetRow.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByTestId("task-row-task-3")).toHaveCount(0);
    await expect(page.getByTestId("task-table").locator("tbody tr")).toHaveCount(3);
  });

  test("clicking a task title (fragile, no testid) opens its detail modal", async ({
    loggedInPage: page,
  }) => {
    await page.goto("/tasks");
    // Fragile on purpose: the title cell is a styled <span>, located only
    // by its visible text, not a data-testid.
    await page.getByText("Set up project scaffolding", { exact: true }).click();
    await expect(page).toHaveURL(/\/tasks\/task-1$/);
    await expect(page.getByTestId("task-detail-title")).toHaveText("Set up project scaffolding");
  });

  test("empty state is shown once every task has been deleted", async ({ loggedInPage: page }) => {
    await page.goto("/tasks");
    for (const id of ["task-1", "task-2", "task-3", "task-4"]) {
      await page.getByTestId(`task-row-${id}`).getByRole("button", { name: "Delete" }).click();
      await expect(page.getByTestId(`task-row-${id}`)).toHaveCount(0);
    }
    await expect(page.getByTestId("empty-state")).toBeVisible();
  });
});
