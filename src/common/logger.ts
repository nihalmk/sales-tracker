import pino from 'pino';

const dev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  name: 'sales-tracker',
  level: dev ? 'debug' : 'info',
  enabled: !(process.env.NO_LOG == 'true'),
});
