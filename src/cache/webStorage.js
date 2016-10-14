/**
 * Created by naeemo on 2016/10/14.
 * 1. sessionStorage的 存、取、删除、清空;
 * 2. localStorage的 存、取、删除;
 */

class Storage {

    constructor(type) {

        /**
         * 保存键值对到Storage, 成功true, 否则返回false;
         * @param key
         * @param value
         * @returns {Boolean}
         */
        this.set = function(key, value) {

            if(Storage.storageAvailable(type)) {
                let _key = JSON.stringify(key);
                let _value = JSON.stringify(value);

                window[type].setItem(_key, _value);
                return true;
            }else {
                return false;
            }

        };


        /**
         * 根据key获取Storage里相应值, 取到即返回, 否则return null
         * @param key
         * @returns {String}
         */
        this.get = function(key) {

            if(Storage.storageAvailable(type)) {
                let _key = JSON.stringify(key);

                return JSON.parse(window[type].getItem(_key));
            }else {
                return null;
            }

        };


        /**
         * 删除Storage中对应key的记录, 删除后查不到记录则返回resolve(true), Storage不可用或删除后仍查询到记录返回resolve(false)
         * @param key
         * @returns {Boolean}
         */
        this.remove = function(key) {

            if(Storage.storageAvailable(type)) {
                let _key = JSON.stringify(key);

                window[type].removeItem(_key);
                return !window[type].getItem(_key);
            }else {
                return false;
            }
        };


        /**
         * 清除Storage, 成功true
         * @returns {boolean}
         */
        this.clear = function() {
            if(Storage.storageAvailable(type)) {
                window[type].clear();
                return !window[type].length;
            }else {
                return true;
            }
        }

    }


    /**
     * detects whether storage [type] is both supported and available is current browser.
     * from MDN https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
     * @param type
     * @returns {boolean}
     */
    static storageAvailable(type) {
        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return false;
        }
    }

}

export const SessionStorage = new Storage('sessionStorage');
export const LocalStorage = new Storage('localStorage');
