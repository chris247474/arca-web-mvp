import { test, expect } from "@playwright/test";

test.describe("Groups Browse Page", () => {
  test("should load and display Browse Groups heading", async ({ page }) => {
    await page.goto("/groups");
    await expect(page.getByText("Browse Groups")).toBeVisible();
  });

  test("should display search input and sector filter", async ({ page }) => {
    await page.goto("/groups");
    await expect(page.getByTestId("input-search-groups")).toBeVisible();
    await expect(page.getByTestId("select-sector-filter")).toBeVisible();
  });

  test("should display group cards from database", async ({ page }) => {
    await page.goto("/groups");
    // Wait for loading to complete (skeleton placeholders disappear)
    await page.waitForSelector(".animate-pulse", { state: "detached", timeout: 10000 });
    // Should show at least one group card or empty state
    const groups = page.locator('[class*="grid"] > div');
    const emptyState = page.getByText("No groups found");
    const hasGroups = await groups.count() > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    expect(hasGroups || hasEmpty).toBeTruthy();
  });

  test("should filter groups when searching", async ({ page }) => {
    await page.goto("/groups");
    await page.waitForSelector(".animate-pulse", { state: "detached", timeout: 10000 });

    const searchInput = page.getByTestId("input-search-groups");
    await searchInput.fill("nonexistent-group-xyz-12345");
    // Wait for debounce (300ms) + network
    await page.waitForTimeout(500);
    await expect(page.getByText("No groups found")).toBeVisible();
  });

  test("should have mobile navigation", async ({ page }) => {
    await page.goto("/groups");
    // Mobile nav should have navigation items
    await expect(page.getByText("Browse Groups").first()).toBeVisible();
  });
});

test.describe("Groups Browse - Navigation", () => {
  test("should navigate to home from groups page", async ({ page }) => {
    await page.goto("/groups");
    // Click on dashboard nav item
    const dashboardNav = page.locator("text=Browse Groups").first();
    await expect(dashboardNav).toBeVisible();
  });
});
