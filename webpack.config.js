const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devtool: 'inline-source-map',
  devServer: {
    static: './dist',
  },
  output: {
    filename: 'aframe-volograms.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  externals: { three: 'THREE'} //this is req to avoid loading twice THREE
};
