import pino from 'pino';

const dev = process.env.NODE_ENV !== 'production';

export const clientLogger = pino({
  name: 'gks-client',
  level: dev ? 'debug' : 'info',
  enabled: !(process.env.NO_LOG == 'true'),
});
