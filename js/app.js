/**
 * Core Application - SPA Router & Initialization
 */
const App = {
    async init() {
        console.log("Iniciando Sistema...");
        Sidebar.init();
        
        // Carregar página inicial (Dashboard)
        this.loadPage('dashboard');

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Storage.remove('user');
                window.location.href = 'login.html';
            });
        }
    },

    async loadPage(page) {
        const mainContent = document.getElementById('mainContent');
        
        // Mostrar loader
        mainContent.innerHTML = `
            <div class="flex-center" style="height: 80vh;">
                <div class="skeleton" style="width: 100%; height: 100%; border-radius: 20px;"></div>
            </div>
        `;

        try {
            // Simular delay de carregamento para mostrar animações
            await Utils.delay(300);

            // Em um sistema real, carregaríamos via fetch. 
            // Como é um protótipo estático, vamos usar templates JS ou injetar o HTML.
            const content = await this.getPageContent(page);
            mainContent.innerHTML = content;

            // Inicializar lógica específica da página
            this.initPageLogic(page);
            
            // Re-inicializar AOS para novos elementos
            if (window.AOS) AOS.refresh();

        } catch (error) {
            console.error("Erro ao carregar página:", error);
            mainContent.innerHTML = `<h1>Erro ao carregar a página ${page}</h1>`;
        }
    },

    async getPageContent(page) {
        // Simulação de carregamento de páginas
        // Em um ambiente real, usaríamos fetch(`pages/${page}.html`)
        // Para este projeto, vamos definir os templates aqui ou ler os arquivos se possível
        const response = await fetch(`pages/${page}.html`);
        if (response.ok) {
            return await response.text();
        }
        return `<h2>Página ${page} em desenvolvimento...</h2>`;
    },

    initPageLogic(page) {
        switch(page) {
            case 'dashboard':
                if (typeof Dashboard !== 'undefined') Dashboard.init();
                break;
            case 'comandas':
                if (typeof Comandas !== 'undefined') Comandas.init();
                break;
            case 'pedidos':
                if (typeof Pedidos !== 'undefined') Pedidos.init();
                break;
            case 'cozinha':
                if (typeof Cozinha !== 'undefined') Cozinha.init();
                break;
            case 'caixa':
                if (typeof Caixa !== 'undefined') Caixa.init();
                break;
            case 'estoque':
                if (typeof Estoque !== 'undefined') Estoque.init();
                break;
            case 'relatorios':
                if (typeof Relatorios !== 'undefined') Relatorios.init();
                break;
            case 'configuracoes':
                if (typeof Configuracoes !== 'undefined') Configuracoes.init();
                break;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
