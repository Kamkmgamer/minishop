document.addEventListener('DOMContentLoaded', () => {
    const productDetailsContainer = document.getElementById('product-details-container');
    const averageRatingEl = document.getElementById('average-rating');
    const starsDisplayEl = document.getElementById('stars-display');
    const totalReviewsCountEl = document.getElementById('total-reviews-count');
    const reviewsListContainer = document.getElementById('reviews-list');
    const noReviewsMessage = document.getElementById('no-reviews-message');
    const reviewForm = document.getElementById('review-form');
    const starRatingInput = document.getElementById('star-rating-input');
    const selectedRatingInput = document.getElementById('selected-rating');
    const reviewCommentInput = document.getElementById('review-comment');
    const loginToReviewMessage = document.getElementById('login-to-review-message');
    const relatedProductsGrid = document.getElementById('related-products-grid'); // NEW
    const noRelatedProductsMessage = document.getElementById('no-related-products-message'); // NEW

    let currentProduct = null; // Store the product being viewed

    // Cache of all products (to modify reviews in memory and find related products)
    // In a real app, this would be persisted to a database.
    let allProductsData = [];

    async function loadProductDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));

        try {
            const response = await fetch('data/products.json');
            allProductsData = await response.json(); // Store all products
        } catch (error) {
            console.error("Error loading products:", error);
            if (window.showCustomModal) {
                window.showCustomModal("Error", "Failed to load product details. Please try again later.");
            } else {
                alert("Failed to load product details. Please try again later.");
            }
            productDetailsContainer.innerHTML = '<p>Error loading product details.</p>';
            return;
        }

        currentProduct = allProductsData.find(p => p.id === productId);

        if (currentProduct) {
            renderProductDetails(currentProduct);
            renderReviews(currentProduct.reviews);
            setupReviewForm(currentProduct);
            loadRelatedProducts(currentProduct.id, currentProduct.category); // NEW
        } else {
            productDetailsContainer.innerHTML = '<p>Product not found.</p>';
            if (window.showCustomModal) {
                window.showCustomModal("Error", "The requested product was not found.");
            }
            setTimeout(() => {
                productDetailsContainer.classList.add('loaded');
            }, 100);
        }
    }

    function renderProductDetails(product) {
        productDetailsContainer.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div>
                <h2>${product.name}</h2>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p>${product.description}</p>
                ${product.stock > 0 ? `<p class="stock-info">${product.stock} in stock</p>` : `<p class="stock-info out-of-stock">Out of Stock</p>`}
                <button class="btn add-to-cart-btn-detail" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-stock="${product.stock}" ${product.stock <= 0 ? 'disabled' : ''}>Add to Cart</button>
            </div>
        `;

        setTimeout(() => {
            productDetailsContainer.classList.add('loaded');
        }, 100);

        // Add event listener for the "Add to Cart" button
        const addToCartButton = productDetailsContainer.querySelector('.add-to-cart-btn-detail');
        if (addToCartButton) {
            addToCartButton.addEventListener('click', (event) => {
                const id = parseInt(addToCartButton.dataset.id);
                const name = addToCartButton.dataset.name;
                const price = parseFloat(addToCartButton.dataset.price);
                const stock = parseInt(addToCartButton.dataset.stock);

                if (window.addToCart) {
                    const success = window.addToCart(id, name, price, stock);
                    if (success) {
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
        }
    }

    // --- Review System Functions ---

    function calculateAverageRating(reviews) {
        if (!reviews || reviews.length === 0) {
            return { average: 0, count: 0 };
        }
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const average = totalRating / reviews.length;
        return { average: average, count: reviews.length };
    }

    function renderStars(rating, container) {
        container.innerHTML = ''; // Clear previous stars
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        for (let i = 0; i < fullStars; i++) {
            const star = document.createElement('i');
            star.classList.add('fas', 'fa-star');
            container.appendChild(star);
        }
        if (halfStar) {
            const star = document.createElement('i');
            star.classList.add('fas', 'fa-star-half-alt'); // Use half-alt for half star
            container.appendChild(star);
        }
        for (let i = 0; i < emptyStars; i++) {
            const star = document.createElement('i');
            star.classList.add('far', 'fa-star');
            container.appendChild(star);
        }
    }

    function renderReviews(reviews) {
        reviewsListContainer.innerHTML = ''; // Clear existing reviews
        const { average, count } = calculateAverageRating(reviews);

        averageRatingEl.textContent = average.toFixed(1);
        renderStars(average, starsDisplayEl);
        totalReviewsCountEl.textContent = count;

        if (reviews.length === 0) {
            noReviewsMessage.style.display = 'block';
            return;
        } else {
            noReviewsMessage.style.display = 'none';
        }

        // Sort reviews by date, newest first
        reviews.sort((a, b) => new Date(b.date) - new Date(a.date));

        reviews.forEach(review => {
            const reviewDiv = document.createElement('div');
            reviewDiv.classList.add('review-item');
            const reviewDate = new Date(review.date).toLocaleString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            const reviewStarsContainer = document.createElement('div');
            reviewStarsContainer.classList.add('review-stars');
            renderStars(review.rating, reviewStarsContainer);

            reviewDiv.innerHTML = `
                <div class="review-header">
                    <span class="reviewer-info">${review.username || 'Anonymous'}</span>
                    <span class="review-date">${reviewDate}</span>
                </div>
                <div class="review-rating-display"></div>
                <p class="review-comment">${review.comment}</p>
            `;
            reviewDiv.querySelector('.review-rating-display').appendChild(reviewStarsContainer);
            reviewsListContainer.appendChild(reviewDiv);
        });
    }

    function setupReviewForm(product) {
        const currentUser = window.getCurrentUser(); // From auth.js

        if (currentUser) {
            loginToReviewMessage.style.display = 'none';
            reviewForm.style.display = 'block';

            // Star rating input interaction
            let currentRating = 0;
            starRatingInput.addEventListener('mouseover', (event) => {
                const rating = event.target.dataset.rating;
                if (rating) {
                    highlightStars(parseInt(rating));
                }
            });

            starRatingInput.addEventListener('mouseout', () => {
                highlightStars(currentRating); // Revert to selected rating
            });

            starRatingInput.addEventListener('click', (event) => {
                const rating = event.target.dataset.rating;
                if (rating) {
                    currentRating = parseInt(rating);
                    selectedRatingInput.value = currentRating;
                    highlightStars(currentRating); // Set selected rating
                }
            });

            function highlightStars(rating) {
                const stars = starRatingInput.querySelectorAll('.fa-star');
                stars.forEach(star => {
                    const starRating = parseInt(star.dataset.rating);
                    if (starRating <= rating) {
                        star.classList.remove('far');
                        star.classList.add('fas');
                    } else {
                        star.classList.remove('fas');
                        star.classList.add('far');
                    }
                });
            }
            highlightStars(currentRating); // Initial state

            // Handle review form submission
            reviewForm.addEventListener('submit', (event) => {
                event.preventDefault();

                const rating = parseInt(selectedRatingInput.value);
                const comment = reviewCommentInput.value.trim();

                if (rating === 0) {
                    window.showCustomModal("Error", "Please select a star rating.");
                    return;
                }
                if (!comment) {
                    window.showCustomModal("Error", "Please enter your review comment.");
                    return;
                }

                const newReview = {
                    reviewId: Date.now(), // Simple unique ID for the review
                    userId: currentUser.id,
                    username: currentUser.username,
                    rating: rating,
                    comment: comment,
                    date: new Date().toISOString()
                };

                // Find the product in the allProductsData array and add the new review
                const productIndex = allProductsData.findIndex(p => p.id === product.id);
                if (productIndex > -1) {
                    // Ensure the reviews array exists
                    if (!allProductsData[productIndex].reviews) {
                        allProductsData[productIndex].reviews = [];
                    }
                    allProductsData[productIndex].reviews.push(newReview);
                    currentProduct.reviews = allProductsData[productIndex].reviews; // Update currentProduct reference

                    // Re-render reviews to show the new one
                    renderReviews(currentProduct.reviews);

                    window.showCustomModal("Success!", "Your review has been submitted.", () => {
                        reviewForm.reset(); // Clear the form
                        currentRating = 0; // Reset selected rating
                        selectedRatingInput.value = 0;
                        highlightStars(0); // Clear stars visually
                    });
                } else {
                    window.showCustomModal("Error", "Could not find product to add review. Please try again.");
                }
            });

        } else {
            // User is not logged in
            loginToReviewMessage.style.display = 'block';
            reviewForm.style.display = 'none';
        }
    }

    // --- NEW: Related Products Functions ---
    function loadRelatedProducts(currentProductId, currentCategory) {
        relatedProductsGrid.innerHTML = ''; // Clear previous related products

        const relatedProducts = allProductsData.filter(product =>
            product.category === currentCategory && product.id !== currentProductId
        );

        if (relatedProducts.length === 0) {
            noRelatedProductsMessage.style.display = 'block';
            return;
        } else {
            noRelatedProductsMessage.style.display = 'none';
        }

        // Shuffle related products and limit to, say, 4 or 5 for display
        const shuffledRelated = relatedProducts.sort(() => 0.5 - Math.random());
        const displayLimit = 4; // Display up to 4 related products
        const productsToDisplay = shuffledRelated.slice(0, displayLimit);

        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card'); // Reusing existing product-card styles
            productCard.innerHTML = `
                <a href="product.html?id=${product.id}">
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                </a>
                <p class="price">$${product.price.toFixed(2)}</p>
                <button class="btn add-to-cart-btn-detail" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-stock="${product.stock}" ${product.stock <= 0 ? 'disabled' : ''}>Add to Cart</button>
            `;
            relatedProductsGrid.appendChild(productCard);

            // Add event listener for the "Add to Cart" button on related products
            const addToCartButton = productCard.querySelector('.add-to-cart-btn-detail');
            if (addToCartButton) {
                addToCartButton.addEventListener('click', (event) => {
                    const id = parseInt(addToCartButton.dataset.id);
                    const name = addToCartButton.dataset.name;
                    const price = parseFloat(addToCartButton.dataset.price);
                    const stock = parseInt(addToCartButton.dataset.stock);

                    if (window.addToCart) {
                        const success = window.addToCart(id, name, price, stock);
                        if (success) {
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
            }
        });
    }

    loadProductDetails();
});