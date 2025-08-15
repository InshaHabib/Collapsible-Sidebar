// DOM Elements
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleBtn');
const navLinks = document.querySelectorAll('.nav-link');

// State management
let isCollapsed = false;
let isMobile = window.innerWidth <= 768;

// Initialize sidebar state
function initSidebar() {
    // Check if we're on mobile
    if (isMobile) {
        sidebar.classList.add('mobile');
        sidebar.classList.remove('collapsed');
    } else {
        sidebar.classList.remove('mobile');
        // Start with sidebar open on desktop
        sidebar.classList.remove('collapsed');
    }
}

// Toggle sidebar function
function toggleSidebar() {
    if (isMobile) {
        // Mobile behavior: slide in/out
        if (sidebar.classList.contains('open')) {
            closeMobileSidebar();
        } else {
            openMobileSidebar();
        }
    } else {
        // Desktop behavior: collapse/expand
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            toggleBtn.setAttribute('aria-label', 'Expand sidebar');
        } else {
            sidebar.classList.remove('collapsed');
            toggleBtn.setAttribute('aria-label', 'Collapse sidebar');
        }
    }
}

// Mobile sidebar functions
function openMobileSidebar() {
    sidebar.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    toggleBtn.setAttribute('aria-label', 'Close sidebar');
}

function closeMobileSidebar() {
    sidebar.classList.add('closing');
    document.body.style.overflow = ''; // Restore scrolling
    
    setTimeout(() => {
        sidebar.classList.remove('open', 'closing');
        toggleBtn.setAttribute('aria-label', 'Open sidebar');
    }, 300); // Match animation duration
}

// Handle window resize
function handleResize() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768;
    
    if (wasMobile !== isMobile) {
        // Reset sidebar state when switching between mobile and desktop
        if (isMobile) {
            sidebar.classList.add('mobile');
            sidebar.classList.remove('collapsed', 'open', 'closing');
            document.body.style.overflow = '';
        } else {
            sidebar.classList.remove('mobile', 'open', 'closing');
            sidebar.classList.remove('collapsed'); // Start open on desktop
        }
    }
}

// Close mobile sidebar when clicking outside
function handleOutsideClick(event) {
    if (isMobile && sidebar.classList.contains('open')) {
        // Check if click is outside the sidebar
        if (!sidebar.contains(event.target) && !toggleBtn.contains(event.target)) {
            closeMobileSidebar();
        }
    }
}

// Handle escape key
function handleKeydown(event) {
    if (event.key === 'Escape' && isMobile && sidebar.classList.contains('open')) {
        closeMobileSidebar();
    }
}

// Add hover effects for desktop
function addHoverEffects() {
    if (!isMobile) {
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                if (sidebar.classList.contains('collapsed')) {
                    // Show tooltip for collapsed state
                    const text = this.querySelector('.nav-text').textContent;
                    this.setAttribute('title', text);
                }
            });
        });
    }
}

// Remove hover effects for mobile
function removeHoverEffects() {
    navLinks.forEach(link => {
        link.removeAttribute('title');
    });
}

// Enhanced navigation link functionality
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Close mobile sidebar after navigation
            if (isMobile) {
                closeMobileSidebar();
            }
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Add loading animation
function addLoadingAnimation() {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Performance optimization: Debounce resize handler
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event Listeners
toggleBtn.addEventListener('click', toggleSidebar);
window.addEventListener('resize', debounce(handleResize, 250));
document.addEventListener('click', handleOutsideClick);
document.addEventListener('keydown', handleKeydown);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    setupNavigation();
    addLoadingAnimation();
    
    // Set initial aria-label
    toggleBtn.setAttribute('aria-label', isMobile ? 'Open sidebar' : 'Collapse sidebar');
    
    // Add accessibility attributes
    sidebar.setAttribute('role', 'navigation');
    sidebar.setAttribute('aria-label', 'Main navigation');
    
    navLinks.forEach((link, index) => {
        link.setAttribute('role', 'menuitem');
        link.setAttribute('tabindex', '0');
    });
});

// Handle hover effects based on device type
window.addEventListener('resize', debounce(() => {
    if (isMobile) {
        removeHoverEffects();
    } else {
        addHoverEffects();
    }
}, 250));

// Add smooth scroll behavior for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add touch support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0 && touchStartX < 50) {
            // Swipe right from left edge - open sidebar
            if (isMobile && !sidebar.classList.contains('open')) {
                openMobileSidebar();
            }
        } else if (swipeDistance < 0 && sidebar.classList.contains('open')) {
            // Swipe left - close sidebar
            closeMobileSidebar();
        }
    }
}

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        // Ensure focus is trapped within sidebar when open on mobile
        if (isMobile && sidebar.classList.contains('open')) {
            const focusableElements = sidebar.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
});

// Add intersection observer for performance
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards for lazy loading effect
document.querySelectorAll('.card').forEach(card => {
    observer.observe(card);
});

console.log('Collapsible Sidebar initialized successfully! 🎉'); 