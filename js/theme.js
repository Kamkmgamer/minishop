document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.getElementById('checkbox');
    const currentTheme = localStorage.getItem('theme');

    // Apply saved theme on load
    if (currentTheme) {
        document.body.classList.add(currentTheme);
        if (currentTheme === 'dark-mode') {
            toggleSwitch.checked = true;
        }
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // If no theme saved, check system preference
        document.body.classList.add('dark-mode');
        toggleSwitch.checked = true;
        localStorage.setItem('theme', 'dark-mode');
    }


    toggleSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light-mode');
        }
    });

    // Ensure cart count is updated after theme is potentially applied
    if (window.updateCartCount) {
        window.updateCartCount();
    }
});