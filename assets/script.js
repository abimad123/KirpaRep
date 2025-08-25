
function goToCategory(cat) {
  window.location.href = `category.html?cat=${cat}`;
}

const container = document.querySelector(".categories-container");
let scrollInterval;


document.addEventListener('DOMContentLoaded', function () {
    const emblaNode = document.querySelector('#brandCarousel');
    const viewportNode = emblaNode.querySelector('.embla__viewport');

    const embla = EmblaCarousel(viewportNode, {
        loop: true,
        align: 'start', // Or 'center' if you prefer
        containScroll: 'trimSnaps',
    });

   
    let autoplayInterval;

    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            embla.scrollNext();
        }, 1000); // Change speed here (1000ms = 1 second)
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Start autoplay initially
    startAutoplay();

    // Pause when user hovers or clicks
    emblaNode.addEventListener('mouseenter', stopAutoplay);
    emblaNode.addEventListener('mouseleave', startAutoplay);
    emblaNode.addEventListener('mousedown', stopAutoplay);
});



  
  // Toggle menu on mobile
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("show");
  });

  // Dropdown click toggle on mobile
  const dropdowns = document.querySelectorAll(".nav-dropdown");

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector(".dropdown-toggle");
    toggle.addEventListener("click", () => {
      dropdown.classList.toggle("open");
    });
  });

// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navToggle.contains(event.target) && !navMenu.contains(event.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });



    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;

        // Add notification to page
        document.body.appendChild(notification);

        // Handle close button
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Lazy loading for images
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        });
    }

    // Add fade-in animation to sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    }, observerOptions);

    // Observe sections for animation
    const sections = document.querySelectorAll('.categories, .features, .testimonials, .about-story, .about-values');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        observer.observe(section);
    });

    // Add CSS for fade-in animation
    if (!document.querySelector('#fade-in-styles')) {
        const style = document.createElement('style');
        style.id = 'fade-in-styles';
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // WhatsApp integration helper
    function openWhatsApp(message = '') {
        const phoneNumber = '919876543210';
        const baseUrl = 'https://wa.me/';
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `${baseUrl}${phoneNumber}${message ? `?text=${encodedMessage}` : ''}`;
        window.open(whatsappUrl, '_blank');
    }

    // Add WhatsApp click handlers
    const whatsappLinks = document.querySelectorAll('.whatsapp-link, .btn-whatsapp');
    whatsappLinks.forEach(link => {
        if (!link.href.includes('wa.me')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openWhatsApp('Hi Kripa Home Solutions, I need help with...');
            });
        }
    });
});


