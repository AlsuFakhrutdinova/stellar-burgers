import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { selectUserOrders } from '../../services/selectors/userOrdersSelectors';
import { setUserOrders } from '../../services/slices/userOrdersSlice';
import { getCookie } from '../../utils/cookie';
import { WS_URL } from '../../utils/ws';

export const ProfileOrders: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectUserOrders);

  useEffect(() => {
    const accessToken = getCookie('accessToken');
    if (!accessToken) return;

    const token = accessToken.replace('Bearer ', '');
    const ws = new WebSocket(`${WS_URL}/orders?token=${token}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.success) {
        dispatch(setUserOrders(data.orders));
      }
    };

    return () => {
      ws.close();
    };
  }, [dispatch]);

  return <ProfileOrdersUI orders={orders} />;
};
