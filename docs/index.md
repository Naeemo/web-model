[中文](https://naeemo.github.io/web-model/zh-CN.html) | [English](https://naeemo.github.io/web-model/)

Instead of repeating api requests everywhere in your SPA, a maintainable model layer for backend's api service seems more reasonable. 
Web-model has many useful features: request/response guards, request caching(web storage), singleton request, and more to come.
Web-model rely [superagent](https://github.com/visionmedia/superagent) as ajax tool.

> Request lifecycle: 
    ``` 
    request -> Model.beforeEach -> instance.beforeEach
    -> (requesting) -> 
    response -> Model.afterEach -> instance.afterEach -> handler 
    ```

## Example
Suppose we have a Restful API resource: 'https://www.xxxx.com/apple', organize all related requests inside one `appleModel.js` with Web-model:
```javascript
import Model from 'web-model';
export default new Model({
    base: 'https://xxx.xxxx.com',
    api: {
        getApples() {
            return this.request.get('/apple')
        },
        getApple(id) {
            return this.request.get('/apple/' + id)
        },
        saveApple(apple) {
            return this.request.post('/apple').send(apple)
        },
        updateApple(apple) {
            return this.request.put('/apple/' + id).send(apple)
        },
        deleteApple(id) {
            return this.request.del('/apple/' + id)
        },
    }
})
```
then use the model instance wherever an apple-resource request needed:
```javascript
import appleModel from './path/to/appleModel.js'
// ...
appleModel.getApples().then(({body: {apples}}) => {
    console.log('all my apples are here: ', apples);
})
// etc.
````

## API

### 1. Superagent API

check [superagent's docs](http://visionmedia.github.io/superagent/) first.

### 2. Static methods

```
import Model from 'web-model'

Model.use({

    // url prefix
    base: String,
    
    // public request guard
    beforeEach(next) {
        /**
         *  1. this bind to current request object
         *  2. call next(falsy), break the request:
         *  3. call next() or next(truthy), continue the request:
         */
    },
    
    // public response guard
    afterEach(err, res) {
        /**
         *  1. this bind to current request object
         *  2. (err, res) come from superagent's repsonse
         */
    }
    
})
```

### 3. Constructor

```
// inside xxxModel.js
import Model from 'web-model'

export default new Model({

    // instance specific url prefix, override public url prefix
    base: String,
    
    // instance specific request guard
    beforeEach(next) {
        /**
         *  1. this bind to current request object
         *  2. call next(falsy), break the request:
         *  3. call next() or next(truthy), continue the request:
         */
    },
    
    // instance specific response guard
    afterEach(err, res) {
        /**
         *  1. this bind to current request object
         *  2. (err, res) come from superagent's response
         */
    },
    
    // request method examples
    api: {
        
        /**
         * @return {Promise}
         */
        xxxRequest() {
            /**
             *  1. this.request is a modified superagent
             */
        }
   
    }
    
})
```

### 3. methods attached to superagent

1. __escape(direction)__ escape guards manually.

    - _direction_
        - 'both', default value, escape both request and response guards.
        - 'before', escape request guards.
        - 'after', escape response guards.
    
    ```
    // Example: userModel.js
    export default new Model({
        api: {
            login(user) {
                this.request
                    .post('/login')
                    .send(user)
                    .escape()   // escape('both') or escape('before') or escape('after')
            }
        }
    })
    ```

2. __cache(minutes, useSessionStorage)__ cache a _GET_ or _HEAD_ request

    - _minutes_ cache valid duration in minutes.
    - _useSessionStorage_ truthy for sessionStorage/falsy for localStorage.
    
    ```
    // Example: userModel.js
    export default new Model({
        api: {
            getUser(id) {
                return this.request
                    .get('/' + id)      
                    .cache(30, true)    // 30 minutes' cache in sessionStorage
                    // .cache(30)       // 30 minutes' cache in localStorage
            }
        }
    })
    ```

3. __singleton()__ mark a request as singleton

    > this means only one request can be in process at the same time, 
    previous request will be aborted.

    ```
    // Example: userModel.js
    export default new Model({
        api: {
           superComplicatedQuery(id, query) {
               return this.request
                   .get(`/user/${id}/report`)
                   .singleton()
                   .query(query)
               }
        }
    })
    ```
