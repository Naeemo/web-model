# web-model
Model layer in front end's mv* pattern.

## description 简介

As front end run independently more often, a model wrapper for backend's api service seems necessary.
It should be easy to use, and features like interceptor, multi sources, cache will be supported. Worker will be 
used. Now it rely on [superagent](https://github.com/visionmedia/superagent) as ajax tool.

前端项目独立出来之后，需要一层对后台API服务封装。
这个model层应该方便应用，支持拦截器、多数据源、缓存。合理应用web Worker。使用superagent作为ajax工具库。

## Guide

1. The request chain:

    ``` 
    request -> Model.beforeEach -> instance.beforeEach -> (requesting) -> response -> Model.afterEach -> instance.afterEach -> handler 
    ```


2. Model's static method use takes a config object, like this:
        
    ```
        Model.use({
        
            // prefix for ajax's url
            base: 'https://your-cool-app.com/api/4',
        
            // public interceptor for every request, before the request
            beforeEach(next) {
                /**
                 *  1. this bind to current request object
                 *  2. check fails, break the request:
                 *      visually return falsy value
                 *      next(falsy)
                 *  3. check pass, continue the request:
                 *      visually return truthy value
                 *      next()
                 *      next(truthy)
                 */
            },
            
            // after request, for response
            afterEach(err, res) {
                /**
                 *  1. this bind to current request object
                 *  2. (err, res) come from superagent's repsonse
                 */
            }
        
        });
    ```

3. Model constructor: take the description of a restful resource, generate a instance with request methods attached.
        
    ```
        let good = new Model({
        
            // will override Model.base
            base: 'https://my-cool-app.com/api/v1/good',   
            
            // instance specific request interceptor, for every request on good
            beforeEach(next) {
                // same rules as Model.beforeEach
            },
            
            // instance specific response interceptor
            afterEach() {
                // same rules as Model.afterEach
            },
            
            api: {
            
                getById(id) {
                    return this.request
                        .get('/' + id)      // will be prefixed with base url
                        .cache(30, true)    // 30 minutes' cache in sessionStorage
                        // .cache(30)       // 30 minutes' cache in localStorage
                },
                
                remove(id) {
                    return this.request
                        .del('http://another-cool-app.com/api/2/' + id) // won't be prefixed
                }
                
            }
        });
        
        good.getById(666).then(res => {}, err => {});
        good.remove(666).then(res => {}, err => {});
        
    ``` 
