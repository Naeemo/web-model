/**
 * Model constructor
 * 业务Model需继承此类
 * @author naeemo
 */

import originSuperAgent from 'superagent/lib/client'
import cache from './cache/superagent-cache'
import intercept from './interceptor/superagent-interceptor'

let superAgent = cache(originSuperAgent);

export default class Model {

    constructor({
        base = '',          // string
        beforeEach = null,  // function, before request
        afterEach = null,   // function, filter response
        api = {}            // object, all requests of a model
    }) {

        /**
         * api server's base url
         * api 服务的url前缀，默认使用Model上的
         */
        if(typeof base !== 'string') {
            throw new Error('base url 必须是字符串。')
        }
        this.base = base || Model.base;

        // Model instance's interceptors
        this.beforeEach = beforeEach;
        this.afterEach = afterEach;

        // attach the APIs
        for(let key in api) {
            this[key] = api[key];
        }

        // save the modified request
        this.request = intercept({
            superAgent,
            base: this.base,
            before: [this.beforeEach, Model.beforeEach],
            after: [this.afterEach, Model.afterEach]
        });

    }


    /**
     * 配置base_url 和 拦截器
     * @param base
     * @param beforeEach
     * @param afterEach
     */
    static use({
        base = '',          // string
        beforeEach = null,  // function, before request
        afterEach = null    // function, filter response
    }) {

        if(typeof base !== 'string') {
            throw new Error('base url 必须是字符串。')
        }

        Model.base = base;
        Model.beforeEach = beforeEach;
        Model.afterEach = afterEach;

    }

}
