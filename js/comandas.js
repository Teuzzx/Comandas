/**
 * Lógica do Sistema de Comandas
 */
const Comandas = {
    currentMesa: null,

    init() {
        this.renderMesas();
    },

    renderMesas() {
        const grid = document.getElementById('mesasGrid');
        if (!grid) return;

        const mesas = Storage.get('mesas');
        grid.innerHTML = mesas.map(mesa => `
            <div class="card mesa-card ${mesa.status}" onclick="Comandas.openMesa(${mesa.id})" data-aos="zoom-in">
                <span class="mesa-number">${mesa.id.toString().padStart(2, '0')}</span>
                <span class="mesa-status">${mesa.status}</span>
                ${mesa.total > 0 ? `<span class="mesa-total">${Utils.formatCurrency(mesa.total)}</span>` : ''}
            </div>
        `).join('');
    },

    openMesa(id) {
        const mesas = Storage.get('mesas');
        this.currentMesa = mesas.find(m => m.id === id);
        
        document.getElementById('modalMesaTitle').textContent = `Mesa ${id.toString().padStart(2, '0')}`;
        document.getElementById('mesaModal').classList.add('active');
        // Popular select de produtos com dados reais
        const select = document.getElementById('selectProduto');
        if (select) {
            const produtos = Storage.get('produtos') || [];
            select.innerHTML = `<option value="">Selecione um produto...</option>` + produtos.map(p => `\n                <option value="${p.id}" data-preco="${p.preco}">${p.nome} (R$ ${p.preco.toFixed(2)})</option>`).join('');
        }

        this.renderOrderItems();
    },

    closeModal() {
        document.getElementById('mesaModal').classList.remove('active');
        this.currentMesa = null;
    },

    addItem() {
        const select = document.getElementById('selectProduto');
        const option = select.options[select.selectedIndex];
        
        if (!option.value) return;

        const produtoId = parseInt(option.value, 10);
        const produto = (Storage.get('produtos') || []).find(p => p.id === produtoId);
        const item = {
            id: Utils.generateId(),
            nome: produto ? produto.nome : option.text.split(' (')[0],
            preco: produto ? produto.preco : parseFloat(option.getAttribute('data-preco')) || 0,
            qtd: 1
        };

        this.currentMesa.pedidos.push(item);
        this.currentMesa.status = 'ocupada';
        this.updateMesaData();
        this.renderOrderItems();
        Notifications.success("Item adicionado!");
    },

    renderOrderItems() {
        const list = document.getElementById('orderItemsList');
        const totalElem = document.getElementById('modalTotal');
        
        let total = 0;
        list.innerHTML = this.currentMesa.pedidos.map(item => {
            total += item.preco * item.qtd;
            return `
                <div class="order-item">
                    <div>
                        <span style="font-weight: 600;">${item.qtd}x</span> ${item.nome}
                    </div>
                    <div style="font-weight: 600;">
                        ${Utils.formatCurrency(item.preco * item.qtd)}
                        <button onclick="Comandas.removeItem('${item.id}')" style="background: transparent; color: var(--danger); margin-left: 10px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        if (this.currentMesa.pedidos.length === 0) {
            list.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Nenhum item na comanda.</p>';
        }

        this.currentMesa.total = total;
        totalElem.textContent = Utils.formatCurrency(total);
    },

    removeItem(id) {
        this.currentMesa.pedidos = this.currentMesa.pedidos.filter(item => item.id !== id);
        if (this.currentMesa.pedidos.length === 0) this.currentMesa.status = 'livre';
        this.updateMesaData();
        this.renderOrderItems();
    },

    updateMesaData() {
        const mesas = Storage.get('mesas');
        const index = mesas.findIndex(m => m.id === this.currentMesa.id);
        mesas[index] = this.currentMesa;
        Storage.save('mesas', mesas);
        this.renderMesas();
    },

    enviarCozinha() {
        if (this.currentMesa.pedidos.length === 0) return;

        // Salvar pedido na fila de pedidos (Storage)
        const pedidos = Storage.get('pedidos') || [];
        const novoPedido = {
            id: Date.now(),
            mesa: this.currentMesa.id.toString().padStart(2, '0'),
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            status: 'pendente',
            itens: this.currentMesa.pedidos.map(i => ({ qtd: i.qtd, nome: i.nome, preco: i.preco }))
        };
        pedidos.push(novoPedido);
        Storage.save('pedidos', pedidos);

        this.currentMesa.status = 'aguardando';
        this.updateMesaData();
        Notifications.info("Pedido enviado para a cozinha!");
        this.closeModal();

        // Abrir a aba de pedidos para visualização
        if (typeof App !== 'undefined') App.loadPage('pedidos');
    },

    pedirConta() {
        if (this.currentMesa.status === 'livre') return;
        this.currentMesa.status = 'conta';
        this.updateMesaData();
        Notifications.info("Solicitação de conta enviada ao caixa!");
        this.closeModal();
    },

    limparMesa() {
        if (confirm("Deseja realmente limpar esta mesa? Todos os dados serão perdidos.")) {
            this.currentMesa.status = 'livre';
            this.currentMesa.total = 0;
            this.currentMesa.pedidos = [];
            this.updateMesaData();
            this.closeModal();
            Notifications.success("Mesa liberada!");
        }
    }
};
