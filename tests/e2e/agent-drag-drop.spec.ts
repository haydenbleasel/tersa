import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Tersa Agent Drag & Drop', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Open agent chat
    await page.keyboard.press('Meta+Shift+k');
    
    // Wait for agent to be ready
    await expect(page.getByText('Tersa Agent')).toBeVisible();
  });

  test('should show drag indicator when dragging files', async ({ page }) => {
    // Get the dropzone area
    const dropzone = page.locator('[data-dropzone]').or(page.locator('div').filter({ hasText: /Ask me anything/ }).first());
    
    // Create a data transfer for file drag
    await dropzone.dispatchEvent('dragenter', {
      dataTransfer: {
        types: ['Files'],
        files: [],
      },
    });
    
    // Verify drag indicator is shown
    await expect(page.getByText('Drop files here...')).toBeVisible();
    
    // Leave the dropzone
    await dropzone.dispatchEvent('dragleave');
    
    // Verify drag indicator is hidden
    await expect(page.getByText('Drop files here...')).not.toBeVisible();
  });

  test('should accept dropped files', async ({ page }) => {
    const dropzone = page.locator('[data-dropzone]').or(page.locator('div').filter({ hasText: /Ask me anything/ }).first());
    
    // Create file data
    const fileName = 'test-workflow.json';
    const fileContent = JSON.stringify({
      nodes: [{ id: '1', type: 'text', data: {} }],
      edges: [],
    });
    
    // Simulate file drop
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      const file = new File(['{"test": "content"}'], 'test.json', { type: 'application/json' });
      dt.items.add(file);
      return dt;
    });
    
    await dropzone.dispatchEvent('drop', { dataTransfer });
    
    // Verify file is attached (look for file indicator with name)
    await expect(page.getByText('test.json')).toBeVisible();
  });

  test('should handle multiple file drops', async ({ page }) => {
    const dropzone = page.locator('[data-dropzone]').or(page.locator('div').filter({ hasText: /Ask me anything/ }).first());
    
    // Create multiple files
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
      const file3 = new File(['content3'], 'file3.txt', { type: 'text/plain' });
      dt.items.add(file1);
      dt.items.add(file2);
      dt.items.add(file3);
      return dt;
    });
    
    await dropzone.dispatchEvent('drop', { dataTransfer });
    
    // Verify all files are attached
    await expect(page.getByText('file1.txt')).toBeVisible();
    await expect(page.getByText('file2.txt')).toBeVisible();
    await expect(page.getByText('file3.txt')).toBeVisible();
  });

  test('should show correct file icons for different file types', async ({ page }) => {
    const dropzone = page.locator('[data-dropzone]').or(page.locator('div').filter({ hasText: /Ask me anything/ }).first());
    
    // Drop different file types
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File([''], 'image.png', { type: 'image/png' }));
      dt.items.add(new File([''], 'script.js', { type: 'text/javascript' }));
      dt.items.add(new File([''], 'document.pdf', { type: 'application/pdf' }));
      return dt;
    });
    
    await dropzone.dispatchEvent('drop', { dataTransfer });
    
    // Verify correct icons are shown
    // Image icon for image files
    await expect(page.locator('svg.lucide-image')).toBeVisible();
    // Code icon for JS files
    await expect(page.locator('svg.lucide-code')).toBeVisible();
    // FileText icon for other files
    await expect(page.locator('svg.lucide-file-text')).toBeVisible();
  });

  test('should remove files when X is clicked', async ({ page }) => {
    const dropzone = page.locator('[data-dropzone]').or(page.locator('div').filter({ hasText: /Ask me anything/ }).first());
    
    // Drop a file
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(['test'], 'removable.txt', { type: 'text/plain' }));
      return dt;
    });
    
    await dropzone.dispatchEvent('drop', { dataTransfer });
    
    // Verify file is attached
    await expect(page.getByText('removable.txt')).toBeVisible();
    
    // Click the X button to remove the file
    await page.locator('button:has(svg.lucide-x)').first().click();
    
    // Verify file is removed
    await expect(page.getByText('removable.txt')).not.toBeVisible();
  });

  test('should send message with attached files', async ({ page }) => {
    const dropzone = page.locator('[data-dropzone]').or(page.locator('div').filter({ hasText: /Ask me anything/ }).first());
    
    // Drop a file
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(['workflow content'], 'workflow.json', { type: 'application/json' }));
      return dt;
    });
    
    await dropzone.dispatchEvent('drop', { dataTransfer });
    
    // Type a message
    const input = page.getByPlaceholder(/Ask me anything/);
    await input.fill('Analyze this workflow');
    
    // Send the message
    await input.press('Enter');
    
    // Verify message and file were sent
    await expect(page.getByText('Analyze this workflow')).toBeVisible();
    // Files should be cleared after sending
    await expect(page.getByText('workflow.json')).not.toBeVisible();
  });

  test('should work with click-to-upload as fallback', async ({ page }) => {
    // Click the paperclip button
    await page.locator('button:has(svg.lucide-paperclip)').click();
    
    // Set files on the file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      {
        name: 'clicked-file.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('File uploaded via click'),
      },
    ]);
    
    // Verify file is attached
    await expect(page.getByText('clicked-file.txt')).toBeVisible();
  });

  test('should maintain drag-drop tip visibility', async ({ page }) => {
    // Verify the drag & drop tip is shown
    await expect(page.getByText('Drag & drop supported')).toBeVisible();
  });

  test('should handle drag-drop during message composition', async ({ page }) => {
    // Start typing a message
    const input = page.getByPlaceholder(/Ask me anything/);
    await input.fill('Here is my ');
    
    // Drop a file while message is being composed
    const dropzone = page.locator('[data-dropzone]').or(page.locator('div').filter({ hasText: /Ask me anything/ }).first());
    const dataTransfer = await page.evaluateHandle(() => {
      const dt = new DataTransfer();
      dt.items.add(new File(['content'], 'mid-typing.txt', { type: 'text/plain' }));
      return dt;
    });
    
    await dropzone.dispatchEvent('drop', { dataTransfer });
    
    // Verify file is attached
    await expect(page.getByText('mid-typing.txt')).toBeVisible();
    
    // Verify message text is preserved
    await expect(input).toHaveValue('Here is my ');
    
    // Complete and send the message
    await input.fill('Here is my file for analysis');
    await input.press('Enter');
    
    // Verify both message and file were sent
    await expect(page.getByText('Here is my file for analysis')).toBeVisible();
  });
});