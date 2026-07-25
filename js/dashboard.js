/**
 * Lógica da página Dashboard
 */
const Dashboard = {
    charts: {
        vendas: null,
        produtos: null
    },

    init() {
        try {
            this.renderCharts();
            this.renderRecentOrders();
            this.refreshRealData();
            var self = this;
            Storage.onChange('vendas', function() { self.refreshRealData(); });
            Storage.onChange('estoque', function() { self.refreshRealData(); });
            Storage.onChange('mesas', function() { self.refreshRealData(); });
        } catch (e) {
            console.error('Dashboard.init error:', e);
        }
    },

    async initFilters() {
        const btnToday = document.getElementById('btnToday');
        const btn7 = document.getElementById('btn7Days');
        const btn30 = document.getElementById('btn30Days');
        const btnRefresh = document.getElementById('btnRefreshDashboard');

        if (btnToday) btnToday.addEventListener('click', () => {
            const now = new Date();
            document.getElementById('filterFrom').value = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0,10);
            document.getElementById('filterTo').value = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0,10);
            this.refreshRealData();
        });
        if (btn7) btn7.addEventListener('click', () => {
            const now = new Date();
            const from = new Date(now.getFullYear(), now.getMonth(), now.getDate()-6);
            document.getElementById('filterFrom').value = from.toISOString().slice(0,10);
            document.getElementById('filterTo').value = new Date().toISOString().slice(0,10);
            this.refreshRealData();
        });
        if (btn30) btn30.addEventListener('click', () => {
            const now = new Date();
            const from = new Date(now.getFullYear(), now.getMonth(), now.getDate()-29);
            document.getElementById('filterFrom').value = from.toISOString().slice(0,10);
            document.getElementById('filterTo').value = new Date().toISOString().slice(0,10);
            this.refreshRealData();
        });
        if (btnRefresh) btnRefresh.addEventListener('click', () => this.refreshRealData());
    },

    async refreshRealData() {
        await DB.init();
        const vendas = await DB.getAll('vendas') || [];
        const estoque = await DB.getAll('estoque') || [];
        const mesas = Storage.get('mesas') || [];

        const hoje = new Date();
        const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const faturamentoHoje = vendas.reduce((sum, v) => {
            const d = new Date(v.data);
            return d >= inicio ? sum + (Number(v.total) || 0) : sum;
        }, 0);
        const pedidosAtivos = vendas.filter(v => (v.status || '').toLowerCase() !== 'finalizado').length;
        const mesasOcupadas = mesas.filter(m => (m.status || '').toLowerCase() !== 'livre').length;
        const emPreparo = vendas.filter(v => (v.status || '').toLowerCase() === 'preparando').length;
        const alertas = estoque.filter(i => (Number(i.qtd) || 0) <= (Number(i.min) || 0)).length;

        const faturElem = document.getElementById('statFaturamento');
        const pedidosElem = document.getElementById('statPedidos');
        const mesasElem = document.getElementById('statMesas');
        const preparoElem = document.getElementById('statPreparo');

        if (faturElem) faturElem.textContent = Utils.formatCurrency(faturamentoHoje);
        if (pedidosElem) pedidosElem.textContent = pedidosAtivos;
        if (mesasElem) mesasElem.textContent = `${mesasOcupadas} / ${mesas.length}`;
        if (preparoElem) preparoElem.textContent = emPreparo;
        const lowCountElem = document.getElementById('lowStockCount');
        if (lowCountElem) lowCountElem.textContent = alertas;

        const vendasPorDiaMap = {};
        vendas.forEach(v => {
            const dia = new Date(v.data).toLocaleDateString('pt-BR');
            vendasPorDiaMap[dia] = (vendasPorDiaMap[dia] || 0) + (Number(v.total) || 0);
        });
        const vendasPorDia = Object.entries(vendasPorDiaMap).map(([dia, total]) => ({ dia, total })).sort((a, b) => {
            const [d1, m1, y1] = a.dia.split('/');
            const [d2, m2, y2] = b.dia.split('/');
            return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
        });

        const labels = vendasPorDia.map(i => i.dia);
        const data = vendasPorDia.map(i => Number(i.total.toFixed(2)));

        if (this.charts.vendas) this.charts.vendas.destroy();
        const vendasCtx = document.getElementById('vendasChart');
        if (vendasCtx) this.charts.vendas = Charts.initVendasChart(vendasCtx, labels, data);

        const produtosMap = {};
        vendas.forEach(v => (v.itens || []).forEach(it => {
            produtosMap[it.nome] = (produtosMap[it.nome] || 0) + (Number(it.qtd) || 0);
        }));
        const top = Object.entries(produtosMap).map(([nome, qtd]) => ({ nome, qtd })).sort((a, b) => b.qtd - a.qtd).slice(0, 6);
        const prodLabels = top.map(i => i.nome);
        const prodData = top.map(i => i.qtd);
        if (this.charts.produtos) this.charts.produtos.destroy();
        const produtosCtx = document.getElementById('produtosChart');
        if (produtosCtx) this.charts.produtos = Charts.initProdutosChart(produtosCtx, prodLabels, prodData);

        try {
            const canvas = document.getElementById('vendasChart');
            if (canvas && this.charts.vendas) {
                canvas.onclick = (evt) => {
                    const points = this.charts.vendas.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
                    if (points.length) {
                        const idx = points[0].index;
                        const label = this.charts.vendas.data.labels[idx];
                        this.showDrilldownByDay(label);
                    }
                };
            }
        } catch (e) {
            console.warn('Drilldown binding failed', e);
        }

        if (!this._filtersInit) { this.initFilters(); this._filtersInit = true; }
        if (!this._lowStockInterval) this.startLowStockWatcher();

        this.renderRecentOrders(vendas);
    },

    async showDrilldownByDay(label) {
        // label is date string in pt-BR (dd/mm/yyyy)
        const parts = label.split('/').reverse().join('-');
        const dayStart = new Date(parts + 'T00:00:00');
        const dayEnd = new Date(parts + 'T23:59:59');
        const vendas = await DB.getAll('vendas') || [];
        const list = vendas.filter(v => {
            const d = new Date(v.data);
            return d >= dayStart && d <= dayEnd;
        });
        // create simple modal with list
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `<div class="modal-content glass"><h3>Vendas em ${label}</h3><div style="max-height:400px; overflow:auto;">${list.map(v=>`<div style="border-bottom:1px solid var(--glass-border); padding:8px 0;"><strong>${v.id||''}</strong> - Mesa ${v.mesa} - ${Utils.formatCurrency(v.total)}<br><small>${Utils.formatDateTime(v.data)}</small></div>`).join('')}</div><div style="display:flex; gap:8px; justify-content:flex-end; margin-top:12px;"><button class="btn" id="closeDrill">Fechar</button></div></div>`;
        document.body.appendChild(modal);
        document.getElementById('closeDrill').addEventListener('click', () => modal.remove());
    },

    startLowStockWatcher() {
        this._lowStockInterval = setInterval(async () => {
            const estoque = await DB.getAll('estoque') || [];
            const low = estoque.filter(i => (i.qtd || 0) <= (i.min || 0));
            const lowCountElem = document.getElementById('lowStockCount');
            if (lowCountElem) lowCountElem.textContent = low.length;
            // if any low and not previously alerted, notify
            const prev = this._lastLowIds || [];
            const lowIds = low.map(i=>i.id);
            const newOnes = lowIds.filter(id => !prev.includes(id));
            if (newOnes.length) {
                if (typeof Notifications !== 'undefined') {
                    Notifications.warning(newOnes.length + ' item(ns) com estoque baixo');
                }
            }
            this._lastLowIds = lowIds;
        }, 10000);
    },

    renderCharts() {
        // Destruir gráficos anteriores se existirem
        if (this.charts.vendas) {
            this.charts.vendas.destroy();
            this.charts.vendas = null;
        }
        if (this.charts.produtos) {
            this.charts.produtos.destroy();
            this.charts.produtos = null;
        }

        const vendasCtx = document.getElementById('vendasChart');
        const produtosCtx = document.getElementById('produtosChart');

        if (vendasCtx) this.charts.vendas = Charts.initVendasChart(vendasCtx);
        if (produtosCtx) this.charts.produtos = Charts.initProdutosChart(produtosCtx);
    },

    renderRecentOrders(vendas = []) {
        const tableBody = document.getElementById('recentOrdersTable');
        if (!tableBody) return;

        if (!vendas.length) {
            tableBody.innerHTML = `<tr><td colspan="5" style="padding: 18px; text-align: center; color: var(--text-muted);">Nenhum pedido recente encontrado.</td></tr>`;
            return;
        }

        const orders = vendas.sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 6);

        tableBody.innerHTML = orders.map(order => {
            const itemsText = (order.itens || []).map(i => `${i.qtd}x ${i.nome}`).join(', ');
            return `
            <tr>
                <td>${order.id || order.codigo || '--'}</td>
                <td>${order.mesa || '---'}</td>
                <td style="color: var(--text-muted); font-size: 0.92rem;">${itemsText || 'Sem itens listados'}</td>
                <td style="font-weight: 600;">${Utils.formatCurrency(order.total || 0)}</td>
                <td>
                    <span class="badge" style="${this.getStatusColor(order.status)}">${order.status || 'N/A'}</span>
                </td>
            </tr>
        `;
        }).join('');
    },

    getStatusColor(status) {
        switch(status) {
            case 'Pendente': return 'background: rgba(241, 196, 15, 0.2); color: #f1c40f; border: 1px solid #f1c40f;';
            case 'Preparando': return 'background: rgba(52, 152, 219, 0.2); color: #3498db; border: 1px solid #3498db;';
            case 'Pronto': return 'background: rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid #2ecc71;';
            case 'Entregue': return 'background: rgba(160, 160, 160, 0.2); color: #a0a0a0; border: 1px solid #a0a0a0;';
            default: return 'background: var(--bg-input); color: var(--text-main); border: 1px solid rgba(255,255,255,0.08);';
        }
    }
};
