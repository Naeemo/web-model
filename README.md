# web-model
Model layer in front end's mv* pattern.
前端MV*模式里的model层。

## description 简介

As front end projects run independently nowadays, a model wrapper for backend's api service seems necessary.
It should be easy to use, features like interceptor, multi sources, cache will be supported. Cool web APIs(web database/web storage/worker) will be used. And it depends on [superagent](https://github.com/visionmedia/superagent) as ajax tool.

前端项目独立出来之后，需要一层对后台API服务封装。
这个model层应该方便应用，支持拦截器、多数据源、缓存。合理应用相关web API，例如web Database、web Storage、web Worker。使用superagent作为ajax工具库。

## goals 目标

1. [x] Model constructor: take the description of a model, generate a instance with async methods attached;
Model构造器: 传入一个数据模型的信息，生成一个model的实例，API提供的接口方法可以调用；
        
        ``` javascript 
        class GoodModel extends Model { 
            constructor() {
                super();
            } 
            getById(id) {
                return new Promise((resolve, reject) => {
                    this.request
                        .get(this.base + '/good/id')
                        .end(function(err, res) {})
                })
            }
        }
        export Good = new GoodModel();
        Good.getById(666);  // ajax call 
        ``` 
        
2. [x] Model constructor: interceptors can be set to Model; 
Model构造器: 拦截器直接配置在Model构造器上；
        
        ```
            Model.use({
                base_url: 'http://rap.qdum.com/mockjsdata/9/v1',
                interceptors: [
                    function() {
                        console.info('拦截器665');
                        return false;
                    },
                    function() {
                        console.info('拦截器444');
                    }
                ]
            }); 
        ```
        
3. [ ] Web Storage: localStorage and sessionStorage support with optional expire time(cookies as fallback?);
localStorage和sessionStorage支持，带有可选的过期时间设置(使用cookie做兼容?)；

4. [ ] Web Workers: use workers to execute ajax calls;
使用web Worker来执行ajax；

5. [ ] Web Database: use of Web SQL or indexedDB;
支持Web SQL或者indexedDB；

