import { test } from '@playwright/test';

test('submit a rubric note', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Work email' }).click();
  await page.getByRole('textbox', { name: 'Work email' }).fill('owner@test.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByTestId('Teams').click();
  await page.getByRole('link', { name: 'Engineering Team' }).click();
  await page.getByRole('link', { name: 'Rubric' }).nth(1).click();
  await page.locator('#rubric_evaluation_rubric_id').selectOption('1');
  await page.getByRole('button', { name: 'Create Rubric evaluation' }).click();
  await page.getByRole('cell', { name: 'Learning to code' }).click();
  await page.getByRole('textbox', { name: 'Enter notes...' }).click();
  await page.getByPlaceholder('Enter score...').click();
  await page.getByPlaceholder('Enter score...').fill('3');
  await page.getByRole('textbox', { name: 'Enter notes...' }).click();
  await page.getByRole('textbox', { name: 'Enter notes...' }).fill('Great work!');
  await page.getByRole('button', { name: 'Save' }).click();
});