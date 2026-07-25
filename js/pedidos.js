var Pedidos = {
    init() {
        this.renderPedidos();
        var self = this;
        Storage.onChange('pedidos', function() { self.renderPedidos(); });
    },

    renderPedidos() {
        var container = document.getElementById('pedidosList');
        if (!container) return;
        var pedidos = Storage.get('pedidos') || [];
        var user = (function(){ try{ return JSON.parse(localStorage.getItem('app_user')); }catch(e){} })() || {};
        var role = user.role || 'Garçom';
        if (!pedidos.length) {
            container.innerHTML = '<div class="empty-state" style="text-align:center;padding:60px 20px">' +
                '<i class="fas fa-shopping-basket" style="font-size:3rem;opacity:0.3"></i>' +
                '<p style="color:var(--text-muted);margin-top:12px">Nenhum pedido registrado</p></div>';
            return;
        }
        container.innerHTML = '<div class="pedidos-grid">' +
            pedidos.sort(function(a, b) { return new Date(b.data) - new Date(a.data); }).map(function(p) {
                var cor = p.status === 'Pendente' ? 'var(--danger)' : p.status === 'Preparando' ? 'var(--warning)' : p.status === 'Pronto' ? 'var(--info)' : 'var(--success)';
                var podeAvancar = p.status === 'Pendente' || p.status === 'Preparando' || p.status === 'Pronto';
                var podeAvancarBtn = false;
                var btnLabel = '';
                if (p.status === 'Pendente' && (role === 'Cozinha' || role === 'Gerente')) {
                    podeAvancarBtn = true;
                    btnLabel = 'Iniciar Preparo';
                } else if (p.status === 'Preparando' && (role === 'Cozinha' || role === 'Gerente')) {
                    podeAvancarBtn = true;
                    btnLabel = 'Marcar Pronto';
                } else if (p.status === 'Pronto' && (role === 'Garçom' || role === 'Gerente')) {
                    podeAvancarBtn = true;
                    btnLabel = 'Entregar';
                }
                var podeExcluir = role === 'Gerente';
                return '<div class="card glass pedido-card" style="border-left:4px solid ' + cor + ';margin-bottom:12px;padding:16px">' +
                    '<div class="flex-between" style="margin-bottom:8px">' +
                    '<div><strong style="font-size:1.1rem">' + p.mesa + '</strong>' +
                    '<span class="badge" style="margin-left:8px;background:' + cor + '">' + p.status + '</span></div>' +
                    '<span style="font-size:0.8rem;color:var(--text-muted)">' + new Date(p.data).toLocaleString('pt-BR') + '</span></div>' +
                    '<div style="margin-bottom:8px;font-size:0.9rem">' +
                    (p.itens || []).map(function(i) {
                        var obsHtml = i.obs ? '<span style="color:var(--warning);font-size:0.78rem;margin-left:6px"><i class="fas fa-comment"></i> ' + i.obs + '</span>' : '';
                        var bordaHtml = i.borda ? '<span style="color:var(--info);font-size:0.78rem;margin-left:6px"><i class="fas fa-circle"></i> Borda: ' + i.borda.charAt(0).toUpperCase() + i.borda.slice(1) + '</span>' : '';
                        return '<div style="padding:2px 0">' + i.qtd + 'x ' + i.nome + obsHtml + bordaHtml + '</div>';
                    }).join('') +
                    '</div>' +
                    '<div class="flex-between">' +
                    '<span style="font-weight:700;color:var(--success);font-size:1.1rem">R$ ' + (Number(p.total) || 0).toFixed(2) + '</span>' +
                    '<div style="display:flex;gap:6px">' +
                    (podeAvancarBtn ? '<button class="btn-primary btn-sm" onclick="Pedidos.avancar(\'' + p.id + '\')">' + btnLabel + '</button>' : '') +
                    (podeExcluir ? '<button class="btn btn-sm" onclick="Pedidos.excluir(\'' + p.id + '\')" style="color:var(--danger)"><i class="fas fa-trash"></i></button>' : '') +
                    '</div></div></div>';
            }).join('') + '</div>';
    },

    avancar(id) {
        var pedidos = Storage.get('pedidos') || [];
        var p = pedidos.find(function(p2) { return p2.id === id; });
        if (!p) return;
        var proximo = { 'Pendente': 'Preparando', 'Preparando': 'Pronto', 'Pronto': 'Entregue' };
        p.status = proximo[p.status] || p.status;
        Storage.save('pedidos', pedidos);
        if (typeof Notifications !== 'undefined') {
            Notifications.success('Pedido atualizado para ' + p.status);
        }
        this.renderPedidos();
    },

    excluir(id) {
        if (!confirm('Excluir este pedido permanentemente?')) return;
        var pedidos = Storage.get('pedidos') || [];
        var idx = pedidos.findIndex(function(p) { return p.id === id; });
        if (idx >= 0) {
            pedidos.splice(idx, 1);
            Storage.save('pedidos', pedidos);
            Notifications.success('Pedido excluído');
            this.renderPedidos();
        }
    }
};