/**
 * Lógica de Relatórios
 */
const Relatorios = {
    init() {
        this.render();
    },

    render() {
        this.vendas = [...(Storage.get('vendas') || [])].reverse();
        this.resumo = this.buildResumo(this.vendas);
        this.renderKpiCards();
        this.renderVendasTable();
        this.renderCharts();
    },

    buildResumo(vendas) {
        const totalVendas = vendas.reduce((sum, venda) => sum + (venda.total || 0), 0);
        const totalPedidos = vendas.length;
        const totalProdutos = vendas.reduce((sum, venda) => sum + (venda.itens || []).reduce((s, item) => s + (item.qtd || 0), 0), 0);
        const ticketMedio = totalPedidos ? totalVendas / totalPedidos : 0;

        const produtosMap = {};
        vendas.forEach(venda => {
            (venda.itens || []).forEach(item => {
                const nome = item.nome || 'Item';
                produtosMap[nome] = (produtosMap[nome] || 0) + (item.qtd || 0);
            });
        });

        const topProdutos = Object.entries(produtosMap)
            .map(([nome, qtd]) => ({ nome, qtd }))
            .sort((a, b) => b.qtd - a.qtd)
            .slice(0, 6);

        const vendasPorDiaMap = {};
        vendas.forEach(venda => {
            const data = new Date(venda.data);
            const dia = data.toLocaleDateString('pt-BR');
            vendasPorDiaMap[dia] = (vendasPorDiaMap[dia] || 0) + (venda.total || 0);
        });

        const vendasPorDia = Object.entries(vendasPorDiaMap)
            .map(([dia, total]) => ({ dia, total }))
            .sort((a, b) => new Date(a.dia.split('/').reverse().join('-')) - new Date(b.dia.split('/').reverse().join('-')));

        return {
            totalVendas,
            totalPedidos,
            totalProdutos,
            ticketMedio,
            topProdutos,
            vendasPorDia
        };
    },

    renderKpiCards() {
        document.getElementById('relatorioTotalVendas').textContent = Utils.formatCurrency(this.resumo.totalVendas);
        document.getElementById('relatorioTicketMedio').textContent = Utils.formatCurrency(this.resumo.ticketMedio);
        document.getElementById('relatorioTotalPedidos').textContent = this.resumo.totalPedidos;
        document.getElementById('relatorioProdutosVendidos').textContent = this.resumo.totalProdutos;
    },

    renderVendasTable() {
        const table = document.getElementById('vendasTable');
        if (!table) return;

        if (this.vendas.length === 0) {
            table.innerHTML = '<tr><td colspan="5" style="padding: 30px; text-align: center; color: var(--text-muted);">Nenhuma venda registrada ainda.</td></tr>';
            return;
        }

        table.innerHTML = this.vendas.map(venda => `
            <tr>
                <td>${Utils.formatDateTime(venda.data)}</td>
                <td>Mesa ${venda.mesa.toString().padStart(2, '0')}</td>
                <td>${venda.pagamento.toUpperCase()}</td>
                <td>${(venda.itens || []).reduce((sum, item) => sum + (item.qtd || 0), 0)} itens</td>
                <td>${Utils.formatCurrency(venda.total)}</td>
            </tr>
        `).join('');
    },

    renderCharts() {
        const salesCanvas = document.getElementById('salesChart');
        const prodCanvas = document.getElementById('prodChart');
        if (salesCanvas && this.resumo.vendasPorDia.length) {
            const labels = this.resumo.vendasPorDia.map(item => item.dia);
            const data = this.resumo.vendasPorDia.map(item => Number(item.total.toFixed(2)));
            if (window.salesChartInstance) window.salesChartInstance.destroy();
            window.salesChartInstance = Charts.initVendasChart(salesCanvas, labels, data);
        }
        if (prodCanvas && this.resumo.topProdutos.length) {
            const labels = this.resumo.topProdutos.map(item => item.nome);
            const data = this.resumo.topProdutos.map(item => item.qtd);
            if (window.prodChartInstance) window.prodChartInstance.destroy();
            window.prodChartInstance = Charts.initProdutosChart(prodCanvas, labels, data);
        }
    },

    export(type) {
        const vendas = this.vendas || [];
        if (vendas.length === 0) {
            Notifications.info('Não há vendas para exportar.');
            return;
        }

        const date = new Date();
        const fileDate = date.toISOString().slice(0, 10).replace(/-/g, '');

        if (type === 'excel') {
            const workbook = XLSX.utils.book_new();
            const vendasSheet = XLSX.utils.json_to_sheet(vendas.map(venda => ({
                Data: Utils.formatDateTime(venda.data),
                Mesa: venda.mesa.toString().padStart(2, '0'),
                Pagamento: venda.pagamento.toUpperCase(),
                Itens: (venda.itens || []).reduce((sum, item) => sum + (item.qtd || 0), 0),
                Total: Utils.formatCurrency(venda.total)
            })));
            XLSX.utils.book_append_sheet(workbook, vendasSheet, 'Vendas');

            const resumoSheet = XLSX.utils.json_to_sheet([
                { Métrica: 'Total Vendas', Valor: Utils.formatCurrency(this.resumo.totalVendas) },
                { Métrica: 'Ticket Médio', Valor: Utils.formatCurrency(this.resumo.ticketMedio) },
                { Métrica: 'Pedidos Registrados', Valor: this.resumo.totalPedidos },
                { Métrica: 'Produtos Vendidos', Valor: this.resumo.totalProdutos }
            ]);
            XLSX.utils.book_append_sheet(workbook, resumoSheet, 'Resumo');

            const filename = `relatorio_vendas_${fileDate}.xlsx`;
            XLSX.writeFile(workbook, filename);
            Notifications.success('Relatório Excel gerado com sucesso!');
            return;
        }

        if (type === 'pdf' && window.jspdf) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            doc.setFontSize(18);
            doc.text('Relatório de Vendas', 40, 50);
            doc.setFontSize(11);
            doc.text(`Gerado em: ${Utils.formatDateTime(date)}`, 40, 70);

            doc.autoTable({
                startY: 90,
                theme: 'grid',
                head: [['Métrica', 'Valor']],
                body: [
                    ['Total Vendas', Utils.formatCurrency(this.resumo.totalVendas)],
                    ['Ticket Médio', Utils.formatCurrency(this.resumo.ticketMedio)],
                    ['Pedidos Registrados', this.resumo.totalPedidos],
                    ['Produtos Vendidos', this.resumo.totalProdutos]
                ],
                headStyles: { fillColor: '#2c3e50', textColor: '#fff' },
                styles: { fontSize: 10 }
            });

            const finalY = doc.lastAutoTable.finalY + 20;
            doc.text('Histórico de Vendas', 40, finalY);

            doc.autoTable({
                startY: finalY + 10,
                theme: 'striped',
                head: [['Data', 'Mesa', 'Pagamento', 'Itens', 'Total']],
                body: vendas.map(venda => [
                    Utils.formatDateTime(venda.data),
                    `Mesa ${venda.mesa.toString().padStart(2, '0')}`,
                    venda.pagamento.toUpperCase(),
                    (venda.itens || []).reduce((sum, item) => sum + (item.qtd || 0), 0),
                    Utils.formatCurrency(venda.total)
                ]),
                headStyles: { fillColor: '#34495e', textColor: '#fff' },
                styles: { fontSize: 9 }
            });

            const filename = `relatorio_vendas_${fileDate}.pdf`;
            doc.save(filename);
            Notifications.success('Relatório PDF gerado com sucesso!');
            return;
        }

        Notifications.error('Não foi possível gerar o relatório.');
    }
};
