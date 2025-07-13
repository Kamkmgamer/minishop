// js/cart.js

let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartCount = document.getElementById('cart-count');
let allProductsData = []; // To store product data with stock

// Fetch all product data initially when cart.js loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data/products.json');
        allProductsData = await response.json();
    } catch (error) {
        console.error("Error loading product data:", error);
        if (window.showCustomModal) {
            window.showCustomModal("Error", "Could not load product information. Please try again later.");
        } else {
            alert("Error loading product information. Please try again later.");
        }
    }
    renderCartItems();
    updateCartCount();
});


function updateCartCount() {
    if (cartCount) {
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

function addToCart(id, name, price, stock) {
    const existingItem = cart.find(item => item.id === id);
    const productInAllProducts = allProductsData.find(p => p.id === id);

    if (!productInAllProducts) {
        console.error("Product not found in data for stock check:", id);
        if (window.showCustomModal) {
            window.showCustomModal("Error", "Product information missing. Cannot add to cart.");
        } else {
            alert("Product information missing. Cannot add to cart.");
        }
        return false;
    }

    const currentCartQuantity = existingItem ? existingItem.quantity : 0;
    const availableStock = productInAllProducts.stock;

    if (currentCartQuantity >= availableStock) {
        if (window.showCustomModal) {
            window.showCustomModal("Out of Stock!", `Sorry, "${name}" is out of stock or you've reached the maximum available quantity (${availableStock}).`);
        } else {
            alert(`Sorry, "${name}" is out of stock or you've reached the maximum available quantity (${availableStock}).`);
        }
        return false;
    }

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (window.showCustomModal) {
        window.showCustomModal("Added to Cart!", `"${name}" has been added to your cart.`);
    }
    return true;
}

function removeItemFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();
    if (window.showCustomModal) {
        window.showCustomModal("Item Removed", "The item has been removed from your cart.");
    }
}

function adjustQuantity(id, change) {
    const itemIndex = cart.findIndex(item => item.id === id);
    if (itemIndex > -1) {
        const existingItem = cart[itemIndex];
        const productInAllProducts = allProductsData.find(p => p.id === id);

        if (!productInAllProducts) {
            console.error("Product not found in data for stock check:", id);
            if (window.showCustomModal) {
                window.showCustomModal("Error", "Product information missing. Cannot adjust quantity.");
            } else {
                alert("Product information missing. Cannot adjust quantity.");
            }
            return;
        }

        const availableStock = productInAllProducts.stock;

        if (change > 0 && existingItem.quantity + change > availableStock) {
            if (window.showCustomModal) {
                window.showCustomModal("Quantity Limit", `You can only add up to ${availableStock} of "${existingItem.name}".`);
            } else {
                alert(`You can only add up to ${availableStock} of "${existingItem.name}".`);
            }
            return;
        }

        existingItem.quantity += change;

        if (existingItem.quantity <= 0) {
            cart.splice(itemIndex, 1);
            if (window.showCustomModal) {
                window.showCustomModal("Item Removed", `All units of "${existingItem.name}" removed from cart.`);
            }
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartCount();
    }
}

async function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const totalAmountEl = document.getElementById('total-amount');

    if (!cartItemsContainer || !totalAmountEl) return;

    if (allProductsData.length === 0) {
        try {
            const response = await fetch('data/products.json');
            allProductsData = await response.json();
        } catch (error) {
            console.error("Error loading product data for cart rendering:", error);
            cartItemsContainer.innerHTML = '<p>Error loading product data.</p>';
            totalAmountEl.textContent = '0.00';
            return;
        }
    }

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        totalAmountEl.textContent = '0.00';
        return;
    }

    let total = 0;
    cart.forEach((item, index) => {
        const product = allProductsData.find(p => p.id === item.id);

        if (product) {
            total += item.price * item.quantity;
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <div class="cart-item-info">
                    <a href="product.html?id=${product.id}" class="cart-item-image-link">
                        <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                    </a>
                    <div>
                        <a href="product.html?id=${product.id}">${item.name}</a>
                        <p>Price: $${item.price.toFixed(2)}</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                            <span class="item-quantity">${item.quantity}</span>
                            <button class="quantity-btn increase-quantity" data-id="${item.id}" ${item.quantity >= product.stock ? 'disabled' : ''}>+</button>
                        </div>
                        ${product.stock > 0 && item.quantity >= product.stock ? `<p class="stock-limit-msg">Max in stock reached!</p>` : ''}
                        ${product.stock === 0 ? `<p class="stock-limit-msg out-of-stock">Out of Stock!</p>` : ''}
                    </div>
                </div>
                <div class="cart-item-actions">
                    <span class="item-subtotal">$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-item-btn" data-id="${item.id}">&#x2715;</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemDiv);

            setTimeout(() => {
                cartItemDiv.classList.add('loaded');
            }, index * 80);
        }
    });

    totalAmountEl.textContent = total.toFixed(2);
    attachCartItemEventListeners();
}

function attachCartItemEventListeners() {
    const decreaseButtons = document.querySelectorAll('.decrease-quantity');
    decreaseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.dataset.id);
            adjustQuantity(id, -1);
        });
    });

    const increaseButtons = document.querySelectorAll('.increase-quantity');
    increaseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.dataset.id);
            adjustQuantity(id, 1);
        });
    });

    const removeButtons = document.querySelectorAll('.remove-item-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = parseInt(button.dataset.id);
            removeItemFromCart(id);
        });
    });
}

window.addToCart = addToCart;
window.updateCartCount = updateCartCount;
window.renderCartItems = renderCartItems;

document.addEventListener('DOMContentLoaded', () => {
    const placeOrderBtn = document.getElementById('place-order-btn');

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                if (window.showCustomModal) {
                    window.showCustomModal("Cart Empty", "Your cart is empty. Add some items before placing an order!");
                } else {
                    alert('Your cart is empty. Add some items before placing an order!');
                }
                return;
            }

            placeOrderBtn.classList.add('success');

            // Simulate order processing and saving
            setTimeout(() => {
                const currentUser = window.getCurrentUser(); // Get current user from auth.js
                let users = window.getUsers(); // Get all users from auth.js

                if (currentUser && users) {
                    // Find the current user in the global users array
                    const userIndex = users.findIndex(user => user.id === currentUser.id);

                    if (userIndex > -1) {
                        // Create an order object
                        const order = {
                            id: Date.now(), // Unique order ID
                            date: new Date().toISOString(), // Current timestamp
                            items: [...cart], // Copy of cart items
                            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                        };

                        // Add order to user's history
                        users[userIndex].orders.push(order);
                        window.saveUsers(users); // Save updated users array

                        // Update currentUser in localStorage to reflect new orders
                        window.setCurrentUser(users[userIndex]);
                    }
                }

                // Display success modal
                if (window.showCustomModal) {
                    window.showCustomModal("Order Placed!", "Thank you for your purchase!", () => {
                        // This callback runs when the user clicks 'OK' on the modal.
                        // We put the redirection here to ensure it happens AFTER acknowledgement.
                        window.location.href = 'index.html'; // Redirect to home page
                    });
                } else {
                    alert('Order placed successfully! Thank you for your purchase.');
                    window.location.href = 'index.html';
                }

                // Crucially, clear the cart and update count immediately after showing the success message,
                // regardless of whether the user clicks OK on the modal or simply closes it.
                // The modal callback will handle the redirection.
                cart = [];
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCartItems(); // Re-render cart to show it's empty
                updateCartCount(); // Update cart count in header

            }, 500); // Allow the button animation to start before showing modal/processing
        });
    }
});