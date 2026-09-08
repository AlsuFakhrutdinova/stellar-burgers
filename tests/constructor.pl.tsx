import { test, expect } from '@playwright/test';
import path from 'path';

const INGREDIENTS_HAR = path.resolve(__dirname, 'hars/ingredients.har');
const ORDER_HAR = path.resolve(__dirname, 'hars/order.har');

const BUN_NAME = 'Краторная булка N-200i';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';

test.describe('Конструктор бургера: добавление ингредиентов', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(INGREDIENTS_HAR, {
      url: '**/api/**',
      notFound: 'abort'
    });
    await page.goto('/');
    await expect(page.getByText(BUN_NAME)).toBeVisible();
  });

  test('добавление булки в конструктор', async ({ page }) => {
    const bunCard = page.locator('li', { hasText: BUN_NAME });
    await bunCard.getByText('Добавить').click();

    await expect(page.getByText(`${BUN_NAME} (верх)`)).toBeVisible();
    await expect(page.getByText(`${BUN_NAME} (низ)`)).toBeVisible();
  });

  test('добавление начинки в конструктор', async ({ page }) => {
    await expect(page.getByText('Выберите начинку')).toBeVisible();

    const mainCard = page.locator('li', { hasText: MAIN_NAME });
    await mainCard.getByText('Добавить').click();

    await expect(page.getByText('Выберите начинку')).toBeHidden();
  });
});

test.describe('Модальное окно ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await page.routeFromHAR(INGREDIENTS_HAR, {
      url: '**/api/**',
      notFound: 'abort'
    });
    await page.goto('/');
    await expect(page.getByText(BUN_NAME)).toBeVisible();
  });

  test('в модальном окне отображаются данные именно того ингредиента, по которому кликнули', async ({
    page
  }) => {
    await page.getByText(BUN_NAME).click();

    const modal = page.locator('#modals');
    await expect(modal.getByText(BUN_NAME)).toBeVisible();
    await expect(page).toHaveURL(/\/ingredients\//);
  });

  test('закрытие модального окна по клику на крестик', async ({ page }) => {
    await page.getByText(BUN_NAME).click();
    const modal = page.locator('#modals');
    await expect(modal.getByText(BUN_NAME)).toBeVisible();

    await modal.locator('button[type="button"]').click();

    await expect(modal.getByText(BUN_NAME)).toBeHidden();
  });

  test('закрытие модального окна по клику на оверлей', async ({ page }) => {
    await page.getByText(BUN_NAME).click();
    const modal = page.locator('#modals');
    await expect(modal.getByText(BUN_NAME)).toBeVisible();

    const overlay = page.locator('#modals > div').last();
    await overlay.click({ position: { x: 5, y: 5 } });

    await expect(modal.getByText(BUN_NAME)).toBeHidden();
  });
});

test.describe('Оформление заказа', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'Bearer test-access-token',
        domain: 'localhost',
        path: '/'
      }
    ]);
    await page.addInitScript(() => {
      window.localStorage.setItem('refreshToken', 'test-refresh-token');
    });

    await page.routeFromHAR(ORDER_HAR, {
      url: '**/api/**',
      notFound: 'abort'
    });

    await page.goto('/');
    await expect(page.getByText(BUN_NAME)).toBeVisible();
  });

  test('заказ создаётся, модальное окно показывает верный номер, конструктор очищается', async ({
    page
  }) => {
    await page
      .locator('li', { hasText: BUN_NAME })
      .getByText('Добавить')
      .click();
    await page
      .locator('li', { hasText: MAIN_NAME })
      .getByText('Добавить')
      .click();

    await page.getByText('Оформить заказ').click();

    const modal = page.locator('#modals');
    await expect(modal.getByText('12345')).toBeVisible();

    await expect(page.getByText('Выберите булки').first()).toBeVisible();
    await expect(page.getByText('Выберите начинку')).toBeVisible();

    await modal.locator('button[type="button"]').click();
    await expect(modal.getByText('12345')).toBeHidden();
  });
});
