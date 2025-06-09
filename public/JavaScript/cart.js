// JavaScript/cart.js
// Initialize cart in localStorage if it doesn't exist
if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
}

// Clear any def


// Update cart count in header
async function updateCartCount() {
    try {
        const response = await fetch('/cart/count');
        if (response.ok) {
            const data = await response.json();
            const cartCountElement = document.querySelector('.cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = data.count;
            }
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Add item to cart
async function addToCart(product) {
    try {
        const response = await fetch(`/cart/add/${product._id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to add item to cart');
        }

        const data = await response.json();
        if (data.success) {
            alert('Product added to cart!');
            updateCartCount();
        } else {
            alert('Error adding product to cart');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding product to cart');
    }
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
                <a href="/dining" class="continue-shopping">← Continue Shopping</a>
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
        '<a href="/dining" class="continue-shopping">← Continue Shopping</a>';
    
    updateTotal();
}

// Update quantity
async function updateQuantity(productId, change) {
    try {
        const response = await fetch(`/cart/update/${productId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ change })
        });

        if (!response.ok) {
            throw new Error('Failed to update quantity');
        }

        const data = await response.json();
        if (data.success) {
            updateCartCount();
            loadCartItems();
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        alert('Failed to update quantity. Please try again.');
    }
}

// Remove from cart
async function removeFromCart(productId) {
    if (!confirm('Are you sure you want to remove this item?')) return;
    
    try {
        const response = await fetch(`/cart/remove/${productId}`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Failed to remove item');
        }

        const data = await response.json();
        if (data.success) {
            updateCartCount();
            loadCartItems();
        }
    } catch (error) {
        console.error('Error removing item:', error);
        alert('Failed to remove item. Please try again.');
    }
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
    if (window.location.pathname.includes('/cart')) {
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
            window.location.href = '/checkout';
        });
    }
});
