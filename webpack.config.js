
const dfxJson = require('./dfx.json');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

// Identify dfx output directory.
const output =
  ['defaults', 'build', 'output'].reduce(function (accum, x) {
    return accum && accum[x] ? accum[x] : null;
  }, dfxJson) || 'build';
console.debug('dfx output directory = ' + output);

// List of all aliases for canisters. This creates the module alias for
// the `import ... from "ic:canisters/xyz"` where xyz is the name of a
// canister.
const aliases = Object.entries(dfxJson.canisters).reduce((acc, [name, _value]) => {
  // Get the network name, or `local` by default.
  const networkName = process.env['DFX_NETWORK'] || 'local';
  const outputRoot = path.join(__dirname, '.dfx', networkName, 'canisters', name);

  return {
    ...acc,
    ['ic:canisters/' + name]: path.join(outputRoot, name + '.js'),
    ['ic:idl/' + name]: path.join(outputRoot, name + '.did.js'),
  };
}, {});

/**
 * Generate a webpack configuration for a canister.
 */
function generateWebpackConfigForCanister(name, info) {
  if (typeof info.frontend !== 'object') {
    return;
  }
  const outputRoot = path.join(__dirname, output, name);
  const inputRoot = __dirname;
  const entry = path.join(inputRoot, info.frontend.entrypoint);
  return {
    mode: 'production',
    entry,
    devtool: 'source-map',
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin()
      ],
    },
    resolve: {
      alias: aliases,
      extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
      rules: [
        { test: /\.(js|ts)x?$/, loader: 'ts-loader' },
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
        { test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader'] },
      ],
    },
    output: {
      filename: 'index.js',
      path: path.join(outputRoot, 'assets'),
    },
    plugins: [],
  };
}

// If you have webpack configurations you want to build as part of this
// config, add them here.
module.exports = [
  ...Object.entries(dfxJson.canisters)
    .map(([name, info]) => {
      return generateWebpackConfigForCanister(name, info);
    })
    .filter((x) => !!x),
];
