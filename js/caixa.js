const Caixa = {
    mesaSelecionada: null,
    paymentMethod: 'pix',
    _vendasAntes: 0,

    async init() {
        this.renderCaixaList();
        this.renderResumoCaixa();
        var self = this;
        Storage.onChange('mesas', function() { self.renderCaixaList(); });
        Storage.onChange('vendas', function() { self.renderResumoCaixa(); });
    },

    renderCaixaList() {
        var container = document.getElementById('caixaList');
        if (!container) return;
        var mesas = Storage.get('mesas') || [];
        var contas = mesas.filter(function(m) {
            var st = (m.status || '').toLowerCase();
            return st === 'conta' || st === 'ocupada' || st === 'pedindo_conta';
        });
        if (!contas.length) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-cash-register" style="font-size:3rem;opacity:0.3"></i><p style="color:var(--text-muted);margin-top:12px">Nenhuma conta pendente</p></div>';
            return;
        }
        container.innerHTML = contas.map(function(m) {
            var total = (m.pedidos || []).reduce(function(s, p) { return s + (Number(p.preco) || 0) * (p.qtd || 1); }, 0);
            var statusIcon = m.status === 'pedindo_conta' ? 'fa-bell' : 'fa-receipt';
            var statusColor = m.status === 'pedindo_conta' ? 'var(--warning)' : 'var(--info)';
            return '<div class="caixa-card card glass" onclick="Caixa.selectMesa(\'' + m.id + '\')" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:16px 20px;margin-bottom:10px">' +
                '<div style="display:flex;align-items:center;gap:12px">' +
                '<i class="fas ' + statusIcon + '" style="color:' + statusColor + ';font-size:1.3rem"></i>' +
                '<div><strong style="font-size:1.1rem">Mesa ' + m.numero + '</strong>' +
                '<br><span style="color:var(--text-muted);font-size:0.85rem">' + (m.pedidos || []).length + ' item(ns)</span></div></div>' +
                '<span style="font-size:1.2rem;font-weight:700;color:var(--success)">R$ ' + total.toFixed(2) + '</span></div>';
        }).join('');
    },

    renderResumoCaixa() {
        var container = document.getElementById('resumoCaixa');
        if (!container) return;
        var vendas = DB.getAll('vendas') || [];
        var totalDia = vendas.reduce(function(s, v) {
            var d = new Date(v.data);
            var hoje = new Date();
            return d.toDateString() === hoje.toDateString() ? s + (Number(v.total) || 0) : s;
        }, 0);
        var qtd = vendas.filter(function(v) {
            var d = new Date(v.data);
            var hoje = new Date();
            return d.toDateString() === hoje.toDateString();
        }).length;
        this._vendasAntes = vendas.length;
        container.innerHTML =
            '<div class="stats-grid" style="margin-bottom:20px">' +
            '<div class="card stat-card"><div class="stat-icon" style="background:rgba(46,204,113,0.1);color:var(--success)"><i class="fas fa-dollar-sign"></i></div><div class="stat-info"><h3>Faturamento Hoje</h3><p class="stat-value">R$ ' + totalDia.toFixed(2) + '</p></div></div>' +
            '<div class="card stat-card"><div class="stat-icon" style="background:rgba(52,152,219,0.1);color:var(--info)"><i class="fas fa-receipt"></i></div><div class="stat-info"><h3>Vendas Hoje</h3><p class="stat-value">' + qtd + '</p></div></div>' +
            '<div class="card stat-card" onclick="Caixa.abrirFechamento()" style="cursor:pointer;border-color:var(--danger)"><div class="stat-icon" style="background:rgba(231,76,60,0.1);color:var(--danger)"><i class="fas fa-lock"></i></div><div class="stat-info"><h3 style="color:var(--danger)">Fechar Caixa</h3><p class="stat-value" style="color:var(--danger);font-size:0.8rem">Clique para fechar</p></div></div>' +
            '</div>';
    },

    selectMesa(mesaId) {
        var mesas = Storage.get('mesas') || [];
        var mesa = mesas.find(function(m) { return m.id === mesaId; });
        if (!mesa) return;
        this.mesaSelecionada = mesa;
        var area = document.getElementById('checkoutArea');
        if (area) area.style.display = 'block';
        this.renderCheckout();
    },

    renderCheckout() {
        var m = this.mesaSelecionada;
        if (!m) return;
        var detalhes = document.getElementById('checkoutDetails');
        if (!detalhes) return;
        var itens = m.pedidos || [];
        var subtotal = itens.reduce(function(s, p) { return s + (Number(p.preco) || 0) * (p.qtd || 1); }, 0);

        detalhes.innerHTML =
            '<div class="flex-between" style="margin-bottom:12px"><strong>Mesa ' + m.numero + '</strong><span class="badge" style="background:var(--warning)">' + (m.status || '') + '</span></div>' +
            '<div style="max-height:240px;overflow:auto;margin-bottom:12px">' +
            itens.map(function(p) {
                var sub = (Number(p.preco) || 0) * (p.qtd || 1);
                var obsHtml = p.obs ? '<br><span style="font-size:0.75rem;color:var(--warning)"><i class="fas fa-comment"></i> ' + p.obs + '</span>' : '';
                var bordaHtml = p.borda ? '<span style="font-size:0.75rem;color:var(--info);margin-left:6px"><i class="fas fa-circle"></i> Borda: ' + p.borda.charAt(0).toUpperCase() + p.borda.slice(1) + '</span>' : '';
                return '<div class="flex-between" style="padding:6px 0;border-bottom:1px solid var(--glass-border);font-size:0.9rem">' +
                    '<span>' + (p.qtd || 1) + 'x ' + (p.nome || 'Item') + obsHtml + bordaHtml + '</span>' +
                    '<span style="font-weight:600">R$ ' + sub.toFixed(2) + '</span></div>';
            }).join('') + '</div>' +
            '<div class="flex-between" style="font-size:1.1rem;font-weight:700;padding-top:8px;border-top:2px solid var(--glass-border)">' +
            '<span>Subtotal</span><span id="checkoutSubtotal">R$ ' + subtotal.toFixed(2) + '</span></div>';

        var input = document.getElementById('inputDesconto');
        if (input) input.value = '0';
        this.calculateTotal();
        this.highlightPayment(this.paymentMethod);
    },

    setPayment(method) {
        this.paymentMethod = method;
        this.highlightPayment(method);
    },

    highlightPayment(method) {
        document.querySelectorAll('.payment-btn').forEach(function(b) {
            b.classList.toggle('active', b.dataset.method === method);
        });
    },

    calculateTotal() {
        var m = this.mesaSelecionada;
        if (!m) return;
        var subtotal = (m.pedidos || []).reduce(function(s, p) { return s + (Number(p.preco) || 0) * (p.qtd || 1); }, 0);
        var desc = Number(document.getElementById('inputDesconto')?.value || 0);
        var total = Math.max(0, subtotal - desc);
        var el = document.getElementById('checkoutTotal');
        if (el) el.textContent = 'R$ ' + total.toFixed(2);
    },

    finalizarVenda() {
        var m = this.mesaSelecionada;
        if (!m) { Notifications.error('Selecione uma mesa'); return; }
        var subtotal = (m.pedidos || []).reduce(function(s, p) { return s + (Number(p.preco) || 0) * (p.qtd || 1); }, 0);
        var desc = Number(document.getElementById('inputDesconto')?.value || 0);
        var total = Math.max(0, subtotal - desc);
        if (total <= 0 && subtotal > 0) { Notifications.error('Desconto não pode zerar a conta'); return; }

        var user = (function(){ try{ return JSON.parse(localStorage.getItem('app_user')); }catch(e){} })() || {};
        var venda = {
            id: Utils.generateId(),
            mesa: 'Mesa ' + m.numero,
            mesaId: m.id,
            itens: m.pedidos || [],
            subtotal: subtotal,
            desconto: desc,
            total: total,
            pagamento: this.paymentMethod,
            data: new Date().toISOString(),
            usuario: user.name || 'Sistema',
            status: 'Finalizado'
        };

        var vendas = Storage.get('vendas') || [];
        vendas.push(venda);
        Storage.save('vendas', vendas);

        var mesas = Storage.get('mesas') || [];
        var idx = mesas.findIndex(function(m2) { return m2.id === m.id; });
        if (idx >= 0) {
            mesas[idx].status = 'livre';
            mesas[idx].pedidos = [];
        }
        Storage.save('mesas', mesas);

        this.mesaSelecionada = null;
        var area = document.getElementById('checkoutArea');
        if (area) area.style.display = 'none';
        this.renderCaixaList();
        this.renderResumoCaixa();
        Notifications.success('Venda finalizada! R$ ' + total.toFixed(2));
    },

    abrirFechamento() {
        var user = (function(){ try{ return JSON.parse(localStorage.getItem('app_user')); }catch(e){} })() || {};
        if (user.role !== 'Gerente') { Notifications.error('Apenas Gerente pode fechar o caixa'); return; }
        var pedidos = Storage.get('pedidos') || [];
        var pendentes = pedidos.filter(function(p) { return p.status !== 'Entregue'; });
        if (pendentes.length > 0) {
            Notifications.error('Existem ' + pendentes.length + ' pedido(s) pendente(s). Feche todos antes de fechar o caixa.');
            return;
        }
        var vendas = DB.getAll('vendas') || [];
        var totalDia = vendas.reduce(function(s, v) {
            var d = new Date(v.data);
            return d.toDateString() === new Date().toDateString() ? s + (Number(v.total) || 0) : s;
        }, 0);
        var qtdVendas = vendas.filter(function(v) {
            return new Date(v.data).toDateString() === new Date().toDateString();
        }).length;

        var modal = document.getElementById('fecharCaixaModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'fecharCaixaModal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        modal.innerHTML =
            '<div class="modal-content glass fechar-caixa">' +
            '<div class="modal-header"><h2><i class="fas fa-lock"></i> Fechamento do Caixa</h2>' +
            '<button class="modal-close" onclick="Caixa.fecharModal()">&times;</button></div>' +
            '<div class="fechamento-body">' +
            '<div class="fechamento-info"><span>Data:</span><strong>' + new Date().toLocaleDateString('pt-BR') + '</strong></div>' +
            '<div class="fechamento-info"><span>Vendas Realizadas:</span><strong>' + qtdVendas + '</strong></div>' +
            '<div class="fechamento-info"><span>Faturamento Total:</span><strong style="color:var(--success);font-size:1.3rem">R$ ' + totalDia.toFixed(2) + '</strong></div>' +
            '<hr style="border-color:var(--glass-border);margin:16px 0">' +
            '<div class="form-group"><label>Valor em Caixa (R$)</label><input id="fechamentoValor" type="number" step="0.01" value="' + totalDia.toFixed(2) + '"></div>' +
            '<div class="form-group"><label>Observações</label><textarea id="fechamentoObs" rows="2" style="width:100%;padding:10px;border-radius:10px;background:var(--bg-input);border:1px solid var(--glass-border);color:#fff"></textarea></div>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button class="btn" onclick="Caixa.fecharModal()">Cancelar</button>' +
            '<button class="btn-primary" style="background:var(--danger)" onclick="Caixa.confirmarFechamento()"><i class="fas fa-check"></i> Fechar Caixa</button>' +
            '</div></div>';
        modal.style.display = 'flex';
    },

    confirmarFechamento() {
        var valor = Number(document.getElementById('fechamentoValor')?.value || 0);
        var obs = document.getElementById('fechamentoObs')?.value || '';
        var user = (function(){ try{ return JSON.parse(localStorage.getItem('app_user')); }catch(e){} })() || {};
        var registro = {
            id: Utils.generateId(),
            data: new Date().toISOString(),
            valor: valor,
            observacoes: obs,
            usuario: user.name || 'Sistema',
            tipo: 'fechamento_caixa'
        };
        var fechamentos = Storage.get('fechamentos_caixa') || [];
        fechamentos.push(registro);
        Storage.save('fechamentos_caixa', fechamentos);
        this.fecharModal();
        Notifications.success('Caixa fechado com sucesso! R$ ' + valor.toFixed(2));
        this.renderResumoCaixa();
    },

    fecharModal() {
        var modal = document.getElementById('fecharCaixaModal');
        if (modal) modal.style.display = 'none';
    }
};
