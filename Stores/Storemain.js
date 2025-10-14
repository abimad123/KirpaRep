const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

navToggle.addEventListener("click", () => {
  navToggle.classList.toggle("active");
  navMenu.classList.toggle("active");
});

document.querySelectorAll('.nav-dropdown .dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const parent = toggle.parentElement;
    parent.classList.toggle('open');
  });
});

const dropdownToggle = document.querySelector('.dropdown-toggle');

dropdownToggle.addEventListener('click', function () {
  this.classList.toggle('active');
});



// Category Card Click Handlers
const categoryCards = document.querySelectorAll('.category-card');
categoryCards.forEach(card => {
    card.addEventListener('click', () => {
        const category = card.getAttribute('data-category');
        // In a real application, this would navigate to a products page
        console.log(`Navigate to products.html?category=hardware&subcategory=${category}`);
        
        // Add visual feedback
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);
    });

    // Add keyboard support
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
        }
    });

    // Make cards focusable
    card.setAttribute('tabindex', '0');
});

// Product Card Buttons
const productButtons = document.querySelectorAll('.product-btn');
productButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const productCard = button.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        
        // Add loading state
        const originalText = button.textContent;
        button.textContent = 'Loading...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
            console.log(`View product: ${productName}`);
        }, 800);
    });
});

// Hero CTA Button
const heroBtn = document.querySelector('.hero-btn');
heroBtn.addEventListener('click', () => {
    // Smooth scroll to categories section
    document.getElementById('categories').scrollIntoView({
        behavior: 'smooth'
    });
});

// CTA Section Button
const ctaBtn = document.querySelector('.cta-btn');
ctaBtn.addEventListener('click', () => {
    // In a real application, this would navigate to contact page
    console.log('Navigate to contact.html');
    
    // Show a mock contact modal or message
    showNotification('Contact form will open here in a real application!');
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #fff;
        color: #333;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        border-left: 4px solid #3498db;
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        float: right;
        margin-left: 10px;
        color: #666;
    `;
    
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Smooth scrolling for navigation links
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

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#ffffff';
        navbar.style.backdropFilter = 'none';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observe sections for animations
const sections = document.querySelectorAll('.categories, .featured-products, .why-choose-us, .cta-section');
sections.forEach(section => {
    observer.observe(section);
});

// Add loading states and micro-interactions
document.addEventListener('DOMContentLoaded', () => {
    // Add ripple effect to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.6);
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                this.removeChild(ripple);
            }, 600);
        });
    });
    
    // Add CSS for ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
        
        .fade-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .categories, .featured-products, .why-choose-us, .cta-section {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
    `;
    document.head.appendChild(style);
});

// Performance optimization: Lazy loading for images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    // Observe all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));
}

// Search functionality (mock)
function initSearch() {
    const searchContainer = document.createElement('div');
    searchContainer.innerHTML = `
        <div class="search-overlay" id="search-overlay">
            <div class="search-modal">
                <input type="text" id="search-input" placeholder="Search for products..." />
                <button id="search-close">&times;</button>
                <div class="search-results" id="search-results"></div>
            </div>
        </div>
    `;
    
    const searchStyles = `
        .search-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 10001;
            display: none;
            align-items: center;
            justify-content: center;
        }
        
        .search-modal {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            position: relative;
        }
        
        .search-modal input {
            width: 100%;
            padding: 1rem;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1.1rem;
            margin-bottom: 1rem;
        }
        
        .search-modal input:focus {
            outline: none;
            border-color: var(--primary-color);
        }
        
        #search-close {
            position: absolute;
            top: 10px;
            right: 15px;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = searchStyles;
    document.head.appendChild(styleSheet);
    document.body.appendChild(searchContainer);
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', initSearch);