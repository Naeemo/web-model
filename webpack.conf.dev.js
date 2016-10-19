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
        filename: '[name].min.js',
        chunkFilename: '[name].js'
    },
    devtool: '#module-source-map',
    debug: true,
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
        loaders: [
            // js loader
            {
                test: /\.js$/,
                loader: 'babel',
                include: [
                    path.join(process.cwd() + '/src'),
                ]
            }
        ]
    },
    babel: {
        cacheDirectory: true,
        presets: [
            'es2015',
            'stage-2'
        ],
        plugins: [
            [
                'transform-runtime',
                {
                    polyfill: true,
                    regenerator: true
                }
            ],
            'transform-async-to-generator'
        ]
    }

};
