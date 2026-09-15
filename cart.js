// Инициализация Vue приложения
document.addEventListener('DOMContentLoaded', function() {
    const { createApp } = Vue;
    
    const app = createApp({
        data() {
            return {
                isCartVisible: false,
                cartItems: [],
                total: 0,
                searchQuery: '',
                currentCategory: 'Все',
                currentSubCategory: 'Все',
                currentPage: 'Все',
                dropdowns: {
                    'main-protein': false,
                    'side-protein': false
                },
                products: [],
                visibleProducts: 6,
                productsPerLoad: 6,
                activeDropdown: null,
                minPrice: 0,                   
                maxPrice: 0,                   
                selectedMinPrice: 0,          
                selectedMaxPrice: 0,            
                showOnlyInStock: false,
                isModalVisible: false,
                selectedProduct: null,
                activeTab: 'Описание',
                ...authData
            }
        },

        computed: {

            // Фильтрация товаров по категориям, подкатегориям и поиску
            filteredProducts() {
                let filtered = this.products;

                if (this.showOnlyInStock) {
                    filtered = filtered.filter(product => product.inStock);
                }

                if (this.currentCategory !== 'Все') {
                    filtered = filtered.filter(product => product.category === this.currentCategory);
                }

                if (this.currentSubCategory !== 'Все') {
                    filtered = filtered.filter(product => product.subcategory === this.currentSubCategory);
                }

                if (this.searchQuery.trim() !== '') {
                    filtered = filtered.filter(product => 
                        product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
                    );
                }

                filtered = filtered.filter(product => 
                    product.price >= this.selectedMinPrice && product.price <= this.selectedMaxPrice
                );

                return filtered;
            },

            // Отображаемые товары на текущий момент
            displayedProducts() {
                return this.filteredProducts.slice(0, this.visibleProducts);
            },

            // Проверка, можно ли загрузить еще товары
            canLoadMore() {
                return this.visibleProducts < this.filteredProducts.length;
            }
        },

        methods: {
            // Методы авторизации
            ...authMethods,

            // Управление корзиной
            showCart() {
                this.isCartVisible = true;
            },
            
            hideCart() {
                this.isCartVisible = false;
            },

            addToCart(productId) {
                // Проверяем авторизацию
                if (!this.currentUser) {
                    alert('Для добавления товаров в корзину необходимо войти в профиль');
                    this.showLoginModal();
                    return;
                }

                const product = this.products.find(p => p.id === productId);
                if (!product || !product.inStock) return;

                const existingItem = this.cartItems.find(item => item.id === productId);
                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    this.cartItems.push({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        quantity: 1
                    });
                }

                // Сохраняем корзину в localStorage
                this.saveCart();
                this.calculateTotal();
            },

            removeFromCart(index) {
                this.cartItems.splice(index, 1);
                this.calculateTotal();
                this.saveCart();
            },

            updateQuantity(index, change) {
                const item = this.cartItems[index];
                item.quantity += change;
                if (item.quantity <= 0) {
                    this.removeFromCart(index);
                } else {
                    this.calculateTotal();
                    this.saveCart();
                }
            },

            calculateTotal() {
                this.total = this.cartItems.reduce((sum, item) => 
                    sum + (item.price * item.quantity), 0
                );
            },
            
            // Форматирование цены
            formatPrice(price) {
                return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
            },
            
            // Оформление заказа
            async checkout() {
                if (this.cartItems.length === 0) {
                    alert('Корзина пуста!');
                    return;
                }

                try {
                    const response = await fetch('http://localhost:3000/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userEmail: this.currentUser.email,
                            orderItems: this.cartItems,
                            totalAmount: this.total
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        alert('Заказ успешно оформлен! Подтверждение отправлено на вашу почту.');
                        this.cartItems = [];
                        this.total = 0;
                        this.saveCart();
                        this.hideCart();
                    } else {
                        alert('Произошла ошибка при оформлении заказа: ' + result.message);
                    }
                } catch (error) {
                    console.error('Ошибка при оформлении заказа:', error);
                    alert('Произошла ошибка при оформлении заказа');
                }
            },
            
            // Сохранение и загрузка корзины
            saveCart() {
                localStorage.setItem('cart', JSON.stringify(this.cartItems));
            },
            
            loadCart() {
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    this.cartItems = JSON.parse(savedCart);
                    this.calculateTotal();
                }
            },
            
            // Управление отображением товаров
            loadMore() {
                this.visibleProducts += this.productsPerLoad;
            },

            setCategory(category) {
                this.currentCategory = category;
                this.currentSubCategory = 'Все';
                if(category !== 'Протеин') {
                    this.visibleProducts = this.productsPerLoad;
                }
            },

            setSubCategory(subcategory) {
                this.currentCategory = 'Протеин';
                this.currentSubCategory = subcategory;
                this.visibleProducts = this.productsPerLoad;
                this.dropdowns['main-protein'] = false;
                this.dropdowns['side-protein'] = false;
            },
            
            // Управление выпадающими меню
            toggleDropdown(menuId) {
                for (let key in this.dropdowns) {
                    if (key !== menuId) {
                        this.dropdowns[key] = false;
                    }
                }
                this.dropdowns[menuId] = !this.dropdowns[menuId];
            },
            closeAllDropdowns() {
                for (let key in this.dropdowns) {
                    this.dropdowns[key] = false;
                }
            },

            handleClickOutside(event) {
                const dropdowns = document.querySelectorAll('.dropdown');
                let clickedOutside = true;
                
                dropdowns.forEach(dropdown => {
                    if (dropdown.contains(event.target)) {
                        clickedOutside = false;
                    }
                });
                
                if (clickedOutside) {
                    this.closeAllDropdowns();
                }
            },

            // Методы для фильтрации по цене
            initializePriceRange() {

                const prices = this.products.map(product => product.price);
                this.minPrice = Math.min(...prices);
                this.maxPrice = Math.max(...prices);
                
                this.selectedMinPrice = this.minPrice;
                this.selectedMaxPrice = this.maxPrice;
            },

            syncPriceRange() {

                if (this.selectedMinPrice > this.selectedMaxPrice) {
                    this.selectedMaxPrice = this.selectedMinPrice;
                }
            },
            
            resetPriceFilter() {
                this.selectedMinPrice = this.minPrice;
                this.selectedMaxPrice = this.maxPrice;
            },

            formatPrice(price) {
                return price.toLocaleString('ru-RU') + ' ₽';
            },

            loadMore() {
                this.visibleProducts += this.productsPerLoad;
            },

            search() {
                this.visibleProducts = this.productsPerLoad;
            },

            // Методы для управления страницами
            setPage(page) {
                this.currentPage = page;
                this.closeAllDropdowns();
            },

            // Методы для модального окна товара
            openProductModal(product) {
                this.selectedProduct = product;
                this.isModalVisible = true;
                this.activeTab = 'Описание';
            },

            closeProductModal() {
                this.isModalVisible = false;
                this.selectedProduct = null;
            },

            // Загрузка данных
            async loadProducts() {
                try {
                    console.log('Начинаем загрузку товаров...');
                    const response = await fetch('http://localhost:3000/products');
                    if (!response.ok) {
                        throw new Error('Не удалось загрузить данные о товарах');
                    }
                    this.products = await response.json();
                    console.log('Товары загружены:', this.products);
                    this.initializePriceRange();
                } catch (error) {
                    console.error('Ошибка при загрузке товаров:', error);
                }
            },

            // Проверка авторизации при загрузке
            checkAuth() {
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    this.currentUser = JSON.parse(savedUser);
                }
            }
        },
        mounted() {
            this.loadProducts();
            this.loadCart();
            document.addEventListener('click', this.handleClickOutside);
            this.checkAuth();
        },
        beforeUnmount() {
            document.removeEventListener('click', this.handleClickOutside);
        }
    });

    app.mount('#app');
});
