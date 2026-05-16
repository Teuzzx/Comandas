/**
 * Lógica da Tela da Cozinha
 */
const Cozinha = {
    init() {
        this.renderPedidos();
    },

    renderPedidos() {
        const grid = document.getElementById('cozinhaGrid');
        if (!grid) return;

        const pedidos = Storage.get('pedidos') || [];
        const countElem = document.getElementById('pedidoCount');
        if (countElem) countElem.textContent = `${pedidos.length} Pedidos Ativos`;

        grid.innerHTML = pedidos.map(pedido => `
            <div class="card pedido-card ${pedido.status}" data-aos="fade-up">
                <div class="pedido-header">
                    <span class="pedido-mesa">Mesa ${pedido.mesa}</span>
                    <span class="pedido-hora"><i class="far fa-clock"></i> ${pedido.hora}</span>
                </div>
                <div class="pedido-itens">
                    ${pedido.itens.map(item => `
                        <div class="pedido-item"><span>${item.qtd}x</span> ${item.nome}</div>
                    `).join('')}
                </div>
                <div class="pedido-actions">
                    ${this.renderActions(pedido)}
                </div>
            </div>
        `).join('');
    },

    renderActions(pedido) {
        if (pedido.status === 'pendente') {
            return `<button class="btn-status" style="background: var(--info); color: white;" onclick="Cozinha.updateStatus(${pedido.id}, 'preparando')">Aceitar Pedido</button>`;
        } else if (pedido.status === 'preparando') {
            return `<button class="btn-status" style="background: var(--success); color: white;" onclick="Cozinha.updateStatus(${pedido.id}, 'pronto')">Marcar como Pronto</button>`;
        } else {
            return `<button class="btn-status" style="background: var(--text-muted); color: white;" onclick="Cozinha.finalizar(${pedido.id})">Entregue / Finalizar</button>`;
        }
    },

    updateStatus(id, newStatus) {
        let pedidos = Storage.get('pedidos') || [];
        const idx = pedidos.findIndex(p => p.id === id);
        if (idx === -1) return;
        pedidos[idx].status = newStatus;
        Storage.save('pedidos', pedidos);
        this.renderPedidos();
        Notifications.success(`Pedido da Mesa ${pedidos[idx].mesa} atualizado!`);
    },

    finalizar(id) {
        let pedidos = Storage.get('pedidos') || [];
        pedidos = pedidos.filter(p => p.id !== id);
        Storage.save('pedidos', pedidos);
        this.renderPedidos();
        Notifications.success("Pedido finalizado e entregue!");
    }
};
