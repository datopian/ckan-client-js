const path = require('path');
const assetPath = './lib';

module.exports = {
  // target: 'node',
  mode: 'production',
  devtool: "source-map",
  context: path.resolve(__dirname),
	entry: {
    "index": `${assetPath}/index.js`,
  },
	output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'var',
    library: 'ckanClient',// The variable name to access the library
	},
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  node: { fs: 'empty' },
};
