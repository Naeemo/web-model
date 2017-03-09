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
 * @returns {superAgent}
 */
superAgent.Request.prototype.escape = function () {
    this._escape = true;
    return this;
};


/**
 * model:
 * _base
 * request as tool
 *
 *
 * _beforeArr
 * _afterArr
 * _beforeHook
 * _afterHook
 *
 * apis
 *
 */
export default class Model {
    
    static base = '';
    static beforeEach;
    static afterEach;
    
    constructor({
        base = '',          // string
        beforeEach,  // function, before request
        afterEach,   // function, filter response
        api = {}            // object, all requests of a model
    }) {
        
        let model = this;
        
        
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
        
        
        // instance's interceptors
        model._beforeArr = [beforeEach, Model.beforeEach];
        model._afterArr = [Model.afterEach, afterEach];
        
        
        /**
         * run beforeInterceptors
         * 前置拦截器
         * wait for next() call: next(true) continue, next(false) break;
         */
        model._beforeHook = function (_request) {
            return new Promise(function (resolve, reject) {
                
                if (_request._escape) resolve();
                
                let len = model._beforeArr.length;
                
                function next(ok = true, msg) {
                    
                    !ok && reject(msg);
                    
                    if (len--) {
                        if (!model._beforeArr[len]) return next();
                        model._beforeArr[len].call(_request, next);
                    } else {
                        resolve()
                    }
                }
                
                next()
                
            })
        };
        
        
        /**
         * run afterInterceptors
         * 后置过滤器
         * 拦截器显式返回一个false, 则中止循环。
         */
        model._afterHook = function (resolve, reject) {
            return function (err, res) {
                
                let _request = this;
                
                let len = model._afterArr.length;
                let afterEscape = _request._escape;
                while (!afterEscape && len--) {
                    
                    // skip invalid ones
                    if (!model._afterArr[len]) continue;
                    
                    let result = model._afterArr[len].call(_request, err, res);
                    
                    // 拦截器显式返回一个false, 则中止请求。
                    if (typeof result !== 'undefined' && !result) {
                        reject('after hook')
                    }
                    
                }
                
                resolve(res);
                
            }
        };
        
        // attach the APIs
        for (let key in api) {
            // api[key];
            model[key] = function (...args) {
                return new Promise(function (resolve, reject) {
                    
                    let _request = api[key].call(model, args);
                    
                    model._beforeHook(_request).then(() => {
                        
                        // wire the base url if necessary:
                        // any string do not begin with 'http(s)://' or '//' will be wired
                        if (!/^((https?:)?\/\/)/.test(_request.url)) {
                            _request.url = model._base + _request.url;
                        }
                        
                        // make request
                        _request.end(model._afterHook(resolve, reject).bind(_request))
                        
                    }).catch(e => {
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
