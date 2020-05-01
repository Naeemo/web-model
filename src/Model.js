/* eslint-disable no-console */
/**
 * Model constructor
 * @author naeemo
 */

import originSuperAgent from "superagent/lib/client";
import cache from "./cache";

// which direction to escape
const ESCAPE_DIRECTIONS = {
    before: 1,
    after: 2,
    both: 3
};

let superAgent = cache(originSuperAgent);

/**
 * Manually escape interceptors
 * @returns {superAgent.Request}
 */
superAgent.Request.prototype.escape = function (direction = "both") {
    if (!(direction in ESCAPE_DIRECTIONS)) {
        throw new Error(
            "request.escape() called with a unrecognized value: " +
            direction +
            ".\n 'before', 'after', 'both' are supported."
        );
    }
    this._escape = ESCAPE_DIRECTIONS[direction];
    return this;
};


/**
 * Mark a request as singleton
 * this means only one request can be in process at the same time, previous request will be aborted.
 * @return {superAgent.Request}
 */
superAgent.Request.prototype.singleton = function () {
    this._singleton = true;
    return this;
};


/**
 * Wrap Promise's resolve/reject, when a singleton request is done, the corresponding record can be cleared.
 * @param model
 * @param key
 * @param promiseHandler
 * @return {Function}
 */
function attachSingletonHook(model, key, promiseHandler) {
    return function (valueOrErr) { // only one argument will be handled according to Promise spec
        model._singletonRequests[key] = null;
        promiseHandler(valueOrErr);
    };
}


/**
 * run beforeInterceptors
 * 前置拦截器
 * wait for next() call: next(true) continue, next(false) break;
 */
function beforeHook(_request, ...beforeArr) {
    return new Promise(function (resolve, reject) {
        let len = beforeArr.length;

        function next(ok = true, msg) {

            !ok && reject(msg);

            if (len--) {
                if (!beforeArr[len]) return next();
                beforeArr[len].call(_request, next);
            } else {
                resolve();
            }
        }

        if (_request._escape === ESCAPE_DIRECTIONS.before || _request._escape === ESCAPE_DIRECTIONS.both)
            resolve();
        else {
            next();
        }

    });
}


/**
 * run afterInterceptors
 * 后置过滤器
 * 拦截器显式返回一个false, 则中止循环。
 */
function afterHook(resolve, reject, ...afterArr) {
    return function (err, res) {

        const _request = this;

        if (_request._escape !== ESCAPE_DIRECTIONS.after && _request._escape !== ESCAPE_DIRECTIONS.both) {
            let len = afterArr.length;
            while (len--) {

                // skip invalid ones
                if (typeof afterArr[len] !== "function") continue;

                const result = afterArr[len].call(_request, err, res);

                // 拦截器显式返回一个false, 则中止请求。
                if (typeof result !== "undefined" && !result) {
                    reject(err || res);
                    // stop the hook calling too
                    return;
                }

            }
        }

        err ? reject(err) : resolve(res);
    };
}


/**
 * model:
 * _base
 * request as tool
 * api
 *
 */
export default class Model {

    static base = "";
    static beforeEach;
    static afterEach;

    constructor(
        {
            base = "",   // string
            beforeEach,  // function, before request
            afterEach,   // function, filter response
            api = {}     // object, all requests of a model
        }
    ) {

        const model = this;


        /**
         * a map to remember ongoing singleton requests
         * 正在请求中的单例请求的记录
         * @type {Object<String, superAgent.Request>}
         * @private
         */
        model._singletonRequests = {};


        /**
         * api server's base url
         * api 服务的url前缀，默认使用Model上的
         */
        if (typeof base !== "string") {
            throw new Error("base url 必须是字符串。");
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

                    // abort previous call to api[key]
                    if (_request._singleton && model._singletonRequests[key]) {
                        // The abort call will only abort the request, not the Promise wrapping it.
                        // Promises cannot be aborted, so it would be left as 'pending'.
                        // This is a memory leak, and I did not know what to do...
                        model._singletonRequests[key].abort();
                        model._singletonRequests[key] = null;
                    }

                    // wire the base url if necessary:
                    // any string do not begin with 'http(s)://' or '//' will be wired
                    if (!/^((https?:)?\/\/)/.test(_request.url)) {
                        _request.url = model._base + _request.url;
                    }

                    beforeHook(_request, beforeEach, Model.beforeEach).then(() => {

                        // remember singleton request
                        if (_request._singleton) {
                            model._singletonRequests[key] = _request;
                            resolve = attachSingletonHook(model, key, resolve);
                            reject = attachSingletonHook(model, key, reject);
                        }

                        // make request
                        _request.end(afterHook(resolve, reject, Model.afterEach, afterEach).bind(_request));

                    }).catch(e => {
                        console.error(e, ", before requesting " + _request.url);
                        reject(e);
                    });

                });
            };
        }

    }


    /**
     * 配置base_url 和 拦截器
     * @param base
     * @param beforeEach
     * @param afterEach
     */
    static use(
        {
            base = "",          // string
            beforeEach,         // function, before request
            afterEach           // function, filter response
        }
    ) {

        if (typeof base !== "string") {
            throw new Error("base url 必须是字符串。");
        }

        Model.base = base;
        Model.beforeEach = beforeEach;
        Model.afterEach = afterEach;

    }

}
