/**
 * Lógica de Autenticação
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value;

            // try to authenticate against stored users
            const users = Storage.get('users') || [];
            const found = users.find(u => u.username === username && u.password === pass);
            if (found) {
                Storage.save('user', { id: found.id, name: found.name, role: found.role });
                window.location.href = 'index.html';
                return;
            }

            // fallback to legacy hardcoded
            if (username === 'admin' && pass === 'admin') {
                Storage.save('user', { name: 'Administrador', role: 'Gerente' });
                window.location.href = 'index.html';
            } else if (username === 'garcom' && pass === 'garcom') {
                Storage.save('user', { name: 'Garçom', role: 'Garçom' });
                window.location.href = 'index.html';
            } else if (username === 'cozinha' && pass === 'cozinha') {
                Storage.save('user', { name: 'Cozinha', role: 'Cozinha' });
                window.location.href = 'index.html';
            } else {
                alert('Usuário ou senha incorretos!');
            }
        });
    }

    // Verificar se já está logado
    if (window.location.pathname.includes('index.html')) {
        const user = Storage.get('user');
        if (!user) {
            window.location.href = 'login.html';
        } else {
            const userNameElem = document.getElementById('userName');
            const userRoleElem = document.querySelector('.user-role');
            if (userNameElem) userNameElem.textContent = user.name;
            if (userRoleElem) userRoleElem.textContent = user.role;
        }
    }
});
