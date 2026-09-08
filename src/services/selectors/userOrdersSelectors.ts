import { RootState } from '../store';

export const selectUserOrders = (state: RootState) => state.userOrders.orders;
