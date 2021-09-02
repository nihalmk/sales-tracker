import next from 'next';
import Koa from 'koa';
import Router from 'koa-router';
const { mongoExport } = require('mongoback');

const dev = !['production', 'staging'].includes(process.env.NODE_ENV || '');

const router = new Router();

// Initialize NextJs instance and expose request handler
const nextApp = next({ dir: './src/client', dev });
const handler = nextApp.getRequestHandler();

export const addRoutes = async (app: Koa) => {
  await nextApp.prepare();

  // Kubernetes readiness probe endpoint
  router.get('/healthz', async (ctx) => {
    ctx.body = 'gfs-kitchen-screens is healthy';
    ctx.respond = true;
  });

  router.get('/dbbackup', async (ctx) => {
    console.log(__dirname);
    try {
      const options = {
        uri: process.env.MONGO_URI,
        outDir: '../../dbbackup',
        databases: 'sales-tracker',
      };

      mongoExport(options);
    } catch (e) {
      console.log(e);
    }

    ctx.body = {
      message: 'DB Backup Queued. Check `dbbackup` folder after some time',
    };
    ctx.respond = true;
  });

  router.get('*', async (ctx) => {
    await handler(ctx.req, ctx.res);
    ctx.respond = false;
  });

  app.use(async (ctx, next) => {
    ctx.res.statusCode = 200;
    await next();
  });
  app.use(router.routes()).use(router.allowedMethods());
};
