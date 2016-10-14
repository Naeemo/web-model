/**
 * indexedDB的增删改查
 */

export default class IndexedDB {

    constructor(database) {
        this.database = database;
        this.init();
    }
    
    // 兼容
    indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    
    // 数据库实例
    db = null;

    /**
     * 初始化, 打开数据库并获取数据库实例
     */
    init() {
        this.open().then(db => {
            this.db = db;
        });
    }

    /**
     * 打开数据库,版本号为时间戳,保证最新版本
     * @param store
     * @returns {Promise}
     */
    open(store) {
        if (!this.indexedDB) {
            alert('您的浏览器不支持indexedDB');
            return false;
        }
        
        return new Promise((resolve, reject) => {
            let request = this.indexedDB.open(this.database, new Date().getTime());
            request.onerror = (e) => {
                reject(e.target.error);
            };
            request.onsuccess = (e) => {
                resolve(request.result);
            };
            if (store) {
                request.onupgradeneeded = (e) => {
                    let objectStore = e.currentTarget.result.createObjectStore(store);
                    //objectStore.createIndex(key, key, {unique: false});
                }
            }
        });
    }

    /**
     * 获取key值为key的数据, 成功会返回查到的数据
     * @param store
     * @param key
     * @returns {Promise}
     */
    get(store, key) {
        return new Promise((resolve, reject) => {
            let objectStore = this.db.transaction(store).objectStore(store);
            let request = objectStore.get(key);
            request.onsuccess = (e) => {
                resolve(e.target.result);
            };
            request.onerror = (e) => {
                reject(e.target.error);
            };
        })
    }

    /**
     * 添加/修改数据,成功会返回key
     * @param store
     * @param key
     * @param val
     * @returns {Promise}
     */
    async set(store, key, val) {
        if (![...this.db.objectStoreNames].includes(store)) {
            this.db.close();
            this.db = await this.open(store);
        }
        
        return new Promise((resolve, reject) => {
            let objectStore = this.db.transaction(store, "readwrite").objectStore(store, "readwrite");
            let request = objectStore.put(val, key);
            request.onsuccess = (e) => {
                resolve(e.target.result);
            };
            request.onerror = (e) => {
                reject(e.target.error);
            };
        });
    }

    /**
     * 删除数据,成功返回'done'
     * @param store
     * @param key
     * @returns {Promise}
     */
    del(store, key) {
        return new Promise((resolve, reject) => {
            let objectStore = this.db.transaction(store, "readwrite").objectStore(store);
            let request = objectStore.delete(key);
            request.onsuccess = (e) => {
                resolve(e.target.readyState);
            };
            request.onerror = (e) => {
                reject(e.target.error);
            };
        });
    }

}
