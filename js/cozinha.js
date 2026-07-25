var Cozinha = {
    init() {
        this.renderPedidos();
        this.atualizarContador();
        var self = this;
        Storage.onChange('pedidos', function() { self.renderPedidos(); self.atualizarContador(); });
    },

    renderPedidos() {
        var grid = document.getElementById('cozinhaGrid');
        if (!grid) return;
        var pedidos = Storage.get('pedidos') || [];
        var pendentes = pedidos.filter(function(p) { return p.status === 'Pendente' || p.status === 'Preparando'; });
        if (!pendentes.length) {
            grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;text-align:center;padding:60px 20px">' +
                '<i class="fas fa-check-circle" style="font-size:3rem;color:var(--success);opacity:0.5"></i>' +
                '<p style="color:var(--text-muted);margin-top:12px;font-size:1.1rem">Nenhum pedido pendente</p></div>';
            return;
        }
        grid.innerHTML = pendentes.sort(function(a, b) { return new Date(b.data) - new Date(a.data); }).map(function(p) {
            var isPreparando = p.status === 'Preparando';
            var cardClass = isPreparando ? 'card glass cozinha-card preparando' : 'card glass cozinha-card';
            var corBorda = isPreparando ? 'var(--warning)' : 'var(--danger)';
            var tempo = Math.floor((new Date() - new Date(p.data)) / 60000);
            return '<div class="' + cardClass + '" style="border-left:4px solid ' + corBorda + ';padding:16px">' +
                '<div class="flex-between" style="margin-bottom:8px">' +
                '<strong style="font-size:1.1rem">' + p.mesa + '</strong>' +
                '<span class="badge" style="background:' + (isPreparando ? 'var(--warning)' : 'var(--danger)') + '">' + p.status + '</span></div>' +
                '<div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:8px">Há ' + tempo + ' min</div>' +
                '<div style="margin-bottom:12px">' +
                (p.itens || []).map(function(i) {
                    var obsHtml = i.obs ? '<div style="font-size:0.78rem;color:var(--warning);margin-top:2px"><i class="fas fa-comment"></i> ' + i.obs + '</div>' : '';
                    var bordaHtml = i.borda ? '<span style="font-size:0.78rem;color:var(--info);margin-left:6px"><i class="fas fa-circle"></i> Borda: ' + i.borda.charAt(0).toUpperCase() + i.borda.slice(1) + '</span>' : '';
                    return '<div style="padding:4px 0;border-bottom:1px solid var(--glass-border);display:flex;justify-content:space-between"><span>' + i.qtd + 'x ' + i.nome + obsHtml + bordaHtml + '</span></div>';
                }).join('') +
                '</div>' +
                '<div style="display:flex;gap:6px">' +
                (!isPreparando ?
                    '<button class="btn-primary btn-sm" onclick="Cozinha.updateStatus(\'' + p.id + '\',\'Preparando\')" style="flex:1;background:var(--warning);color:var(--text-dark)"><i class="fas fa-fire"></i> Iniciar</button>' :
                    '<button class="btn-primary btn-sm" onclick="Cozinha.updateStatus(\'' + p.id + '\',\'Pronto\')" style="flex:1;background:var(--success)"><i class="fas fa-check"></i> Finalizar</button>'
                ) +
                '</div></div>';
        }).join('');
    },

    updateStatus(id, novoStatus) {
        var pedidos = Storage.get('pedidos') || [];
        var idx = pedidos.findIndex(function(p) { return p.id === id; });
        if (idx < 0) return;
        pedidos[idx].status = novoStatus;
        Storage.save('pedidos', pedidos);

        var statusMsg = novoStatus === 'Preparando' ? 'Preparando...' : 'Pronto!';
        if (typeof Notifications !== 'undefined') {
            Notifications.success('Pedido ' + statusMsg);
        }
        this.renderPedidos();
        this.atualizarContador();
    },

    atualizarContador() {
        var el = document.getElementById('pedidoCount');
        if (!el) return;
        var pedidos = Storage.get('pedidos') || [];
        var ativos = pedidos.filter(function(p) { return p.status === 'Pendente' || p.status === 'Preparando'; }).length;
        el.textContent = ativos + ' Pedido(s) Ativo(s)';
    }
};
