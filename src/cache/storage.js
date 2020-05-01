/**
 * Created by naeemo on 2016/10/14.
 * Web Storage get/set/remove
 */

/**
 * Save key-value pair to Storage
 * @param {Storage} storage
 * @param key
 * @param value
 * @returns {Boolean}
 */
export function set(storage, key, value) {

    let _key = String(key);
    let _value = JSON.stringify(value);

    storage.setItem(_key, _value);
    return true;

}

/**
 * Read value by key, empty string as default
 * @param {Storage} storage
 * @param key
 * @returns {String}
 */
export function get(storage, key) {

    key = String(key);
    let result = storage.getItem(key);
    if (result === null) return "";
    return JSON.parse(result);

}


/**
 * Delete key-value pair by key
 * @param {Storage} storage
 * @param key
 * @returns {Boolean}
 */
export function remove(storage, key) {

    let _key = JSON.stringify(key);

    storage.removeItem(_key);
    return !storage.getItem(_key);

}
