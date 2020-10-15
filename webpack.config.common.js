const webpack = require('webpack');
const dotenv = require('dotenv');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

const env = dotenv.config().parsed;
const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
}, {});


module.exports = {
    entry: './src/app.js',
    plugins: [
        new webpack.DefinePlugin(envKeys),
        new FaviconsWebpackPlugin('./assets/images/favico.png')
    ],
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: ['html-loader']
            },
            {
                test: /\.(svg|png)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[hash].[ext]',
                        outputPath: 'imgs'
                    }
                }
            },
            {
                test: /\.(woff2|eot|woff|ttf)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[hash].[ext]',
                        outputPath: 'fonts'
                    }
                }
            }
        ]
    }
}