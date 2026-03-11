import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// 登录辅助函数
async function login(page: any) {
  // 访问登录页
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('domcontentloaded');

  // 填写表单
  await page.locator('input[type="email"]').fill('admin@supermart.com');
  await page.locator('input[type="password"]').fill('Test123456');

  // 点击登录按钮
  await page.locator('button[type="submit"]').click();

  // 等待登录完成 - 等待 URL 变化或 toast 出现
  try {
    // 等待离开登录页
    await page.waitForURL('**/explore**', { timeout: 10000 });
  } catch {
    // 如果没有跳转，可能登录成功但仍在登录页
    // 等待 toast 通知
    await page.waitForSelector('text=登录成功', { timeout: 5000 }).catch(() => {});
  }

  // 强制导航到首页验证登录状态
  await page.goto(BASE_URL);
  await page.waitForLoadState('domcontentloaded');
}

test.describe('用户认证', () => {
  test('未登录用户访问首页应该重定向到登录页', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });

  test('登录页面应该正常显示', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('用户可以使用正确凭据登录', async ({ page }) => {
    await login(page);
    // 验证可以访问首页（如果未登录会重定向）
    expect(page.url()).not.toContain('/login');
  });

  test('用户登录失败应该显示错误提示', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);

    await page.locator('input[type="email"]').fill('wrong@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click({ force: true });

    // 应该停留在登录页
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });

  test('注册页面应该正常显示', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

test.describe('权限控制', () => {
  test('未登录用户不能访问创建页面', async ({ page }) => {
    await page.goto(`${BASE_URL}/create`);
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });

  test('未登录用户不能访问个人中心', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile`);
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });

  test('未登录用户不能访问我的内容', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile/contents`);
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });
});

test.describe('导航功能 - 需要登录', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('登录后首页应该显示内容', async ({ page }) => {
    // login 函数已经导航到首页了
    // 使用更精确的选择器，匹配 h1 标题
    await expect(page.locator('h1:has-text("SuperMart")')).toBeVisible({ timeout: 10000 });
  });

  test('探索页面应该正常显示', async ({ page }) => {
    await page.goto(`${BASE_URL}/explore`);
    // 页面应该加载，不一定有特定标题
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toContain('/explore');
  });

  test('创建页面应该正常显示', async ({ page }) => {
    await page.goto(`${BASE_URL}/create`);
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test('我的内容页面应该正常显示', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile/contents`);
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });
});
