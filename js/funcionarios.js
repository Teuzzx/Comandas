var Funcionarios = {
    _funcionarios: [],

    init() {
        this._funcionarios = Storage.get('funcionarios') || [];
        this.render();
        var self = this;
        Storage.onChange('funcionarios', function() { self._funcionarios = Storage.get('funcionarios') || []; self.render(); });
    },

    render() {
        var container = document.getElementById('funcionariosList');
        if (!container) return;
        var funcs = this._funcionarios;
        if (!funcs.length) {
            container.innerHTML = '<div class="empty-state" style="text-align:center;padding:60px 20px;grid-column:1/-1">' +
                '<i class="fas fa-users" style="font-size:3rem;opacity:0.3"></i>' +
                '<p style="color:var(--text-muted);margin-top:12px">Nenhum funcionário cadastrado</p></div>';
            return;
        }
        container.innerHTML = funcs.map(function(f) {
            var ativo = f.ativo !== false;
            return '<div class="card glass" style="padding:16px;display:flex;justify-content:space-between;align-items:center">' +
                '<div style="display:flex;align-items:center;gap:12px">' +
                '<div class="user-avatar" style="width:44px;height:44px;border-radius:50%;background:' + (ativo ? 'var(--success)' : 'var(--text-muted)') + ';display:flex;align-items:center;justify-content:center;opacity:' + (ativo ? 1 : 0.5) + '">' +
                '<i class="fas fa-user" style="color:#fff"></i></div>' +
                '<div><strong>' + (f.nome || 'Sem nome') + '</strong>' +
                '<br><span style="font-size:0.8rem;color:var(--text-muted)">' + (f.cargo || 'Funcionário') + (f.ativo === false ? ' (Inativo)' : '') + (f.salario ? ' | R$ ' + Number(f.salario).toFixed(2) : '') + '</span></div></div>' +
                '<div style="display:flex;gap:6px">' +
                '<button class="btn btn-sm" onclick="Funcionarios.abrirModal(\'' + f.id + '\')"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-sm" onclick="Funcionarios.toggleAtivo(\'' + f.id + '\')" style="color:' + (ativo ? 'var(--warning)' : 'var(--success)') + '"><i class="fas ' + (ativo ? 'fa-pause' : 'fa-play') + '"></i></button>' +
                '<button class="btn btn-sm" onclick="Funcionarios.excluir(\'' + f.id + '\')" style="color:var(--danger)"><i class="fas fa-trash"></i></button></div></div>';
        }).join('');
    },

    abrirModal(id) {
        var func = id ? this._funcionarios.find(function(f) { return f.id === id; }) : null;
        var modal = document.getElementById('funcionarioModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'funcionarioModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML =
            '<div class="modal-content glass">' +
            '<div class="modal-header"><h2>' + (func ? 'Editar Funcionário' : 'Novo Funcionário') + '</h2>' +
            '<button class="modal-close" onclick="Funcionarios.fecharModal()">&times;</button></div>' +
            '<div class="form-group"><label>Nome</label><input id="funcNome" value="' + (func ? (func.nome || '') : '') + '"></div>' +
            '<div class="form-group"><label>Cargo</label><select id="funcCargo">' +
            '<option value="Garçom"' + (func && func.cargo === 'Garçom' ? ' selected' : '') + '>Garçom</option>' +
            '<option value="Cozinha"' + (func && func.cargo === 'Cozinha' ? ' selected' : '') + '>Cozinha</option>' +
            '<option value="Gerente"' + (func && func.cargo === 'Gerente' ? ' selected' : '') + '>Gerente</option>' +
            '<option value="Caixa"' + (func && func.cargo === 'Caixa' ? ' selected' : '') + '>Caixa</option></select></div>' +
            '<div class="form-group"><label>Telefone</label><input id="funcTel" value="' + (func ? (func.telefone || '') : '') + '"></div>' +
            '<div class="form-group"><label>Sal\u00e1rio (R$)</label><input id="funcSalario" type="number" step="0.01" value="' + (func ? (func.salario || '') : '') + '"></div>' +
            '<div class="modal-footer">' +
            '<button class="btn" onclick="Funcionarios.fecharModal()">Cancelar</button>' +
            '<button class="btn-primary" onclick="Funcionarios.salvar(\'' + (func ? func.id : '') + '\')">Salvar</button></div></div>';
        modal.style.display = 'flex';
    },

    salvar(id) {
        var nomeEl = document.getElementById('funcNome');
        var cargoEl = document.getElementById('funcCargo');
        var telEl = document.getElementById('funcTel');
        var salarioEl = document.getElementById('funcSalario');
        if (!nomeEl) { Notifications.error('Erro ao acessar formulário'); return; }
        var nome = nomeEl.value.trim();
        var cargo = cargoEl ? cargoEl.value : '';
        var telefone = telEl ? telEl.value.trim() : '';
        var salario = salarioEl ? parseFloat(salarioEl.value) || 0 : 0;
        if (!nome) { Notifications.error('Nome é obrigatório'); return; }
        if (id) {
            var func = this._funcionarios.find(function(f) { return f.id === id; });
            if (func) { func.nome = nome; func.cargo = cargo; func.telefone = telefone; func.salario = salario; }
        } else {
            this._funcionarios.push({ id: Utils.generateId(), nome: nome, cargo: cargo, telefone: telefone, salario: salario, ativo: true });
        }
        Storage.save('funcionarios', this._funcionarios);
        this.fecharModal();
        this.render();
        Notifications.success('Funcionário salvo!');
    },

    toggleAtivo(id) {
        var func = this._funcionarios.find(function(f) { return f.id === id; });
        if (func) {
            func.ativo = func.ativo === false ? true : false;
            Storage.save('funcionarios', this._funcionarios);
            this.render();
            Notifications.info(func.ativo ? 'Funcionário ativado' : 'Funcionário desativado');
        }
    },

    excluir(id) {
        if (!confirm('Excluir este funcionário?')) return;
        this._funcionarios = this._funcionarios.filter(function(f) { return f.id !== id; });
        Storage.save('funcionarios', this._funcionarios);
        this.render();
        Notifications.success('Funcionário excluído');
    },

    fecharModal() {
        var modal = document.getElementById('funcionarioModal');
        if (modal) modal.style.display = 'none';
    },

    openModal() {
        this.abrirModal(null);
    }
};
