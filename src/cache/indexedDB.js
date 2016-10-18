/**
 * indexedDB的增删改查
 */

export default class IndexedDB {

    constructor(name) {

        IndexedDB.baseName = name; // database name

        // 兼容
        IndexedDB.DB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

        // 数据库实例
        IndexedDB.db = null;

    }

    /**
     * 打开数据库,版本号为时间戳,保证最新版本
     * @param store // optional
     * @returns {Promise}
     */
    static open(store) {
        return new Promise((resolve, reject) => {

            if (!IndexedDB.DB) {
                console.warn('您的浏览器不支持indexedDB');
                IndexedDB.db = null;
                reject(null);
            }

            if(IndexedDB.db) {
                IndexedDB.db.close();
            }

            let request = IndexedDB.DB.open(IndexedDB.baseName, parseInt(Date.now() / 100));

            // add new store
            if (store) {
                request.onupgradeneeded = (e) => {
                    e.currentTarget.result.createObjectStore(store);
                }
            }

            request.onerror = (e) => {
                IndexedDB.db = null;
                reject(e.target.error);
            };

            request.onsuccess = (e) => {
                IndexedDB.db = request.result;
                resolve(request.result);
            };

        });
    }

    /**
     * 获取key值为key的数据, 成功会返回查到的数据
     * @param store
     * @param key
     * @returns {Promise}
     */
    get(store, key) {
        return new Promise(function (resolve, reject) {
            let transaction, objectStore, request;

            if (IndexedDB.db) {

                try {

                    transaction = IndexedDB.db.transaction([store], 'readonly')

                    objectStore = transaction.objectStore(store);
                    request = objectStore.get(key);

                    request.onsuccess = (e) => {
                        resolve(e.target.result);
                    };

                    request.onerror = (e) => {
                        reject(e.target.error);
                    };

                } catch (err) {
                    resolve(null);
                }


            } else {

                IndexedDB.open().then(ok => {

                    try {

                        transaction = IndexedDB.db.transaction([store], 'readonly')

                        objectStore = transaction.objectStore(store);
                        request = objectStore.get(key);

                        request.onsuccess = (e) => {
                            resolve(e.target.result);
                        };

                        request.onerror = (e) => {
                            reject(e.target.error);
                        };

                    } catch (err) {
                        resolve(null);
                    }

                }, err => {

                });

            }

        })
    }

    /**
     * 添加/修改数据,成功会返回key
     * @param store
     * @param key
     * @param val
     * @returns {Promise}
     */
    set(store, key, val) {
        return new Promise(function(resolve, reject) {

            let transaction, objectStore, request;

            if(!IndexedDB.db) {
                IndexedDB.open().then(ok => {
                    try {

                        transaction = IndexedDB.db.transaction([store], 'readwrite');
                        objectStore = transaction.objectStore(store);
                        request = objectStore.put(val, key);

                        request.onsuccess = (e) => {
                            resolve(e.target.result);
                        };
                        request.onerror = (e) => {
                            reject(e.target.error);
                        };

                    } catch (err) {
                        resolve(null);
                    }
                });
            }else if (!IndexedDB.db.objectStoreNames.contains(store)) {

                IndexedDB.open(store).then(ok => {
                    try {

                        transaction = IndexedDB.db.transaction([store], 'readwrite');
                        objectStore = transaction.objectStore(store);
                        request = objectStore.put(val, key);

                        request.onsuccess = (e) => {
                            resolve(e.target.result);
                        };
                        request.onerror = (e) => {
                            reject(e.target.error);
                        };

                    } catch (err) {
                        resolve(null);
                    }
                });
            }else {

                try {

                    transaction = IndexedDB.db.transaction([store], 'readwrite');
                    objectStore = transaction.objectStore(store);
                    request = objectStore.put(val, key);

                    request.onsuccess = (e) => {
                        resolve(e.target.result);
                    };
                    request.onerror = (e) => {
                        reject(e.target.error);
                    };

                } catch (err) {
                    resolve(null);
                }
            }

        })
    }

    /**
     * 删除数据,成功返回'done'
     * @param store
     * @param key
     * @returns {Promise}
     */
    del(store, key) {
        return new Promise((resolve, reject) => {

            let transaction, objectStore, request;

            if(!IndexedDB.db) {
                IndexedDB.open().then(ok => {
                    try {

                        transaction = IndexedDB.db.transaction([store], 'readwrite');
                        objectStore = transaction.objectStore(store);
                        request = objectStore.delete(key);

                        request.onsuccess = (e) => {
                            resolve(e.target.readyState);
                        };
                        request.onerror = (e) => {
                            reject(e.target.error);
                        };

                    } catch (err) {
                        resolve(null);
                    }
                });
            }else if (!IndexedDB.db.objectStoreNames.contains(store)) {
                resolve(true);
            }else {

                try {

                    transaction = IndexedDB.db.transaction([store], 'readwrite');
                    objectStore = transaction.objectStore(store);
                    request = objectStore.delete(key);

                    request.onsuccess = (e) => {
                        resolve(e.target.readyState);
                    };

                    request.onerror = (e) => {
                        reject(e.target.error);
                    };

                } catch (err) {
                    resolve(null);
                }
            }

        });
    }

}
