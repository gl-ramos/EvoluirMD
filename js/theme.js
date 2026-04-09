/**
 * ========================================
 * EVOLUIRMD - MÓDULO DE TEMA (DARK/LIGHT MODE)
 * ========================================
 */

function setupThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    
    if (!themeToggleBtn) return;
    
    themeToggleBtn.addEventListener('click', () => {
        // Toggle class
        document.documentElement.classList.toggle('dark');
        
        // Save preference
        if (document.documentElement.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });
}

// Ensure the setup runs after DOM is loaded, or when called by the main init
window.setupThemeToggle = setupThemeToggle;

// Add event listener here as fallback/direct run
document.addEventListener('DOMContentLoaded', setupThemeToggle);
