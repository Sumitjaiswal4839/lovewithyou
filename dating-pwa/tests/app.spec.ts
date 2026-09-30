import { test, expect } from '@playwright/test';

test.describe('LoveWithYou Dating App Smoke Tests', () => {
  test('should load the application and show correct title', async ({ page }) => {
    // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
    await page.goto('/');
    
    // The page should have the correct title
    await expect(page).toHaveTitle(/LoveWithYou|Dating/i);
  });

  test('should navigate to premium page correctly', async ({ page }) => {
    await page.goto('/premium');
    
    // Expect the premium page to have some specific text or elements
    // We know from our previous work that Premium page has "Cashback Coins Vault" or "Subscription Tiers"
    await expect(page.locator('text=Subscription Tiers')).toBeVisible();
  });

  test('should navigate to settings page correctly', async ({ page }) => {
    await page.goto('/settings');
    
    // Settings page should have something related to Preferences or Themes
    await expect(page.locator('text=App Preferences').first()).toBeVisible();
  });
});
