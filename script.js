
document.addEventListener('DOMContentLoaded', function() {

    // ===================================================================
    // FUNCIÓN 1: LÓGICA DE AUTENTICACIÓN Y SESIÓN
    // ===================================================================

    function updateHeader() {
        const sessionContainer = document.getElementById('session-container');
        if (!sessionContainer) return;

        const currentUser = JSON.parse(localStorage.getItem('andicarCurrentUser'));

        if (currentUser && currentUser.name) {
            // Usuario LOGUEADO
            sessionContainer.innerHTML = `
                <span>Hola, <strong>${currentUser.name}</strong></span>
                <div class="dropdown">
                    <a href="my-account.html" class="dropdown-toggle">Mi Cuenta <i class="fas fa-chevron-down"></i></a>
                    <ul class="dropdown-menu">
                        <li><a href="my-account.html">Ver mi Perfil</a></li>
                        <li><a href="#" id="logout-btn">Cerrar Sesión</a></li>
                    </ul>
                </div>
            `;
            document.getElementById('logout-btn').addEventListener('click', handleLogout);
        } else {
            // Usuario DESLOGUEADO
            sessionContainer.innerHTML = `
                <span>Hola,</span>
                <div class="dropdown">
                    <a href="#" class="dropdown-toggle">Inicia Sesión <i class="fas fa-chevron-down"></i></a>
                    <ul class="dropdown-menu">
                        <li><a href="login.html">Iniciar Sesión</a></li>
                        <li><a href="register.html">Registrarse</a></li>
                    </ul>
                </div>
            `;
        }
    }

    function handleLogout(e) {
        e.preventDefault();
        localStorage.removeItem('andicarCurrentUser');
        updateHeader();
        window.location.href = 'index.html';
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = e.target.name.value.trim();
            const email = e.target.email.value.trim();
            const password = e.target.password.value;
            const feedback = document.getElementById('feedback-message');

            if (!name || !email || !password) {
                feedback.textContent = 'Todos los campos son obligatorios.';
                feedback.className = 'feedback-message error';
                feedback.style.display = 'block';
                return;
            }

            let users = JSON.parse(localStorage.getItem('andicarUsers')) || [];
            if (users.find(user => user.email === email)) {
                feedback.textContent = 'Este correo electrónico ya está registrado.';
                feedback.className = 'feedback-message error';
                feedback.style.display = 'block';
                return;
            }

            users.push({ name, email, password });
            localStorage.setItem('andicarUsers', JSON.stringify(users));
            feedback.textContent = '¡Registro exitoso! Serás redirigido para iniciar sesión.';
            feedback.className = 'feedback-message success';
            feedback.style.display = 'block';
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        });
    }

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = e.target.email.value.trim();
            const password = e.target.password.value;
            const feedback = document.getElementById('feedback-message');

            let users = JSON.parse(localStorage.getItem('andicarUsers')) || [];
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('andicarCurrentUser', JSON.stringify(user));
                feedback.textContent = 'Inicio de sesión correcto. Redirigiendo...';
                feedback.className = 'feedback-message success';
                feedback.style.display = 'block';
                setTimeout(() => { window.location.href = 'my-account.html'; }, 1000);
            } else {
                feedback.textContent = 'Correo o contraseña incorrectos.';
                feedback.className = 'feedback-message error';
                feedback.style.display = 'block';
            }
        });
    }

    // ===================================================================
    // FUNCIÓN 2: LÓGICA DEL MENÚ LATERAL DE CATEGORÍAS
    // ===================================================================

    const categoryButton = document.getElementById('category-btn');
    const categoryMenu = document.getElementById('category-menu');
    if (categoryButton && categoryMenu) {
        categoryButton.addEventListener('click', e => {
            e.stopPropagation();
            categoryMenu.classList.toggle('active');
        });
        document.addEventListener('click', e => {
            if (categoryMenu.classList.contains('active') && !categoryMenu.contains(e.target) && !categoryButton.contains(e.target)) {
                categoryMenu.classList.remove('active');
            }
        });
    }

    // ===================================================================
    // FUNCIÓN 3: LÓGICA DEL CARRITO DE COMPRAS
    // ===================================================================

    function updateCartIcon() {
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const cartTotal = document.getElementById('cart-total');
        let total = 0;
        cart.forEach(item => {
            let price = parseFloat(item.price.replace('S/', '').trim());
            total += price * item.quantity;
        });
        if (cartTotal) cartTotal.textContent = `S/${total.toFixed(2)}`;
    }

    const productsContainer = document.querySelector('.products-container');
if (productsContainer) {
    productsContainer.addEventListener('click', e => {
        // --- Lógica para los botones de cantidad (+ y -) ---
        if (e.target.tagName === 'BUTTON' && e.target.closest('.quantity-selector')) {
            const selector = e.target.closest('.quantity-selector');
            const input = selector.querySelector('input');
            let currentValue = parseInt(input.value);

            if (e.target.textContent === '+') {
                currentValue++;
            } else if (e.target.textContent === '-') {
                if (currentValue > 1) {
                    currentValue--;
                }
            }
            input.value = currentValue;
        }

        // --- Lógica para el botón "Comprar" ---
        if (e.target.classList.contains('buy-btn')) {
            const card = e.target.closest('.product-card');
            const product = {
                id: Date.now(),
                name: card.querySelector('h3').textContent,
                price: card.querySelector('.product-price').textContent,
                image: card.querySelector('img').getAttribute('src'),
                quantity: parseInt(card.querySelector('.quantity-selector input').value)
            };
            
            let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
            cart.push(product);
            localStorage.setItem('shoppingCart', JSON.stringify(cart));
            localStorage.setItem('lastAddedItem', product.name);
            window.location.href = 'cart.html';
        }

        // --- Lógica para la calificación con estrellas ---
        if (e.target.tagName === 'I' && e.target.closest('.product-rating')) {
            const ratingContainer = e.target.closest('.product-rating');
            const allStars = ratingContainer.querySelectorAll('i');
            const clickedStarIndex = Array.from(allStars).indexOf(e.target);

            // Actualiza las clases de las estrellas
            allStars.forEach((star, index) => {
                if (index <= clickedStarIndex) {
                    star.classList.remove('far'); // Quita la clase de estrella vacía
                    star.classList.add('fas');    // Añade la clase de estrella llena
                } else {
                    star.classList.remove('fas'); // Quita la clase de estrella llena
                    star.classList.add('far');    // Añade la clase de estrella vacía
                }
            });
        }
    });
}

    if (document.body.classList.contains('cart-page-body')) {
        displayCartItems();
    }
    
    function displayCartItems() {
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const cartContent = document.getElementById('cart-content');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const notificationArea = document.getElementById('cart-notification');
        const lastAdded = localStorage.getItem('lastAddedItem');

        if (lastAdded && notificationArea) {
            notificationArea.innerHTML = `<span><i class="fas fa-check-circle"></i> "${lastAdded.toUpperCase()}" se ha añadido a tu carrito.</span><a href="products.html" class="continue-shopping-btn">Seguir comprando</a>`;
            notificationArea.classList.remove('hidden');
            localStorage.removeItem('lastAddedItem');
        }

        if (cart.length === 0) {
            if(cartContent) cartContent.innerHTML = '';
            if(emptyCartMessage) emptyCartMessage.classList.remove('hidden');
        } else {
            let subtotal = 0;
            const itemsHTML = cart.map(item => {
                let price = parseFloat(item.price.replace('S/', '').trim());
                subtotal += price * item.quantity;
                return `<tr><td><div class="product-info"><button class="remove-item-btn" data-id="${item.id}">&times;</button><img src="${item.image}" alt="${item.name}"><span>${item.name}</span></div></td><td>S/${price.toFixed(2)}</td><td><input type="number" value="${item.quantity}" min="1" class="item-quantity" data-id="${item.id}"></td><td>S/${(price * item.quantity).toFixed(2)}</td></tr>`;
            }).join('');
            
            if (cartContent) {
                cartContent.innerHTML = `<table class="cart-table"><thead><tr><th>Productos</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th></tr></thead><tbody>${itemsHTML}</tbody></table><div class="cart-summary"><h2>Totales de carrito</h2><div class="summary-row"><span>Subtotal</span><span>S/${subtotal.toFixed(2)}</span></div><div class="summary-row total"><span>Total</span><span>S/${subtotal.toFixed(2)}</span></div><button class="finalize-btn" id="finalize-btn">Finalizar compra</button></div>`;
            }
            if(emptyCartMessage) emptyCartMessage.classList.add('hidden');
        }
    }
    
    const cartContentEl = document.getElementById('cart-content');
    if (cartContentEl) {
        cartContentEl.addEventListener('click', e => {
            if (e.target.id === 'finalize-btn') {
                const cartContainer = document.querySelector('.cart-container');
                cartContainer.innerHTML = `<div id="thank-you-message"><h2>¡Gracias por su compra!</h2><p>Tu pedido ha sido procesado exitosamente.</p><br><a href="index.html" class="continue-shopping-btn">Volver al inicio</a></div>`;
                localStorage.removeItem('shoppingCart');
                updateCartIcon();
            }
            if (e.target.classList.contains('remove-item-btn')) {
                const itemId = parseInt(e.target.dataset.id);
                let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
                cart = cart.filter(item => item.id !== itemId);
                localStorage.setItem('shoppingCart', JSON.stringify(cart));
                displayCartItems();
                updateCartIcon();
            }
        });
        cartContentEl.addEventListener('change', e => {
            if (e.target.classList.contains('item-quantity')) {
                const itemId = parseInt(e.target.dataset.id);
                const newQuantity = parseInt(e.target.value);
                let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
                const itemIndex = cart.findIndex(item => item.id === itemId);
                if (itemIndex > -1 && newQuantity > 0) {
                    cart[itemIndex].quantity = newQuantity;
                }
                localStorage.setItem('shoppingCart', JSON.stringify(cart));
                displayCartItems();
                updateCartIcon();
            }
        });
    }



    // ===================================================================
    // INICIALIZACIÓN DE LA PÁGINA (se ejecuta al final)
    // ===================================================================

    updateHeader();
    updateCartIcon();

    
    
    const footerHTML = `<footer class="main-footer"><p>&copy; 2025 Andicar | Todos los derechos reservados</p></footer>`;
    document.body.insertAdjacentHTML('beforeend', footerHTML);
});

// ===================================================================
// FUNCIÓN 4: LÓGICA DE BÚSQUEDA DE PRODUCTOS
// ===================================================================

const searchInput = document.getElementById('search-input');
// Solo añade el escuchador si estamos en la página de productos
if (searchInput && document.querySelector('.products-page')) {
    searchInput.addEventListener('keyup', function() {
        // Obtiene el texto de búsqueda y lo convierte a minúsculas
        const searchTerm = searchInput.value.toLowerCase();
        
        // Selecciona todas las tarjetas de productos
        const allProducts = document.querySelectorAll('.product-card');

        // Recorre cada tarjeta para ver si debe mostrarse u ocultarse
        allProducts.forEach(product => {
            // Obtiene el nombre del producto de la etiqueta h3 y lo convierte a minúsculas
            const productName = product.querySelector('h3').textContent.toLowerCase();

            // Comprueba si el nombre del producto incluye el término de búsqueda
            if (productName.includes(searchTerm)) {
                product.style.display = 'block'; // Muestra la tarjeta
            } else {
                product.style.display = 'none'; // Oculta la tarjeta
            }
        });
    });
}