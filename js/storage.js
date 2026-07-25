var Storage = {
    _cache: {},

    init: async function() {
        await SB.init();
        for (var key in SB._cache) {
            this._cache[key] = SB._cache[key];
        }
        var self = this;
        SB.onChange('*', function(key, value) {
            self._cache[key] = value;
        });
    },

    get: function(key) {
        return this._cache[key] !== undefined ? this._cache[key] : null;
    },

    save: async function(key, data) {
        this._cache[key] = data;
        try {
            await SB.save(key, data);
        } catch (e) {
            console.warn('Storage.save error:', e.message);
        }
    },

    remove: async function(key) {
        delete this._cache[key];
        try {
            await SB.remove(key);
        } catch (e) {}
    },

    clear: async function() {
        this._cache = {};
        try {
            await SB.clear();
        } catch (e) {}
    },

    onChange: function(key, fn) {
        SB.onChange(key, fn);
    }
};
