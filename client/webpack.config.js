const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
      fs: false,
      crypto: false,
      stream: false,
    },
  },
  module: {
    rules: [
      // ✅ Leaflet and MarkerCluster CSS (skip PostCSS)
      {
        test: /\.css$/,
        include: /node_modules\/(leaflet|leaflet\.markercluster)/,
        use: ['style-loader', 'css-loader'],
      },
      // ✅ Other node_modules CSS (still skip PostCSS)
      {
        test: /\.css$/,
        include: /node_modules/,
        exclude: /node_modules\/(leaflet|leaflet\.markercluster)/,
        use: ['style-loader', 'css-loader'],
      },
      // ✅ Your own CSS (with Tailwind)
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      // ✅ JS/JSX
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
    ],
  },
};