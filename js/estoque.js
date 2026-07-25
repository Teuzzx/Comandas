/**
 * Lógica do Controle de Estoque
 */
const Estoque = {
    async init() {
        await DB.init();
        this.limparFakeData();
        this.renderEstoque();
        var self = this;
        Storage.onChange('estoque', function() { self.renderEstoque(); });
        Storage.onChange('audit_logs', function() { self.renderAuditLogs && self.renderAuditLogs(); });

        // form handlers
        const form = document.getElementById('estoqueForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveFromForm();
            });
        }
    },

    limparFakeData() {
        var estoque = Storage.get('estoque') || [];
        if (estoque.length > 0) {
            Storage.save('estoque', []);
        }
    },

    async renderEstoque() {
        const table = document.getElementById('estoqueTable');
        if (!table) return;

        const estoque = await DB.getAll('estoque');
        table.innerHTML = estoque.map(item => `
            <tr style="border-bottom: 1px solid var(--glass-border);">
                <td data-label="Item" style="padding: 15px; font-weight: 600;">${item.nome}</td>
                <td data-label="Qtd Atual" style="padding: 15px;">${item.qtd} ${item.unidade}</td>
                <td data-label="Qtd Mínima" style="padding: 15px;">${item.min} ${item.unidade}</td>
                <td data-label="Fornecedor" style="padding: 15px;">${item.fornecedor || '-'}</td>
                <td data-label="Status" style="padding: 15px;">
                    <span class="badge" style="
                        padding: 5px 10px; 
                        border-radius: 20px; 
                        font-size: 0.75rem;
                        background: ${item.qtd <= item.min ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)'};
                        color: ${item.qtd <= item.min ? '#e74c3c' : '#2ecc71'};
                        border: 1px solid ${item.qtd <= item.min ? '#e74c3c' : '#2ecc71'};
                    ">${item.qtd <= item.min ? 'Estoque Baixo' : 'Normal'}</span>
                </td>
                <td data-label="Ações" style="padding: 15px;">
                    <button onclick="Estoque.openModal('${item.id}')" aria-label="Editar ${item.nome}" style="background: transparent; color: var(--info); margin-right: 10px;"><i class="fas fa-edit"></i></button>
                    <button onclick="Estoque.openBaixa('${item.id}')" aria-label="Dar baixa ${item.nome}" style="background: transparent; color: var(--warning); margin-right: 10px;"><i class="fas fa-arrow-down"></i></button>
                    <button onclick="Estoque.deleteItem('${item.id}')" aria-label="Excluir ${item.nome}" style="background: transparent; color: var(--danger);"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    openModal(id = null) {
        const modal = document.getElementById('estoqueModal');
        const title = document.getElementById('modalTitle');
        const itemId = document.getElementById('itemId');
        const nome = document.getElementById('itemNome');
        const qtd = document.getElementById('itemQtd');
        const unidade = document.getElementById('itemUnidade');
        const min = document.getElementById('itemMin');
        const fornecedor = document.getElementById('itemFornecedor');

        itemId.value = '';
        nome.value = '';
        qtd.value = 0;
        unidade.value = 'un';
        min.value = 1;
        if (fornecedor) fornecedor.value = '';

        if (id) {
            const item = DB.get('estoque', id);
            if (!item) return Notifications.info('Item não encontrado');
            itemId.value = item.id;
            nome.value = item.nome || '';
            qtd.value = item.qtd || 0;
            unidade.value = item.unidade || 'un';
            min.value = item.min || 1;
            if (fornecedor) fornecedor.value = item.fornecedor || '';
            title.innerText = 'Editar Item';
            modal.style.display = 'flex';
        } else {
            title.innerText = 'Novo Item';
            modal.style.display = 'flex';
        }
    },

    closeModal() {
        const modal = document.getElementById('estoqueModal');
        if (modal) modal.style.display = 'none';
    },

    async saveFromForm() {
        const itemId = document.getElementById('itemId').value;
        const nome = document.getElementById('itemNome').value.trim();
        const qtd = parseFloat(document.getElementById('itemQtd').value) || 0;
        const unidade = document.getElementById('itemUnidade').value || 'un';
        const min = parseFloat(document.getElementById('itemMin').value) || 1;
        const fornecedorEl = document.getElementById('itemFornecedor');
        const fornecedor = fornecedorEl ? fornecedorEl.value.trim() : '';

        if (!nome) { Notifications.info('Nome inválido'); return; }

        if (itemId) {
            const item = DB.get('estoque', itemId);
            if (!item) return Notifications.info('Item não encontrado');
            const updated = { ...item, nome, qtd, unidade, min, fornecedor };
            await DB.put('estoque', updated);
            Notifications.success('Item atualizado!');
        } else {
            const novo = { id: Utils.generateId(), nome, qtd, unidade, min, fornecedor };
            await DB.put('estoque', novo);
            Notifications.success('Item criado!');
        }

        this.closeModal();
        this.renderEstoque();
    },

    async deleteItem(id) {
        const user = (function(){ try{ return JSON.parse(localStorage.getItem('app_user')); }catch(e){} })() || { role: 'Gerente' };
        if (user.role !== 'Gerente') {
            Notifications.error('Permissão negada. Apenas Gerente pode excluir itens.');
            return;
        }
        if (!confirm('Deseja excluir este item?')) return;
        await DB.delete('estoque', id);
        Notifications.success('Item removido!');
        this.renderEstoque();
    },

    openBaixa(id) {
        const baixaModal = document.getElementById('baixaModal');
        baixaModal.dataset.itemId = id;
        baixaModal.style.display = 'flex';
    },

    closeBaixa() {
        const baixaModal = document.getElementById('baixaModal');
        baixaModal.style.display = 'none';
        baixaModal.dataset.itemId = '';
    },

    async confirmBaixa() {
        const baixaModal = document.getElementById('baixaModal');
        const id = baixaModal.dataset.itemId;
        const qtd = parseFloat(document.getElementById('baixaQtd').value) || 0;
        const user = (function(){ try{ return JSON.parse(localStorage.getItem('app_user')); }catch(e){} })() || { role: 'Gerente' };
        // permitir baixa apenas para Gerente e Cozinha
        if (!['Gerente','Cozinha'].includes(user.role)) {
            Notifications.error('Permissão negada. Você não pode dar baixa.');
            return;
        }
        if (!id || qtd <= 0) { Notifications.info('Quantidade inválida'); return; }

        const item = await DB.get('estoque', id);
        if (!item) return Notifications.info('Item não encontrado');

        item.qtd = (parseFloat(item.qtd) || 0) - qtd;
        if (item.qtd < 0) item.qtd = 0;
        await DB.put('estoque', item);

        // registrar movimento
        const currentUser = (function(){ try{ return JSON.parse(localStorage.getItem('app_user')); }catch(e){} })() || { name: 'Sistema' };
        const tx = {
            txId: Utils.generateId(),
            itemId: id,
            quantidade: qtd,
            tipo: 'baixa',
            data: new Date().toISOString(),
            usuario: currentUser.name
        };
        await DB.put('estoque_movimentos', tx);

        // audit log (localStorage)
        const audits = Storage.get('audit_logs') || [];
        audits.push({ id: Utils.generateId(), action: 'baixa', itemId: id, quantidade: qtd, usuario: currentUser.id || currentUser.name, date: new Date().toISOString() });
        Storage.save('audit_logs', audits);

        Notifications.success('Baixa registrada');
        this.closeBaixa();
        this.renderEstoque();
    },

    async exportToExcel() {
        const estoque = await DB.getAll('estoque');
        const ws_data = [['Nome', 'Quantidade', 'Unidade', 'Qtd Mínima', 'Status']];
        estoque.forEach(i => ws_data.push([i.nome, i.qtd, i.unidade, i.min, i.qtd <= i.min ? 'Estoque Baixo' : 'Normal']));
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, 'Estoque');
        XLSX.writeFile(wb, `estoque_${new Date().toISOString().slice(0,10)}.xlsx`);
    },

    async exportToPDF() {
        const estoque = await DB.getAll('estoque');
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const rows = estoque.map(i => [i.nome, `${i.qtd} ${i.unidade}`, `${i.min} ${i.unidade}`, i.qtd <= i.min ? 'Estoque Baixo' : 'Normal']);
        doc.setFontSize(14);
        doc.text('Relatório de Estoque', 14, 20);
        doc.autoTable({
            head: [['Nome','Qtd Atual','Qtd Mínima','Status']],
            body: rows,
            startY: 28,
            theme: 'grid'
        });
        doc.save(`estoque_${new Date().toISOString().slice(0,10)}.pdf`);
    }
};
