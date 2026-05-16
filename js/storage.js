/**
 * Gerenciamento de persistência de dados usando LocalStorage
 */
const Storage = {
    save(key, data) {
        localStorage.setItem(`pizzaria_${key}`, JSON.stringify(data));
    },

    get(key) {
        const data = localStorage.getItem(`pizzaria_${key}`);
        return data ? JSON.parse(data) : null;
    },

    remove(key) {
        localStorage.removeItem(`pizzaria_${key}`);
    },

    clear() {
        localStorage.clear();
    },

    // Inicializar dados padrão se não existirem
    init() {
        if (!this.get('mesas')) {
            const mesas = Array.from({ length: 12 }, (_, i) => ({
                id: i + 1,
                status: 'livre', // livre, ocupada, aguardando, conta
                total: 0,
                pedidos: []
            }));
            this.save('mesas', mesas);
        }

        if (!this.get('estoque')) {
            const estoque = [
                { id: 1, nome: 'Massa de Pizza', qtd: 50, min: 10, unidade: 'un' },
                { id: 2, nome: 'Queijo Muçarela', qtd: 20, min: 5, unidade: 'kg' },
                { id: 3, nome: 'Molho de Tomate', qtd: 15, min: 3, unidade: 'L' },
                { id: 4, nome: 'Calabresa', qtd: 10, min: 2, unidade: 'kg' },
                { id: 5, nome: 'Pão de Hambúrguer', qtd: 40, min: 10, unidade: 'un' },
                { id: 6, nome: 'Carne (Blend)', qtd: 15, min: 5, unidade: 'kg' }
            ];
            this.save('estoque', estoque);
        }

        if (!this.get('produtos')) {
            const produtos = [
                { id: 1, nome: 'Pizza Calabresa', preco: 45.00 },
                { id: 2, nome: 'Pizza 4 Queijos', preco: 55.00 },
                { id: 3, nome: 'X-Burger', preco: 32.00 },
                { id: 4, nome: 'Batata Frita', preco: 15.00 },
                { id: 5, nome: 'Coca-Cola', preco: 8.00 }
            ];
            this.save('produtos', produtos);
        }

        if (!this.get('vendas')) {
            this.save('vendas', []);
        }

        if (!this.get('pedidos')) {
            this.save('pedidos', []);
        }
        
        if (!this.get('funcionarios')) {
            const funcionarios = [
                { id: Utils.generateId(), nome: 'João Silva', role: 'Garçom', ativo: true },
                { id: Utils.generateId(), nome: 'Maria Oliveira', role: 'Cozinha', ativo: true }
            ];
            this.save('funcionarios', funcionarios);
        }
    }
};

Storage.init();
