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

// Challenge 2:
// - Fixed flaky submit click by letting Playwright wait for the animated button to become stable.
// - Waits for delayed dashboard/menu initialization instead of using static waits.
// - Added focused assertions for login state, menu state, logout, and form reset.
// - Improved locators with accessible selectors instead of XPath/CSS where possible.
test('Login animated form and logout successfully @c2', async ({ page }) => {
  // Navigation
  await page.goto('/');
  await page.getByRole('link', { name: 'Try Challenge 2' }).click();

  // Locators
  const emailInput = page.getByLabel('Email', { exact: true });
  const passwordInput = page.getByLabel('Password', { exact: true });
  const submitButton = page.getByRole('button', { name: 'Sign In' });

  const loggedInUser = page.getByRole('status', { name: 'Logged in user' });

  const menuButton = page.getByRole('button', { name: 'My Account' });
  const accountMenu = page.getByRole('menu', { name: 'Account menu' });
  const logoutOption = page.getByRole('menuitem', { name: 'Logout' });

  // Test data
  const email = 'test1@example.com';
  const password = 'password1';

  // Login and logout
  await emailInput.fill(email);
  await passwordInput.fill(password);
  await submitButton.click({ timeout: 10000 });

  await expect(loggedInUser).toHaveText(`Logged in as: ${email}`);
  await expect(menuButton).toHaveAttribute('data-initialized', 'true');
  await menuButton.click();
  await expect(accountMenu).toBeVisible();
  await logoutOption.click();

  await expect(emailInput).toBeVisible();
  await expect(emailInput).toHaveValue('');
  await expect(passwordInput).toHaveValue('');
});

// Challenge 3:
// - Fixed flaky forgot password flow by waiting for the reset form after dynamic DOM replacement.
// - Added focused assertions for reset form state and success result.
// - Improved locators with accessible selectors instead of XPath/CSS where possible.
test('Forgot password @c3', async ({ page }) => {
  // Navigation
  await page.goto('/');
  await page.getByRole('link', { name: 'Try Challenge 3' }).click();

  // Locators
  const forgotPasswordButton = page.getByRole('button', { name: 'Forgot Password?' });
  const resetPasswordHeading = page.getByRole('heading', { name: 'Reset Password' });
  const emailInput = page.getByLabel('Email', { exact: true });
  const resetPasswordButton = page.getByRole('button', { name: 'Reset Password' });

  const successHeading = page.getByRole('heading', { name: 'Success!' });
  const formResult = page.getByRole('status', { name: 'Form result' });

  // Test data
  const email = 'test@example.com';

  // Forgot password flow
  await forgotPasswordButton.click();
  await expect(resetPasswordHeading).toBeVisible();
  await emailInput.fill(email);
  await resetPasswordButton.click();

  await expect(successHeading).toBeVisible();
  await expect(formResult).toContainText('Password reset link sent!');
  await expect(formResult).toContainText(`Email: ${email}`);
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
