import 'reflect-metadata';
import Koa from 'koa';
import koaBody from 'koa-bodyparser';
import KoaReqLogger from 'koa-req-logger';
import cors from 'kcors';
import helmet from 'koa-helmet';
import { logger } from '../common/logger';
import { ApolloServer } from 'apollo-server-koa';
import * as path from 'path';
import { setUpAccounts } from '../accounts/setup';
import { connect } from 'mongoose';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { buildTypeDefsAndResolvers } from 'type-graphql';
import { addRoutes } from './routes';
import compression from 'compression';
import { authChecker } from './common/authChecker';
import { runItemStartupCleanup } from './modules/items/autoCategorize';
// import { graphqlPubsub as pubSub } from './modules/graphqlPubsub/pubsub.service';

const koaConnect = require('koa-connect');

// @accounts/mongo-password (a nested dependency of @accounts/mongo) still calls
// the old `ObjectID` alias that the mongodb driver dropped in favor of `ObjectId`.
// Restore it on the single shared mongodb module instance.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const mongodbPkg = require('mongodb');
mongodbPkg.ObjectID = mongodbPkg.ObjectId;

const startUp = async () => {
  const PORT = process.env.PORT || 3000;

  const mongoURI = process.env.MONGO_URI;

  const app = new Koa();

  const koaLogger = new KoaReqLogger({
    pinoInstance: logger,
  });

  try {
    app.use(koaBody());

    app.use(
      cors({
        credentials: true,
      }),
    );

    app.use(helmet());
    app.use(koaConnect(compression()));

    const mongooseConnection = await connect(mongoURI);

    logger.info(`Connection to MongoDB successful`);

    logger.info(`Setting up account-js authentication`);

    const { accountsGraphQL } = setUpAccounts(mongooseConnection.connection);

    const { typeDefs: typeGraphqlTypeDefs, resolvers: typeGraphqlResolvers } =
      await buildTypeDefsAndResolvers({
        resolvers: [
          __dirname + '/modules/**/*.resolver.ts',
          __dirname + '/modules/**/*.resolver.js',
        ],
        emitSchemaFile: path.resolve(__dirname, '../schema.gql'),
        validate: false,
        authChecker,
        // pubSub,
      });

    const schema = makeExecutableSchema({
      typeDefs: mergeTypeDefs([accountsGraphQL.typeDefs, typeGraphqlTypeDefs]),
      resolvers: mergeResolvers([
        accountsGraphQL.resolvers,
        typeGraphqlResolvers,
      ]),
      resolverValidationOptions: { requireResolversForResolveType: 'ignore' },
    });

    logger.info('Initalizing Apollo graphQLServer.');

    let isProduction = process.env.NODE_ENV === 'production';

    const graphQLServer = new ApolloServer({
      schema,
      context: async ({ ctx, connection }) => {
        if (connection) {
          return connection.context;
        }

        const userContext = await accountsGraphQL.context(ctx);
        if (userContext) {
          ctx = { ...ctx, ...userContext };
        }
        return ctx;
      },
      introspection: !isProduction,
      // subscriptions: {
      //   keepAlive: 5000,
      //   onConnect: async (connectionParams: any) => {
      //     const { accountsServer } = getAccounts();
      //     if (connectionParams.token) {
      //       try {
      //         const session = await accountsServer.findSessionByAccessToken(
      //           connectionParams.token,
      //         );
      //         const user = await accountsServer.findUserById(session.userId);
      //         return {
      //           user: user,
      //         };
      //       } catch (e) {
      //         logger.error(
      //           'Error authentication subscription connection',
      //           e.message,
      //         );
      //       }
      //     }
      //     throw new Error('Missing auth token!');
      //   },
      // },
    });

    await graphQLServer.start();
    graphQLServer.applyMiddleware({ app });
    app.use(koaLogger.getMiddleware());

    await addRoutes(app);
    logger.info(`🚀 Server listening on ${PORT}`);
    app.listen(PORT);

    // Deliberately not awaited — must never delay startup or the first
    // request. Assigns a best-guess category to any item still missing
    // one, and backfills MRP from Sale Price where MRP is missing/0 (both
    // from historical data, or any edge case createItem's own auto-guess
    // didn't cover). Safe to run every boot: a shop with nothing to fix
    // just does one cheap query and returns.
    runItemStartupCleanup().catch((error) => {
      logger.error({ error }, 'Background item startup cleanup failed');
    });

    // K_SERVICE is set automatically on Cloud Run; skip the local dev-convenience
    // browser auto-open there since no `xdg-open`/browser exists in the container,
    // and an unhandled async exec error would otherwise crash the process.
    if (process.env.NODE_ENV !== 'development' && !process.env.K_SERVICE) {
      let url = `http://localhost:${PORT}`;
      let start =
        process.platform == 'darwin'
          ? 'open'
          : process.platform == 'win32'
            ? 'start'
            : 'xdg-open';
      require('child_process').exec(start + ' ' + url);
    }
    app.on('error', (error) => {
      if (error.code === 'EPIPE') {
        logger.warn({ error }, 'Koa app-level EPIPE error.');
      } else {
        logger.error({ error }, 'Koa app-level error');
      }
    });
  } catch (e) {
    logger.error(`Unable to start server : ${e.message}`);
    logger.error(e);
  }
};

startUp();
