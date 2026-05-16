const Configuracoes = {
    async init() {
        await DB.init();

        const refreshUsers = () => {
            const usersList = document.getElementById('usersList');
            if (!usersList) return;
            const users = Storage.get('users') || [];
            usersList.innerHTML = users.map(u => `
                <div style="display:flex; gap:8px; align-items:center; padding:8px 0; border-bottom:1px solid var(--glass-border);">
                    <div style="flex:1;"><strong>${u.name}</strong> <small style="color:var(--text-muted)">@${u.username || ''}</small><br><small style="color:var(--text-muted)">${u.role}</small></div>
                    <button class="btn" data-id="${u.id}" data-action="edit">Editar</button>
                    <button class="btn" data-id="${u.id}" data-action="delete">Remover</button>
                </div>
            `).join('');

            usersList.querySelectorAll('button[data-action="delete"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = btn.getAttribute('data-id');
                    const newUsers = (Storage.get('users') || []).filter(x => x.id !== id);
                    Storage.save('users', newUsers);
                    refreshUsers();
                });
            });

            usersList.querySelectorAll('button[data-action="edit"]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = btn.getAttribute('data-id');
                    const users = Storage.get('users') || [];
                    const u = users.find(x => x.id === id);
                    if (!u) return Notifications.info('Usuário não encontrado');
                    const newName = prompt('Nome completo:', u.name) || u.name;
                    const newRole = prompt('Papel (Gerente/Garçom/Cozinha):', u.role) || u.role;
                    const newPass = prompt('Nova senha (deixe vazio para manter):', '');
                    u.name = newName;
                    u.role = newRole;
                    if (newPass && newPass.trim()) u.password = newPass;
                    Storage.save('users', users);
                    refreshUsers();
                    Notifications.success('Usuário atualizado');
                });
            });
        };

        const exportBtn = document.getElementById('exportDbBtn');
        const importFile = document.getElementById('importDbFile');
        const addUserBtn = document.getElementById('addUserBtn');
        const btnShowAudits = document.getElementById('btnShowAudits');
        const btnExportAudits = document.getElementById('btnExportAudits');
        const btnClearAudits = document.getElementById('btnClearAudits');

        if (exportBtn) {
            exportBtn.addEventListener('click', async () => {
                const data = await DB.exportAll();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backup_pizzaria_${new Date().toISOString().slice(0,10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }

        if (importFile) {
            importFile.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const text = await file.text();
                try {
                    const data = JSON.parse(text);
                    await DB.importAll(data);
                    Notifications.success('Backup importado com sucesso!');
                } catch (err) {
                    Notifications.error('Erro ao importar backup: ' + err.message);
                }
            });
        }

        // seed users if not exist
        if (!Storage.get('users')) {
            Storage.save('users', [
                { id: Utils.generateId(), name: 'Administrador', username: 'admin', password: 'admin', role: 'Gerente' },
                { id: Utils.generateId(), name: 'Cozinha', username: 'cozinha', password: 'cozinha', role: 'Cozinha' },
                { id: Utils.generateId(), name: 'Garçom', username: 'garcom', password: 'garcom', role: 'Garçom' }
            ]);
        }

        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                const name = document.getElementById('newUserName').value.trim();
                const username = document.getElementById('newUsername').value.trim();
                const password = document.getElementById('newUserPass').value;
                const role = document.getElementById('newUserRole').value;
                if (!name || !username || !password) { Notifications.info('Preencha nome, usuário e senha'); return; }
                const users = Storage.get('users') || [];
                if (users.find(u => u.username === username)) { Notifications.error('Username já existe'); return; }
                const novo = { id: Utils.generateId(), name, username, password, role };
                users.push(novo);
                Storage.save('users', users);
                document.getElementById('newUserName').value = '';
                document.getElementById('newUsername').value = '';
                document.getElementById('newUserPass').value = '';
                refreshUsers();
                Notifications.success('Usuário adicionado');
            });
        }

        // audit buttons
        if (btnShowAudits) {
            btnShowAudits.addEventListener('click', () => {
                const logs = Storage.get('audit_logs') || [];
                const container = document.getElementById('auditLogs');
                if (!container) return;
                if (!logs.length) { container.innerHTML = '<div style="color:var(--text-muted)">Sem registros.</div>'; return; }
                container.innerHTML = logs.slice().reverse().map(l => `<div style="padding:8px 0; border-bottom:1px solid var(--glass-border);"><strong>${l.action}</strong> - ${l.itemId || ''} - ${l.quantidade || ''} - ${l.usuario || ''} <br><small style="color:var(--text-muted)">${Utils.formatDateTime(l.date)}</small></div>`).join('');
            });
        }

        if (btnExportAudits) {
            btnExportAudits.addEventListener('click', () => {
                const logs = Storage.get('audit_logs') || [];
                const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit_logs_${new Date().toISOString().slice(0,10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
            });
        }

        if (btnClearAudits) {
            btnClearAudits.addEventListener('click', () => {
                if (!confirm('Limpar todos os logs de auditoria?')) return;
                Storage.save('audit_logs', []);
                const container = document.getElementById('auditLogs');
                if (container) container.innerHTML = '';
                Notifications.success('Logs limpos');
            });
        }

        refreshUsers();
    }
};

window.Configuracoes = Configuracoes;
