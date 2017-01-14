/**
 * Created by naeemo on 2016/12/8.
 */

export default function({
    superAgent,
    base = '',
    before = [],
    after = []
}) {

    let len,
        result,
        originEnd = superAgent.Request.prototype.end;

    function callRequest(_request, userHandler) {

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
                if(after[len] === null) continue;

                result = after[len].call(_request, err, res);

                // 拦截器显式返回一个false, 则中止请求。
                if (typeof result !== 'undefined' && !result) {
                    return false;
                }

            }

            userHandler(err, res);

        });
    }

    superAgent.Request.prototype.end = function() {

        let _request = this,
            userHandler = arguments[0];

        /**
         * run beforeInterceptors
         * 前置拦截器
         * 1. interceptor return falsy value, break the request;
         * 2. interceptor return truthy value, continue;
         * 3. interceptor doesn't return any none-undefined value,
         * wait for next() call: next(true) continue, next(false) break;
         */
        len = before.length;
        function next(signal = true) { // notice: undefined signal means ok

            // 3. interceptor doesn't return any none-undefined value, wait for next() call;
            if(len--) {

                if(signal) {
                    // undefined interceptor default value: null
                    if (before[len] === null) return next();

                    result = before[len].call(_request, next);

                    if (typeof result !== 'undefined'){
                        if(result) {
                            // 2. interceptor return truthy value, continue;
                            return next();
                        }else {
                            // 1. interceptor return falsy value, break the request;
                            return false;
                        }
                    }
                }else {
                    return false;
                }

            }else {
                if(signal) {
                    callRequest(_request, userHandler);
                }else {
                    return false;
                }
            }

        }

        next();
    };

    return superAgent;

}
