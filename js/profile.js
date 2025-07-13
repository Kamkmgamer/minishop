// js/profile.js

document.addEventListener('DOMContentLoaded', () => {
    const profileUsernameEl = document.getElementById('profile-username');
    const logoutBtn = document.getElementById('logout-btn'); // Get the logout button
    const orderHistoryContainer = document.getElementById('order-history-container');
    const noOrdersMessage = document.getElementById('no-orders-message');

    const currentUser = window.getCurrentUser(); // Get current user from auth.js

    if (!currentUser) {
        // If not logged in, redirect to auth page or show a message
        window.showCustomModal("Access Denied", "Please log in to view your profile and order history.", () => {
            window.location.href = 'auth.html';
        });
        return; // Stop execution
    }

    profileUsernameEl.textContent = currentUser.username;

    // --- IMPORTANT: ADD A CHECK HERE ---
    if (logoutBtn) {
        // Confirm it was found
        console.log("Logout button found:", logoutBtn);
        logoutBtn.addEventListener('click', () => {
            console.log("Logout button clicked!"); // Log when button is clicked
            window.handleLogout(); // Call the global logout function
        });
    } else {
        console.error("Logout button with ID 'logout-btn' not found on profile.html");
        // Optionally, display a modal error to the user
        if (window.showCustomModal) {
            window.showCustomModal("Error", "Logout button not found. Please contact support.");
        }
    }

    // Render order history
    if (orderHistoryContainer) {
        if (currentUser.orders && currentUser.orders.length > 0) {
            orderHistoryContainer.innerHTML = ''; // Clear placeholder
            noOrdersMessage.style.display = 'none';

            currentUser.orders.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first

            currentUser.orders.forEach(order => {
                const orderDiv = document.createElement('div');
                orderDiv.classList.add('order-history-item');

                const orderDate = new Date(order.date).toLocaleString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                let itemsHtml = order.items.map(item => `
                    <li>
                        <span>${item.name} (x${item.quantity})</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                `).join('');

                orderDiv.innerHTML = `
                    <h4>Order ID: ${order.id}</h4>
                    <p>Date: ${orderDate}</p>
                    <p>Total: <strong>$${order.total.toFixed(2)}</strong></p>
                    <ul class="order-items-list">
                        ${itemsHtml}
                    </ul>
                    <p class="order-total">Order Total: $${order.total.toFixed(2)}</p>
                `;
                orderHistoryContainer.appendChild(orderDiv);
            });
        } else {
            noOrdersMessage.style.display = 'block';
        }
    }
});