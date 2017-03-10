// Karma configuration
// Generated on Thu Aug 11 2016 14:00:51 GMT+0800 (中国标准时间)

const path = require('path');

module.exports = function (config) {
    config.set({
        
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',
        
        
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],
        
        
        // list of files / patterns to load in the browser
        files: [
            'src/**/test.js',
            'src/**/*.test.js'
        ],
        
        
        // list of files to exclude
        exclude: [],
        
        
        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/**/*.js': ['webpack'],
            'src/**/test.js': ['webpack', 'sourcemap']
        },
        
        
        webpack: {
            devtool: 'inline-source-map',
            
            module: {
                
                loaders: [
                    // js loader
                    {
                        test: /\.js$/,
                        loader: 'babel',
                        exclude: /node_modules\//,
                        query: {
                            cacheDirectory: true,
                            presets: ['es2015'],
                            plugins: [
                                ['transform-runtime', {polyfill: true, regenerator: true}],
                                'transform-async-to-generator'
                            ]
                        }
                    }
                ]
            }
        },
        
        
        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],
        
        
        // pc app port
        port: 9876,
        
        
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        
        
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        
        
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,
        
        
        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],
        
        
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,
        
        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,
        
        //需要引入的插件
        plugins: [
            require('karma-webpack'),
            require('karma-jasmine'),
            require('karma-sourcemap-loader'),
            require('karma-chrome-launcher')
        ]
    })
    
};
