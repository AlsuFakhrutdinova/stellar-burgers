import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TOrder } from '@utils-types';

type TUserOrdersState = {
  orders: TOrder[];
};

const initialState: TUserOrdersState = {
  orders: []
};

const userOrdersSlice = createSlice({
  name: 'userOrders',
  initialState,
  reducers: {
    setUserOrders: (state, action: PayloadAction<TOrder[]>) => {
      state.orders = action.payload;
    }
  }
});

export const { setUserOrders } = userOrdersSlice.actions;
export const userOrdersReducer = userOrdersSlice.reducer;
