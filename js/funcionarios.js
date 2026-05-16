/**
 * Gerenciamento de Funcionários
 */
const Funcionarios = {
    init() {
        this.render();
    },

    render() {
        const container = document.getElementById('funcionariosList');
        if (!container) return;
        const funcionarios = Storage.get('funcionarios') || [];
        if (funcionarios.length === 0) {
            container.innerHTML = `<div class="card">Nenhum funcionário cadastrado.</div>`;
            return;
        }

        container.innerHTML = funcionarios.map(f => `
            <div class="card flex-center" style="gap: 15px; padding: 20px; align-items: center;">
                <div class="user-avatar" style="width: 48px; height: 48px; font-size: 1.2rem;"><i class="fas fa-user"></i></div>
                <div style="text-align: left; flex: 1;">
                    <h4 style="margin: 0;">${f.nome}</h4>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">${f.role}</p>
                </div>
                <div style="display:flex;gap:8px;align-items:center;">
                    <button onclick="Funcionarios.toggleAtivo('${f.id}')" style="background:transparent;color:${f.ativo? 'var(--success)':'var(--text-muted)'}">${f.ativo? 'Ativo' : 'Inativo'}</button>
                    <button onclick="Funcionarios.edit('${f.id}')" style="background:transparent;color:var(--info)"><i class="fas fa-edit"></i></button>
                    <button onclick="Funcionarios.delete('${f.id}')" style="background:transparent;color:var(--danger)"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
    },

    openModal() {
        const nome = prompt('Nome do funcionário:');
        if (!nome || !nome.trim()) { Notifications.info('Nome inválido.'); return; }
        const role = prompt('Função (Gerente / Garçom / Cozinha):', 'Garçom');
        if (!role || !role.trim()) { Notifications.info('Função inválida.'); return; }

        if (!confirm(`Criar funcionário ${nome} como ${role}?`)) { Notifications.info('Criação cancelada.'); return; }

        const funcionarios = Storage.get('funcionarios') || [];
        funcionarios.push({ id: Utils.generateId(), nome: nome.trim(), role: role.trim(), ativo: true });
        Storage.save('funcionarios', funcionarios);
        Notifications.success('Funcionário criado!');
        this.render();
    },

    edit(id) {
        const funcionarios = Storage.get('funcionarios') || [];
        const idx = funcionarios.findIndex(f => f.id === id);
        if (idx === -1) return;
        const f = funcionarios[idx];
        const nome = prompt('Nome do funcionário:', f.nome);
        if (!nome || !nome.trim()) { Notifications.info('Nome inválido.'); return; }
        const role = prompt('Função (Gerente / Garçom / Cozinha):', f.role);
        if (!role || !role.trim()) { Notifications.info('Função inválida.'); return; }
        if (!confirm(`Salvar alterações para ${nome}?`)) { Notifications.info('Alteração cancelada.'); return; }
        funcionarios[idx].nome = nome.trim();
        funcionarios[idx].role = role.trim();
        Storage.save('funcionarios', funcionarios);
        Notifications.success('Funcionário atualizado!');
        this.render();
    },

    delete(id) {
        if (!confirm('Remover funcionário permanentemente?')) return;
        let funcionarios = Storage.get('funcionarios') || [];
        funcionarios = funcionarios.filter(f => f.id !== id);
        Storage.save('funcionarios', funcionarios);
        Notifications.success('Funcionário removido');
        this.render();
    },

    toggleAtivo(id) {
        const funcionarios = Storage.get('funcionarios') || [];
        const idx = funcionarios.findIndex(f => f.id === id);
        if (idx === -1) return;
        funcionarios[idx].ativo = !funcionarios[idx].ativo;
        Storage.save('funcionarios', funcionarios);
        this.render();
    }
};
