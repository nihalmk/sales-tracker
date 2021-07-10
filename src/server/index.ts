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
import { mergeSchemas, makeExecutableSchema } from 'graphql-tools';
import { buildSchema } from 'type-graphql';
import { addRoutes } from './routes';
import compression from 'compression';
import { authChecker } from './common/authChecker';
// import { graphqlPubsub as pubSub } from './modules/graphqlPubsub/pubsub.service';

const koaConnect = require('koa-connect');

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

    const mongooseConnection = await connect(mongoURI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    logger.info(`Connection to MongoDB successful`);

    logger.info(`Setting up account-js authentication`);

    const { accountsGraphQL } = setUpAccounts(mongooseConnection.connection);

    const typeGraphqlSchema = await buildSchema({
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
      typeDefs: accountsGraphQL.typeDefs,
      resolvers: accountsGraphQL.resolvers,
      schemaDirectives: {
        ...accountsGraphQL.schemaDirectives,
      },
      resolverValidationOptions: { requireResolversForResolveType: false },
    });

    logger.info('Initalizing Apollo graphQLServer.');

    let isProduction = process.env.NODE_ENV === 'production';

    const graphQLServer = new ApolloServer({
      schema: mergeSchemas({
        schemas: [schema, typeGraphqlSchema],
      }),
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
      playground: {
        endpoint: isProduction ? undefined : '/graphql',
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

    graphQLServer.applyMiddleware({ app });
    app.use(koaLogger.getMiddleware());

    await addRoutes(app);
    logger.info(`🚀 Server listening on ${PORT}`);
    const httpServer = app.listen(PORT);
    graphQLServer.installSubscriptionHandlers(httpServer);

    let url = `http://localhost:${PORT}`;
    let start =
      process.platform == 'darwin'
        ? 'open'
        : process.platform == 'win32'
        ? 'start'
        : 'xdg-open';
    require('child_process').exec(start + ' ' + url);

    app.on('error', (error) => {
      if (error.code === 'EPIPE') {
        logger.warn('Koa app-level EPIPE error.', { error });
      } else {
        logger.error('Koa app-level error', { error });
      }
    });
  } catch (e) {
    logger.error(`Unable to start server : ${e.message}`);
    logger.error(e);
  }
};

startUp();
