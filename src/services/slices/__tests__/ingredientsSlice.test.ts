import { ingredientsReducer, fetchIngredients } from '../ingredientsSlice';
import { TIngredient } from '@utils-types';

const initialState = {
  items: [],
  isLoading: false,
  error: null
};

const testIngredient: TIngredient = {
  _id: '643d69a5c3f7b9001cfa093c',
  name: 'Краторная булка N-200i',
  type: 'bun',
  proteins: 80,
  fat: 24,
  carbohydrates: 53,
  calories: 420,
  price: 1255,
  image: 'https://code.s3.yandex.net/react/code/bun-02.png',
  image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png'
};

describe('редьюсер ingredientsSlice', () => {
  test('возвращает начальное состояние при неизвестном экшене', () => {
    const state = ingredientsReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  test('fetchIngredients.pending — включает загрузку и сбрасывает ошибку', () => {
    const previousState = {
      items: [],
      isLoading: false,
      error: 'предыдущая ошибка'
    };
    const state = ingredientsReducer(
      previousState,
      fetchIngredients.pending('requestId', undefined)
    );
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  test('fetchIngredients.fulfilled — выключает загрузку и сохраняет список ингредиентов', () => {
    const previousState = {
      items: [],
      isLoading: true,
      error: null
    };
    const state = ingredientsReducer(
      previousState,
      fetchIngredients.fulfilled([testIngredient], 'requestId', undefined)
    );
    expect(state.isLoading).toBe(false);
    expect(state.items).toEqual([testIngredient]);
  });

  test('fetchIngredients.rejected — выключает загрузку и сохраняет текст ошибки', () => {
    const previousState = {
      items: [],
      isLoading: true,
      error: null
    };
    const state = ingredientsReducer(
      previousState,
      fetchIngredients.rejected(
        new Error('Не удалось загрузить ингредиенты'),
        'requestId',
        undefined
      )
    );
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Не удалось загрузить ингредиенты');
  });
});
