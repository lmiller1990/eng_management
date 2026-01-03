import { test, expect } from '@playwright/test';

const ranNum = Math.round(Math.random() * 10000)

test('has title', async ({ page }) => {
  await page.goto('/');

  await page.getByPlaceholder("Work email").fill("owner@test.com")
  await page.getByPlaceholder("Password").fill("password")
  await page.getByText("Login").click()
  await page.getByTestId('Teams').click()
  await page.getByText('New team').first().click()
  await page.getByPlaceholder('Team name').fill(`Team Number ${ranNum}`)
  await page.getByPlaceholder('What is this team for?').fill("Testing it out")
  await page.getByText("Create team").click()

  const tbody = page.getByTestId('team-members');

  // the owner is the only member
  await expect(tbody.locator('tr')).toHaveCount(1);

  // Invite to join
  const invitee = `${ranNum}@test.com`
  await page.getByPlaceholder(`Email address`).fill(invitee)
  await page.getByText("Send Invite").click()

  const row = page.getByTestId('pending-invites')
    .locator('tr', { hasText: invitee });
  await row.getByRole('link', { name: 'View Notes' }).click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(`1-on-1 Notes: ${invitee}`)
});