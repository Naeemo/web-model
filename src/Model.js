/**
 * Model constructor
 * 业务Model需继承此类
 * @author naeemo
 */

import originSuperAgent from 'superagent/lib/client'
import cache from './cache/superagent-cache'

let superAgent = cache(originSuperAgent);

/**
 * Manually escape interceptors
 * @returns {superAgent.Request}
 */
superAgent.Request.prototype.escape = function () {
    this._escape = true;
    return this;
};


/**
 * run beforeInterceptors
 * 前置拦截器
 * wait for next() call: next(true) continue, next(false) break;
 */
function beforeHook(_request, ...beforeArr) {
    return new Promise(function (resolve, reject) {
        
        if (_request._escape)
            resolve();
        else {
            
            let len = beforeArr.length;
            
            function next(ok = true, msg) {
                
                !ok && reject(msg);
                
                if (len--) {
                    if (!beforeArr[len]) return next();
                    beforeArr[len].call(_request, next);
                } else {
                    resolve()
                }
            }
            
            next();
            
        }
        
    })
}


/**
 * run afterInterceptors
 * 后置过滤器
 * 拦截器显式返回一个false, 则中止循环。
 */
function afterHook(resolve, reject, ...afterArr) {
    return function (err, res) {
        
        const _request = this;
        let len = afterArr.length;
        
        while (len--) {
            
            // skip invalid ones
            if (typeof afterArr[len] !== 'function') continue;
            
            const result = afterArr[len].call(_request, err, res);
            
            // 拦截器显式返回一个false, 则中止请求。
            if (typeof result !== 'undefined' && !result) {
                reject(err || res);
                // stop the hook calling too
                return;
            }
            
        }
    
        err ? reject(err) : resolve(res);
    }
}


/**
 * model:
 * _base
 * request as tool
 * api
 *
 */
export default class Model {
    
    static base = '';
    static beforeEach;
    static afterEach;
    
    constructor({
        base = '',   // string
        beforeEach,  // function, before request
        afterEach,   // function, filter response
        api = {}     // object, all requests of a model
    }) {
        
        const model = this;
        
        
        /**
         * api server's base url
         * api 服务的url前缀，默认使用Model上的
         */
        if (typeof base !== 'string') {
            throw new Error('base url 必须是字符串。')
        }
        model._base = base || Model.base;
        
        
        /**
         * save the modified request
         */
        model.request = superAgent;
        
        
        // attach the APIs
        for (let key in api) {
            // api[key];
            model[key] = function (...args) {
                return new Promise(function (resolve, reject) {
                    
                    const _request = api[key].apply(model, args);
    
                    // wire the base url if necessary:
                    // any string do not begin with 'http(s)://' or '//' will be wired
                    if (!/^((https?:)?\/\/)/.test(_request.url)) {
                        _request.url = model._base + _request.url;
                    }
    
                    beforeHook(_request, beforeEach, Model.beforeEach).then(() => {
                     
                        // make request
                        _request.end(afterHook(resolve, reject, Model.afterEach, afterEach).bind(_request))
                        
                    }).catch(e => {
                        console.error(e, ', before requesting ' + _request.url);
                        reject(e)
                    });
                    
                })
            }
        }
        
    }
    
    
    /**
     * 配置base_url 和 拦截器
     * @param base
     * @param beforeEach
     * @param afterEach
     */
    static use({
        base = '',          // string
        beforeEach,         // function, before request
        afterEach           // function, filter response
    }) {
        
        if (typeof base !== 'string') {
            throw new Error('base url 必须是字符串。')
        }
        
        Model.base = base;
        Model.beforeEach = beforeEach;
        Model.afterEach = afterEach;
        
    }
    
}
