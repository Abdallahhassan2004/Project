// JavaScript/cart.js
// Initialize cart in localStorage if it doesn't exist
if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
}

// Clear any def


// Update cart count in header
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Add item to cart
function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        if (existingItem.quantity >= 3) {
            alert('Maximum 3 items allowed per product');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
}

// Load cart items
function loadCartItems() {
    const cartLeftElement = document.querySelector('.cart-left');
    if (!cartLeftElement) return; // Not on cart page

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        cartLeftElement.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <a href="../HTML/home.html" class="continue-shopping">← Continue Shopping</a>
            </div>`;
        const cartRight = document.querySelector('.cart-right');
        if (cartRight) cartRight.style.display = 'none';
        return;
    }

    const cartItemsHTML = cart.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h3>${item.name}</h3>
                <div class="quantity-controls">
                    <button class="quantity-btn minus" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn plus" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <div class="price" data-unit-price="${item.price}">£${(item.price * item.quantity).toFixed(2)}</div>
            </div>
            <button class="trash-icon" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    cartLeftElement.innerHTML = cartItemsHTML + 
        '<a href="../HTML/home.html" class="continue-shopping">← Continue Shopping</a>';
    
    updateTotal();
}

// Update quantity
function updateQuantity(productId, change) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity < 1) {
            removeFromCart(productId);
            return;
        }
        if (newQuantity > 3) {
            alert('Maximum 3 items allowed per product');
            return;
        }
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCartItems();
        updateCartCount();
    }
}

// Remove from cart
function removeFromCart(productId) {
    if (!confirm('Are you sure you want to remove this item?')) return;
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    loadCartItems();
    updateCartCount();
}

// Update total
function updateTotal() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const itemsCountElement = document.getElementById('items-count');
    const totalPriceElement = document.getElementById('total-price');
    
    if (itemsCountElement) itemsCountElement.textContent = totalItems;
    if (totalPriceElement) totalPriceElement.textContent = `£${totalPrice.toFixed(2)}`;
}

// Initialize cart functionality
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (window.location.pathname.includes('cart.html')) {
        loadCartItems();
    }
});

// Handle checkout button click
document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            if (cart.length === 0) {
                alert('Your cart is empty. Add some items before checking out.');
                return;
            }
            
            // Redirect to checkout page
            window.location.href = 'checkout.html';
        });
    }
});
