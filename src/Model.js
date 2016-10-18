/**
 * Model constructor
 * 业务Model需继承此类
 * @author naeemo
 */

import superagent from 'superagent'
import getExpireStamp from './cache/expireStamp'
import {LocalStorage, SessionStorage} from './cache/webStorage'
import IndexedDB from './cache/indexedDB'

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
         * Model.base
         * api server's base url
         * api 服务的域名配置，必须有一个默认
         */
        if (Model.base) {
            this.base = Model.base;
            Model.DB = new IndexedDB(this.base.match(/^(\w+:\/\/)?([^\/]+)/i)[2]);
        } else {
            throw new Error('Model类未配置默认 base url, 使用Model.use({base, beforeInterceptors, afterInterceptors })进行初始化。');
        }


        /**
         * request.cache
         * @param timeString such as: 'session', 'session, 2 hours', '3 month'.
         */
        superagent.Request.prototype.cache = function(timeString) {

            if(this.method && this.method != 'GET') {
                throw new Error('only get requests can use .cache, for now.')
            }

            if(!this._expire) {

                let isSession;
                let rules = timeString.split(',').map(rule => rule.replace(/(^\s|\s$)/g, ''));

                // check for 'session' inside
                isSession = rules.indexOf('session') + 1;
                isSession && rules.splice(isSession - 1, 1);

                // parse rules to a expire timeStamp
                this._expire = {session: isSession, stamp: getExpireStamp(rules)};

            }

            return this;

        };


        /**
         * request.end
         */
        let oldEnd = superagent.Request.prototype.end;
        superagent.Request.prototype.end = function () {

            // console.info('end method, called at ', Date.now());
            // console.log(this);
            let self = this;
            let userHandler = arguments[0];
            let i = 0, len, result;
            let cacheUsed = this._expire && this.method == 'GET';
            let cache = null, now = Date.now();

            if(cacheUsed) {
                // 1. form the KEY for caching.
                self._expire.key = Model._formKey(self.url, self._query);
            }

            /**
             * run beforeInterceptors
             * 前置拦截器
             */
            len = Model.beforeInterceptors.length;
            while(i++ < len) {

                result = Model.beforeInterceptors[i]();

                // 拦截器显式返回一个false, 则中止请求。
                if (typeof result !== 'undefined' && !result) {
                    return false;
                }

            }

            /**
             * cache - get with database supported
             */
            if(Model.DB && cacheUsed && !self._expire.session) {

                // 2. get cache
                // 2.2 split the KEY into a STORE and a _KEY, get cache from indexedDB the two
                Model.DB.get(...self._expire.key.split('__by__')).then(cache => {
                    // 2.3 if db failed, get cache from localStorage with KEY
                    cache = cache || LocalStorage.get(self._expire.key)

                    if(cache && cache.expire > now) {
                        userHandler(null, {body: cache.data});
                    }else {
                        // ajax start here
                        return oldEnd.call(self, function (err, res) {

                            /**
                             * run afterInterceptors
                             * 后置过滤器
                             */
                            i = 0;
                            len = Model.afterInterceptors.length;
                            while (i++ < len) {

                                result = Model.afterInterceptors[i](err, res);

                                // 拦截器显式返回一个false, 则中止循环。
                                if (typeof result !== 'undefined' && !result) {
                                    return false;
                                }

                            }

                            /**
                             * cache - set
                             */
                            if(/null/i.test(Object.prototype.toString.call(err))) {

                                let cache = {
                                    expire: Date.now() + self._expire.stamp,
                                    data: res.body
                                };
                                let [store, key] = (self._expire.key + '').split('__by__');

                                Model.DB.set(store, key, cache).catch(() => {
                                    LocalStorage.set(self._expire.key, cache);
                                });

                            }

                            // user's callback
                            userHandler(err, res);

                        })
                    }

                });

            }else {
                /**
                 * cache - get with no database
                 */
                try {
                    if (!cacheUsed) {
                        throw null;
                    }

                    // 2. get cache
                    if (self._expire.session) {
                        // 2.1 get cache from sessionStorage with KEY
                        cache = SessionStorage.get(self._expire.key)
                    } else {
                        // 2.3 if db failed, get cache from localStorage with KEY
                        cache = cache || LocalStorage.get(self._expire.key)
                    }

                    // 3. check for expire
                    if (cache && cache.expire > now) {
                        userHandler(null, {body: cache.data});
                    }else {
                        throw null;
                    }

                }catch (err) {
                    // ajax start here
                    return oldEnd.call(self, function (err, res) {

                        /**
                         * run afterInterceptors
                         * 后置过滤器
                         */
                        i = 0;
                        len = Model.afterInterceptors.length;
                        while (i++ < len) {

                            result = Model.afterInterceptors[i](err, res);

                            // 拦截器显式返回一个false, 则中止循环。
                            if (typeof result !== 'undefined' && !result) {
                                return false;
                            }

                        }

                        /**
                         * cache - set
                         */
                        if(cacheUsed && /null/i.test(Object.prototype.toString.call(err))) {

                            // 1. form cache
                            let cache = {
                                expire: Date.now() + self._expire.stamp,
                                data: res.body
                            };

                            // 2. set cache, the key has been formed in get process
                            if(self._expire.session) {
                                SessionStorage.set(self._expire.key, cache);
                            }else {
                                LocalStorage.set(self._expire.key, cache);
                            }

                        }

                        // user's callback
                        userHandler(err, res);

                    })
                }

            }

        };

        // save the modified request
        this.request = superagent;

    }


    /**
     * form something like 'sale.good__by__id.65_name.naeemo'
     * @param url
     * @param query
     * @returns {string}
     * @private
     */
    static _formKey(url, query) {

        url = url.replace(Model.base, '').replace(/^\/|\/$/, '').replace(/\//, '.');

        let queryStr = query.reduce((qStr, pair) => {
            pair = pair.replace('=', '.');
            return qStr ? qStr + '_' + pair : pair;
        }, '');

        console.info('key: ', url + '__by__' + queryStr);
        return url + '__by__' + queryStr;

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
