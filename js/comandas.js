var Comandas = {
    currentMesa: null,

    init() {
        this.normalizarMesas();
        this.renderMesas();
        var self = this;
        Storage.onChange('mesas', function() { self.renderMesas(); });
        Storage.onChange('produtos', function() { if (document.getElementById('selectProduto')) self.renderSelectProdutos(); });
    },

    normalizarMesas() {
        var mesas = Storage.get('mesas');
        if (!mesas || !Array.isArray(mesas)) {
            this.criarMesasPadrao();
            return;
        }
        var precisaSalvar = false;
        mesas.forEach(function(m, i) {
            if (typeof m.id !== 'string' || !m.id.startsWith('mesa_')) {
                m.id = 'mesa_' + (i + 1);
                precisaSalvar = true;
            }
            if (!m.numero) { m.numero = (i + 1); precisaSalvar = true; }
            if (!m.status) { m.status = 'livre'; precisaSalvar = true; }
            if (!m.pedidos) { m.pedidos = []; precisaSalvar = true; }
        });
        if (precisaSalvar) Storage.save('mesas', mesas);
    },

    criarMesasPadrao() {
        var mesas = [];
        for (var i = 1; i <= 12; i++) {
            mesas.push({ id: 'mesa_' + i, numero: i, status: 'livre', pedidos: [] });
        }
        Storage.save('mesas', mesas);
    },

    renderMesas() {
        var grid = document.getElementById('mesasGrid');
        if (!grid) return;
        var mesas = Storage.get('mesas') || [];
        if (!mesas.length) {
            this.criarMesasPadrao();
            mesas = Storage.get('mesas') || [];
        }
        grid.innerHTML = mesas.map(function(m) {
            var cor = m.status === 'livre' ? 'var(--success)' : m.status === 'ocupada' ? 'var(--danger)' : 'var(--warning)';
            var icone = m.status === 'livre' ? 'fa-chair' : m.status === 'ocupada' ? 'fa-utensils' : 'fa-bell';
            var total = (m.pedidos || []).reduce(function(s, p) { return s + (Number(p.total) || 0); }, 0);
            return '<div class="mesa-card card glass" onclick="Comandas.openMesa(\'' + m.id + '\')" style="border-left:4px solid ' + cor + ';cursor:pointer">' +
                '<div class="mesa-header"><i class="fas ' + icone + '" style="color:' + cor + ';font-size:1.5rem"></i>' +
                '<span class="mesa-numero">Mesa ' + (m.numero || String(m.id).replace('mesa_', '') || '?') + '</span></div>' +
                '<div class="mesa-status" style="color:' + cor + '">' + (m.status || 'livre') + '</div>' +
                (m.status !== 'livre' ? '<div class="mesa-total">R$ ' + total.toFixed(2) + '</div>' : '') +
                '</div>';
        }).join('');
    },

    openMesa(id) {
        var mesas = Storage.get('mesas') || [];
        this.currentMesa = null;
        var idStr = String(id);
        for (var i = 0; i < mesas.length; i++) {
            if (String(mesas[i].id) === idStr) { this.currentMesa = mesas[i]; break; }
        }
        if (!this.currentMesa) { Notifications.error('Mesa nao encontrada'); return; }
        var modal = document.getElementById('mesaModal');
        if (!modal) return;
        document.getElementById('modalMesaTitle').textContent = 'Mesa ' + (this.currentMesa.numero || String(this.currentMesa.id).replace('mesa_', '') || '?');
        this.renderSelectProdutos();
        this.renderOrderItems();
        modal.style.display = 'flex';
    },

    getProdutos() {
        var p = Storage.get('produtos');
        if (p && p.length) return p;
        p = [
            { id: '1', nome: 'Pizza Calabresa', preco: 45.00, categoria: 'pizza' },
            { id: '2', nome: 'Pizza 4 Queijos', preco: 55.00, categoria: 'pizza' },
            { id: '3', nome: 'X-Burger', preco: 32.00, categoria: 'lanche' },
            { id: '4', nome: 'Batata Frita', preco: 15.00, categoria: 'porcao' },
            { id: '5', nome: 'Coca-Cola 2L', preco: 8.00, categoria: 'bebida' },
            { id: '6', nome: 'Suco Laranja', preco: 7.00, categoria: 'bebida' },
            { id: '7', nome: 'Pizza Mussarela', preco: 42.00, categoria: 'pizza' },
            { id: '8', nome: 'Pizza Portuguesa', preco: 50.00, categoria: 'pizza' },
            { id: '9', nome: 'X-Salada', preco: 28.00, categoria: 'lanche' },
            { id: '10', nome: 'Onion Rings', preco: 18.00, categoria: 'porcao' },
            { id: '11', nome: 'Contra Filé', preco: 38.00, categoria: 'principal' },
            { id: '12', nome: 'Frango Grelhado', preco: 34.00, categoria: 'principal' }
        ];
        Storage.save('produtos', p);
        return p;
    },

    renderSelectProdutos() {
        var select = document.getElementById('selectProduto');
        if (!select) return;
        var produtos = this.getProdutos();
        var cats = {};
        produtos.forEach(function(p) {
            if (!cats[p.categoria]) cats[p.categoria] = [];
            cats[p.categoria].push(p);
        });
        var html = '<option value="">Selecione um produto...</option>';
        Object.keys(cats).forEach(function(cat) {
            html += '<optgroup label="' + cat.charAt(0).toUpperCase() + cat.slice(1) + 's">';
            cats[cat].forEach(function(p) {
                html += '<option value="' + p.id + '" data-preco="' + p.preco + '" data-categoria="' + p.categoria + '">' + p.nome + ' (R$ ' + p.preco.toFixed(2) + ')</option>';
            });
            html += '</optgroup>';
        });
        select.innerHTML = html;
        var self = this;
        select.onchange = function() {
            var bordaSection = document.getElementById('bordaSection');
            if (!bordaSection) return;
            var opt = select.options[select.selectedIndex];
            if (!opt || !opt.value) { bordaSection.style.display = 'none'; return; }
            var cat = opt.dataset ? opt.dataset.categoria : '';
            var optgroup = opt.closest('optgroup');
            var categoria = cat || (optgroup ? optgroup.label.toLowerCase().replace(/s$/, '') : '');
            var check = document.getElementById('itemBordaCheck');
            if (check) check.checked = false;
            var flavorSection = document.getElementById('bordaFlavorSection');
            if (flavorSection) flavorSection.style.display = 'none';
            bordaSection.style.display = categoria === 'pizza' ? 'block' : 'none';
        };
    },

    toggleBorda() {
        var check = document.getElementById('itemBordaCheck');
        var section = document.getElementById('bordaFlavorSection');
        if (check && section) section.style.display = check.checked ? 'block' : 'none';
    },

    addItem() {
        var select = document.getElementById('selectProduto');
        if (!select || !select.value) { Notifications.error('Selecione um produto'); return; }
        var option = select.options[select.selectedIndex];
        var optgroup = option.closest('optgroup');
        var categoria = optgroup ? optgroup.label.toLowerCase().replace(/s$/, '') : '';
        var obsInput = document.getElementById('itemObservacao');
        var obs = obsInput ? obsInput.value.trim() : '';
        var borda = '';
        if (categoria === 'pizza') {
            var bordaCheck = document.getElementById('itemBordaCheck');
            if (bordaCheck && bordaCheck.checked) {
                var bordaSel = document.getElementById('itemBordaSabor');
                borda = bordaSel ? bordaSel.value : 'catupiry';
            }
        }
        var produto = {
            id: select.value,
            nome: option.text.split(' (R$')[0],
            preco: Number(option.dataset.preco || 0),
            qtd: 1,
            categoria: categoria
        };
        if (!this.currentMesa.pedidos) this.currentMesa.pedidos = [];
        var existente = null;
        for (var i = 0; i < this.currentMesa.pedidos.length; i++) {
            if (this.currentMesa.pedidos[i].id === produto.id && !this.currentMesa.pedidos[i].enviado && !this.currentMesa.pedidos[i].obs && !this.currentMesa.pedidos[i].borda) {
                existente = this.currentMesa.pedidos[i];
                break;
            }
        }
        if (existente && !obs && !borda) {
            existente.qtd = (existente.qtd || 1) + 1;
        } else {
            this.currentMesa.pedidos.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                qtd: 1,
                categoria: produto.categoria,
                enviado: false,
                status: 'Pendente',
                obs: obs || '',
                borda: borda
            });
        }
        if (obsInput) obsInput.value = '';
        var bordaCheck = document.getElementById('itemBordaCheck');
        if (bordaCheck) bordaCheck.checked = false;
        var bordaSection = document.getElementById('bordaFlavorSection');
        if (bordaSection) bordaSection.style.display = 'none';
        var bordaSection2 = document.getElementById('bordaSection');
        if (bordaSection2) bordaSection2.style.display = 'none';
        this.atualizarMesa();
        this.renderOrderItems();
        var total = this.currentMesa.pedidos.reduce(function(s, item) { return s + (Number(item.preco) || 0) * (item.qtd || 1); }, 0);
        Notifications.success(produto.nome + ' adicionado - R$ ' + total.toFixed(2));
    },

    removeItem(index) {
        if (!this.currentMesa || !this.currentMesa.pedidos) return;
        this.currentMesa.pedidos.splice(index, 1);
        this.atualizarMesa();
        this.renderOrderItems();
    },

    editarObs(index) {
        if (!this.currentMesa || !this.currentMesa.pedidos) return;
        var item = this.currentMesa.pedidos[index];
        if (!item) return;
        var nova = prompt('Observação para ' + item.nome + ':', item.obs || '');
        if (nova === null) return;
        item.obs = nova.trim();
        this.atualizarMesa();
        this.renderOrderItems();
    },

    updateQty(index, delta) {
        if (!this.currentMesa || !this.currentMesa.pedidos) return;
        var item = this.currentMesa.pedidos[index];
        if (!item) return;
        item.qtd = Math.max(1, (item.qtd || 1) + delta);
        this.atualizarMesa();
        this.renderOrderItems();
    },

    renderOrderItems() {
        var list = document.getElementById('orderItemsList');
        if (!list || !this.currentMesa) return;
        var itens = this.currentMesa.pedidos || [];
        if (!itens.length) {
            list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted)"><i class="fas fa-cart-plus" style="font-size:2rem;opacity:0.3;margin-bottom:8px;display:block"></i>Nenhum item adicionado</div>';
            var totalEl = document.getElementById('modalTotal');
            if (totalEl) totalEl.textContent = 'R$ 0,00';
            return;
        }
        list.innerHTML = itens.map(function(item, idx) {
            var sub = (Number(item.preco) || 0) * (item.qtd || 1);
            var obsHtml = item.obs ? '<div style="font-size:0.78rem;color:var(--warning);margin-top:2px"><i class="fas fa-comment"></i> ' + item.obs + '</div>' : '';
            var bordaHtml = item.borda ? '<span style="font-size:0.78rem;color:var(--info);margin-left:6px"><i class="fas fa-circle"></i> Borda: ' + item.borda.charAt(0).toUpperCase() + item.borda.slice(1) + '</span>' : '';
            return '<div class="order-item' + (item.enviado ? ' enviado' : '') + '" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--glass-border)">' +
                '<div style="flex:1"><strong>' + (item.nome || 'Item') + '</strong>' + obsHtml +
                '<br><span style="font-size:0.8rem;color:var(--text-muted)">Qtd: ' + (item.qtd || 1) + ' x R$ ' + (Number(item.preco) || 0).toFixed(2) + '</span>' + bordaHtml + '</div>' +
                '<div style="display:flex;align-items:center;gap:6px">' +
                '<span style="font-weight:700;color:var(--success);font-size:1rem">R$ ' + sub.toFixed(2) + '</span>' +
                (item.enviado ? '<span class="badge" style="background:rgba(52,152,219,0.2);color:var(--info)">Enviado</span>' :
                    '<button class="btn btn-sm" onclick="Comandas.updateQty(' + idx + ', -1)" style="color:var(--warning);padding:2px 8px" title="Diminuir"><i class="fas fa-minus"></i></button>' +
                    '<span style="font-weight:700;min-width:20px;text-align:center">' + (item.qtd || 1) + '</span>' +
                    '<button class="btn btn-sm" onclick="Comandas.updateQty(' + idx + ', 1)" style="color:var(--success);padding:2px 8px" title="Aumentar"><i class="fas fa-plus"></i></button>' +
                    '<button class="btn btn-sm" onclick="Comandas.editarObs(' + idx + ')" style="color:var(--info);padding:2px 8px" title="Observação"><i class="fas fa-comment-dots"></i></button>' +
                    '<button class="btn btn-sm" onclick="Comandas.removeItem(' + idx + ')" style="color:var(--danger);padding:2px 8px" title="Remover"><i class="fas fa-trash"></i></button>') +
                '</div></div>';
        }).join('');
        var total = itens.reduce(function(s, item) { return s + (Number(item.preco) || 0) * (item.qtd || 1); }, 0);
        var totalEl = document.getElementById('modalTotal');
        if (totalEl) totalEl.textContent = 'R$ ' + total.toFixed(2);
    },

    atualizarMesa() {
        if (!this.currentMesa) return;
        var mesas = Storage.get('mesas') || [];
        for (var i = 0; i < mesas.length; i++) {
            if (String(mesas[i].id) === String(this.currentMesa.id)) {
                mesas[i] = this.currentMesa;
                if (this.currentMesa.pedidos && this.currentMesa.pedidos.length > 0) {
                    var temPendente = false;
                    for (var j = 0; j < this.currentMesa.pedidos.length; j++) {
                        if (!this.currentMesa.pedidos[j].enviado) { temPendente = true; break; }
                    }
                    if (temPendente) {
                        mesas[i].status = 'ocupada';
                        this.currentMesa.status = 'ocupada';
                    }
                }
                Storage.save('mesas', mesas);
                this.renderMesas();
                return;
            }
        }
    },

    enviarCozinha() {
        if (!this.currentMesa || !this.currentMesa.pedidos || !this.currentMesa.pedidos.length) {
            Notifications.error('Nenhum item para enviar');
            return;
        }
        var pendentes = [];
        var bebidas = [];
        for (var i = 0; i < this.currentMesa.pedidos.length; i++) {
            var item = this.currentMesa.pedidos[i];
            if (!item.enviado) {
                if (item.categoria === 'bebida') {
                    bebidas.push(item);
                } else {
                    pendentes.push(item);
                }
            }
        }

        if (!pendentes.length && !bebidas.length) {
            Notifications.info('Todos os itens ja foram enviados');
            return;
        }

        for (var j = 0; j < pendentes.length; j++) {
            pendentes[j].enviado = true;
            pendentes[j].status = 'Pendente';
        }

        for (var k = 0; k < bebidas.length; k++) {
            bebidas[k].enviado = true;
            bebidas[k].status = 'Entregue';
        }

        if (pendentes.length) {
            var itensPedido = pendentes.map(function(p) {
                return { id: p.id, nome: p.nome, qtd: p.qtd, preco: p.preco, categoria: p.categoria, obs: p.obs || '', borda: p.borda || '' };
            });
            var totalPedido = pendentes.reduce(function(s, p) { return s + (Number(p.preco) || 0) * (p.qtd || 1); }, 0);

            var pedido = {
                id: Utils.generateId(),
                mesaId: this.currentMesa.id,
                mesa: 'Mesa ' + (this.currentMesa.numero || String(this.currentMesa.id).replace('mesa_', '') || '?'),
                itens: itensPedido,
                total: totalPedido,
                status: 'Pendente',
                data: new Date().toISOString()
            };

            var pedidos = Storage.get('pedidos') || [];
            pedidos.push(pedido);
            Storage.save('pedidos', pedidos);
        }

        if (bebidas.length) {
            Notifications.info(bebidas.length + ' bebida(s) liberada(s) direto na mesa');
        }
        this.atualizarMesa();
        this.renderOrderItems();
        if (pendentes.length) {
            Notifications.success('Pedido enviado para a cozinha!');
        }
    },

    pedirConta() {
        if (!this.currentMesa) return;
        this.currentMesa.status = 'pedindo_conta';
        this.atualizarMesa();
        Notifications.info('Conta solicitada para Mesa ' + (this.currentMesa.numero || String(this.currentMesa.id).replace('mesa_', '') || '?'));
        this.fecharModal();
    },

    limparMesa() {
        if (!this.currentMesa) return;
        if (!confirm('Tem certeza que deseja limpar esta mesa?')) return;
        this.currentMesa.status = 'livre';
        this.currentMesa.pedidos = [];
        this.atualizarMesa();
        this.fecharModal();
        Notifications.info('Mesa ' + (this.currentMesa.numero || '') + ' liberada');
    },

    fecharModal() {
        var modal = document.getElementById('mesaModal');
        if (modal) { modal.style.display = 'none'; modal.classList.remove('show'); }
        var bordaSection = document.getElementById('bordaSection');
        if (bordaSection) bordaSection.style.display = 'none';
        var bordaCheck = document.getElementById('itemBordaCheck');
        if (bordaCheck) bordaCheck.checked = false;
        var bordaFlavor = document.getElementById('bordaFlavorSection');
        if (bordaFlavor) bordaFlavor.style.display = 'none';
        var obsInput = document.getElementById('itemObservacao');
        if (obsInput) obsInput.value = '';
        this.currentMesa = null;
    },

};
