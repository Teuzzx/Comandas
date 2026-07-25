(function() {
    var loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    var login = async function(email, pass) {
        console.log('login() called with email:', email);
        var loginError = document.getElementById('loginError');

        console.log('login() - calling SB.authLogin...');
        var user = await SB.authLogin(email, pass);
        console.log('login() - SB.authLogin returned:', user ? user.name : 'null');

        if (user) {
            console.log('login() - user found, saving...');
            Storage.save('user', { id: user.id, name: user.name, role: user.role });
            document.body.classList.add('authenticated');
            console.log('login() - authenticated class added');
            if (loginError) loginError.style.display = 'none';
            var userNameElem = document.getElementById('userName');
            var userRoleElem = document.querySelector('.user-role');
            if (userNameElem) userNameElem.textContent = user.name;
            if (userRoleElem) userRoleElem.textContent = user.role;
            console.log('login() - calling App.init()');
            if (typeof App !== 'undefined' && App.init) {
                App.init();
                console.log('login() - App.init() called');
            } else {
                console.log('login() - App.init NOT available');
            }
            return;
        }

        console.log('login() - user NOT found, showing error');
        if (loginError) {
            loginError.style.display = 'block';
            loginError.textContent = 'Email ou senha incorretos!';
        }
    };

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        login(
            document.getElementById('username').value.trim(),
            document.getElementById('password').value
        );
    });
})();
