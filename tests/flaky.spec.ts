import { expect, test } from '@playwright/test';

// Challenge 1:
// - Fixed repeated login flakiness without static waits.
// - Root cause: the form resets only after the success overlay closes.
// - Fix: verify each submitted email/password pair, then wait for the overlay to hide and the form to reset.
// - Added focused assertions and improved locators with accessible selectors instead of XPath/CSS where possible.
// - Added small HTML accessibility attributes to support stable role-based locators.
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
// - Fixed animated login/logout flakiness without static waits.
// - Root cause: the submit button moves for several seconds, and the account menu appears before initialization.
// - Fix: let Playwright wait longer for button actionability, then wait for data-initialized before opening the menu.
// - Added focused assertions and improved locators with accessible selectors instead of XPath/CSS where possible.
// - Added small HTML accessibility attributes to support stable role-based locators.
test('Login animated form and logout successfully @c2', async ({ page }) => {
  // Navigation
  await page.goto('/');
  await page.getByRole('link', { name: 'Try Challenge 2' }).click();

  // Locators
  const emailInput = page.getByLabel('Email', { exact: true });
  const passwordInput = page.getByLabel('Password', { exact: true });
  const submitButton = page.getByRole('button', { name: 'Sign In' });

  const userEmail = page.getByRole('status', { name: 'Logged in user' });

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

  await expect(userEmail).toHaveText(`Logged in as: ${email}`);
  await expect(menuButton).toHaveAttribute('data-initialized', 'true');
  await menuButton.click();
  await expect(accountMenu).toBeVisible();
  await logoutOption.click();

  await expect(emailInput).toBeVisible();
  await expect(emailInput).toHaveValue('');
  await expect(passwordInput).toHaveValue('');
});

// Challenge 3:
// - Fixed forgot-password flakiness without static waits.
// - Root cause: the reset form is rendered after a dynamic DOM replacement.
// - Fix: wait for the reset form before filling email, then verify the success message and submitted email.
// - Added focused assertions and improved locators with accessible selectors instead of XPath/CSS where possible.
// - Added a small HTML accessibility attribute to support a stable role-based result locator.
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

// Challenge 4:
// - Fixed app-ready login/logout flakiness without static waits.
// - Root cause: window.isAppReady can flip before handlers are fully attached.
// - Fix: wait for the app-ready global, retry login until the profile email appears, then verify logout/reset.
// - Added focused assertions and improved locators with accessible selectors instead of XPath/CSS where possible.
// - Added small HTML accessibility attributes to support stable role-based locators.
test('Login and logout successfully @c4', async ({ page }) => {
  // Navigation
  await page.goto('/');
  await page.getByRole('link', { name: 'Try Challenge 4' }).click();

  // Locators
  const emailInput = page.getByLabel('Email', { exact: true });
  const passwordInput = page.getByLabel('Password', { exact: true });
  const submitButton = page.getByRole('button', { name: 'Sign In' });

  const userEmail = page.getByRole('status', { name: 'Logged in user' });

  const profileButton = page.getByRole('button', { name: 'Profile menu' });
  const profileMenu = page.getByRole('menu', { name: 'Profile menu' });
  const logoutOption = page.getByRole('menuitem', { name: 'Logout' });

  // Test data
  const email = 'test@example.com';
  const password = 'password';

  // Login and logout
  await page.waitForFunction(() => {
    const appWindow = window as Window & { isAppReady?: boolean };
    return appWindow.isAppReady === true;
  });

  // isAppReady can be set before handlers are attached, so retry until login has a visible effect.
  await expect(async () => {
    await emailInput.fill(email);
    await passwordInput.fill(password);
    await submitButton.click();
    await expect(userEmail).toHaveText(email, { timeout: 500 });
  }).toPass({ timeout: 5000 });

  await profileButton.click();
  await expect(profileMenu).toBeVisible();
  await logoutOption.click();

  await expect(emailInput).toBeVisible();
  await expect(emailInput).toHaveValue('');
  await expect(passwordInput).toHaveValue('');
});
