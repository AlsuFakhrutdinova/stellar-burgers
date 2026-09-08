export const WS_URL = (process.env.BURGER_API_URL as string)
  .replace('https://', 'wss://')
  .replace('/api', '');
