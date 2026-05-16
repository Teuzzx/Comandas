/**
 * Lista e gerenciamento de Pedidos (histórico / fila da cozinha)
 */
const Pedidos = {
    init() {
        this.renderPedidos();
    },

    renderPedidos() {
        const container = document.getElementById('pedidosList');
        if (!container) return;

        const pedidos = Storage.get('pedidos') || [];
        if (pedidos.length === 0) {
            container.innerHTML = `
                <div class="card flex-center" style="padding: 60px; flex-direction: column; gap: 12px;">
                    <i class="fas fa-shopping-basket" style="font-size: 3rem; color: var(--glass-border);"></i>
                    <p style="color: var(--text-muted);">Nenhum pedido no momento.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = pedidos.map(p => `
            <div class="card pedido-card ${p.status}" style="margin-bottom: 12px;">
                <div class="pedido-header flex-between">
                    <div>
                        <div style="font-weight:700;">Pedido #${p.id}</div>
                        <div style="font-size:0.9rem; color:var(--text-muted);">Mesa ${p.mesa} • ${p.hora}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight:700;">${Utils.formatCurrency(p.itens.reduce((s,i)=>s + (i.preco||0)*i.qtd,0))}</div>
                        <div style="font-size:0.85rem; color:var(--text-muted);">${p.status}</div>
                    </div>
                </div>
                <div class="pedido-itens" style="margin-top:10px;">
                    ${p.itens.map(i => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed rgba(255,255,255,0.02)"><div>${i.qtd}x ${i.nome}</div><div>${Utils.formatCurrency((i.preco||0)*i.qtd)}</div></div>`).join('')}
                </div>
                <div class="pedido-actions" style="margin-top:10px;display:flex;gap:10px;">
                    ${this.renderActions(p)}
                </div>
            </div>
        `).join('');
    },

    renderActions(pedido) {
        if (pedido.status === 'pendente') {
            return `<button class="btn-status" style="background: var(--info); color: white;" onclick="Pedidos.updateStatus(${pedido.id}, 'preparando')">Enviar para Preparar</button>`;
        } else if (pedido.status === 'preparando') {
            return `<button class="btn-status" style="background: var(--success); color: white;" onclick="Pedidos.updateStatus(${pedido.id}, 'pronto')">Marcar como Pronto</button>`;
        } else if (pedido.status === 'pronto') {
            return `<button class="btn-status" style="background: var(--warning); color: black;" onclick="Pedidos.updateStatus(${pedido.id}, 'entregue')">Entregue</button>`;
        } else {
            return `<button class="btn-status" style="background: var(--text-muted); color: white;" onclick="Pedidos.delete(${pedido.id})">Remover</button>`;
        }
    },

    updateStatus(id, newStatus) {
        let pedidos = Storage.get('pedidos') || [];
        const idx = pedidos.findIndex(p => p.id === id);
        if (idx === -1) return;
        pedidos[idx].status = newStatus;
        Storage.save('pedidos', pedidos);
        Notifications.success('Status do pedido atualizado!');
        this.renderPedidos();
    },

    delete(id) {
        if (!confirm('Remover este pedido permanentemente?')) return;
        let pedidos = Storage.get('pedidos') || [];
        pedidos = pedidos.filter(p => p.id !== id);
        Storage.save('pedidos', pedidos);
        this.renderPedidos();
        Notifications.success('Pedido removido');
    }
};
