const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            products: [],
            searchQuery: '',
            showAddForm: false,
            showEditForm: false,
            editingProduct: null,
            categories: [
                'Протеин',
                'BCAA',
                'Витамины',
                'Жиросжигатели',
                'Энергетики'
            ],
            proteinSubcategories: [
                'Изолят протеина',
                'Казеиновый протеин',
                'Многокомпонентый протеин',
                'Сывороточный протеин'
            ],
            newProduct: {
                name: '',
                price: 0,
                category: 'Протеин',
                subcategory: 'Изолят протеина',
                image: '',
                description: '',
                composition: '',
                inStock: true
            }
        }
    },

    watch: {
        'newProduct.category'(newValue) {
            if (newValue !== 'Протеин') {
                this.newProduct.subcategory = '-';
            } else {
                this.newProduct.subcategory = 'Изолят протеина';
            }
        },
        'editingProduct.category'(newValue) {
            if (this.editingProduct && newValue !== 'Протеин') {
                this.editingProduct.subcategory = '-';
            } else if (this.editingProduct) {
                this.editingProduct.subcategory = 'Изолят протеина';
            }
        }
    },

    computed: {
        filteredProducts() {
            return this.products.filter(product => {
                const searchLower = this.searchQuery.toLowerCase();
                return product.name.toLowerCase().includes(searchLower) ||
                       product.category.toLowerCase().includes(searchLower) ||
                       product.subcategory.toLowerCase().includes(searchLower);
            });
        }
    },

    methods: {
        goToMainSite() {
            window.location.href = 'Атрибут.html';
        },

        // Загрузка товаров
        async loadProducts() {
            try {
                const response = await fetch('http://localhost:3000/products');
                if (!response.ok) throw new Error('Ошибка загрузки товаров');
                this.products = await response.json();
            } catch (error) {
                console.error('Ошибка при загрузке товаров:', error);
                alert('Не удалось загрузить товары');
            }
        },

        // Форматирование цены
        formatPrice(price) {
            return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
        },

        // Добавление товара
        async addProduct() {
            try {
                const response = await fetch('http://localhost:3000/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.newProduct)
                });

                if (!response.ok) throw new Error('Ошибка добавления товара');

                const addedProduct = await response.json();
                this.products.push(addedProduct);
                this.showAddForm = false;
                this.resetNewProduct();
                alert('Товар успешно добавлен');
            } catch (error) {
                console.error('Ошибка при добавлении товара:', error);
                alert('Не удалось добавить товар');
            }
        },

        // Редактирование товара
        editProduct(product) {
            this.editingProduct = { ...product };
            this.showEditForm = true;
        },

        // Сохранение изменений
        async saveEdit() {
            try {
                const response = await fetch(`http://localhost:3000/products/${this.editingProduct.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.editingProduct)
                });

                if (!response.ok) throw new Error('Ошибка обновления товара');

                const updatedProduct = await response.json();
                const index = this.products.findIndex(p => p.id === updatedProduct.id);
                if (index !== -1) {
                    this.products[index] = updatedProduct;
                }
                
                this.showEditForm = false;
                this.editingProduct = null;
                alert('Товар успешно обновлен');
            } catch (error) {
                console.error('Ошибка при обновлении товара:', error);
                alert('Не удалось обновить товар');
            }
        },

        // Удаление товара
        async deleteProduct(id) {
            if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;

            try {
                const response = await fetch(`http://localhost:3000/products/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) throw new Error('Ошибка удаления товара');

                this.products = this.products.filter(p => p.id !== id);
                alert('Товар успешно удален');
            } catch (error) {
                console.error('Ошибка при удалении товара:', error);
                alert('Не удалось удалить товар');
            }
        },

        // Обновление статуса наличия
        async updateProduct(product) {
            try {
                const response = await fetch(`http://localhost:3000/products/${product.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(product)
                });

                if (!response.ok) throw new Error('Ошибка обновления товара');
            } catch (error) {
                console.error('Ошибка при обновлении товара:', error);
                alert('Не удалось обновить статус товара');
                // Возвращаем предыдущее состояние
                product.inStock = !product.inStock;
            }
        },

        // Сброс формы нового товара
        resetNewProduct() {
            this.newProduct = {
                name: '',
                price: 0,
                category: 'Протеин',
                subcategory: 'Изолят протеина',
                image: '',
                description: '',
                composition: '',
                inStock: true
            };
        }
    },

    mounted() {
        this.loadProducts();
    }
});

app.mount('#app'); 