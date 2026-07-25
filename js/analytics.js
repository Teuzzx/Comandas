var Analytics = {
    init() {
        this.renderResumo();
        this.renderTopProdutos();
        this.renderProdutosVendidos();
        this.renderMovimentoDiario();
    },

    renderResumo() {
        var el = document.getElementById('analyticsResumo');
        if (!el) return;
        var vendas = DB.getAll('vendas') || [];
        var hoje = new Date();
        var inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

        var vendasHoje = vendas.filter(function(v) { return new Date(v.data) >= inicioHoje; });
        var faturamento = vendasHoje.reduce(function(s, v) { return s + (Number(v.total) || 0); }, 0);
        var qtdVendas = vendasHoje.length;
        var todosItens = [];
        vendasHoje.forEach(function(v) { (v.itens || []).forEach(function(i) { todosItens.push(i); }); });
        var totalItens = todosItens.reduce(function(s, i) { return s + (Number(i.qtd) || 0); }, 0);

        var pedidos = Storage.get('pedidos') || [];
        var finalizadosHoje = pedidos.filter(function(p) { return new Date(p.data) >= inicioHoje && p.status === 'Entregue'; }).length;

        el.innerHTML =
            '<div class="stats-grid">' +
            '<div class="card stat-card"><div class="stat-icon" style="background:rgba(46,204,113,0.1);color:var(--success)"><i class="fas fa-dollar-sign"></i></div><div class="stat-info"><h3>Faturamento Hoje</h3><p class="stat-value">R$ ' + faturamento.toFixed(2) + '</p></div></div>' +
            '<div class="card stat-card"><div class="stat-icon" style="background:rgba(52,152,219,0.1);color:var(--info)"><i class="fas fa-shopping-cart"></i></div><div class="stat-info"><h3>Vendas Hoje</h3><p class="stat-value">' + qtdVendas + '</p></div></div>' +
            '<div class="card stat-card"><div class="stat-icon" style="background:rgba(241,196,15,0.1);color:var(--warning)"><i class="fas fa-box"></i></div><div class="stat-info"><h3>Itens Vendidos</h3><p class="stat-value">' + totalItens + '</p></div></div>' +
            '<div class="card stat-card"><div class="stat-icon" style="background:rgba(155,89,182,0.1);color:#9b59b6"><i class="fas fa-check-double"></i></div><div class="stat-info"><h3>Pedidos Entregues</h3><p class="stat-value">' + finalizadosHoje + '</p></div></div>' +
            '</div>';
    },

    renderTopProdutos() {
        var el = document.getElementById('analyticsTopProdutos');
        if (!el) return;
        var vendas = DB.getAll('vendas') || [];
        var mapa = {};
        vendas.forEach(function(v) {
            (v.itens || []).forEach(function(i) {
                var nome = i.nome || 'Item';
                mapa[nome] = (mapa[nome] || 0) + (Number(i.qtd) || 0);
            });
        });
        var sorted = Object.entries(mapa).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 10);
        if (!sorted.length) {
            el.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px">Nenhum dado disponível</p>';
            return;
        }
        var max = sorted[0][1];
        el.innerHTML = sorted.map(function(item) {
            var pct = (item[1] / max * 100).toFixed(0);
            return '<div style="margin-bottom:10px">' +
                '<div class="flex-between" style="margin-bottom:4px"><span>' + item[0] + '</span><strong>' + item[1] + ' un</strong></div>' +
                '<div style="height:8px;background:var(--bg-input);border-radius:4px;overflow:hidden">' +
                '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--primary-color),var(--accent-color));border-radius:4px;transition:width 0.5s"></div></div></div>';
        }).join('');
    },

    renderProdutosVendidos() {
        var el = document.getElementById('analyticsProdutosVendidos');
        if (!el) return;
        var vendas = DB.getAll('vendas') || [];
        var mapa = {};
        vendas.forEach(function(v) {
            (v.itens || []).forEach(function(i) {
                var nome = i.nome || 'Item';
                mapa[nome] = (mapa[nome] || 0) + (Number(i.qtd) || 0);
            });
        });
        var sorted = Object.entries(mapa).sort(function(a, b) { return b[1] - a[1]; });
        if (!sorted.length) {
            el.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px">Nenhum dado disponível</p>';
            return;
        }
        el.innerHTML = '<div class="table-responsive"><table style="width:100%"><thead><tr style="color:var(--text-muted);border-bottom:1px solid var(--glass-border)"><th style="padding:10px 0">Produto</th><th style="padding:10px 0">Quantidade Vendida</th><th style="padding:10px 0">% do Total</th></tr></thead><tbody>' +
            sorted.map(function(item) {
                var totalGeral = sorted.reduce(function(s, i) { return s + i[1]; }, 0);
                var pct = totalGeral ? ((item[1] / totalGeral) * 100).toFixed(1) : 0;
                return '<tr style="border-bottom:1px solid var(--glass-border)"><td style="padding:8px 0">' + item[0] + '</td><td style="padding:8px 0;font-weight:600">' + item[1] + '</td><td style="padding:8px 0">' + pct + '%</td></tr>';
            }).join('') + '</tbody></table></div>';
    },

    renderMovimentoDiario() {
        var el = document.getElementById('analyticsMovimento');
        if (!el) return;
        var vendas = DB.getAll('vendas') || [];
        var mapa = {};
        vendas.forEach(function(v) {
            var dia = new Date(v.data).toLocaleDateString('pt-BR');
            mapa[dia] = (mapa[dia] || 0) + (Number(v.total) || 0);
        });
        var sorted = Object.entries(mapa).sort(function(a, b) {
            var partsA = a[0].split('/');
            var partsB = b[0].split('/');
            return new Date(partsA[2], partsA[1] - 1, partsA[0]) - new Date(partsB[2], partsB[1] - 1, partsB[0]);
        }).slice(-14);
        if (!sorted.length) {
            el.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px">Nenhum dado disponível</p>';
            return;
        }
        var max = Math.max.apply(null, sorted.map(function(i) { return i[1]; })) || 1;
        el.innerHTML = sorted.map(function(item) {
            var pct = (item[1] / max * 100).toFixed(0);
            return '<div style="margin-bottom:10px">' +
                '<div class="flex-between" style="margin-bottom:4px"><span>' + item[0] + '</span><strong>R$ ' + Number(item[1]).toFixed(2) + '</strong></div>' +
                '<div style="height:12px;background:var(--bg-input);border-radius:6px;overflow:hidden">' +
                '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--success),var(--info));border-radius:6px;transition:width 0.5s"></div></div></div>';
        }).join('');
    }
};
