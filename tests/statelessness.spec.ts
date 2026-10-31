import { test, expect } from "./fixtures/base";

test.describe("statelessness", () => {
  test("backend returns to the exact same 4-task baseline after reset, even after mutation", async ({
    loggedInPage: page,
  }) => {
    await page.goto("/tasks");
    await expect(page.getByTestId("task-table").locator("tbody tr")).toHaveCount(4);

    // Mutate: delete a task and create a new one.
    await page.getByTestId("task-row-task-1").getByRole("button", { name: "Delete" }).click();
    await page.goto("/tasks/new");
    await page.getByTestId("task-title-input").fill("Temporary task, should not survive reset");
    await page.getByTestId("task-form-submit").click();
    await expect(page.getByTestId("task-table").locator("tbody tr")).toHaveCount(4);

    // Reset via the API directly (what the test harness does before each run).
    const res = await page.request.post("http://localhost:4000/api/_reset");
    expect(res.ok()).toBe(true);

    await page.reload();
    await expect(page.getByTestId("task-table").locator("tbody tr")).toHaveCount(4);
    await expect(page.getByText("Set up project scaffolding")).toBeVisible();
    await expect(page.getByText("Temporary task, should not survive reset")).toHaveCount(0);
  });
});
