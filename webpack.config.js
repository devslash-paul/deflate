module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.jsx', 
    debug: './src/huffman_all/debug.jsx'
  },
  output: {
    path: `${__dirname}/dist`,
    publicPath: '/',
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
  },
};
