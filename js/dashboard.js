/**
 * Lógica da página Dashboard
 */
const Dashboard = {
    charts: {
        vendas: null,
        produtos: null
    },

    init() {
        console.log("Dashboard inicializado");
        this.renderCharts();
        this.renderRecentOrders();
        this.updateStats();
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

    renderRecentOrders() {
        const tableBody = document.getElementById('recentOrdersTable');
        if (!tableBody) return;

        const orders = [
            { id: '#1024', mesa: '05', itens: '1x Pizza Calabresa, 2x Coca-Cola', total: 85.00, status: 'Preparando' },
            { id: '#1023', mesa: '02', itens: '2x X-Salada, 1x Batata G', total: 64.50, status: 'Pronto' },
            { id: '#1022', mesa: '08', itens: '1x Pizza 4 Queijos', total: 55.00, status: 'Entregue' },
            { id: '#1021', mesa: '12', itens: '3x Chopp, 1x Porção Isca', total: 112.00, status: 'Pendente' }
        ];

        tableBody.innerHTML = orders.map(order => `
            <tr style="border-bottom: 1px solid var(--glass-border);">
                <td style="padding: 15px; font-weight: 600;">${order.id}</td>
                <td style="padding: 15px;">Mesa ${order.mesa}</td>
                <td style="padding: 15px; color: var(--text-muted); font-size: 0.85rem;">${order.itens}</td>
                <td style="padding: 15px; font-weight: 600;">${Utils.formatCurrency(order.total)}</td>
                <td style="padding: 15px;">
                    <span class="badge" style="
                        padding: 5px 10px; 
                        border-radius: 20px; 
                        font-size: 0.75rem;
                        background: ${this.getStatusColor(order.status)};
                        color: white;
                    ">${order.status}</span>
                </td>
            </tr>
        `).join('');
    },

    getStatusColor(status) {
        switch(status) {
            case 'Pendente': return 'rgba(241, 196, 15, 0.2); color: #f1c40f; border: 1px solid #f1c40f;';
            case 'Preparando': return 'rgba(52, 152, 219, 0.2); color: #3498db; border: 1px solid #3498db;';
            case 'Pronto': return 'rgba(46, 204, 113, 0.2); color: #2ecc71; border: 1px solid #2ecc71;';
            case 'Entregue': return 'rgba(160, 160, 160, 0.2); color: #a0a0a0; border: 1px solid #a0a0a0;';
            default: return 'var(--bg-input)';
        }
    },

    updateStats() {
        // Simulação de atualização dinâmica
        const faturamento = document.getElementById('statFaturamento');
        if (faturamento) {
            // Animação simples de número
            let val = 0;
            const target = 1250;
            const interval = setInterval(() => {
                val += 50;
                faturamento.textContent = Utils.formatCurrency(val);
                if (val >= target) clearInterval(interval);
            }, 30);
        }
    }
};
