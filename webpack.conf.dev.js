/**
 * develop config
 */

console.log('developing');
const path = require('path');
const webpack = require('webpack');

module.exports = {

    entry: [
        path.join(process.cwd(), '/src/Model.js')
    ],
    output: {
        path: path.join(process.cwd() + '/dist'),
        library: 'model',
        libraryTarget: 'commonjs2',
        filename: 'model.js'
    },
    devtool: '#module-source-map',
    cache: true,
    
    plugins: [

        new webpack.optimize.OccurrenceOrderPlugin(true/*preferEntry*/),

        new webpack.DefinePlugin({
            __SERVER__:      true,
            __DEVELOPMENT__: true,
            __DEVTOOLS__:    true,
            'process.env':   {
                BABEL_ENV: JSON.stringify('development'),
                NODE_ENV:  JSON.stringify('development')
            },
        }),

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
