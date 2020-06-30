// const withCSS = require('@zeit/next-css');

const nextConfig = {
  webpack(config, { isServer }) {
    if (isServer) {
      return config;
    }
    config.module.rules.push({
      test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: '[name].[ext]',
        },
      },
    });
    return config;
  },
  env: {
    GRAPHQL_SERVER: process.env.GRAPHQL_SERVER,
    GRAPHQL_WEBSOCKET_SERVER: process.env.GRAPHQL_WEBSOCKET_SERVER,
  },
  cssModules: true,
  cssLoaderOptions: {
    importLoaders: 1,
    localIdentName: '[local]',
  },
};

module.exports = nextConfig;
