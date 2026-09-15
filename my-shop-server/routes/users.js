const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Путь к файлу users.json
const USERS_FILE = path.join(__dirname, '..', 'users.json');

// Вспомогательная функция для чтения файла с пользователями
async function readUsersFile() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        if (!data || data.trim() === '') {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(USERS_FILE, '[]');
            return [];
        }
        throw error;
    }
}

// Вспомогательная функция для записи в файл
async function writeUsersFile(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, phone } = req.body;

        // Базовая проверка наличия данных
        if (!username?.trim() || !password?.trim() || !email?.trim() || !phone?.trim()) {
            return res.status(400).json({ message: 'Отсутствуют необходимые данные' });
        }

        const users = await readUsersFile();

        // Проверка уникальности пользователя
        if (users.some(user => user.username === username || user.email === email)) {
            return res.status(400).json({ message: 'Пользователь с таким именем или email уже существует' });
        }

        // Создание нового пользователя
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            username: username.trim(),
            password: password.trim(), 
            email: email.trim(),
            phone: phone.trim(),
            role: 'user',
            registrationDate: new Date().toISOString().split('T')[0]
        };

        users.push(newUser);
        await writeUsersFile(users);

        // Отправляем данные без пароля
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера при регистрации' });
    }
});

// Авторизация пользователя
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Базовая проверка наличия данных
        if (!username?.trim() || !password?.trim()) {
            return res.status(400).json({ message: 'Отсутствуют необходимые данные' });
        }

        const users = await readUsersFile();

        // Поиск пользователя
        const user = users.find(u => 
            u.username === username.trim() && 
            u.password === password.trim() 
        );

        if (!user) {
            return res.status(401).json({ message: 'Неверное имя пользователя или пароль' });
        }

        // Отправляем данные без пароля
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Ошибка при авторизации:', error);
        res.status(500).json({ message: 'Ошибка сервера при авторизации' });
    }
});

module.exports = router; 