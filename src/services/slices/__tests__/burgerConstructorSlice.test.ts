jest.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}));

import {
  burgerConstructorReducer,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from '../burgerConstructorSlice';
import { TIngredient } from '@utils-types';

const initialState = {
  bun: null,
  ingredients: []
};

const testBun: TIngredient = {
  _id: 'bun-1',
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

const testMain: TIngredient = {
  _id: 'main-1',
  name: 'Биокотлета из марсианской Магнолии',
  type: 'main',
  proteins: 420,
  fat: 142,
  carbohydrates: 242,
  calories: 4242,
  price: 424,
  image: 'https://code.s3.yandex.net/react/code/meat-01.png',
  image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
  image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png'
};

describe('редьюсер burgerConstructorSlice', () => {
  test('возвращает начальное состояние при неизвестном экшене', () => {
    const state = burgerConstructorReducer(undefined, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  test('addIngredient с булкой — записывает её в bun', () => {
    const state = burgerConstructorReducer(
      initialState,
      addIngredient(testBun)
    );
    expect(state.bun).toEqual({ ...testBun, id: 'mock-uuid' });
    expect(state.ingredients).toHaveLength(0);
  });

  test('addIngredient с начинкой — добавляет её в конец списка ingredients', () => {
    const state = burgerConstructorReducer(
      initialState,
      addIngredient(testMain)
    );
    expect(state.ingredients).toEqual([{ ...testMain, id: 'mock-uuid' }]);
    expect(state.bun).toBeNull();
  });

  test('removeIngredient — удаляет ингредиент по id', () => {
    const previousState = {
      bun: null,
      ingredients: [
        { ...testMain, id: 'id-1' },
        { ...testMain, id: 'id-2' }
      ]
    };
    const state = burgerConstructorReducer(
      previousState,
      removeIngredient('id-1')
    );
    expect(state.ingredients).toEqual([{ ...testMain, id: 'id-2' }]);
  });

  test('moveIngredient — перемещает ингредиент вверх', () => {
    const previousState = {
      bun: null,
      ingredients: [
        { ...testMain, id: 'id-1', name: 'Первый' },
        { ...testMain, id: 'id-2', name: 'Второй' }
      ]
    };
    const state = burgerConstructorReducer(
      previousState,
      moveIngredient({ index: 1, direction: 'up' })
    );
    expect(state.ingredients[0].id).toBe('id-2');
    expect(state.ingredients[1].id).toBe('id-1');
  });

  test('moveIngredient — перемещает ингредиент вниз', () => {
    const previousState = {
      bun: null,
      ingredients: [
        { ...testMain, id: 'id-1', name: 'Первый' },
        { ...testMain, id: 'id-2', name: 'Второй' }
      ]
    };
    const state = burgerConstructorReducer(
      previousState,
      moveIngredient({ index: 0, direction: 'down' })
    );
    expect(state.ingredients[0].id).toBe('id-2');
    expect(state.ingredients[1].id).toBe('id-1');
  });

  test('clearConstructor — очищает булку и список ингредиентов', () => {
    const previousState = {
      bun: { ...testBun, id: 'id-bun' },
      ingredients: [{ ...testMain, id: 'id-1' }]
    };
    const state = burgerConstructorReducer(previousState, clearConstructor());
    expect(state).toEqual(initialState);
  });
});
