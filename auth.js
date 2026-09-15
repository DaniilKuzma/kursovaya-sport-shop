const authMethods = {
    showLoginModal() {
        this.loginModalVisible = true;
    },
    showRegModal() {
        this.regModalVisible = true;
    },
    hideLoginModal() {
        this.loginModalVisible = false;
    },
    hideRegModal() {
        this.regModalVisible = false;
    },

    validateUsername(username) {
        if (username.length < 3) {
            return 'Логин должен содержать минимум 3 символа';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return 'Логин может содержать только буквы, цифры и знак подчеркивания';
        }
        return '';
    },

    formatPhone(event) {
        let phone = event.target.value.replace(/\D/g, '');
        if (phone.length > 0) {
            if (phone.length <= 1) {
                phone = '+7 (' + phone;
            } else if (phone.length <= 4) {
                phone = '+7 (' + phone.substring(1);
            } else if (phone.length <= 7) {
                phone = '+7 (' + phone.substring(1,4) + ') ' + phone.substring(4);
            } else if (phone.length <= 9) {
                phone = '+7 (' + phone.substring(1,4) + ') ' + phone.substring(4,7) + '-' + phone.substring(7);
            } else {
                phone = '+7 (' + phone.substring(1,4) + ') ' + phone.substring(4,7) + '-' + 
                        phone.substring(7,9) + '-' + phone.substring(9,11);
            }
        }
        event.target.value = phone;
    },

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return 'Введите корректный email адрес';
        }
        return '';
    },

    validatePhone(phone) {
        const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;
        if (!phoneRegex.test(phone)) {
            return 'Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX';
        }
        return '';
    },

    validatePassword(password) {
        if (password.length < 6) {
            return 'Пароль должен содержать минимум 6 символов';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Пароль должен содержать хотя бы одну заглавную букву';
        }
        if (!/[a-z]/.test(password)) {
            return 'Пароль должен содержать хотя бы одну строчную букву';
        }
        if (!/[0-9]/.test(password)) {
            return 'Пароль должен содержать хотя бы одну цифру';
        }
        return '';
    },

    async handleRegister(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Проверка обязательных полей
        if (!username || !password || !email || !phone) {
            alert('Все поля обязательны для заполнения');
            return;
        }

        // Валидация полей
        const usernameError = this.validateUsername(username);
        if (usernameError) {
            alert(usernameError);
            return;
        }

        const emailError = this.validateEmail(email);
        if (emailError) {
            alert(emailError);
            return;
        }

        const phoneError = this.validatePhone(phone);
        if (phoneError) {
            alert(phoneError);
            return;
        }

        const passwordError = this.validatePassword(password);
        if (passwordError) {
            alert(passwordError);
            return;
        }

        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    phone,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Регистрация прошла успешно!');
                this.regModalVisible = false;
                event.target.reset();
                localStorage.setItem('user', JSON.stringify(data));
                this.currentUser = data;
            } else {
                // Обработка конкретных ошибок
                if (data.message.includes('уже существует')) {
                    alert('Пользователь с таким именем или email уже существует');
                } else {
                    alert(data.message || 'Ошибка при регистрации');
                }
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при регистрации');
        }
    },

    async handleLogin(event) {
        event.preventDefault();

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        // Проверка обязательных полей
        if (!username || !password) {
            alert('Необходимо указать имя пользователя и пароль');
            return;
        }

        // Валидация полей
        const usernameError = this.validateUsername(username);
        if (usernameError) {
            alert(usernameError);
            return;
        }

        const passwordError = this.validatePassword(password);
        if (passwordError) {
            alert(passwordError);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Вход выполнен успешно!');
                this.loginModalVisible = false;
                event.target.reset();
                localStorage.setItem('user', JSON.stringify(data));
                this.currentUser = data;
            } else {
                // Обработка конкретных ошибок
                if (response.status === 401) {
                    alert('Неверное имя пользователя или пароль');
                } else {
                    alert(data.message || 'Ошибка при входе');
                }
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при входе');
        }
    },

    handleLogout() {
        localStorage.removeItem('user');
        this.currentUser = null;
    },

    checkAuth() {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    },

    goToAdminPanel() {
        window.location.href = 'admin.html';
    }
};

// Данные для Vue приложения
const authData = {
    loginModalVisible: false,
    regModalVisible: false,
    currentUser: null
}; 