/**
 * Created by naeemo on 2016/12/8.
 */

export default function({
    superAgent,
    base = '',
    before = [],
    after = []
}) {

    let originEnd = superAgent.Request.prototype.end;
    superAgent.Request.prototype.end = function() {

        let _request = this;
        let userHandler = arguments[0];
        let len;
        let interCepResult;


        /**
         * run beforeInterceptors
         * 前置拦截器
         * 拦截器显式返回一个false, 则中止请求。
         */
        len = before.length;
        while(len--) {

            // 未定义的拦截器为 null
            if(before[len] === null) continue;

            interCepResult = before[len].call(_request);

            if (typeof interCepResult !== 'undefined' && !interCepResult) {
                return false;
            }

        }

        // wire the base url if necessary:
        // any string do not begin with 'http(s)://' or '//' will be wired
        if (!/^((https?:)?\/\/)/.test(_request.url[0])) {
            _request.url = base + _request.url;
        }

        originEnd.call(_request, function (err, res) {

            /**
             * run afterInterceptors
             * 后置过滤器
             * 拦截器显式返回一个false, 则中止循环。
             */
            len = after.length;
            while(len--) {

                // 未定义的拦截器为 null
                if(before[len] === null) continue;

                interCepResult = after[len].call(_request, err, res);

                // 拦截器显式返回一个false, 则中止请求。
                if (typeof interCepResult !== 'undefined' && !interCepResult) {
                    return false;
                }

            }

            userHandler(err, res);

        });
    };

    return superAgent;

}
