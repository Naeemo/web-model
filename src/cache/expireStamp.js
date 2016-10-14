/**
 * Created by naeemo on 2016/10/10.
 * parse the expire time setting to timeStamp
 * 将配置数组解析为时间戳
 *
 * @param rules ex: ['1 year', '3 month','2 weeks', '4 days', '11 hours', '30 minutes', '10 seconds', '1476112245275', '2016 12 12'].
 * @returns {number}
 */
export default function getExpireStamp(rules) {

    let timeStamp = 0;
    rules.forEach(function(rule) {
        timeStamp += _timeParser(rule);
    });

    return timeStamp;

}


/**
 * rule for milliseconds
 * @param str
 * @returns {number}
 * @private
 */
function _timeParser(str) {

    let milliseconds,
        base = 1;
    let [,count, type, date] = str.match(/(\d+)\s*([A-Za-z]+)\s*(\d+)?/);

    type = type.replace(/s$|ours?$|$min|$sec/g, '');

    switch (type) {
        case 'seconds':
            base = 1000;
            break;
        case 'min':
            base = 60000;
            break;
        case 'h':
            base = 3600000;
            break;
        case 'day':
            base = 86400000;
            break;
        case 'week':
            base = 604800000;
            break;
        case 'month':
            base = 2592000000;
            break;
        case 'year':
            base = 31104000000;
            break;
        default:
            if(count && !type && !date) {
                // merely a timestamp number
                break;
            }else if(type + 1 - 1) {
                // type stands for the month in the 'year month date' pattern
                base = _parseDate(count, type, date);
                count = 1;
            }else {
                throw new Error('缓存设置不对');
            }
            break;
    }

    milliseconds = count * base;

    return milliseconds;

}


/**
 * pares date to timeStamp
 * @param year
 * @param month
 * @param date
 * @returns {number}
 * @private
 */
function _parseDate(year, month, date = 1) {

    let stamp = Date.parse(`${year}, ${month}, ${date}`);

    if(Number.isNaN(stamp)) {
        stamp = Date.parse(`${year}-${month}-${date}`);
    }

    if(Number.isNaN(stamp)) {
        stamp = Date.parse(`${year}/${month}/${date}`);
    }

    return stamp;

}
