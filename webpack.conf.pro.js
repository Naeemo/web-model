/**
 * building for release
 */

console.log('building for release');
const path = require('path');
const DIST_DIR = path.join(process.cwd(), '/dist');
const webpack = require('webpack');
const CleanPlugin = require('clean-webpack-plugin');

module.exports = {
    
    entry: [
        path.join(process.cwd(), '/src/Model.js')
    ],
    output: {
        path: DIST_DIR,
        library: 'model',
        libraryTarget: 'commonjs2',
        filename: 'model.js'
    },
    devtool: false,
    cache: false,
    plugins: [
        new CleanPlugin(DIST_DIR),
        
        new webpack.optimize.UglifyJsPlugin({
            mangle: true,
            compress: {
                warnings: false
            },
        }),
        
        new webpack.optimize.OccurrenceOrderPlugin(true/*preferEntry*/),
        
        new webpack.DefinePlugin({
            __SERVER__: false,
            __DEVELOPMENT__: false,
            __DEVTOOLS__: false,
            'process.env': {
                BABEL_ENV: JSON.stringify('production'),
                NODE_ENV: JSON.stringify('production')
            },
        })
    
    ],
    module: {
        rules: [
            // js loader
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [
                    path.join(process.cwd() + '/src'),
                ]
            }
        ]
    }
};
