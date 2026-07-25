const SUPABASE_URL = 'https://gkgzaxrlbvpltfgmcczw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrZ3pheHJsYnZwbHRmZ21jY3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NzkyNjgsImV4cCI6MjEwMDU1NTI2OH0.w97lvQWP__pJcm9P6KJTLs1lwsgMj-Cxh9PKRrZSrgg';

var SB = {
    _client: null,
    _cache: {},
    _ready: false,
    _realtimeChannel: null,
    _realtimeCallbacks: {},

    async init() {
        try {
            this._client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                realtime: { params: { eventsPerSecond: 10 } }
            });
            await this._loadCache();
            this._ready = true;
            this._initRealtime();
            console.log('Supabase conectado!');
        } catch (e) {
            console.error('Erro ao conectar Supabase:', e);
            this._ready = true;
        }
    },

    onChange(key, fn) {
        if (!this._realtimeCallbacks[key]) this._realtimeCallbacks[key] = [];
        this._realtimeCallbacks[key].push(fn);
    },

    _initRealtime() {
        try {
            if (this._realtimeChannel) return;
            var self = this;
            this._realtimeChannel = this._client.channel('app_data_changes')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'app_data' },
                    function(payload) {
                        var key = payload.new ? payload.new.key : (payload.old ? payload.old.key : null);
                        if (!key) return;
                        var value = payload.new ? payload.new.value : null;
                        self._cache[key] = value;
                        var cbs = self._realtimeCallbacks[key];
                        if (cbs) {
                            for (var i = 0; i < cbs.length; i++) cbs[i](value);
                        }
                        var allCbs = self._realtimeCallbacks['*'];
                        if (allCbs) {
                            for (var j = 0; j < allCbs.length; j++) allCbs[j](key, value);
                        }
                    }
                )
                .subscribe(function(status) {
                    if (status === 'SUBSCRIBED') console.log('Realtime conectado');
                });
        } catch (e) {
            console.warn('Realtime init error:', e.message);
        }
    },

    async _loadCache() {
        try {
            var result = await this._client.from('app_data').select('*');
            if (result.error) {
                console.warn('Supabase _loadCache error:', result.error.message);
                return;
            }
            if (result.data) {
                result.data.forEach(function(row) {
                    this._cache[row.key] = row.value;
                }.bind(this));
            }
        } catch (e) {
            console.warn('Supabase _loadCache exception:', e.message);
        }
    },

    get(key) {
        return this._cache[key] !== undefined ? this._cache[key] : null;
    },

    async fetch(key) {
        if (!this._client) return null;
        try {
            var result = await this._client.from('app_data').select('value').eq('key', key).maybeSingle();
            if (result.data && result.data.value !== null && result.data.value !== undefined) {
                this._cache[key] = result.data.value;
                return result.data.value;
            }
            return null;
        } catch (e) {
            console.warn('Supabase fetch error:', e.message);
            return this._cache[key] !== undefined ? this._cache[key] : null;
        }
    },

    async save(key, data) {
        this._cache[key] = data;
        if (!this._client) return;
        try {
            var result = await this._client.from('app_data').upsert(
                { key: key, value: data },
                { onConflict: 'key', ignoreDuplicates: false }
            );
            if (result.error) console.warn('Supabase save error:', result.error.message);
        } catch (e) {
            console.warn('Supabase save error:', e.message);
        }
    },

    async remove(key) {
        delete this._cache[key];
        if (!this._client) return;
        try {
            await this._client.from('app_data').delete().eq('key', key);
        } catch (e) {}
    },

    async clear() {
        this._cache = {};
        if (!this._client) return;
        try {
            await this._client.from('app_data').delete().neq('key', '__dummy__');
        } catch (e) {}
    },

    async authLogin(email, password) {
        if (!this._client) return null;
        try {
            var authResult = await this._client.auth.signInWithPassword({
                email: email, password: password
            });
            if (authResult.data && authResult.data.user) {
                var userEmail = authResult.data.user.email || email;
                var userResult = await this._client
                    .from('users').select('*').eq('username', userEmail).maybeSingle();
                if (userResult.data) return userResult.data;
                return { id: authResult.data.user.id, name: userEmail, role: 'Gerente' };
            }
        } catch (e) {
            console.warn('Supabase Auth login failed (fallback to custom login):', e.message);
        }
        try {
            var result = await this._client
                .from('users').select('*').eq('username', email).eq('password', password).maybeSingle();
            if (result.data) return result.data;
        } catch (e) {}
        return null;
    },

    async getUsers() {
        if (!this._client) return [];
        try {
            var result = await this._client.from('users').select('*').order('created_at');
            if (!result.error) return result.data || [];
        } catch (e) {}
        return [];
    },

    async saveUser(user) {
        if (!this._client) throw new Error('Supabase nao conectado');
        var result = await this._client.from('users').upsert(user, {
            onConflict: 'id', ignoreDuplicates: false
        });
        if (result.error) throw result.error;
    },

    async deleteUser(id) {
        if (!this._client) throw new Error('Supabase nao conectado');
        var result = await this._client.from('users').delete().eq('id', id);
        if (result.error) throw result.error;
    },

    waitReady() {
        var self = this;
        return new Promise(function(resolve) {
            if (self._ready) return resolve();
            var check = setInterval(function() {
                if (self._ready) { clearInterval(check); resolve(); }
            }, 50);
        });
    }
};
