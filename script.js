// Function to set theme and update UI
function setTheme(theme) {
    const html = document.documentElement;
    const toggle = document.querySelector('.theme-switch input');
    
    // Remove any existing theme classes
    html.classList.remove('light-mode', 'dark-mode');
    
    // Add the new theme class if it's not 'system'
    if (theme !== 'system') {
        html.classList.add(`${theme}-mode`);
    }
    
    // Update toggle state
    if (toggle) {
        toggle.checked = theme === 'system' 
            ? window.matchMedia('(prefers-color-scheme: dark)').matches 
            : theme === 'dark';
    }
    
    // Save preference
    localStorage.setItem('theme', theme);
}

// Function to handle toggle changes
function toggleDarkMode() {
    const toggle = document.querySelector('.theme-switch input');
    const currentTheme = localStorage.getItem('theme') || 'system';
    
    if (currentTheme === 'system') {
        // If currently using system theme, switch to manual mode
        setTheme(toggle.checked ? 'dark' : 'light');
    } else {
        // If using manual theme, switch to system theme
        setTheme('system');
    }
}

// Function to initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('theme') === 'system') {
            const toggle = document.querySelector('.theme-switch input');
            if (toggle) {
                toggle.checked = e.matches;
            }
        }
    });
}

// Add this function to load the navigation bar
async function loadNavBar() {
    const response = await fetch('nav.html');
    const navHtml = await response.text();
    document.body.insertAdjacentHTML('afterbegin', navHtml);
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadNavBar();
    initTheme();
});

// Add this class to your CSS 