/**
 * Lógica de Autenticação
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;

            // Simulação de login: já adicionamos perfis básicos
            if (user === 'admin' && pass === 'admin') {
                Storage.save('user', { name: 'Administrador', role: 'Gerente' });
                window.location.href = 'index.html';
            } else if ((user === 'garcom' || user === 'garçon' || user === 'garçon') && pass === 'garcom') {
                Storage.save('user', { name: 'Garçom', role: 'Garçom' });
                window.location.href = 'index.html';
            } else if (user === 'cozinha' && pass === 'cozinha') {
                Storage.save('user', { name: 'Cozinha', role: 'Cozinha' });
                window.location.href = 'index.html';
            } else {
                alert('Usuário ou senha incorretos! (Dica: admin/admin, garcom/garcom, cozinha/cozinha)');
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
