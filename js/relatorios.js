/**
 * Lógica de Relatórios
 */
const Relatorios = {
    async init() {
        await DB.init();
        await this.render();
        var self = this;
        Storage.onChange('vendas', function() { self.render(); });
        Storage.onChange('estoque', function() { self._renderMov && self._renderMov(); });

        // hook movimentacoes filters
        const btnFilterMov = document.getElementById('btnFilterMov');
        const btnClearMov = document.getElementById('btnClearFilterMov');
        const btnExportMovExcel = document.getElementById('btnExportMovExcel');
        const btnExportMovPDF = document.getElementById('btnExportMovPDF');

        if (btnFilterMov) btnFilterMov.addEventListener('click', () => this.renderMovements());
        if (btnClearMov) btnClearMov.addEventListener('click', () => {
            var f1 = document.getElementById('filterDateFromMov'); if (f1) f1.value = '';
            var f2 = document.getElementById('filterDateToMov'); if (f2) f2.value = '';
            var f3 = document.getElementById('filterItemMov'); if (f3) f3.value = '';
            this.renderMovements();
        });
        if (btnExportMovExcel) btnExportMovExcel.addEventListener('click', () => this.exportMovements('excel'));
        if (btnExportMovPDF) btnExportMovPDF.addEventListener('click', () => this.exportMovements('pdf'));
    },

    async render() {
        this.vendas = ((await DB.getAll('vendas')) || []).slice().reverse();
        this.resumo = this.buildResumo(this.vendas);
        this.renderKpiCards();
        this.renderVendasTable();
        this.renderCharts();
        await this.renderMovements();
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
                <td data-label="Data">${Utils.formatDateTime(venda.data)}</td>
                <td data-label="Mesa">${venda.mesa || '-'}</td>
                <td data-label="Pagamento">${(venda.pagamento || '').toUpperCase()}</td>
                <td data-label="Itens">${(venda.itens || []).reduce((sum, item) => sum + (item.qtd || 0), 0)} itens</td>
                <td data-label="Total">${Utils.formatCurrency(venda.total)}</td>
            </tr>
        `).join('');
    },

    renderCharts() {
        const salesCanvas = document.getElementById('salesChart');
        const prodCanvas = document.getElementById('prodChart');
        if (salesCanvas && this.resumo.vendasPorDia.length) {
            const labels = this.resumo.vendasPorDia.map(item => item.dia);
            const data = this.resumo.vendasPorDia.map(item => Number(item.total.toFixed(2)));
            if (this._salesChart) this._salesChart.destroy();
            this._salesChart = Charts.initVendasChart(salesCanvas, labels, data);
        }
        if (prodCanvas && this.resumo.topProdutos.length) {
            const labels = this.resumo.topProdutos.map(item => item.nome);
            const data = this.resumo.topProdutos.map(item => item.qtd);
            if (this._prodChart) this._prodChart.destroy();
            this._prodChart = Charts.initProdutosChart(prodCanvas, labels, data);
        }
    },

    async renderMovements() {
        const table = document.getElementById('movimentosTable');
        if (!table) return;
        let movs = await DB.getAll('estoque_movimentos');
        movs = (movs || []).sort((a,b) => new Date(b.data) - new Date(a.data));

        const filterFrom = document.getElementById('filterDateFromMov');
        const filterTo = document.getElementById('filterDateToMov');
        const filterItem = document.getElementById('filterItemMov');
        const from = filterFrom ? filterFrom.value : '';
        const to = filterTo ? filterTo.value : '';
        const itemFilter = (filterItem ? filterItem.value : '').toLowerCase();

        const estoque = await DB.getAll('estoque');
        const itemMap = {};
        estoque.forEach(i => itemMap[i.id] = i.nome);

        const filtered = movs.filter(m => {
            const d = new Date(m.data);
            if (from) {
                const f = new Date(from);
                if (d < f) return false;
            }
            if (to) {
                const t = new Date(to);
                t.setHours(23,59,59,999);
                if (d > t) return false;
            }
            if (itemFilter) {
                const nome = (itemMap[m.itemId] || '').toLowerCase();
                if (!nome.includes(itemFilter)) return false;
            }
            return true;
        });

        if (filtered.length === 0) {
            table.innerHTML = '<tr><td colspan="5" style="padding: 20px; text-align:center; color:var(--text-muted)">Nenhuma movimentação encontrada.</td></tr>';
            return;
        }

        table.innerHTML = filtered.map(m => `
            <tr>
                <td data-label="Data" style="padding:10px;">${Utils.formatDateTime(m.data)}</td>
                <td data-label="Item" style="padding:10px;">${itemMap[m.itemId] || m.itemId}</td>
                <td data-label="Qtd" style="padding:10px;">${m.quantidade}</td>
                <td data-label="Tipo" style="padding:10px;">${m.tipo}</td>
                <td data-label="Usuário" style="padding:10px;">${m.usuario || '-'}</td>
            </tr>
        `).join('');
    },

    async exportMovements(type) {
        const movs = await DB.getAll('estoque_movimentos');
        if (!movs || movs.length === 0) { Notifications.info('Sem movimentações para exportar.'); return; }
        const estoque = await DB.getAll('estoque');
        const itemMap = {};
        estoque.forEach(i => itemMap[i.id] = i.nome);

        const rows = movs.map(m => ({
            Data: Utils.formatDateTime(m.data),
            Item: itemMap[m.itemId] || m.itemId,
            Quantidade: m.quantidade,
            Tipo: m.tipo,
            Usuario: m.usuario || ''
        }));

        const date = new Date();
        const fileDate = date.toISOString().slice(0,10).replace(/-/g,'');

        if (type === 'excel') {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, 'Movimentacoes');
            XLSX.writeFile(wb, `movimentacoes_${fileDate}.xlsx`);
            Notifications.success('Excel gerado.');
            return;
        }

        if (type === 'pdf' && window.jspdf) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text('Movimentações de Estoque', 14, 20);
            doc.autoTable({
                startY: 30,
                head: [['Data','Item','Quantidade','Tipo','Usuario']],
                body: rows.map(r => [r.Data, r.Item, r.Quantidade, r.Tipo, r.Usuario]),
                theme: 'grid'
            });
            doc.save(`movimentacoes_${fileDate}.pdf`);
            Notifications.success('PDF gerado.');
            return;
        }

        Notifications.error('Exportação não suportada.');
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
                Mesa: venda.mesa || '-',
                Pagamento: (venda.pagamento || '').toUpperCase(),
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
                    venda.mesa || '-',
                    (venda.pagamento || '').toUpperCase(),
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
