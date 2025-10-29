import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, updateDoc, getDoc, doc, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC71wc-JkZ5ZWiD4aYAuv0Y3v_YOT_FADY",
    authDomain: "kripahomesolutions-0001.firebaseapp.com",
    projectId: "kripahomesolutions-0001",
    storageBucket: "kripahomesolutions-0001.firebasestorage.app",
    messagingSenderId: "218320673308",
    appId: "1:218320673308:web:107cb7040ee424553d5dd9",
    measurementId: "G-RLE4404QMG"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


    function extractReelId(url) {
    const match = url.match(/instagram\.com\/reel\/([^\/?]+)/);
    return match ? match[1] : null;
}

  async function loadInstagramReels() {
    const reelGallery = document.getElementById('reelGallery');
    
    if (reelGallery) {
        try {
            const reelsQuery = query(
                collection(db, "instagramReels"),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(reelsQuery);
            
            reelGallery.innerHTML = ''; // Clear the gallery
            
            if (querySnapshot.empty) {
                reelGallery.innerHTML = "<p>No reels to display.</p>";
                return;
            }

            // This loop builds the NEW iframe cards
            querySnapshot.forEach((doc) => {
                const reel = doc.data();
                const reelId = extractReelId(reel.url); // Use the helper

                if (reelId) {
                    reelGallery.innerHTML += `
                        <div class="reel-card-wrapper">
                            <iframe 
                                class="reel-iframe"
                                src="https://www.instagram.com/reel/${reelId}/embed"
                                frameborder="0" 
                                allowfullscreen
                                scrolling="no">
                            </iframe>
                        </div>
                    `;
                }
            });
            
        } catch (error) {
            console.error("Error loading Instagram reels:", error);
            reelGallery.innerHTML = "<p>Error loading reels. Please try again later.</p>";
        }
    }
}

// =IS=====================================================
//  3. SCRIPT EXECUTION
// =======================================================
// This part remains the same
document.addEventListener('DOMContentLoaded', () => {
    loadInstagramReels();
});

//youtube video load
window.videoPlayer = function() {
  return {
    // 1. Set the initial data state (loading)
    mainVideo: { 
      title: 'Loading videos...', 
      expert: 'Kripa Home Solutions', 
      videoId: '', 
      image: '' 
    },
    videos: [],

    // 2. This function is called by x-init="initVideoPlayer()"
    async initVideoPlayer() {
      try {
        
        // Create a query to get videos, newest first
        const q = query(collection(db, "youtubevideos"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        const allVideos = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allVideos.push({
            title: data.title,
            expert: data.expert,
            videoId: data.videoId,
            // Automatically create the thumbnail image URL
            image: `https://img.youtube.com/vi/${data.videoId}/0.jpg` 
          });
        });

        if (allVideos.length > 0) {
          // Set the first video as the 'mainVideo'
          this.mainVideo = allVideos.shift(); 
          // Set the rest of the videos as the 'videos' list
          this.videos = allVideos; 
        } else {
          this.mainVideo.title = "No videos found.";
        }
      } catch (error) {
        console.error("Error loading videos from Firestore:", error);
        this.mainVideo.title = "Error loading videos.";
      }
    },

    // 3. This is your 'selectVideo' function
    //    (I made a small fix to use 'videoId' for checking, as titles can be the same)
    selectVideo(video) {
      const currentMain = { ...this.mainVideo };
      const clickedVideoIndex = this.videos.findIndex(v => v.videoId === video.videoId);
      
      if (clickedVideoIndex === -1) return; // Safety check

      this.mainVideo = video; // Set the new main video
      this.videos.splice(clickedVideoIndex, 1, currentMain); // Put the old main video back in the list
    }
  };
}

async function logActivity(action, details, type = "info", user = "Admin") {
    try {
        await addDoc(collection(db, "recent_actions"), {
            action,
            details,
            type,
            user,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
}

window.scrollButton = function(galleryId, direction) {
    const gallery = document.getElementById(galleryId);
    if (!gallery) return;
    const scrollAmount = 300;
    gallery.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
};

document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById("contactForm");
    const sendButton = document.querySelector(".sendbtn");
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    const header = document.querySelector('.header');
    
    // --- Banner Slider Logic ---
    const slides = document.querySelectorAll(".banner-slide");
    const totalSlides = slides.length;
    let currentSlide = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove("active");
            if (i === index) {
                slide.classList.add("active");
            }
        });
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }
    
    if (totalSlides > 0) {
        showSlide(currentSlide);
        setInterval(nextSlide, 4000);
    }

    // --- Contact Form Submission Logic ---
    if (contactForm && sendButton) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!contactForm.checkValidity()) {
                contactForm.reportValidity();
                return;
            }
            sendButton.disabled = true;
            sendButton.innerHTML = '<span>Sending...</span>';

            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value.trim(),
                status: "Pending",
                timestamp: serverTimestamp()
            };

            let productDetails = {
                product: formData.subject,
                productid: "N/A"
            };

            try {
                await addDoc(collection(db, "enquiries"), {
                    ...formData,
                    ...productDetails
                });
                await logActivity(
                    "New User Enquiry",
                    `From ${formData.name} (Subject: ${formData.subject})`,
                    "enquiry",
                    "Client"
                );
                alert("Thank you! Your message has been sent successfully.");
                contactForm.reset();
            } catch (error) {
                console.error("Error submitting contact form:", error);
                alert("Error: Failed to send your message. Please try again later.");
            } finally {
                sendButton.disabled = false;
                sendButton.innerHTML = `
                    <div class="svg-wrapper-1">
                        <div class="svg-wrapper">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"></path>
                            </svg>
                        </div>
                    </div>
                    <span>Send Message</span>
                `;
            }
        });
    }


// --- Embla Carousel Logic ---
const emblaNode = document.querySelector('#brandCarousel');
if (emblaNode && typeof EmblaCarousel === 'function') {
    const viewportNode = emblaNode.querySelector('.embla__viewport');
    
    // 🎯 FIX 2: Ensure the viewport node exists before calling the library.
    if (viewportNode) {
        const embla = EmblaCarousel(viewportNode, {
            loop: true,
            align: 'start',
            containScroll: 'trimSnaps',
        });
        
        let autoplayInterval;
        
        function startAutoplay() { autoplayInterval = setInterval(() => { embla.scrollNext(); }, 1000); }
        function stopAutoplay() { clearInterval(autoplayInterval); }
        
        startAutoplay();
        emblaNode.addEventListener('mouseenter', stopAutoplay);
        emblaNode.addEventListener('mouseleave', startAutoplay);
        emblaNode.addEventListener('mousedown', stopAutoplay);
    }
}

    // --- Navigation Toggles ---
    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navToggle.classList.toggle("active");
            navMenu.classList.toggle("active");
        });
    }
    document.querySelectorAll('.nav-dropdown .dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggle.parentElement.classList.toggle('open');
        });
    });

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = document.querySelector(this.getAttribute('href'));
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Header Scroll Effect ---
    let lastScrollTop = 0;
    if (header) {
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            lastScrollTop = scrollTop;
        });
    }

    // --- Notification System ---
    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) { existingNotification.remove(); }
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<div class="notification-content"><span class="notification-message">${message}</span><button class="notification-close">&times;</button></div>`;

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
        document.body.appendChild(notification);

        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => { notification.remove(); });
        
        setTimeout(() => {
            if (notification.parentElement) { notification.remove(); }
        }, 5000);
    }

    // --- Lazy Loading ---
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

    // --- Fade-in Animation ---
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            }
        });
    }, observerOptions);

    const sectionsToObserve = document.querySelectorAll('.categories, .features, .testimonials, .about-story, .about-values');
    sectionsToObserve.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        observer.observe(section);
    });

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

    // --- WhatsApp Integration ---
    function openWhatsApp(message = '') {
        const phoneNumber = '919876543210';
        const baseUrl = 'https://wa.me/';
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `${baseUrl}${phoneNumber}${message ? `?text=${encodedMessage}` : ''}`;
        window.open(whatsappUrl, '_blank');
    }

    const whatsappLinks = document.querySelectorAll('.whatsapp-link, .btn-whatsapp');
    whatsappLinks.forEach(link => {
        if (!link.href.includes('wa.me')) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                openWhatsApp('Hi Kripa Home Solutions, I need help with...');
            });
        }
    });

    // --- Search Logic ---
    const searchBtn = document.getElementById("searchBtn");
    const searchInput = document.getElementById("searchInput");
    if (searchBtn && searchInput) {
        searchBtn.addEventListener("click", () => {
            const keyword = searchInput.value.trim();
            if (keyword) {
                window.location.href = `Stores/products.html?search=${encodeURIComponent(keyword)}`;
            }
        });
    }
});