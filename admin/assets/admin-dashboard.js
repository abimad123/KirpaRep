
    // Firebase imports
    import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
    import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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

offerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("offer-title").value.trim();
  const description = document.getElementById("offer-description").value.trim();
  const image = document.getElementById("offer-image").value.trim();
  const discount = document.getElementById("offer-discount").value.trim();
  const validUntil = document.getElementById("offer-valid-until").value;
  const link = document.getElementById("offer-link").value.trim();

  try {
    await addDoc(collection(db, "offers"), {
      title,
      description,
      image,
      discount,
      validUntil,
      link: link || null,
      createdAt: serverTimestamp()
    });

    offerForm.reset();
    loadOffers();
  } catch (error) {
    console.error("Error adding offer:", error);
  }
});

// Load offers
async function loadOffers() {
  offerList.innerHTML = "";
  const snapshot = await getDocs(collection(db, "offers"));
  snapshot.forEach((docSnap) => {
    const offer = docSnap.data();
    const li = document.createElement("li");

    li.innerHTML = `
      <img src="${offer.image}" alt="${offer.title}" width="50">
      <strong>${offer.title}</strong> - ${offer.discount} off (Valid until: ${offer.validUntil})
      ${offer.link ? `<a href="${offer.link}" target="_blank">View Offer</a>` : ""}
      <button data-id="${docSnap.id}" class="delete-offer">Delete</button>
    `;

    offerList.appendChild(li);
  });

  // Delete offer
  document.querySelectorAll(".delete-offer").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "offers", btn.dataset.id));
      loadOffers();
    });
  });
}
loadOffers();

