/**
 * Lógica da Tela do Caixa
 */
const Caixa = {
    selectedMesa: null,
    paymentMethod: 'pix',

    init() {
        this.renderCaixaList();
    },

    renderCaixaList() {
        const list = document.getElementById('caixaList');
        if (!list) return;

        const mesas = Storage.get('mesas').filter(m => m.status === 'ocupada' || m.status === 'conta');
        
        if (mesas.length === 0) {
            list.innerHTML = '<div class="card flex-center" style="padding: 40px; color: var(--text-muted);">Nenhuma mesa aberta no momento.</div>';
            document.getElementById('checkoutArea').style.display = 'none';
            return;
        }

        list.innerHTML = mesas.map(mesa => `
            <div class="card caixa-item ${this.selectedMesa?.id === mesa.id ? 'selected' : ''}" onclick="Caixa.selectMesa(${mesa.id})">
                <div>
                    <h4 style="font-size: 1.2rem;">Mesa ${mesa.id.toString().padStart(2, '0')}</h4>
                    <p style="font-size: 0.8rem; color: var(--text-muted);">${mesa.pedidos.length} itens consumidos</p>
                </div>
                <div style="text-align: right;">
                    <span class="badge" style="background: ${mesa.status === 'conta' ? 'var(--warning)' : 'var(--info)'}; color: ${mesa.status === 'conta' ? 'var(--text-dark)' : 'white'}; margin-bottom: 5px; display: inline-block;">
                        ${mesa.status === 'conta' ? 'Pediu Conta' : 'Em Consumo'}
                    </span>
                    <div style="font-weight: 700; font-size: 1.1rem;">${Utils.formatCurrency(mesa.total)}</div>
                </div>
            </div>
        `).join('');
    },

    selectMesa(id) {
        const mesas = Storage.get('mesas');
        this.selectedMesa = mesas.find(m => m.id === id);
        
        document.getElementById('checkoutArea').style.display = 'block';
        this.renderCheckoutDetails();
        this.renderCaixaList();
        this.calculateTotal();
    },

    renderCheckoutDetails() {
        const details = document.getElementById('checkoutDetails');
        details.innerHTML = `
            <p style="color: var(--text-muted); margin-bottom: 10px;">Mesa ${this.selectedMesa.id.toString().padStart(2, '0')}</p>
            <div style="max-height: 150px; overflow-y: auto; margin-bottom: 20px;">
                ${this.selectedMesa.pedidos.map(p => `
                    <div class="flex-between" style="font-size: 0.9rem; margin-bottom: 5px;">
                        <span>${p.qtd}x ${p.nome}</span>
                        <span>${Utils.formatCurrency(p.preco * p.qtd)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    setPayment(method) {
        this.paymentMethod = method;
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(method)) {
                btn.classList.add('active');
            }
        });
    },

    calculateTotal() {
        const desconto = parseFloat(document.getElementById('inputDesconto').value) || 0;
        const subtotal = this.selectedMesa.total;
        const total = Math.max(0, subtotal - desconto);

        document.getElementById('checkoutSubtotal').textContent = Utils.formatCurrency(subtotal);
        document.getElementById('checkoutTotal').textContent = Utils.formatCurrency(total);
    },

    async finalizarVenda() {
        const desconto = parseFloat(document.getElementById('inputDesconto').value) || 0;
        const total = Math.max(0, this.selectedMesa.total - desconto);

        // Salvar venda no histórico local e no DB
        const venda = {
            id: Utils.generateId(),
            data: new Date().toISOString(),
            mesa: this.selectedMesa.id,
            total: total,
            pagamento: this.paymentMethod,
            itens: this.selectedMesa.pedidos
        };

        const vendas = Storage.get('vendas') || [];
        vendas.push(venda);
        Storage.save('vendas', vendas);

        await DB.init();
        await DB.put('vendas', venda);

        // Limpar mesa
        const mesas = Storage.get('mesas');
        const index = mesas.findIndex(m => m.id === this.selectedMesa.id);
        mesas[index] = {
            id: this.selectedMesa.id,
            status: 'livre',
            total: 0,
            pedidos: []
        };
        Storage.save('mesas', mesas);

        Notifications.success("Venda finalizada com sucesso!");
        this.selectedMesa = null;
        this.renderCaixaList();
        document.getElementById('checkoutArea').style.display = 'none';
    }
};
