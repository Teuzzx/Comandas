var Sidebar = {
    init() {
        var toggleBtn = document.getElementById('toggleSidebar');
        var sidebar = document.getElementById('sidebar');
        var menuItems = document.querySelectorAll('.menu-item');
        if (!sidebar || !menuItems.length) return;

        var overlay = document.getElementById('sidebarOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:900;display:none';
            document.body.appendChild(overlay);
        }

        var self = this;
        if (toggleBtn) {
            toggleBtn.onclick = function() {
                if (window.innerWidth < 768) {
                    sidebar.classList.toggle('open');
                    overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
                } else {
                    sidebar.classList.toggle('collapsed');
                    overlay.style.display = 'none';
                }
            };
            overlay.onclick = function() {
                sidebar.classList.remove('open');
                overlay.style.display = 'none';
            };
        }

        var user = Storage.get('user') || { role: 'Gerente' };
        var role = user.role || 'Gerente';
        var allowedPagesByRole = {
            'Gerente': ['dashboard', 'comandas', 'pedidos', 'cozinha', 'caixa', 'estoque', 'funcionarios', 'relatorios', 'analytics', 'configuracoes', 'produtos'],
            'Garçom': ['dashboard', 'comandas', 'pedidos'],
            'Cozinha': ['cozinha', 'pedidos']
        };
        var allowed = allowedPagesByRole[role] || allowedPagesByRole['Gerente'];

        menuItems.forEach(function(item) {
            var page = item.getAttribute('data-page');
            if (!allowed || allowed.indexOf(page) < 0) {
                item.style.display = 'none';
                return;
            }
            item.onclick = function() {
                menuItems.forEach(function(mi) { mi.classList.remove('active'); });
                item.classList.add('active');
                if (typeof App !== 'undefined' && App.loadPage) App.loadPage(page);
                if (window.innerWidth < 768) {
                    sidebar.classList.remove('open');
                    overlay.style.display = 'none';
                }
            };
        });

        if (window.innerWidth < 768) {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
        }
    }
};
