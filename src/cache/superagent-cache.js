/**
 * Created by naeemo on 2016/12/8.
 */

import {SessionStorage, LocalStorage} from './web-storage'

/**
 * form something like 'http://sdfsdf.com/api/sale.good__by__id.65_name.naeemo'
 * @param url
 * @param query
 * @returns {string}
 * @private
 */
function _formKey(url, query) {

    url = url.replace(/^\/|\/$/, '');

    let queryStr = query.reduce((qStr, pair) => {
        pair = pair.replace(/=|\//, '.');
        return qStr ? qStr + '_' + pair : pair;
    }, '');

    return url + '__by__' + queryStr;

}


export default function(superAgent) {

    /**
     * request.cache
     * @param time number expire time in minutes
     * @param isSession
     */
    superAgent.Request.prototype.cache = function(time, isSession) {

        if(this.method && this.method != 'GET') {
            throw new Error('only get requests can use .cache')
        }

        time = parseInt(time) * 60 * 1000;
        if(!time) {
            throw new Error('Not a validate expire time for cache');
        }

        if(!this._expire && time) {
            this._expire = {session: isSession, stamp: time};
        }

        return this;

    };


    /**
     * request.end
     */
    let oldEnd = superAgent.Request.prototype.end;
    superAgent.Request.prototype.end = function() {

        let _request = this;
        let userHandler = arguments[0];
        let cacheUsed = this._expire && this.method == 'GET';
        let cache = null, now = Date.now();


        function _cb(err, res) {

            /**
             * cache step 2: set
             */
            if(cacheUsed && /null/i.test(Object.prototype.toString.call(err))) {

                // 1. form cache
                let cache = {
                    expire: Date.now() + _request._expire.stamp,
                    data: res
                };

                // 2. set cache, the key has been formed in get process
                if(_request._expire.session) {
                    SessionStorage.set(_request._expire.key, cache);
                }else {
                    LocalStorage.set(_request._expire.key, cache);
                }

            }

            // user's callback
            userHandler(err, res);

        }

        /**
         * cache
         */
        if(cacheUsed) {

            // cache step 1: form the KEY for caching.
            _request._expire.key = _formKey(_request.url, _request._query);

            // cache step 3.1: get
            cache = _request._expire.session
                ? SessionStorage.get(_request._expire.key)
                : LocalStorage.get(_request._expire.key);

            // cache step 3.2: check expire
            if (cache && cache.expire > now) {
                _cb(null, cache.data);
            }else {
                _request._expire.session
                    ? SessionStorage.remove(_request._expire.key)
                    : LocalStorage.remove(_request._expire.key);

                oldEnd.call(_request, _cb);
            }

        }else {
            oldEnd.call(_request, _cb);
        }

    };

    return superAgent;

}
