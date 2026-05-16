/**
 * Lógica do Controle de Estoque
 */
const Estoque = {
    init() {
        this.renderEstoque();
    },

    renderEstoque() {
        const table = document.getElementById('estoqueTable');
        if (!table) return;

        const estoque = Storage.get('estoque');
        table.innerHTML = estoque.map(item => `
            <tr style="border-bottom: 1px solid var(--glass-border);">
                <td style="padding: 15px; font-weight: 600;">${item.nome}</td>
                <td style="padding: 15px;">${item.qtd} ${item.unidade}</td>
                <td style="padding: 15px;">${item.min} ${item.unidade}</td>
                <td style="padding: 15px;">
                    <span class="badge" style="
                        padding: 5px 10px; 
                        border-radius: 20px; 
                        font-size: 0.75rem;
                        background: ${item.qtd <= item.min ? 'rgba(231, 76, 60, 0.2)' : 'rgba(46, 204, 113, 0.2)'};
                        color: ${item.qtd <= item.min ? '#e74c3c' : '#2ecc71'};
                        border: 1px solid ${item.qtd <= item.min ? '#e74c3c' : '#2ecc71'};
                    ">${item.qtd <= item.min ? 'Estoque Baixo' : 'Normal'}</span>
                </td>
                <td style="padding: 15px;">
                    <button onclick="Estoque.editItem(${item.id})" style="background: transparent; color: var(--info); margin-right: 10px;"><i class="fas fa-edit"></i></button>
                    <button onclick="Estoque.deleteItem(${item.id})" style="background: transparent; color: var(--danger);"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    openModal() {
        const nome = prompt('Nome do item:');
        if (!nome) return;
        const qtdStr = prompt('Quantidade inicial (número):', '0');
        const qtd = parseFloat(qtdStr) || 0;
        const unidade = prompt('Unidade (ex: un, kg, L):', 'un') || 'un';
        const minStr = prompt('Quantidade mínima para alerta:', '1');
        const min = parseFloat(minStr) || 1;

        if (!confirm(`Criar item "${nome}" com ${qtd} ${unidade}?`)) {
            Notifications.info('Criação cancelada.');
            return;
        }

        const estoque = Storage.get('estoque') || [];
        const novo = {
            id: Utils.generateId(),
            nome,
            qtd,
            min,
            unidade
        };
        estoque.push(novo);
        Storage.save('estoque', estoque);
        this.renderEstoque();
        Notifications.success('Item criado com sucesso!');
    },

    editItem(id) {
        const estoque = Storage.get('estoque') || [];
        const idx = estoque.findIndex(i => i.id === id);
        if (idx === -1) { Notifications.info('Item não encontrado'); return; }
        const item = estoque[idx];
        const nome = prompt('Nome:', item.nome);
        if (!nome || !nome.trim()) { Notifications.info('Nome inválido.'); return; }
        const qtdStr = prompt('Quantidade:', item.qtd);
        const qtd = parseFloat(qtdStr) || 0;
        const unidade = prompt('Unidade:', item.unidade) || item.unidade;
        const minStr = prompt('Quantidade mínima:', item.min);
        const min = parseFloat(minStr) || item.min;

        if (!confirm(`Salvar alterações em ${nome}?`)) { Notifications.info('Edição cancelada.'); return; }

        estoque[idx] = { ...item, nome: nome.trim(), qtd, unidade, min };
        Storage.save('estoque', estoque);
        this.renderEstoque();
        Notifications.success('Item atualizado!');
    },

    deleteItem(id) {
        if (confirm("Deseja excluir este item?")) {
            let estoque = Storage.get('estoque');
            estoque = estoque.filter(i => i.id !== id);
            Storage.save('estoque', estoque);
            this.renderEstoque();
            Notifications.success("Item removido!");
        }
    }
};
