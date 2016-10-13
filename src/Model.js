/**
 * Model constructor
 * 业务Model需继承此类
 * @author naeemo
 */

import superagent from 'superagent'
import getExpireStamp from './util/expireStamp'

export default class Model {

    constructor() {

        /**
         * Model can't be instantiated, extended only
         * Model不能被实例化，只能被继承
         */
        if (new.target === Model) {
            throw new Error('Model类不能实例化');
        }


        /**
         * base
         * api server's base url
         * api 服务的域名配置，必须有一个默认
         */
        if (Model.base) {
            this.base = Model.base;
        } else {
            throw new Error('Model类未配置默认 base url, 使用Model.use({base, beforeInterceptors, afterInterceptors })进行初始化。');
        }


        /**
         * cache
         * @param timeString such as: 'session', 'session, 2 hours', '3 month'.
         */
        superagent.Request.prototype.cache = function(timeString) {

            if(!this._expire) {

                let isSession;
                let rules = timeString.split(',').map(rule => rule.replace(/(^\s|\s$)/g, ''));

                // check for 'session' inside
                isSession = rules.indexOf('session') + 1;
                isSession && rules.splice(isSession - 1, 1);

                // parse rules to a expire timeStamp
                this._expire = {session: true, stamp: getExpireStamp(rules)};

            }

            return this;

        };


        /**
         * 拦截器
         */
        let oldEnd = superagent.Request.prototype.end;
        superagent.Request.prototype.end = function () {

            let self = this;
            let userHandler = arguments[0];
            let key, result;

            /**
             * run beforeInterceptors
             */
            for (key in Model.beforeInterceptors) {
                if (Model.beforeInterceptors.hasOwnProperty(key)) {
                    result = Model.beforeInterceptors[key]();
                    // 拦截器显式返回一个false, 则中止请求。
                    if (typeof result !== 'undefined' && !result) {
                        return false;
                    }
                }
            }

            /**
             * cache - get
             */
            if(self.method == 'GET' && self._expire) {
                // todo 1. form the KEY for caching.
                // self._expire.key = _formKey(self.query, self.path)

                // get cache
                let cache, now;
                if(self._expire.session) {
                    // todo 2.1 get cache from sessionStorage with KEY
                }else {
                    // todo 2.2 split the KEY into a STORE and a _KEY, get cache from indexedDB the two
                    // todo 2.3 if db failed, get cache from localStorage with KEY
                }

                // check for expire
                if(cache) {
                    now = Date.now();
                    if(cache.expire > now) {
                        return cache.data;
                    }
                }

            }

            // ajax start here
            return oldEnd.call(self, function (err, res) {
                let key, result;

                /**
                 * run afterInterceptors
                 */
                for (key in Model.afterInterceptors) {
                    if (Model.afterInterceptors.hasOwnProperty(key)) {
                        result = Model.afterInterceptors[key](err, res);
                        // 拦截器显式返回一个false, 则中止循环。
                        if (typeof result !== 'undefined' && !result) {
                            break;
                        }
                    }
                }

                /**
                 * cache - set
                 */
                if(self.method == 'GET' && self._expire) {
                    if(/null/i.test(Object.prototype.toString.call(err))) {
                        let cache = {
                            expire: Date.now() + self._expire.stamp,
                            data: res.body
                        };
                        // get cache
                        if(self._expire.session) {
                            // todo 3.1 set cache to sessionStorage with KEY
                        }else {
                            // todo 3.2 split the KEY into a STORE and a _KEY, set cache to indexedDB
                            // todo 3.3 if db failed, set cache to localStorage with KEY
                        }
                    }
                }

                // user's callback
                if (typeof result === 'undefined' || result) {
                    userHandler(err, res);
                }

            })
        };

        // save the modified request
        this.request = superagent;

    }


    /**
     * 配置base_url 和 拦截器
     * @param base
     * @param beforeInterceptors
     * @param afterInterceptors
     */
    static use({
        base,           // string
        beforeInterceptors = [], // function array, before request
        afterInterceptors = []   // function array, filter response
    }) {

        if (typeof base !== 'string') {
            throw new Error('base url 必须是字符串。')
        }

        if (!/array/ig.test(Object.prototype.toString.call(beforeInterceptors))) {
            throw new Error('前置拦截器 beforeInterceptors 必须是数组。')
        }

        if (!/array/ig.test(Object.prototype.toString.call(afterInterceptors))) {
            throw new Error('后置拦截器 afterInterceptors 必须是数组。')
        }

        Model.base = base;
        Model.beforeInterceptors = beforeInterceptors;
        Model.afterInterceptors = afterInterceptors;

    }

}
