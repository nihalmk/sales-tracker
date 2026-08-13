const nextConfig = {
  env: {
    GRAPHQL_SERVER: process.env.GRAPHQL_SERVER,
    SERVER_URL: process.env.SERVER_URL,
    GRAPHQL_WEBSOCKET_SERVER: process.env.GRAPHQL_WEBSOCKET_SERVER,
  },
};

module.exports = nextConfig;
