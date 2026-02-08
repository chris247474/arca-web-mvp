import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load and display Market Trends heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Market Trends")).toBeVisible();
  });

  test("should display stock carousel cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("card-stock-AAPL").first()).toBeVisible();
    await expect(page.getByTestId("card-stock-MIPANDA").first()).toBeVisible();
    await expect(page.getByTestId("card-stock-LDM").first()).toBeVisible();
    await expect(page.getByTestId("card-stock-AMZN").first()).toBeVisible();
  });

  test("should display navigation tabs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Browse Groups")).toBeVisible();
    await expect(page.getByText("My Groups")).toBeVisible();
    await expect(page.getByText("My Deals")).toBeVisible();
    await expect(page.getByText("Portfolio")).toBeVisible();
  });

  test("should display Sign in button when unauthenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Sign in")).toBeVisible();
  });

  test("should show ArCa logo/text in header", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("ArCa").first()).toBeVisible();
  });

  test("should have theme toggle button", async ({ page }) => {
    await page.goto("/");
    // Theme toggle is an icon button
    const themeToggle = page.locator("button").filter({ has: page.locator("svg") }).first();
    await expect(themeToggle).toBeVisible();
  });
});

test.describe("Home Page - Browse Groups Tab", () => {
  test("should display group cards on Browse Groups tab", async ({ page }) => {
    await page.goto("/");
    // Browse Groups is the default active tab
    await expect(page.getByText("Discover groups curated by experienced investors")).toBeVisible();
  });

  test("should have a search input for groups", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByPlaceholder("Search groups...")).toBeVisible();
  });

  test("should display Apply to Join buttons on group cards", async ({ page }) => {
    await page.goto("/");
    const applyButtons = page.getByText("Apply to Join");
    await expect(applyButtons.first()).toBeVisible();
  });
});
