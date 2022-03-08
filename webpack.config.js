const path = require('path');

module.exports = {
  entry: './index.js',
  devtool: 'eval',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  mode: 'development',
  devServer: {
    static: {
      directory: path.join(__dirname, 'example')
    },
    historyApiFallback: true,
    open: true,
    compress: true,
    hot: true,
    port: 8080
  }
};