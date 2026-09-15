const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Путь к файлу users.json
const USERS_FILE = path.join(__dirname, '..', 'users.json');

// Конфигурация транспорта для nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mail.ru',
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Верификация транспорта
transporter.verify(function(error, success) {
    if (error) {
        console.log('Ошибка при верификации транспорта:', error);
    } else {
        console.log('Сервер готов к отправке писем');
    }
});

// Вспомогательная функция для чтения файла с пользователями
async function readUsersFile() {
    try {
        const data = await fs.readFile(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Ошибка при чтении файла пользователей:', error);
        return [];
    }
}

// Создание нового заказа
router.post('/', async (req, res) => {
    try {
        const { userEmail, orderItems, totalAmount } = req.body;
        console.log('Получены данные заказа:', { userEmail, orderItems, totalAmount });

        if (!userEmail || !orderItems || !totalAmount) {
            console.log('Отсутствуют необходимые данные:', { userEmail, orderItems, totalAmount });
            return res.status(400).json({ message: 'Недостаточно данных для оформления заказа' });
        }

        // Формируем текст письма
        const orderItemsList = orderItems
            .map(item => `${item.name} - ${item.quantity} шт. x ${item.price} руб.`)
            .join('\n');

        const mailOptions = {
            from: {
                name: process.env.MAIL_FROM_NAME || 'Атрибут',
                address: process.env.SMTP_USER
            },
            to: userEmail,
            subject: 'Подтверждение заказа в "Атрибут"',
            html: `
            <h2>Спасибо за ваш заказ в "Атрибут"!</h2>
            <h3>Детали заказа:</h3>
            <pre>${orderItemsList}</pre>
            <p><strong>Общая сумма: ${totalAmount} руб.</strong></p>
            <br>
            <p>С уважением,<br>Команда "Атрибут"</p>
            `
        };

        console.log('Пытаемся отправить email:', mailOptions);

        // Отправляем email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email отправлен успешно:', info);

        res.status(200).json({ 
            message: 'Заказ успешно оформлен. Подтверждение отправлено на вашу почту.',
            success: true 
        });
    } catch (error) {
        console.error('Подробная ошибка при оформлении заказа:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            response: error.response
        });
        res.status(500).json({ 
            message: `Ошибка при оформлении заказа: ${error.message}`,
            success: false 
        });
    }
});

module.exports = router; 
