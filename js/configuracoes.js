var Configuracoes = {
    _users: [],

    async init() {
        this.renderEmpresa();
        await this.renderUsers();
        this.renderMesasConfig();
        this.bindEvents();
        var self = this;
        Storage.onChange('mesas', function() { self.renderMesasConfig(); });
        Storage.onChange('config_empresa', function() { self.renderEmpresa(); });
    },

    renderEmpresa() {
        var cfg = Storage.get('config_empresa') || {};
        var nomeEl = document.getElementById('configNome');
        var cnpjEl = document.getElementById('configCnpj');
        var endEl = document.getElementById('configEndereco');
        var telEl = document.getElementById('configTelefone');
        var taxaEl = document.getElementById('configTaxa');
        if (nomeEl) nomeEl.value = cfg.nome || '';
        if (cnpjEl) cnpjEl.value = cfg.cnpj || '';
        if (endEl) endEl.value = cfg.endereco || '';
        if (telEl) telEl.value = cfg.telefone || '';
        if (taxaEl) taxaEl.value = cfg.taxaServico || 0;
    },

    salvarEmpresa() {
        var nomeEl = document.getElementById('configNome');
        var cnpjEl = document.getElementById('configCnpj');
        var endEl = document.getElementById('configEndereco');
        var telEl = document.getElementById('configTelefone');
        var taxaEl = document.getElementById('configTaxa');
        if (!nomeEl) return;
        var cfg = {
            nome: nomeEl.value.trim(),
            cnpj: cnpjEl ? cnpjEl.value.trim() : '',
            endereco: endEl ? endEl.value.trim() : '',
            telefone: telEl ? telEl.value.trim() : '',
            taxaServico: parseFloat(taxaEl ? taxaEl.value : 0) || 0
        };
        Storage.save('config_empresa', cfg);
        Notifications.success('Dados da empresa salvos!');
    },

    async renderUsers() {
        var container = document.getElementById('usersList');
        if (!container) return;
        var users = await SB.getUsers();
        this._users = users;
        if (!users.length) {
            container.innerHTML = '<p style="color:var(--text-muted)">Nenhum usuário cadastrado.</p>';
            return;
        }
        container.innerHTML = '<div style="margin-bottom:10px"><strong>Usuários do Sistema</strong></div>' +
            users.map(function(u) {
                return '<div class="user-row" style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:var(--bg-input);border-radius:10px;margin-bottom:6px">' +
                    '<div><strong>' + (u.name || 'Sem nome') + '</strong><br><span style="font-size:0.8rem;color:var(--text-muted)">' + u.username + ' | ' + u.role + '</span></div>' +
                    '<div style="display:flex;gap:6px">' +
                    '<button class="btn btn-sm" onclick="Configuracoes.editar(\'' + u.id + '\')" style="padding:4px 10px"><i class="fas fa-edit"></i></button>' +
                    '<button class="btn btn-sm" onclick="Configuracoes.excluir(\'' + u.id + '\')" style="padding:4px 10px;color:var(--danger)"><i class="fas fa-trash"></i></button></div></div>';
            }).join('');
    },

    abrirModalUsuario(user) {
        var modal = document.getElementById('userModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'userModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        var editando = !!user;
        modal.innerHTML =
            '<div class="modal-content glass modal-usuario">' +
            '<div class="modal-header"><h2>' + (editando ? 'Editar Usuário' : 'Novo Usuário') + '</h2>' +
            '<button class="modal-close" onclick="Configuracoes.fecharModal(\'userModal\')">&times;</button></div>' +
            '<div class="form-group"><label>Nome</label><input id="userFormNome" value="' + (user ? (user.name || '') : '') + '"></div>' +
            '<div class="form-group"><label>Email (username)</label><input id="userFormEmail" value="' + (user ? (user.username || '') : '') + '"' + (editando ? ' readonly style="opacity:0.6"' : '') + '></div>' +
            '<div class="form-group"><label>Senha</label><input id="userFormSenha" type="password" placeholder="' + (editando ? 'Deixe vazio para manter' : 'Senha') + '"></div>' +
            '<div class="form-group"><label>Cargo</label><select id="userFormRole">' +
            '<option value="Gerente"' + (user && user.role === 'Gerente' ? ' selected' : '') + '>Gerente</option>' +
            '<option value="Garçom"' + (user && user.role === 'Garçom' ? ' selected' : '') + '>Garçom</option>' +
            '<option value="Cozinha"' + (user && user.role === 'Cozinha' ? ' selected' : '') + '>Cozinha</option>' +
            '</select></div>' +
            '<div class="modal-footer">' +
            '<button class="btn" onclick="Configuracoes.fecharModal(\'userModal\')">Cancelar</button>' +
            '<button class="btn-primary" onclick="Configuracoes.salvarUsuario(\'' + (user ? user.id : '') + '\')">Salvar</button></div></div>';
        modal.style.display = 'flex';
    },

    async salvarUsuario(id) {
        var nomeEl = document.getElementById('userFormNome');
        var emailEl = document.getElementById('userFormEmail');
        var senhaEl = document.getElementById('userFormSenha');
        var roleEl = document.getElementById('userFormRole');
        if (!nomeEl || !emailEl) { Notifications.error('Erro ao acessar formulário'); return; }
        var nome = nomeEl.value.trim();
        var email = emailEl.value.trim();
        var senha = senhaEl ? senhaEl.value : '';
        var role = roleEl ? roleEl.value : 'Garçom';
        if (!nome || !email) { Notifications.error('Nome e email são obrigatórios'); return; }
        try {
            if (id) {
                var user = this._users.find(function(u) { return u.id === id; });
                if (user) {
                    user.name = nome;
                    user.role = role;
                    if (senha) user.password = senha;
                    await SB.saveUser(user);
                }
            } else {
                if (!senha) { Notifications.error('Senha é obrigatória para novo usuário'); return; }
                await SB.saveUser({ id: Utils.generateUUID(), name: nome, username: email, password: senha, role: role, created_at: new Date().toISOString() });
            }
            this.fecharModal('userModal');
            Notifications.success('Usuário salvo!');
            await this.renderUsers();
        } catch (e) {
            Notifications.error('Erro: ' + e.message);
        }
    },

    async editar(id) {
        var user = this._users.find(function(u) { return u.id === id; });
        if (user) this.abrirModalUsuario(user);
    },

    async excluir(id) {
        if (!confirm('Excluir este usuário?')) return;
        try {
            await SB.deleteUser(id);
            Notifications.success('Usuário excluído');
            await this.renderUsers();
        } catch (e) {
            Notifications.error('Erro: ' + e.message);
        }
    },

    renderMesasConfig() {
        var container = document.getElementById('mesasConfig');
        if (!container) return;
        var mesas = Storage.get('mesas') || [];
        container.innerHTML =
            '<div class="section-title">Gerenciar Mesas</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px;margin:12px 0">' +
            mesas.map(function(m) {
                return '<div style="background:var(--bg-input);border-radius:10px;padding:10px;text-align:center;border:1px solid var(--glass-border)">' +
                    '<div style="font-weight:600;font-size:1.1rem">Mesa ' + m.numero + '</div>' +
                    '<div style="font-size:0.75rem;color:var(--text-muted);margin:4px 0">' + m.status + '</div>' +
                    '<button class="btn btn-sm" onclick="Configuracoes.removerMesa(\'' + m.id + '\')" style="color:var(--danger);padding:2px 8px;font-size:0.75rem"><i class="fas fa-times"></i></button></div>';
            }).join('') + '</div>' +
            '<div style="display:flex;gap:8px;margin-top:8px">' +
            '<input id="novaMesaNumero" type="number" placeholder="Nº da mesa" style="width:100px">' +
            '<button class="btn-primary btn-sm" onclick="Configuracoes.adicionarMesa()"><i class="fas fa-plus"></i> Adicionar Mesa</button></div>';
    },

    adicionarMesa() {
        var input = document.getElementById('novaMesaNumero');
        var num = parseInt(input?.value, 10);
        if (!num || num < 1) { Notifications.error('Número inválido'); return; }
        var mesas = Storage.get('mesas') || [];
        if (mesas.find(function(m) { return m.numero === num; })) { Notifications.error('Mesa já existe'); return; }
        var maxId = mesas.reduce(function(max, m) {
            var idStr = String(m.id || '');
            var n = parseInt(idStr.replace('mesa_', ''), 10);
            return n > max ? n : max;
        }, 0);
        mesas.push({ id: 'mesa_' + (maxId + 1), numero: num, status: 'livre', pedidos: [] });
        Storage.save('mesas', mesas);
        input.value = '';
        this.renderMesasConfig();
        Notifications.success('Mesa ' + num + ' adicionada!');
    },

    removerMesa(id) {
        if (!confirm('Remover esta mesa?')) return;
        var mesas = Storage.get('mesas') || [];
        var idx = mesas.findIndex(function(m) { return String(m.id) === String(id); });
        if (idx >= 0) {
            mesas.splice(idx, 1);
            Storage.save('mesas', mesas);
            this.renderMesasConfig();
            Notifications.success('Mesa removida');
        }
    },

    bindEvents() {
        var addBtn = document.getElementById('addUserBtn');
        if (addBtn) {
            addBtn.onclick = function() { Configuracoes.abrirModalUsuario(null); };
        }
        var exportBtn = document.getElementById('exportDbBtn');
        if (exportBtn) exportBtn.onclick = this.exportBackup;
        var importFile = document.getElementById('importDbFile');
        if (importFile) importFile.onchange = this.importBackup;
        var showAudits = document.getElementById('btnShowAudits');
        if (showAudits) showAudits.onclick = this.showAudits;
        var exportAudits = document.getElementById('btnExportAudits');
        if (exportAudits) exportAudits.onclick = this.exportAudits;
        var clearAudits = document.getElementById('btnClearAudits');
        if (clearAudits) clearAudits.onclick = this.clearAudits;
    },

    fecharModal(id) {
        var modal = document.getElementById(id);
        if (modal) modal.style.display = 'none';
    },

    async exportBackup() {
        var data = await DB.exportAll();
        var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'backup_' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
        Notifications.success('Backup exportado!');
    },

    async importBackup(e) {
        var file = e.target.files[0];
        if (!file) return;
        try {
            var text = await file.text();
            var data = JSON.parse(text);
            await DB.importAll(data);
            Notifications.success('Backup importado!');
        } catch (err) {
            Notifications.error('Erro ao importar: ' + err.message);
        }
        e.target.value = '';
    },

    showAudits() {
        var container = document.getElementById('auditLogs');
        if (!container) return;
        var logs = Storage.get('audit_logs') || [];
        if (!logs.length) { container.innerHTML = '<p style="color:var(--text-muted)">Nenhum log encontrado.</p>'; return; }
        container.innerHTML = logs.reverse().map(function(l) {
            return '<div style="padding:6px 0;border-bottom:1px solid var(--glass-border);font-size:0.85rem">' +
                '<span style="color:var(--text-muted)">' + new Date(l.data).toLocaleString('pt-BR') + '</span> - ' +
                l.mensagem + ' <em style="color:var(--text-muted)">(' + l.usuario + ')</em></div>';
        }).join('');
    },

    exportAudits() {
        var logs = Storage.get('audit_logs') || [];
        if (!logs.length) { Notifications.info('Nenhum log para exportar'); return; }
        var blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'audit_logs_' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        URL.revokeObjectURL(url);
    },

    clearAudits() {
        if (!confirm('Limpar todos os logs de auditoria?')) return;
        Storage.save('audit_logs', []);
        var container = document.getElementById('auditLogs');
        if (container) container.innerHTML = '<p style="color:var(--text-muted)">Logs limpos.</p>';
        Notifications.success('Logs limpos');
    }
};
window.Configuracoes = Configuracoes;
