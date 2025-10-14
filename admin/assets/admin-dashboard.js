
   import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
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
    // Form & container elements
const form = document.getElementById("reel-form");
const reelInput = document.getElementById("reel-url");
const reelContainer = document.getElementById("reel-container");
const offerForm = document.getElementById("offer-form");
const offerList = document.getElementById("offer-list");

    // Pagination function
    function paginate(data, perPage, container, paginationContainer, renderItem) {
        let currentPage = 1;

        function renderPage(page) {
            currentPage = page;
            container.innerHTML = '';
            const start = (page - 1) * perPage;
            const end = start + perPage;
            data.slice(start, end).forEach(item => {
                container.appendChild(renderItem(item));
            });
            renderPagination();
        }

        function renderPagination() {
            paginationContainer.innerHTML = '';
            const totalPages = Math.ceil(data.length / perPage);
            for (let i = 1; i <= totalPages; i++) {
                const btn = document.createElement('button');
                btn.textContent = i;
                if (i === currentPage) btn.classList.add('active');
                btn.addEventListener('click', () => renderPage(i));
                paginationContainer.appendChild(btn);
            }
        }

        renderPage(1);
    }

    // Fetch products from Firestore and render
    async function loadProducts() {
        const productsRef = collection(db, "products");
        const q = query(productsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        paginate(
            products,
            20,
            document.getElementById('product-list'),
            document.getElementById('product-pagination'),
            p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${p.name || ''}</td>
                    <td>${p.modelNumber || ''}</td>
                    <td>${p.priceMRP || ''}</td>
                    <td>${p.priceSale || ''}</td>
                    <td>${p.descriptionShort || ''}</td>
                    <td>
                        <button data-id="${p.id}" class="edit-btn">Edit</button>
                        <button data-id="${p.id}" class="delete-btn">Delete</button>
                    </td>
                `;
                return tr;
            }
        );
    }

    // Run on page load
    loadProducts();



// Extract Instagram Reel ID from URL
function extractReelId(url) {
    const match = url.match(/instagram\.com\/reel\/([^\/?]+)/);
    return match ? match[1] : null;
}

// Load all reels from Firestore, newest first
async function loadReels() {
    reelContainer.innerHTML = "<p>Loading reels...</p>";
    try {
        const reelsQuery = query(
            collection(db, "instagramReels"),
            orderBy("createdAt", "desc") // Newest first
        );

        const querySnapshot = await getDocs(reelsQuery);
        reelContainer.innerHTML = "";

        if (querySnapshot.empty) {
            reelContainer.innerHTML = "<p>No reels added yet.</p>";
            return;
        }

        querySnapshot.forEach(doc => {
            const data = doc.data();
            const reelId = extractReelId(data.url);
            if (!reelId) return;

            const iframe = document.createElement("iframe");
            iframe.src = `https://www.instagram.com/reel/${reelId}/embed`;
            iframe.width = "300";
            iframe.height = "650";
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("scrolling", "no");
            iframe.setAttribute("allowfullscreen", "true");

            reelContainer.appendChild(iframe);
        });
    } catch (error) {
        console.error("Error loading reels:", error);
        reelContainer.innerHTML = "<p>Error loading reels. Check console.</p>";
    }
}
// Handle adding a new reel
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = reelInput.value.trim();

    if (!url) {
        alert("Please enter a reel URL.");
        return;
    }

    const reelId = extractReelId(url);
    if (!reelId) {
        alert("Invalid Instagram Reel URL.");
        return;
    }

    try {
        await addDoc(collection(db, "instagramReels"), {
            url: url,
            createdAt: serverTimestamp()
        });
        reelInput.value = "";
        loadReels(); // reload reels after adding
    } catch (error) {
        console.error("Error adding reel:", error);
        alert("Failed to add reel. Check console.");
    }
});
// Initial load
loadReels();

const bannerForm = document.getElementById('bannerForm');
const deleteBannerBtn = document.getElementById('deleteBannerBtn');
const statusDiv = document.getElementById('currentOfferStatus');
let activeBannerDocId = null; // Variable to store the ID of the active banner

// Function to fetch the current offer and populate the form
async function fetchCurrentOffer() {
    const bannerCollection = collection(db, "announcements");
    const now = new Date();
    
    // Create a query to find the single active banner
    const activeBannerQuery = query(
        bannerCollection, 
        where("isActive", "==", true),
        where("startDate", "<=", now),
        where("endDate", ">=", now)
    );

    const querySnapshot = await getDocs(activeBannerQuery);

    if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();

        document.getElementById('message').value = data.message;
        document.getElementById('linkURL').value = data.linkURL;
        document.getElementById('isActive').checked = data.isActive;
        document.getElementById('startDate').value = new Date(data.startDate.toDate()).toISOString().slice(0, 16);
        document.getElementById('endDate').value = new Date(data.endDate.toDate()).toISOString().slice(0, 16);
        
        // Store the document ID for editing/deleting
        activeBannerDocId = docSnap.id; 
        
        statusDiv.innerHTML = `<p><strong>Current Active Banner:</strong> ${data.message}</p>`;
    } else {
        statusDiv.innerHTML = `<p><strong>No active banner offer found.</strong></p>`;
        // Clear the form if no active banner is found
        bannerForm.reset();
        activeBannerDocId = null;
    }
}

// Function to save/update the offer
async function saveOffer() {
    const message = document.getElementById('message').value;
    const linkURL = document.getElementById('linkURL').value;
    const isActive = document.getElementById('isActive').checked;
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);

    // If an active banner exists, update it. Otherwise, create a new one.
    const bannerDocRef = activeBannerDocId ? doc(db, 'announcements', activeBannerDocId) : doc(collection(db, 'announcements'));

    try {
        await setDoc(bannerDocRef, {
            message,
            linkURL,
            isActive,
            startDate,
            endDate
        });
        alert('Banner offer saved successfully!');
        fetchCurrentOffer(); // Refresh status
    } catch (e) {
        console.error('Error saving document: ', e);
        alert('Failed to save offer. Check console for details.');
    }
}

// Function to delete the offer
async function deleteOffer() {
    if (!activeBannerDocId) {
        alert('No active banner to delete.');
        return;
    }

    if (confirm('Are you sure you want to delete the current banner offer?')) {
        try {
            await deleteDoc(doc(db, 'announcements', activeBannerDocId));
            alert('Banner offer deleted successfully!');
            fetchCurrentOffer(); // Refresh status
        } catch (e) {
            console.error('Error deleting document: ', e);
            alert('Failed to delete offer. Check console for details.');
        }
    }
}

// Event listeners
bannerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    saveOffer();
});

deleteBannerBtn.addEventListener('click', deleteOffer);

// Initial call to fetch the offer on page load
window.onload = fetchCurrentOffer;