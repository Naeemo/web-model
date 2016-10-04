/**
 * Model constructor
 * 业务Model需继承此类
 * @author naeemo
 */

const superagent = require('superagent');

class Model {

    constructor() {

        /**
         * Model不能被实例化，只能被继承
         */
        if (new.target === Model) {
            throw new Error('Model类不能实例化');
        }


        /**
         * base
         * api 服务的域名配置，必须有一个默认
         */
        if (Model.base) {
            this.base = Model.base;
        } else {
            throw new Error('Model类未配置默认 base url, 使用Model.use(url)进行初始化。');
        }


        /**
         * this.request
         * 封装ajax response拦截器之后的request对象。
         */
        let oldEnd = superagent.Request.prototype.end;
        superagent.Request.prototype.end = function () {

            let userHandler = arguments[0];

            return oldEnd.call(this, function (err, res) {
                let key, result;

                // run interceptors;
                for (key in Model.interceptors) {
                    if (Model.interceptors.hasOwnProperty(key)) {
                        result = Model.interceptors[key](err, res);
                        // 拦截器显式返回一个false, 则中止循环。
                        if (typeof result !== 'undefined' && !result) {
                            break;
                        }
                    }
                }

                // 未显示返回，或返回true都会继续执行业务回调。
                if (typeof result === 'undefined' || result) {
                    userHandler(err, res);
                }

            })
        };

        this.request = superagent;

    }


    /**
     * 配置base_url 和 拦截器
     * @param base_url
     * @param interceptors
     */
    static use({
        base_url,       // string
        interceptors    // function array
    }) {

        if (typeof base_url !== 'string') {
            throw new Error('base url 必须是字符串。')
        }

        if (!/array/ig.test(Object.prototype.toString.call(interceptors))) {
            throw new Error('拦截器配置interceptors必须是数组。')
        }

        Model.base = base_url;
        Model.interceptors = interceptors;

    }

}

export default Model;

