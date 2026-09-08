import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { selectFeedOrders } from '../../services/selectors/feedSelectors';
import { fetchFeeds, setFeedData } from '../../services/slices/feedSlice';
import { WS_URL } from '../../utils/ws';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFeedOrders);

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}/orders/all`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.success) {
        dispatch(
          setFeedData({
            orders: data.orders,
            total: data.total,
            totalToday: data.totalToday
          })
        );
      }
    };

    return () => {
      ws.close();
    };
  }, [dispatch]);

  const handleGetFeeds = () => {
    dispatch(fetchFeeds());
  };

  if (!orders.length) {
    return <Preloader />;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
