[English](https://naeemo.github.io/web-model/) | [中文](https://naeemo.github.io/web-model/zh-CN.html) 

在前后端分离的单页应用中，对服务端的数据请求无处不在，Web-model把这些请求整理为统一管理的数据层。
基于统一的数据层，它实现了许多常用的功能：请求/返回 拦截器，请求缓存（基于web storage），单实例请求。
Web-model 使用 superagent 作为 ajax 工具。

> 一次请求的生命周期: 
    ``` 
    request -> Model.beforeEach -> instance.beforeEach
    -> (requesting) -> 
    response -> Model.afterEach -> instance.afterEach -> handler 
    ```

## 例子
假设有一个 Restful API 规范的资源：'https://www.xxxx.com/apple'，把这个资源相关的所有请求用 Web-model 统一管理，放在一个名为 `appleModel.js` 的文件里：
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
业务代码中：
```javascript
import appleModel from './path/to/appleModel.js'
// ...
appleModel.getApples().then(({body: {apples}}) => {
    console.log('all my apples are here: ', apples);
})
```

## API

### 1. Superagent API

check [superagent's docs](http://visionmedia.github.io/superagent/) first.

### 2. Model的静态方法

```
import Model from 'web-model'

Model.use({

    // 全局的 url 前缀
    base: String,
    
    // 全局的前置拦截
    beforeEach(next) {
        /**
         *  1. this 指向 superagent request 实例
         *  2. next(falsy) 终止请求
         *  3. next() 或者 next(truthy)，请求继续
         */
    },
    
    // 全局的后置拦截
    afterEach(err, res) {
        /**
         *  1. this 指向 superagent request 实例
         *  2. (err, res) 来自 superagent 的相应 (err, res)
         */
    }
    
})
```

### 3. Model 构造器

```
// xxxModel.js 文件里面:
import Model from 'web-model'

export default new Model({

    // xxxModel 实例专属的 url 前缀，如果存在，将优先使用；不存在则使用全局的url前缀
    base: String,
    
    // 实例专属的前置拦截器
    beforeEach(next) {
        /**
         *  1. this 指向 superagent request 实例
         *  2. next(falsy) 终止请求
         *  3. next() 或者 next(truthy)，请求继续
         */
    },
    
    // 实例专属的后置拦截器
    afterEach(err, res) {
        /**
          *  1. this 指向 superagent request 实例
          *  2. (err, res) 来自 superagent 的相应 (err, res)
          */
    },
    
    // 请求方法例子
    api: {
        
        /**
         * @return {Promise}
         */
        xxxRequest() {
            /**
             *  1. this.request 是修改过的 superagent 对象
             */
        }
   
    }
    
})
```

### 3. superagent 对象上添加的方法

1. __escape(direction)__ 选择性的跳过拦截器

    - _direction_
        - 'both', 默认值，跳过前后拦截器
        - 'before', 跳过前置拦截器
        - 'after', 跳过后置拦截器
    
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

2. __cache(minutes, useSessionStorage)__ 缓存一个 GET 或 HEAD 请求

    - _minutes_ 缓存有效时长，以分钟计
    - _useSessionStorage_ 默认 false, true 则使用 sessionStorage，false 使用 localStorage
    
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

3. __singleton()__ 将一个请求方法标记为单例

    > 这意味着当前页面同一时刻最多只能存在一个该请求，重复调用会自动将现有的请求中断。

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
