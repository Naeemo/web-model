# web-model
Model layer in front end's mv* pattern.

## description 简介

As front end run independently more often, a model wrapper for backend's api service seems necessary.
It should be easy to use, and features like interceptor, multi sources, cache will be supported. Worker will be 
used. Now it rely on [superagent](https://github.com/visionmedia/superagent) as ajax tool.

前端项目独立出来之后，需要一层对后台API服务封装。
这个model层应该方便应用，支持拦截器、多数据源、缓存。合理应用web Worker。使用superagent作为ajax工具库。

## goals 目标

1. [x] Model constructor: take the description of a restful resource, generate a instance with request methods attached;
instance-only hooks: beforeEach and afterEach work as interceptors, A falsy return value from the hook will break 
the chain.
        
```
    /*
     * the request chain:
     * caller --> Model.beforeEach --> instance.beforeEach --> (...ajax, may use cache...) --> Model.afterEach --> instance.afterEach --> handler
     */

    let good = new Model({
        base: 'http://your-cool-app.com/api/v1/good',   // instance's base will overwite Model.base
        beforeEach() {
            console.info('instance's before')
        },
        afterEach() {
            console.info('instance's after')
        },
        api: {
            getById(id) {
                this.request
                    .get('/' + id)
                    .cache(30, true)    // 30 minutes' cache in sessionStorage
                    // .cache(30)       // 30 minutes' cache in localStorage
                    .end(function(err, res) {
                        console.info('inside end');
                    })
            },
            remove(id) {
                this.request
                    .del('/' + id)
                    .end(function() {})
            }
            // ... other restful apis
        }
    });
    good.getById(666);
    good.remove(666)
``` 
        
2. [x] Model constructor: interceptors can be set to Model too, each instance's request will go through these before 
the instance-specific ones. A falsy return value in the interceptors will break the chain too, as expected.
        
```
    Model.use({
        base: 'http://your-cool-app.com/api/4',
        beforeEach() {
            console.info('Model's before')
        },
        afterEach() {
            console.info('Model's after')
        },
    });
```

3. [ ] Web Workers: use workers to execute ajax calls;

4. [ ] Tests


