import { test, expect } from '@playwright/test';

test.describe('Tersa Agent', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Mock authentication if needed
    // You might need to set up authentication state here
  });

  test('should open agent chat via command menu', async ({ page }) => {
    // Open command menu with Cmd+K
    await page.keyboard.press('Meta+k');
    
    // Wait for command menu to appear
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Type to search for Tersa Agent
    await page.keyboard.type('tersa agent');
    
    // Click on the Tersa Agent option
    await page.getByText('Ask Tersa Agent').click();
    
    // Verify agent chat is open
    await expect(page.getByText('Tersa Agent')).toBeVisible();
    await expect(page.getByPlaceholder(/Quick command|Describe what/)).toBeVisible();
  });

  test('should open agent chat with hotkey', async ({ page }) => {
    // Use Cmd+Shift+K hotkey
    await page.keyboard.press('Meta+Shift+k');
    
    // Verify agent chat is open
    await expect(page.getByText('Tersa Agent')).toBeVisible();
  });

  test('should send a message and receive response', async ({ page }) => {
    // Open agent chat
    await page.keyboard.press('Meta+Shift+k');
    
    // Type a message
    const input = page.getByPlaceholder(/Quick command|Describe what/);
    await input.fill('Create a text node');
    await input.press('Enter');
    
    // Wait for user message to appear
    await expect(page.getByText('Create a text node')).toBeVisible();
    
    // Wait for assistant response (with timeout)
    await expect(page.locator('.bg-muted').last()).toBeVisible({ timeout: 10000 });
  });

  test('should switch between overlay and sidebar modes', async ({ page }) => {
    // Open agent chat
    await page.keyboard.press('Meta+Shift+k');
    
    // Should start in overlay mode
    await expect(page.locator('.fixed.bottom-4.right-4')).toBeVisible();
    
    // Click maximize button
    await page.getByRole('button', { name: /maximize/i }).click();
    
    // Should switch to sidebar mode
    await expect(page.locator('.fixed.top-0.right-0')).toBeVisible();
    
    // Click minimize button
    await page.getByRole('button', { name: /minimize/i }).click();
    
    // Should switch back to overlay mode
    await expect(page.locator('.fixed.bottom-4.right-4')).toBeVisible();
  });

  test('should handle file uploads', async ({ page }) => {
    // Open agent chat
    await page.keyboard.press('Meta+Shift+k');
    
    // Find file input (usually hidden)
    const fileInput = page.locator('input[type="file"]');
    
    // Upload a test file
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Test file content'),
    });
    
    // Verify file is attached (look for file indicator)
    await expect(page.locator('[data-testid="file-attachment"]')).toBeVisible();
  });

  test('should close agent chat', async ({ page }) => {
    // Open agent chat
    await page.keyboard.press('Meta+Shift+k');
    
    // Verify it's open
    await expect(page.getByText('Tersa Agent')).toBeVisible();
    
    // Click close button
    await page.locator('button:has(svg.lucide-x)').click();
    
    // Verify it's closed
    await expect(page.getByText('Tersa Agent')).not.toBeVisible();
  });

  test('should open MCP config modal', async ({ page }) => {
    // Open command menu
    await page.keyboard.press('Meta+k');
    
    // Search for MCP config
    await page.keyboard.type('mcp');
    
    // Click on Configure MCP Tools
    await page.getByText('Configure MCP Tools').click();
    
    // Verify MCP config modal is open
    await expect(page.getByText('MCP Server Configuration')).toBeVisible();
    await expect(page.getByPlaceholder('Server URL')).toBeVisible();
  });

  test('should handle approval flow for destructive operations', async ({ page }) => {
    // This test would require mocking the agent response
    // to trigger a destructive operation
    
    // Open agent chat
    await page.keyboard.press('Meta+Shift+k');
    
    // Send a delete command
    const input = page.getByPlaceholder(/Quick command|Describe what/);
    await input.fill('Delete all nodes');
    await input.press('Enter');
    
    // Wait for approval prompt (if implemented)
    // This would need proper mocking of the streaming response
    // await expect(page.getByText('Approval Required')).toBeVisible({ timeout: 10000 });
    // await expect(page.getByText('Approve')).toBeVisible();
    // await expect(page.getByText('Reject')).toBeVisible();
  });

  test('should display agent status when executing actions', async ({ page }) => {
    // Open agent chat
    await page.keyboard.press('Meta+Shift+k');
    
    // Send a command
    const input = page.getByPlaceholder(/Quick command|Describe what/);
    await input.fill('Add a transform node');
    await input.press('Enter');
    
    // Check for streaming indicator
    await expect(page.locator('.animate-bounce')).toBeVisible();
    
    // Wait for completion
    await expect(page.locator('.animate-bounce')).not.toBeVisible({ timeout: 10000 });
  });

  test('should handle mobile viewport', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }
    
    // Open agent chat
    await page.keyboard.press('Meta+Shift+k');
    
    // On mobile, should take full width
    await expect(page.locator('.max-sm\\:bottom-0.max-sm\\:right-0.max-sm\\:left-0')).toBeVisible();
    
    // Should have mobile-specific height
    await expect(page.locator('.max-sm\\:h-\\[80vh\\]')).toBeVisible();
  });
});