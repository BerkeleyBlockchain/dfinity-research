const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const path = require('path');
const { ProvidePlugin } = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const defaultWebpackConfig = require('./webpack.config');

/**
 * Generate a webpack configuration for a canister.
 */
function generateWebpackDevConfig(config) {
  if (config.entry.index.includes('linkedup')) { // don't run linkedup in dev mode
    return;
  }
  console.log(config)
  const { outputRoot } = config
  return {
    ...config,
    mode: 'development',
    devServer: {
      contentBase: outputRoot,
      compress: true,
      port: 9000,
      proxy: {
        '/proxy': { target: 'http://localhost:8000/', pathRewrite: {'^/proxy': '' }},
        '/': 'http://localhost:8000/',
      }
    },
    devtool: 'source-map',
    plugins: [
      new BundleAnalyzerPlugin(),
      new HTMLWebpackPlugin({ template: './index.html' }),
      new ProvidePlugin({
        ic: [path.resolve(path.join(__dirname, 'ic-polyfill.js')), 'ic'],
      }),
    ],
  };
}

// add on dev-mode-specific changes
module.exports = [
  ...defaultWebpackConfig
    .map((config) => generateWebpackDevConfig(config))
    .filter((x) => !!x),
];
