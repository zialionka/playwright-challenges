import { expect, test } from '@playwright/test';

// Challenge 1:
// - Fixed flaky repeated login by waiting for the success overlay to close and the form to reset.
// - Added focused assertions for the success message and submitted credentials.
// - Improved locators with accessible selectors instead of XPath/CSS where possible.
// - Avoided static waits; the test waits for real UI state.
// - Did not add POM/hooks/helpers because they would be overhead for this small, page-specific test.
test('Login multiple times successfully @c1', async ({ page }) => {
  // Navigation
  await page.goto('/');
  await page.getByRole('link', { name: 'Try Challenge 1' }).click();

  // Locators
  const emailInput = page.getByLabel('Email', { exact: true });
  const passwordInput = page.getByLabel('Password', { exact: true });
  const submitButton = page.getByRole('button', { name: 'Sign In' });

  const successHeading = page.getByRole('heading', { name: 'Successfully submitted!' });
  const successMessage = page.getByRole('status', { name: 'Submission result' });

  const emailDisplay = page.getByRole('note', { name: 'Submitted email' });
  const passwordDisplay = page.getByRole('note', { name: 'Submitted password' });

  // Test data
  const loginAttempts = [
    { email: 'test1@example.com', password: 'password1' },
    { email: 'test2@example.com', password: 'password2' },
    { email: 'test3@example.com', password: 'password3' },
  ];

  // Login multiple times
  for (const { email, password } of loginAttempts) {
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await submitButton.click();

    await expect(successHeading).toBeVisible();
    await expect(emailDisplay).toHaveText(`Email: ${email}`);
    await expect(passwordDisplay).toHaveText(`Password: ${password}`);

    await expect(successMessage).toBeHidden();
    await expect(emailInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
  }
});

// Login and logout successfully with animated form and delayed loading
test('Login animated form and logout sucessfully @c2', async ({ page }) => {
  await page.goto('/');
  await page.locator(`//*[@href='/challenge2.html']`).click();
  await page.locator('#email').fill(`test1@example.com`);
  await page.locator('#password').fill(`password1`);
  await page.locator('#submitButton').click();
  await page.locator('#menuButton').click();
  await page.locator('#logoutOption').click();
});

// Fix the Forgot password test and add proper assertions
test('Forgot password @c3', async ({ page }) => {
  await page.goto('/');
  await page.locator(`//*[@href='/challenge3.html']`).click();
  await page.getByRole('button', { name: 'Forgot Password?' }).click();
  await page.locator('#email').fill('test@example.com');
  await page.getByRole('button', { name: 'Reset Password' }).click();
  await expect(page.getByRole('heading', { name: 'Success!' })).toBeVisible();
  await expect(page.locator('#mainContent')).toContainText('Password reset link sent!');
});

//Fix the login test. Hint: There is a global variable that you can use to check if the app is in ready state
test('Login and logout @c4', async ({ page }) => {
  await page.goto('/');
  await page.locator(`//*[@href='/challenge4.html']`).click();
  await page.locator('#email').fill(`test@example.com`);
  await page.locator('#password').fill(`password`);
  await page.locator('#submitButton').click();
  await page.locator('#profileButton').click();
  await page.getByText('Logout').click();
});
