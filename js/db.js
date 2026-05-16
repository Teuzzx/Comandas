/**
 * IndexedDB wrapper simples para armazenamento local mais robusto
 */
const DB = {
    dbName: 'pizzaria_db',
    version: 1,
    db: null,

    init() {
        return new Promise((resolve, reject) => {
            if (this.db) return resolve(this.db);
            const req = indexedDB.open(this.dbName, this.version);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('estoque')) {
                    db.createObjectStore('estoque', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('estoque_movimentos')) {
                    db.createObjectStore('estoque_movimentos', { keyPath: 'txId' });
                }
                if (!db.objectStoreNames.contains('produtos')) {
                    db.createObjectStore('produtos', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('vendas')) {
                    db.createObjectStore('vendas', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('pedidos')) {
                    db.createObjectStore('pedidos', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('funcionarios')) {
                    db.createObjectStore('funcionarios', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('mesas')) {
                    db.createObjectStore('mesas', { keyPath: 'id' });
                }
            };

            req.onsuccess = async (e) => {
                this.db = e.target.result;
                try {
                    await this.seedFromStorage();
                    resolve(this.db);
                } catch (err) {
                    reject(err);
                }
            };

            req.onerror = (e) => reject(e.target.error);
        });
    },

    async seedStore(storeName, items) {
        const existing = await this.getAll(storeName);
        if (!existing || existing.length === 0) {
            for (const item of items) {
                await this.put(storeName, item);
            }
        }
    },

    async seedFromStorage() {
        if (!window.Storage) return;
        const seeds = {
            estoque: Storage.get('estoque') || [],
            vendas: Storage.get('vendas') || [],
            pedidos: Storage.get('pedidos') || [],
            produtos: Storage.get('produtos') || [],
            funcionarios: Storage.get('funcionarios') || [],
            mesas: Storage.get('mesas') || []
        };

        for (const [storeName, items] of Object.entries(seeds)) {
            if (items && items.length > 0) {
                await this.seedStore(storeName, items);
            }
        }
    },

    _tx(storeName, mode = 'readonly') {
        const tx = this.db.transaction(storeName, mode);
        return tx.objectStore(storeName);
    },

    getAll(storeName) {
        return new Promise((resolve, reject) => {
            const store = this._tx(storeName, 'readonly');
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = (e) => reject(e.target.error);
        });
    },

    get(storeName, key) {
        return new Promise((resolve, reject) => {
            const store = this._tx(storeName, 'readonly');
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = (e) => reject(e.target.error);
        });
    },

    put(storeName, item) {
        return new Promise((resolve, reject) => {
            const store = this._tx(storeName, 'readwrite');
            const req = store.put(item);
            req.onsuccess = () => resolve(req.result);
            req.onerror = (e) => reject(e.target.error);
        });
    },

    add(storeName, item) {
        return new Promise((resolve, reject) => {
            const store = this._tx(storeName, 'readwrite');
            const req = store.add(item);
            req.onsuccess = () => resolve(req.result);
            req.onerror = (e) => reject(e.target.error);
        });
    },

    delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const store = this._tx(storeName, 'readwrite');
            const req = store.delete(key);
            req.onsuccess = () => resolve(true);
            req.onerror = (e) => reject(e.target.error);
        });
    },

    clearStore(storeName) {
        return new Promise((resolve, reject) => {
            const store = this._tx(storeName, 'readwrite');
            const req = store.clear();
            req.onsuccess = () => resolve(true);
            req.onerror = (e) => reject(e.target.error);
        });
    },

    exportAll() {
        // export contents of all object stores
        return new Promise(async (resolve, reject) => {
            try {
                const meta = Array.from(this.db.objectStoreNames);
                const out = {};
                for (const name of meta) {
                    out[name] = await this.getAll(name);
                }
                resolve(out);
            } catch (err) {
                reject(err);
            }
        });
    },

    importAll(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const meta = Object.keys(data || {});
                for (const name of meta) {
                    // clear then put
                    await this.clearStore(name);
                    const arr = data[name] || [];
                    for (const item of arr) {
                        await this.put(name, item);
                    }
                }
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }
};
