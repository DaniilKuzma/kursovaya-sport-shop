const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// Путь к файлу products.json
const PRODUCTS_FILE = path.join(__dirname, '..', 'products.json');

// Функция для упорядочивания полей товара
function orderProductFields(product) {
    const orderedProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        subcategory: product.subcategory,
        description: product.description || '',
        composition: product.composition || '',
        inStock: product.inStock
    };
    return orderedProduct;
}

// Вспомогательная функция для чтения файла с продуктами
async function readProductsFile() {
    try {
        const data = await fs.readFile(PRODUCTS_FILE, 'utf8');
        if (!data || data.trim() === '') {
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(PRODUCTS_FILE, '[]');
            return [];
        }
        throw error;
    }
}

// Вспомогательная функция для записи в файл
async function writeProductsFile(products) {
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

// Получение всех продуктов
router.get('/', async (req, res) => {
    try {
        const products = await readProductsFile();
        res.json(products);
    } catch (error) {
        console.error('Ошибка при чтении продуктов:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении продуктов.' });
    }
});

// Получение продукта по ID
router.get('/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const products = await readProductsFile();
        const product = products.find(p => p.id === productId);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Продукт не найден.' });
        }
    } catch (error) {
        console.error('Ошибка при получении продукта:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении продукта.' });
    }
});

// Добавление нового продукта
router.post('/', async (req, res) => {
    try {
        const newProduct = req.body;
        const products = await readProductsFile();

        // Проверка обязательных полей
        if (!newProduct.name || !newProduct.price || !newProduct.category) {
            return res.status(400).json({ message: 'Недостаточно данных для добавления продукта.' });
        }

        // Генерация нового ID
        const maxId = products.length > 0 ? Math.max(...products.map(p => p.id)) : 0;
        newProduct.id = maxId + 1;

        // Упорядочиваем поля нового товара
        const orderedProduct = orderProductFields(newProduct);
        products.push(orderedProduct);
        await writeProductsFile(products);
        res.status(201).json(orderedProduct);
    } catch (error) {
        console.error('Ошибка при добавлении продукта:', error);
        res.status(500).json({ message: 'Ошибка сервера при добавлении продукта.' });
    }
});

// Обновление продукта по ID
router.put('/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const updatedData = req.body;
        const products = await readProductsFile();
        const index = products.findIndex(p => p.id === productId);

        if (index !== -1) {
            // Объединяем существующий товар с обновленными данными и упорядочиваем поля
            const updatedProduct = orderProductFields({ ...products[index], ...updatedData });
            products[index] = updatedProduct;
            await writeProductsFile(products);
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Продукт не найден.' });
        }
    } catch (error) {
        console.error('Ошибка при обновлении продукта:', error);
        res.status(500).json({ message: 'Ошибка сервера при обновлении продукта.' });
    }
});

// Удаление продукта по ID
router.delete('/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const products = await readProductsFile();
        const index = products.findIndex(p => p.id === productId);

        if (index !== -1) {
            const removedProduct = products.splice(index, 1)[0];
            await writeProductsFile(products);
            res.json({ message: 'Продукт успешно удалён.', product: removedProduct });
        } else {
            res.status(404).json({ message: 'Продукт не найден.' });
        }
    } catch (error) {
        console.error('Ошибка при удалении продукта:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении продукта.' });
    }
});

module.exports = router;
