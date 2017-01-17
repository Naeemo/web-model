/**
 * Created by naeemo on 2016/12/8.
 */

export default function ({
    superAgent,
    base = '',
    before = [],
    after = []
}) {

    let originEnd = superAgent.Request.prototype.end;

    superAgent.Request.prototype.end = function () {

        let _request = this,
            userHandler = arguments[0],
            beforeEscape = this._escape,
            afterEscape = this._escape,
            len,
            result;

        function callRequest() {

            // wire the base url if necessary:
            // any string do not begin with 'http(s)://' or '//' will be wired
            if (!/^((https?:)?\/\/)/.test(_request.url)) {
                _request.url = base + _request.url;
            }

            originEnd.call(_request, function (err, res) {

                /**
                 * run afterInterceptors
                 * 后置过滤器
                 * 拦截器显式返回一个false, 则中止循环。
                 */
                len = after.length;
                while (!afterEscape && len--) {

                    // skip invalid ones
                    if (!after[len]) continue;

                    result = after[len].call(_request, err, res);

                    // 拦截器显式返回一个false, 则中止请求。
                    if (typeof result !== 'undefined' && !result) {
                        return false;
                    }

                }

                userHandler(err, res);

            });

        }


        /**
         * run beforeInterceptors
         * 前置拦截器
         * wait for next() call: next(true) continue, next(false) break;
         */
        len = before.length;
        function next(signal = true) { // notice: undefined signal means ok

            if (beforeEscape) {
                callRequest();
            } else {
                if (signal) {

                    if (len--) {
                        if (!before[len]) return next();
                        before[len].call(_request, next);
                    } else {
                        callRequest();
                    }

                }
            }

        }

        next();
    };


    /**
     * Manually escape interceptors
     * @returns {superAgent}
     */
    superAgent.Request.prototype.escape = function () {
        this._escape = true;
        return this;
    };

    return superAgent;

}
