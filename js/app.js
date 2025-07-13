document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-select');

    let allProducts = []; // To store all products fetched from JSON

    // Function to set up Intersection Observer (for scroll animation)
    function observeElementsForAnimation() {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Stop observing once animated
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% of element is visible

        // Select all elements that need to animate in
        document.querySelectorAll('.animate-in').forEach(element => {
            observer.observe(element);
        });
    }

    // Function to render products based on a filtered array
    function renderProducts(productsToRender) {
        productsContainer.innerHTML = ''; // Clear existing products
        if (productsToRender.length === 0) {
            productsContainer.innerHTML = '<p>No products found matching your criteria.</p>';
            return;
        }

        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            // Add 'animate-in' class for scroll animation
            productCard.classList.add('product-card', 'animate-in');
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">$${product.price.toFixed(2)}</p>
                ${product.stock > 0 ? `<p class="stock-info">${product.stock} in stock</p>` : `<p class="stock-info out-of-stock">Out of Stock</p>`}
                <button class="btn view-details-btn" data-id="${product.id}">View Details</button>
                <button class="btn btn-secondary add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-stock="${product.stock}" ${product.stock <= 0 ? 'disabled' : ''}>Add to Cart</button>
            `;
            productsContainer.appendChild(productCard);
        });

        addEventListenersToProductCards(); // Re-attach event listeners to new buttons
        observeElementsForAnimation(); // Re-observe for scroll animations for newly added elements
    }

    // Function to populate category dropdown
    function populateCategories(products) {
        // Get unique categories from the products list
        const categories = [...new Set(products.map(product => product.category))];
        categorySelect.innerHTML = '<option value="all">All Categories</option>'; // Always start with "All" option
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    // Main function to load and filter products
    async function initProducts() {
        try {
            const response = await fetch('data/products.json');
            allProducts = await response.json(); // Store all products
        } catch (error) {
            console.error("Error loading products:", error);
            if (window.showCustomModal) {
                window.showCustomModal("Error", "Failed to load products. Please try again later.");
            } else {
                alert("Failed to load products. Please try again later.");
            }
            return; // Stop execution if products can't be loaded
        }

        populateCategories(allProducts); // Populate categories initially
        renderProducts(allProducts); // Render all products initially
    }

    // Event listeners for filtering
    searchInput.addEventListener('input', filterProducts);
    categorySelect.addEventListener('change', filterProducts);

    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value;

        let filtered = allProducts.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                  product.description.toLowerCase().includes(searchTerm);

            const matchesCategory = selectedCategory === 'all' ||
                                    product.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        renderProducts(filtered); // Render the filtered products
    }

    // Attaches event listeners to buttons (view details, add to cart)
    function addEventListenersToProductCards() {
        const viewDetailButtons = document.querySelectorAll('.view-details-btn');
        viewDetailButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.id;
                window.location.href = `product.html?id=${productId}`;
            });
        });

        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const id = parseInt(button.dataset.id);
                const name = button.dataset.name;
                const price = parseFloat(button.dataset.price);
                const stock = parseInt(button.dataset.stock); // Get stock from data attribute

                if (window.addToCart) {
                    // Pass stock to addToCart function. addToCart returns true on success.
                    const success = window.addToCart(id, name, price, stock);
                    if (success) {
                        // Trigger pulse animation on button and shake on cart icon if successful
                        event.target.classList.add('pulse');
                        setTimeout(() => {
                            event.target.classList.remove('pulse');
                        }, 500);

                        const cartCountElement = document.getElementById('cart-count');
                        if (cartCountElement) {
                            cartCountElement.classList.add('shake');
                            setTimeout(() => {
                                cartCountElement.classList.remove('shake');
                            }, 500);
                        }
                    }
                } else {
                    console.error("addToCart function not available.");
                    if (window.showCustomModal) {
                        window.showCustomModal("Error", "Cart functionality is not available. Please check the console for details.");
                    }
                }
            });
        });
    }

    initProducts();
});