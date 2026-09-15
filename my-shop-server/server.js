const express = require('express');
const cors = require('cors');
const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Маршруты
app.use('/products', productsRouter);
app.use('/users', usersRouter);
app.use('/orders', ordersRouter);

// Статические файлы 
app.use('/pictures', express.static(path.join(__dirname, 'pictures')));
app.use('/data', express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, '..')));

// Главная страница для проверки
app.get('/', (req, res) => {
    res.send('Сервер работает!');
});

// Маршрут для панели администратора
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
