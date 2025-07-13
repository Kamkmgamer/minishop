// js/modal.js

// Get modal elements
const customModal = document.getElementById('custom-alert-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');
const closeModalBtn = document.querySelector('.close-modal');

let onConfirmCallback = null; // To store a callback function for the OK button

// Function to show the custom modal
function showCustomModal(title, message, confirmCallback = null) {
    if (!customModal) { // Add a check if modal element exists
        console.error("Custom modal element not found. Cannot show modal.");
        // Fallback to native alert if modal not present (unlikely if HTML is correct)
        alert(`${title}\n\n${message}`);
        if (confirmCallback) confirmCallback(); // Still try to run callback
        return;
    }

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    onConfirmCallback = confirmCallback; // Store the callback

    customModal.classList.add('show'); // Add 'show' class to trigger CSS transition
    document.body.style.overflow = 'hidden'; // Prevent scrolling background
}

// Function to hide the custom modal
function hideCustomModal() {
    if (!customModal) return; // Add a check
    customModal.classList.remove('show');
    document.body.style.overflow = ''; // Restore scrolling
    onConfirmCallback = null; // Clear callback
}

// --- IMPORTANT: Ensure event listeners are attached when DOM is ready ---
document.addEventListener('DOMContentLoaded', () => {
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideCustomModal);
        console.log("Modal close button listener attached."); // Debug log
    } else {
        console.warn("Modal close button (.close-modal) not found.");
    }

    if (modalConfirmBtn) {
        modalConfirmBtn.addEventListener('click', () => {
            console.log("Modal OK button clicked!"); // Debug log
            hideCustomModal();
            if (onConfirmCallback) {
                onConfirmCallback(); // Execute callback if provided
            }
        });
        console.log("Modal confirm button listener attached."); // Debug log
    } else {
        console.warn("Modal confirm button (#modal-confirm-btn) not found.");
    }

    // Click outside the modal content to close
    if (customModal) {
        customModal.addEventListener('click', (event) => {
            if (event.target === customModal) {
                console.log("Clicked outside modal content."); // Debug log
                hideCustomModal();
            }
        });
    }
});


// Make showCustomModal globally accessible
window.showCustomModal = showCustomModal;