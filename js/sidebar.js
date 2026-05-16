/**
 * Controle da Sidebar e Navegação
 */
const Sidebar = {
    init() {
        const toggleBtn = document.getElementById('toggleSidebar');
        const sidebar = document.getElementById('sidebar');
        const menuItems = document.querySelectorAll('.menu-item');

        // create overlay for mobile
        let overlay = document.getElementById('sidebarOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.style.display = 'none';
            document.body.appendChild(overlay);
        }

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    // mobile: open/close overlay-driven sidebar
                    const isOpen = sidebar.classList.toggle('open');
                    overlay.style.display = isOpen ? 'block' : 'none';
                    toggleBtn.classList.toggle('opened', isOpen);
                } else {
                    // desktop: collapse to narrow
                    const isCollapsed = sidebar.classList.toggle('collapsed');
                    // ensure overlay hidden on desktop
                    overlay.style.display = 'none';
                    toggleBtn.classList.toggle('opened', !isCollapsed);
                }
            });
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.style.display = 'none';
                toggleBtn.classList.remove('opened');
            });

            // close on ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    sidebar.classList.remove('open');
                    overlay.style.display = 'none';
                    toggleBtn.classList.remove('opened');
                }
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
                // close on mobile after click
                if (window.innerWidth < 768) {
                    sidebar.classList.add('collapsed');
                    overlay.style.display = 'none';
                }
            });
        });

        // ensure initial state
        if (window.innerWidth < 768) {
            sidebar.classList.remove('collapsed');
            sidebar.classList.remove('open');
        }

        // handle resize to adjust overlay/state
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                overlay.style.display = 'none';
                sidebar.classList.remove('open');
            }
        });
    },

    setActive(element) {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        element.classList.add('active');
    }
};
