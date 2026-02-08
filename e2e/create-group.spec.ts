import { test, expect } from "@playwright/test";

test.describe("Create Group - Unauthenticated", () => {
  test("should show Sign in button when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Sign in")).toBeVisible();
  });
});

test.describe("Create Group - Error Handling", () => {
  test("should not show misleading 'must be signed in' error on page load", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Market Trends")).toBeVisible();

    // The error toast "You must be signed in to create a group" should NEVER
    // appear on page load. This verifies no race condition triggers the error
    // toast for users who haven't even tried to create a group.
    const errorToast = page.getByText("You must be signed in to create a group");
    await expect(errorToast).not.toBeVisible();
  });

  test("should not show 'unable to load profile' error on page load", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Market Trends")).toBeVisible();

    // The "Unable to load your profile" error should only appear when
    // an authenticated user tries to create a group and profile sync fails.
    // It should never appear spontaneously.
    const errorToast = page.getByText("Unable to load your profile");
    await expect(errorToast).not.toBeVisible();
  });
});

test.describe("Create Group - Dashboard Navigation", () => {
  test("should have My Groups tab on desktop", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Tab text is hidden on mobile viewports");

    await page.goto("/");
    await expect(page.getByText("Market Trends")).toBeVisible();

    // My Groups tab should be visible on desktop
    const myGroupsTab = page.getByText("My Groups").first();
    await expect(myGroupsTab).toBeVisible();
  });
});
