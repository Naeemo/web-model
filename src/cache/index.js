/**
 * Created by naeemo on 2016/12/8.
 */

import {get, remove, set} from "./storage";

/**
 * form something like 'http://sdfsdf.com/api/sale.good__by__id.65_name.naeemo'
 * @param url
 * @param query
 * @returns {string}
 * @private
 */
function buildKey(url, query) {

    const _url = url.replace(/^\/|\/$/, "");
    const queryStr = query.reduce((qStr, pair) => {
        pair = pair.replace(/[=/]/, ".");
        return qStr ? qStr + "_" + pair : pair;
    }, "");

    return _url + "__by__" + queryStr;

}


export default function (superAgent) {

    /**
     * request.cache
     *
     * this._expire is a object looks like:
     * {session, stamp, key}
     *
     * what is finally been saved to web storage:
     * cache: {
     *      expire: Date.now() + _request._expire.stamp,
     *      data: res
     * };
     *
     * @param {Number} minutesFromNow expire timestamp in minutes
     * @param {Boolean} isSession
     */
    superAgent.Request.prototype.cache = function (minutesFromNow, isSession) {

        if (!this.method) {
            throw new Error("Please use .cache() after .get()");
        }

        if (this.method !== "GET") {
            throw new Error("Only get requests can be cached, it seems you are using: " + this.method);
        }

        const secondsFromNow = parseInt(minutesFromNow) * 60 * 1000;
        if (!secondsFromNow) { // NaN or 0
            throw new Error("Not a validate expire time for cache: " + secondsFromNow);
        }

        if (!this._expire) {
            this._expire = {session: isSession, stamp: secondsFromNow};
        }

        return this;

    };


    /**
     * request.end
     */
    const oldEnd = superAgent.Request.prototype.end;
    superAgent.Request.prototype.end = function (userHandler) {

        const request = this,
            CACHE_USED = this._expire && this.method === "GET",
            NOW = (new Date).getTime();


        function cb(err, res) {

            /**
             * cache step 2: set
             */
            if (CACHE_USED && /null/i.test(Object.prototype.toString.call(err))) {

                // 1. form cache
                let cache = {
                    expire: NOW + request._expire.stamp,
                    data: res
                };

                // 2. set cache, the key has been formed in get process
                if (request._expire.session) {
                    set(window.sessionStorage, request._expire.key, cache);
                } else {
                    set(window.localStorage, request._expire.key, cache);
                }

            }

            // user's callback
            userHandler(err, res);

        }

        /**
         * cache
         */
        if (CACHE_USED) {

            // cache step 1: form the KEY for caching.
            request._expire.key = buildKey(request.url, request._query);

            // cache step 3.1: get
            let cache = get(
                request._expire.session
                    ? window.sessionStorage
                    : window.localStorage,
                request._expire.key
            );

            // cache step 3.2: check expire
            if (cache && cache.expire > NOW) {
                cb(null, cache.data);
            } else {
                remove(
                    request._expire.session
                        ? window.sessionStorage
                        : window.localStorage,
                    request._expire.key
                );

                oldEnd.call(request, cb);
            }

        } else {
            oldEnd.call(request, cb);
        }

    };

    return superAgent;

}
