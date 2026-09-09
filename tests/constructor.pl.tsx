import { test, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const INGREDIENTS_HAR = path.resolve(__dirname, 'hars/ingredients.har');
const ORDER_HAR = path.resolve(__dirname, 'hars/order.har');

const BUN_ID = '643d69a5c3f7b9001cfa093c';
const BUN_NAME = 'Краторная булка N-200i';
const MAIN_ID = '643d69a5c3f7b9001cfa0940';
const MAIN_NAME = 'Биокотлета из марсианской Магнолии';

type THarEntry = {
  request: { url: string };
  response: { content: { text: string } };
};

type THarFile = {
  log: { entries: THarEntry[] };
};

const readOrderNumberFromHar = (): string => {
  const harContent = fs.readFileSync(ORDER_HAR, 'utf-8');
  const har: THarFile = JSON.parse(harContent);
  const orderEntry = har.log.entries.find((entry) =>
    entry.request.url.includes('/api/orders')
  );
  if (!orderEntry) {
    throw new Error('В order.har не найден запрос на создание заказа');
  }
  const responseBody = JSON.parse(orderEntry.response.content.text) as {
    order: { number: number };
  };
  return String(responseBody.order.number);
};

const ORDER_NUMBER = readOrderNumberFromHar();

// Секция конструктора на странице — определяется по кнопке "Оформить заказ",
// чтобы не путать её с секцией списка ингредиентов
const getConstructorSection = (page: Page) =>
  page.locator('section').filter({ hasText: 'Оформить заказ' });

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
    const constructorSection = getConstructorSection(page);
    const bunCard = page.getByTestId(`ingredient-card-${BUN_ID}`);

    await bunCard.getByText('Добавить').click();

    await expect(
      constructorSection.getByText(`${BUN_NAME} (верх)`)
    ).toBeVisible();
    await expect(
      constructorSection.getByText(`${BUN_NAME} (низ)`)
    ).toBeVisible();
  });

  test('добавление начинки в конструктор', async ({ page }) => {
    const constructorSection = getConstructorSection(page);
    const mainCard = page.getByTestId(`ingredient-card-${MAIN_ID}`);

    await expect(
      constructorSection.getByText('Выберите начинку')
    ).toBeVisible();

    await mainCard.getByText('Добавить').click();

    await expect(constructorSection.getByText('Выберите начинку')).toBeHidden();
    await expect(constructorSection.getByText(MAIN_NAME)).toBeVisible();
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
    const bunCard = page.getByTestId(`ingredient-card-${BUN_ID}`);
    await bunCard.getByText(BUN_NAME).click();

    const modal = page.locator('#modals');
    await expect(modal.getByText(BUN_NAME)).toBeVisible();
    await expect(page).toHaveURL(/\/ingredients\//);
  });

  test('закрытие модального окна по клику на крестик', async ({ page }) => {
    const bunCard = page.getByTestId(`ingredient-card-${BUN_ID}`);
    await bunCard.getByText(BUN_NAME).click();

    const modal = page.locator('#modals');
    await expect(modal.getByText(BUN_NAME)).toBeVisible();

    await modal.locator('button[type="button"]').click();

    await expect(modal.getByText(BUN_NAME)).toBeHidden();
  });

  test('закрытие модального окна по клику на оверлей', async ({ page }) => {
    const bunCard = page.getByTestId(`ingredient-card-${BUN_ID}`);
    await bunCard.getByText(BUN_NAME).click();

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
    const constructorSection = getConstructorSection(page);

    await page
      .getByTestId(`ingredient-card-${BUN_ID}`)
      .getByText('Добавить')
      .click();
    await page
      .getByTestId(`ingredient-card-${MAIN_ID}`)
      .getByText('Добавить')
      .click();

    await page.getByText('Оформить заказ').click();

    const modal = page.locator('#modals');
    await expect(modal.getByText(ORDER_NUMBER)).toBeVisible();

    await expect(
      constructorSection.getByText('Выберите булки').first()
    ).toBeVisible();
    await expect(
      constructorSection.getByText('Выберите начинку')
    ).toBeVisible();

    await modal.locator('button[type="button"]').click();
    await expect(modal.getByText(ORDER_NUMBER)).toBeHidden();
  });
});
