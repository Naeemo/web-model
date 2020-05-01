
# web-model 

<a href="https://www.npmjs.com/package/web-model"><img src="https://img.shields.io/npm/v/web-model.svg?sanitize=true" alt="Version"></a>
<a href="https://www.npmjs.com/package/web-model"><img src="https://img.shields.io/npm/l/web-model.svg?sanitize=true" alt="License"></a>

API layer for the web, organize your api requests nicely.

Instead of repeating api requests everywhere in your SPA, a maintainable model layer for backend's api service seems more reasonable. 
Web-model has many useful features: request/response guards, request caching(web storage), singleton request, and more to come.
Web-model rely [superagent](https://github.com/visionmedia/superagent) as ajax tool.

## Install

```bash
yarn add web-model
```
or
```
npm i web-model
```

Notice, if you are using babel(like babel-loader with webpack 4+), make sure to include `node_modules/web-model` in the compile process.

Example for webpack 4+
```JavaScript
module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: {
                    test: /node_modules/,
                    exclude: /web-model/
                },
                options: {}
            }
        ]
    }
    // ...
}
```

## Basic usage
Define the model
```JavaScript
import Model from 'web-model';
export default new Model({
    base: 'https://xxx.xxxx.com',
    api: {
        getApples() {
            return this.request.get('/apple')
        },
        getApple(id) {
            return this.request.get(`/apple/${id}`)
        },
        saveApple(apple) {
            return this.request.post('/apple').send(apple)
        },
        updateApple(apple) {
            return this.request.put(`/apple/${id}`).send(apple)
        },
        deleteApple(id) {
            return this.request.del(`/apple/${id}`)
        },
    }
})
```
then
```JavaScript
import appleModel from './path/to/appleModel.js'

appleModel.getApples().then(({body: {apples}}) => {
    console.log('all my apples are here: ', apples);
})
```

## Documents

   [web-model](https://naeemo.github.io/web-model/)

___


Supported by [JetBrains open source program](https://www.jetbrains.com/community/opensource/#support?from=web-model).
