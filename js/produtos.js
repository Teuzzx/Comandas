var Produtos = {
    init() {
        this.render();
        var self = this;
        Storage.onChange('produtos', function() { self.render(); });
        Storage.onChange('produtos_desc', function() { self.render(); });
    },

    getProdutos() {
        var p = Storage.get('produtos');
        if (!p || !p.length) {
            p = [
                { id: '1', nome: 'Pizza Calabresa', preco: 45.00, categoria: 'pizza' },
                { id: '2', nome: 'Pizza 4 Queijos', preco: 55.00, categoria: 'pizza' },
                { id: '7', nome: 'Pizza Mussarela', preco: 42.00, categoria: 'pizza' },
                { id: '8', nome: 'Pizza Portuguesa', preco: 50.00, categoria: 'pizza' },
                { id: '3', nome: 'X-Burger', preco: 32.00, categoria: 'lanche' },
                { id: '9', nome: 'X-Salada', preco: 28.00, categoria: 'lanche' },
                { id: '4', nome: 'Batata Frita', preco: 15.00, categoria: 'porcao' },
                { id: '10', nome: 'Onion Rings', preco: 18.00, categoria: 'porcao' },
                { id: '11', nome: 'Contra Filé', preco: 38.00, categoria: 'principal' },
                { id: '12', nome: 'Frango Grelhado', preco: 34.00, categoria: 'principal' },
                { id: '5', nome: 'Coca-Cola 2L', preco: 8.00, categoria: 'bebida' },
                { id: '6', nome: 'Suco Laranja', preco: 7.00, categoria: 'bebida' }
            ];
            Storage.save('produtos', p);
        }
        return p;
    },

    render() {
        var tbody = document.getElementById('produtosTable');
        if (!tbody) return;
        var produtos = this.getProdutos();
        if (!produtos || !produtos.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted)">Nenhum produto cadastrado</td></tr>';
            return;
        }
        var descricoes = Storage.get('produtos_desc') || {};
        var html = '';
        for (var i = 0; i < produtos.length; i++) {
            var p = produtos[i];
            if (!p) continue;
            var desc = (descricoes && descricoes[p.id]) || '';
            var catLabel = p.categoria ? p.categoria.charAt(0).toUpperCase() + p.categoria.slice(1) : 'Geral';
            var nome = String(p.nome || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            var descEsc = String(desc || '-').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            html += '<tr>' +
                '<td style="padding:15px;font-weight:600">' + nome + '</td>' +
                '<td style="padding:15px"><span class="badge" style="background:rgba(255,255,255,0.06);color:var(--text-muted)">' + catLabel + '</span></td>' +
                '<td style="padding:15px;font-weight:700;color:var(--success)">R$ ' + (Number(p.preco) || 0).toFixed(2) + '</td>' +
                '<td style="padding:15px;font-size:0.85rem;color:var(--text-muted);max-width:250px">' + descEsc + '</td>' +
                '<td style="padding:15px">' +
                '<button class="btn btn-sm" onclick="Produtos.editar(\'' + p.id + '\')" style="margin-right:6px;color:var(--info)"><i class="fas fa-edit"></i></button>' +
                '<button class="btn btn-sm" onclick="Produtos.excluir(\'' + p.id + '\')" style="color:var(--danger)"><i class="fas fa-trash"></i></button></td></tr>';
        }
        tbody.innerHTML = html;
    },

    abrirModal(p) {
        var modal = document.getElementById('produtoModal');
        if (!modal) return;
        document.getElementById('produtoModalTitle').textContent = p ? 'Editar Produto' : 'Novo Produto';
        document.getElementById('produtoId').value = p ? p.id : '';
        document.getElementById('produtoNome').value = p ? p.nome || '' : '';
        document.getElementById('produtoPreco').value = p ? p.preco || '' : '';
        document.getElementById('produtoCategoria').value = p ? p.categoria || 'pizza' : 'pizza';
        document.getElementById('produtoDesc').value = p ? this.getDescricao(p.id) : '';
        modal.style.display = 'flex';
    },

    fecharModal() {
        var modal = document.getElementById('produtoModal');
        if (modal) modal.style.display = 'none';
    },

    salvar() {
        try {
            var idEl = document.getElementById('produtoId');
            var nome = document.getElementById('produtoNome').value.trim();
            var preco = Number(document.getElementById('produtoPreco').value);
            var categoria = document.getElementById('produtoCategoria').value;
            var desc = document.getElementById('produtoDesc').value.trim();

            if (!nome || !preco) { Notifications.error('Nome e preço são obrigatórios'); return; }
            if (preco <= 0) { Notifications.error('Preço deve ser maior que zero'); return; }

            var produtos = this.getProdutos();
            var descricoes = Storage.get('produtos_desc') || {};

            if (idEl.value) {
                for (var i = 0; i < produtos.length; i++) {
                    if (produtos[i] && produtos[i].id === idEl.value) {
                        produtos[i].nome = nome;
                        produtos[i].preco = preco;
                        produtos[i].categoria = categoria;
                        break;
                    }
                }
                descricoes[idEl.value] = desc;
                Notifications.success('Produto atualizado!');
            } else {
                var novo = { id: Utils.generateId(), nome: nome, preco: preco, categoria: categoria };
                produtos.push(novo);
                descricoes[novo.id] = desc;
                Notifications.success('Produto cadastrado!');
            }

            this.fecharModal();
            this.render();
            Storage.save('produtos_desc', descricoes);
            Storage.save('produtos', produtos);
        } catch (e) { console.error('salvar:', e); Notifications.error('Erro: ' + e.message); }
    },

    editar(id) {
        var produtos = this.getProdutos();
        for (var i = 0; i < produtos.length; i++) {
            if (produtos[i] && produtos[i].id === id) { this.abrirModal(produtos[i]); return; }
        }
    },

    excluir(id) {
        if (!confirm('Excluir este produto?')) return;
        var produtos = this.getProdutos();
        var descricoes = Storage.get('produtos_desc') || {};
        for (var i = 0; i < produtos.length; i++) {
            if (produtos[i] && produtos[i].id === id) {
                produtos.splice(i, 1);
                delete descricoes[id];
                Storage.save('produtos_desc', descricoes);
                Storage.save('produtos', produtos);
                Notifications.success('Produto excluído');
                this.render();
                return;
            }
        }
    },

    getDescricao(id) {
        var descricoes = Storage.get('produtos_desc') || {};
        return descricoes[id] || '';
    }
};
