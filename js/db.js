const DB = {
    async init() {
        await SB.waitReady();
    },

    getAll(storeName) {
        return Storage.get(storeName) || [];
    },

    get(storeName, key) {
        const data = Storage.get(storeName) || [];
        return data.find(d => d.id === key) || null;
    },

    async put(storeName, item) {
        const data = Storage.get(storeName) || [];
        const idx = data.findIndex(d => d.id === item.id);
        if (idx >= 0) {
            data[idx] = item;
        } else {
            data.push(item);
        }
        await Storage.save(storeName, data);
    },

    async add(storeName, item) {
        const data = Storage.get(storeName) || [];
        data.push(item);
        await Storage.save(storeName, data);
    },

    async delete(storeName, key) {
        const data = Storage.get(storeName) || [];
        const filtered = data.filter(d => d.id !== key);
        await Storage.save(storeName, filtered);
    },

    async clearStore(storeName) {
        await Storage.save(storeName, []);
    },

    async exportAll() {
        const keys = ['estoque', 'vendas', 'pedidos', 'produtos', 'funcionarios', 'mesas', 'estoque_movimentos'];
        const out = {};
        for (const key of keys) {
            out[key] = Storage.get(key) || [];
        }
        return out;
    },

    async importAll(data) {
        for (const [key, items] of Object.entries(data || {})) {
            if (items && Array.isArray(items)) {
                await Storage.save(key, items);
            }
        }
    }
};
