const Repack = require('@callstack/repack');

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
 *
 * Learn about Rspack configuration: https://rspack.dev/config/
 * Learn about Re.Pack configuration: https://re-pack.dev/docs/guides/configuration
 */

module.exports = Repack.defineRspackConfig({
  context: __dirname,
  entry: './index.js',
  resolve: {
    ...Repack.getResolveOptions(),
    alias: {
      '@react-native/asset-utils$': require.resolve('@react-native/asset-utils'),
    },
  },
  module: {
    rules: [
      {
        test: /\.[cm]?[jt]sx?$/,
        type: 'javascript/auto',
        use: {
          loader: '@callstack/repack/babel-swc-loader',
          parallel: true,
          options: {},
        },
      },
      ...Repack.getAssetTransformRules(),
    ],
  },
  plugins: [new Repack.RepackPlugin()],
});
