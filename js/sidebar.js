/**
 * Controle da Sidebar e Navegação
 */
const Sidebar = {
    init() {
        const toggleBtn = document.getElementById('toggleSidebar');
        const sidebar = document.getElementById('sidebar');
        const menuItems = document.querySelectorAll('.menu-item');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }

        // Filtrar abas com base no papel do usuário
        const user = Storage.get('user') || { role: 'Gerente' };
        const role = user.role;
        const allowedPagesByRole = {
            'Gerente': ['dashboard','comandas','pedidos','cozinha','caixa','estoque','funcionarios','relatorios','configuracoes'],
            'Garçom': ['dashboard','comandas','pedidos'],
            'Garçom': ['dashboard','comandas','pedidos'],
            'Cozinha': ['cozinha','pedidos']
        };
        const allowed = allowedPagesByRole[role] || allowedPagesByRole['Gerente'];

        menuItems.forEach(item => {
            const page = item.getAttribute('data-page');
            if (!allowed.includes(page)) {
                item.style.display = 'none';
                return;
            }
            item.addEventListener('click', () => {
                this.setActive(item);
                App.loadPage(page);
            });
        });

        // Mobile responsiveness
        if (window.innerWidth < 768) {
            sidebar.classList.add('collapsed');
        }
    },

    setActive(element) {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        element.classList.add('active');
    }
};
