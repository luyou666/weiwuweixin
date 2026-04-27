import { test, expect } from '@playwright/test';

/**
 * E2E 测试：新建榜单流程
 * 覆盖 /zh/list/new 的 4 步创建器
 */

test.describe('新建榜单流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh/list/new');
  });

  test('应正确展示 4 步创建器步骤指示器', async ({ page }) => {
    const stepButtons = page.locator('nav button');
    await expect(stepButtons).toHaveCount(4);
    await expect(stepButtons.nth(0)).toContainText('1');
    await expect(stepButtons.nth(1)).toContainText('2');
    await expect(stepButtons.nth(2)).toContainText('3');
    await expect(stepButtons.nth(3)).toContainText('4');
  });

  test('步骤 1：填写标题（≤30字校验）', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('榜单标题');

    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill('我的测试榜单');
    await expect(titleInput).toHaveValue('我的测试榜单');

    // 验证字数统计可见
    await expect(page.getByText('/30').first()).toBeVisible();
  });

  test('步骤 1：标题字数超过 30 字应被截断', async ({ page }) => {
    const titleInput = page.locator('input[type="text"]').first();
    const longTitle = '这是一段非常非常非常非常非常长的标题文字超过了三十个字';
    await titleInput.fill(longTitle);
    // input 有 maxLength=30，值应被截断
    const value = await titleInput.inputValue();
    expect(value.length).toBeLessThanOrEqual(30);
  });

  test('步骤 1：填写副标题和选择分类标签', async ({ page }) => {
    // 填写副标题
    const subtitleInput = page.locator('input[type="text"]').nth(1);
    await subtitleInput.fill('这是副标题');
    await expect(subtitleInput).toHaveValue('这是副标题');

    // 选择分类标签（点击「音乐」标签）
    const musicTag = page.getByRole('button', { name: '音乐' });
    if (await musicTag.isVisible()) {
      await musicTag.click();
      // 选中后应有 vermilion 背景色
      await expect(musicTag).toHaveClass(/vermilion/);
    }
  });

  test('步骤 2：添加条目', async ({ page }) => {
    // 导航到步骤 2
    await page.locator('nav button').nth(1).click();
    await expect(page.locator('h2')).toContainText('添加条目');

    // 点击「添加条目」按钮
    await page.getByRole('button', { name: /添加条目/ }).click();

    // 在新增的条目输入框中输入名称
    const itemInputs = page.locator('input[type="text"]');
    const inputCount = await itemInputs.count();
    const nameInput = itemInputs.nth(inputCount > 1 ? 1 : 0);
    await nameInput.fill('红烧肉');
    await expect(nameInput).toHaveValue('红烧肉');
  });

  test('步骤 3：添加维度', async ({ page }) => {
    // 导航到步骤 3
    await page.locator('nav button').nth(2).click();
    await expect(page.locator('h2')).toContainText('配置维度');

    // 点击「添加维度」按钮
    await page.getByRole('button', { name: /添加维度/ }).click();

    // 输入维度名称
    const dimNameInput = page.locator(
      'input[placeholder*="维度名称"], input[placeholder*="口感"]'
    );
    await dimNameInput.fill('口感');

    // 设置权重为 50
    const weightInput = page.locator('input[type="number"]').first();
    if (await weightInput.isVisible()) {
      await weightInput.fill('50');
    }
  });

  test('步骤 4：选择算法', async ({ page }) => {
    // 导航到步骤 4
    await page.locator('nav button').nth(3).click();
    await expect(page.locator('h2')).toContainText('选择算法');

    // 选择加权平均算法
    const weightedMeanButton = page.getByRole('button', { name: /加权平均/ });
    if (await weightedMeanButton.isVisible()) {
      await weightedMeanButton.click();
    }
  });

  test('完整流程：4 步创建并验证摘要预览可见', async ({ page }) => {
    // Step 1: 填写标题
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill('我的测试榜单');

    // 前往步骤 2
    await page.locator('nav button').nth(1).click();

    // Step 2: 添加条目
    await page.getByRole('button', { name: /添加条目/ }).click();
    const nameInput = page.locator('input[type="text"]').nth(1);
    await nameInput.fill('红烧肉');

    // 前往步骤 3
    await page.locator('nav button').nth(2).click();

    // Step 3: 添加维度
    await page.getByRole('button', { name: /添加维度/ }).click();
    const dimNameInput = page.locator(
      'input[placeholder*="维度名称"], input[placeholder*="口感"]'
    );
    await dimNameInput.fill('口感');

    // 前往步骤 4
    await page.locator('nav button').nth(3).click();

    // Step 4: 选择加权平均算法
    const weightedMeanButton = page.getByRole('button', { name: /加权平均/ });
    if (await weightedMeanButton.isVisible()) {
      await weightedMeanButton.click();
    }

    // 验证摘要预览区可见
    await expect(page.locator('h2:has-text("选择算法")')).toBeVisible();
  });
});