import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import webpack from 'webpack';

const __dirname = path.resolve();

export default {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/',
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'tailwindcss',
                  'autoprefixer',
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    historyApiFallback: true,
    port: 3000,
    hot: true,
    open: false,
    proxy: {
      '/api': {
        target: process.env.API_PROXY_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '.',
          globOptions: {
            ignore: ['**/index.html'],
          },
        },
      ],
    }),
    new webpack.DefinePlugin({
      'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || 'http://localhost:5000'),
      'process.env.RAZORPAY_KEY_ID': JSON.stringify(process.env.RAZORPAY_KEY_ID || 'rzp_test_yourkeyid'),
    }),
  ],
};
