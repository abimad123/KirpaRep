import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, 
            query, orderBy, serverTimestamp, deleteDoc, 
            updateDoc, getDoc, doc, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

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
        const auth = getAuth(app); 

      onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html'; 
    }
});

const logoutLink = document.getElementById('logout-link');

if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault(); 
        signOut(auth).then(() => {
            
            console.log('User signed out successfully.');
            
            window.location.href = 'login.html'; 
        }).catch((error) => {
            console.error('Sign out error:', error);
            alert('Failed to sign out. Please try again.');
        });
    });
}


async function loadProductCount() {
    const valueElement = document.getElementById("total-products-value");
    
    if (!valueElement) return;

    valueElement.textContent = "Loading...";
    try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        
        const productCount = productsSnapshot.size;
        valueElement.textContent = productCount.toLocaleString();

    } catch (error) {
        console.error("Error loading product count:", error);
        valueElement.textContent = "Error";
    }
}

loadProductCount();

async function deleteEnquiry(docId) {
    if (!confirm("Permanently delete this enquiry?")) return;
    try {
        const enquiriesTableBody = document.getElementById("enquiriesTableBody");
        enquiriesTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center;">Deleting...</td></tr>`;
        
        await deleteDoc(doc(db, "enquiries", docId));
        loadEnquiries();
    } catch (error) {
        console.error("Error deleting enquiry:", error);
    }
}

async function markEnquiryAsRead(docId) {
    const enquiriesTableBody = document.getElementById("enquiriesTableBody");
    if (enquiriesTableBody) {
        enquiriesTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center;">Marking as read...</td></tr>`;
    }

    try {
        const enquiryRef = doc(db, "enquiries", docId);
        await updateDoc(enquiryRef, {
            status: "Read"
        });

        await logActivity("Enquiry Marked Read", `Enquiry ID: ${docId}`, "read"); 
        
        loadEnquiries(); 
        
    } catch (error) {
        console.error("Error marking enquiry as read:", error);
        alert("Failed to mark enquiry as read. Check console.");
        loadEnquiries();
    }
}

async function loadEnquiries() {
    const enquiriesTableBody = document.getElementById("enquiriesTableBody");
    const enquiriesCount = document.getElementById("enquiries-count"); 

    if (!enquiriesTableBody) return; 

    enquiriesTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center;">Loading user enquiries...</td></tr>`;

    try {
        const q = query(collection(db, "enquiries"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        
        enquiriesTableBody.innerHTML = "";
        let count = 0;

        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const docId = docSnapshot.id;
            count++;

            const timestamp = data.timestamp?.toDate().toLocaleString() || "N/A";
            const statusClass = data.status === "Pending" ? "status-pending" : "status-read";
            const replyBody = `
---Message from ${data.name} ---
Product ID: ${data.productid || 'N/A'}
Subject: ${data.subject || 'N/A'}
Message:
${data.message || 'No message provided.'}
----------------------------------------

Hi ${data.name.split(' ')[0] || 'there'},

Thank you for your enquiry. We are writing to you regarding: [INSERT YOUR REPLY HERE].

`;
            const encodedBody = encodeURIComponent(replyBody.trim());
            const subjectLine = `Re: Your Enquiry about ${data.product || data.subject || 'Our Products'}`;
            const encodedSubject = encodeURIComponent(subjectLine);
            
            const gmailReplyUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${data.email}&su=${encodedSubject}&body=${encodedBody}`;

            
            const row = `
                <tr class="group" data-doc-id="${docId}">
                    <td class="font-medium">${data.name || "-"}</td>
                    <td>${data.email || "-"}</td>
                    <td>${data.phone || "N/A"}</td>
                    <td>${data.product || "N/A"}</td>
                    <td>${data.productid || "N/A"}</td>
                    <td class="max-w-xs overflow-hidden text-ellipsis">${data.message || "-"}</td>
                    <td><span class="${statusClass}">${data.status || "Pending"}</span></td>
                    <td>${timestamp}</td>
                    <td>
                        <div class="actions-column">
                            <button class="read" data-doc-id="${docId}"><span class="material-symbols-outlined" style="font-size: 1rem;">mark_email_read</span></button>
                            
                            <a href="${gmailReplyUrl}" class="reply" target="_blank"><span class="material-symbols-outlined" style="font-size: 1rem;">reply</span></a>
                            
                            <button class="delete" data-doc-id="${docId}"><span class="material-symbols-outlined" style="font-size: 1rem;">delete</span></button>
                        </div>
                    </td>
                </tr>
            `;
            enquiriesTableBody.innerHTML += row;
        });

        if (enquiriesCount) {
             enquiriesCount.textContent = `Showing ${count} results`;
        }
       
        if (count === 0) {
            enquiriesTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center;">No enquiries found.</td></tr>`;
        }

    } catch (error) {
        console.error("Error loading user enquiries:", error);
        enquiriesTableBody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: red;">Error loading data. Check console.</td></tr>`;
    }
}
const enquiriesTableBody = document.getElementById("enquiriesTableBody");
if (enquiriesTableBody) {
    enquiriesTableBody.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button');

        if (targetButton) {
            const docId = targetButton.getAttribute('data-doc-id');
            if (!docId) return;
            if (targetButton.classList.contains('delete')) {
                deleteEnquiry(docId); 
            } else if (targetButton.classList.contains('read')) {
                markEnquiryAsRead(docId);
            }
        }
    });
}

loadEnquiries();

const productsTableBody = document.getElementById("productsTableBody");
const addProductForm = document.getElementById("add-product-form");
const productSubmitButton = document.getElementById("product-submit-button");
const editDocIdInput = document.getElementById("edit-doc-id");

async function editProduct(docId) {
    console.log("Editing product with ID:", docId);
    try {
        const productSubmitButton = document.getElementById("product-submit-button");
        const editDocIdInput = document.getElementById("edit-doc-id");
        const addProductForm = document.getElementById("add-product-form");

        if (!productSubmitButton || !editDocIdInput || !addProductForm) {
            console.error("Form elements not found for editing.");
            alert("Error: Could not find necessary form elements.");
            return;
        }

        const productRef = doc(db, "products", docId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
            const data = productSnap.data();
            document.getElementById('product-name').value = data.name || '';
            document.getElementById('product-id').value = data.productId || '';
            document.getElementById('product-brand').value = data.brand || '';
            document.getElementById('product-priceMRP').value = data.priceMRP || ''; 
            document.getElementById('product-priceSale').value = data.priceSale || '';
            document.getElementById('product-description').value = data.description || '';
            document.getElementById('product-modelNumber').value = data.modelNumber || '';
            document.getElementById('product-category').value = data.category || '';
            document.getElementById('product-subCategory').value = data.subCategory || '';
            document.getElementById('product-stockQty').value = data.stockQty || '';
            document.getElementById('product-inStock').value = data.inStock === true ? 'true' : 'false';
            document.getElementById('product-descriptionShort').value = data.descriptionShort || '';
            document.getElementById('product-highlights').value = (data.highlights || []).join(', '); 
            document.getElementById('product-hsn').value = data.hsn || '';
            document.getElementById('product-gstRate').value = data.gstRate || '';
            document.getElementById('product-dimensionsCm').value = data.dimensionsCm || '';
            document.getElementById('product-searchKeywords').value = (data.searchKeywords || []).join(', ');
            document.getElementById('product-tags').value = (data.tags || []).join(', ');
            document.getElementById('product-status').value = data.status || 'active';


            editDocIdInput.value = docId;
            productSubmitButton.textContent = "Update Product";
            addProductForm.scrollIntoView({ behavior: 'smooth' });

        } else {
            alert("Product not found.");
        }
    } catch (error) {
        console.error("Error fetching product for edit:", error);
        alert("Failed to load product details for editing.");
    }
}

async function deleteProduct(docId) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
        const productRef = doc(db, "products", docId);
        await deleteDoc(productRef);
        await logActivity("Product Deleted", `Product ID: ${docId}`, "delete");
        loadProducts();
    } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Check console.");
    }
}

async function loadProducts() {
    if (!productsTableBody) return;
    productsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Loading products...</td></tr>`;
    try {
        const productsQuery = query(collection(db, "products"), orderBy("name", "asc"));
        const querySnapshot = await getDocs(productsQuery);
        productsTableBody.innerHTML = "";
        let count = 0;

        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const docId = docSnapshot.id;
            count++;
            const salePriceFormatted = `₹${Number(data.salePrice || 0).toLocaleString('en-IN')}`;
            const row = `
                <tr data-doc-id="${docId}">
                    <td>${data.name || "N/A"}</td>
                    <td>${data.productId || docId}</td>
                    <td>${data.priceSale}</td>
                    <td>
                        <div class="actions-column product-actions">
                            <button class="edit-product" data-doc-id="${docId}"><span class="material-symbols-outlined" style="font-size: 1.125rem;">edit</span></button>
                            <button class="delete-product" data-doc-id="${docId}"><span class="material-symbols-outlined" style="font-size: 1.125rem;">delete</span></button>
                        </div>
                    </td>
                </tr>
            `;
            productsTableBody.innerHTML += row;
        });

        if (count === 0) {
            productsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No products found. Add one using the form.</td></tr>`;
        }
    } catch (error) {
        console.error("Error loading products:", error);
        productsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Error loading products. Check console.</td></tr>`;
    }
}

if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!addProductForm.checkValidity()) {
             addProductForm.reportValidity();
             return;
        }

        productSubmitButton.disabled = true;
        const originalButtonText = productSubmitButton.textContent;
        productSubmitButton.textContent = "Processing...";

        const productData = {
            name: document.getElementById('product-name').value.trim(),
            productId: document.getElementById('product-id').value.trim(),
            brand: document.getElementById('product-brand').value.trim(),
            modelNumber: document.getElementById('product-modelNumber').value.trim(),
            category: document.getElementById('product-category').value.trim(),
            subCategory: document.getElementById('product-subCategory').value.trim(),
            priceMRP: parseFloat(document.getElementById('product-priceMRP').value) || 0,
            priceSale: parseFloat(document.getElementById('product-priceSale').value) || 0,
            stockQty: parseInt(document.getElementById('product-stockQty').value) || 0,
            inStock: document.getElementById('product-inStock').value === 'true',
            descriptionShort: document.getElementById('product-descriptionShort').value.trim(),
            description: document.getElementById('product-description').value.trim(), 
            highlights: document.getElementById('product-highlights').value.split(',').map(s => s.trim()).filter(s => s), 
            hsn: document.getElementById('product-hsn').value.trim(),
            gstRate: parseFloat(document.getElementById('product-gstRate').value) || 0,
            dimensionsCm: document.getElementById('product-dimensionsCm').value.trim(),
            searchKeywords: document.getElementById('product-searchKeywords').value.split(',').map(s => s.trim()).filter(s => s),
            tags: document.getElementById('product-tags').value.split(',').map(s => s.trim()).filter(s => s),
            status: document.getElementById('product-status').value,
        };

        const currentEditDocId = editDocIdInput.value;

        try {
            if (currentEditDocId) {
                const productRef = doc(db, "products", currentEditDocId);
                await updateDoc(productRef, {
                    ...productData,
                    lastUpdatedAt: serverTimestamp() 
                });
                await logActivity("Product Updated", `ID: ${productData.productId || currentEditDocId}`, "edit");
                alert("Product updated successfully!");

            } else {
                await addDoc(collection(db, "products"), {
                    ...productData,
                    createdAt: serverTimestamp() 
                });
                await logActivity("Product Added", `ID: ${productData.productId || 'N/A'}`, "add");
                alert("Product added successfully!");
            }
            
            addProductForm.reset(); 
            editDocIdInput.value = ""; 
            productSubmitButton.textContent = "Add Product"; 
            loadProducts(); 

        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product. Check console.");
            productSubmitButton.textContent = originalButtonText; 

        } finally {
            productSubmitButton.disabled = false; 
        }
    });
}

if (productsTableBody) {
    productsTableBody.addEventListener('click', (e) => {
        const editButton = e.target.closest('.edit-product');
        const deleteButton = e.target.closest('.delete-product');
        if (editButton) {
            const docId = editButton.getAttribute('data-doc-id');
            editProduct(docId);
        } else if (deleteButton) {
            const docId = deleteButton.getAttribute('data-doc-id');
            deleteProduct(docId);
        }
    });
}

const searchInput = document.getElementById("product-search-input");

if (searchInput && productsTableBody) {
    searchInput.addEventListener('input', function() {
         const searchTerm = this.value.toLowerCase().trim();
         const rows = productsTableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const productNameCell = row.querySelector('td:nth-child(1)');
            const productIdCell = row.querySelector('td:nth-child(2)');

            if (productNameCell && productIdCell) {
                const productName = productNameCell.textContent.toLowerCase();
                const productId = productIdCell.textContent.toLowerCase();

                const isMatch = productName.includes(searchTerm) || productId.includes(searchTerm);

                if (isMatch) {
                    row.style.display = ''; 
                } else {
                    row.style.display = 'none';
                }
            }
        });
    });
}

loadProducts();


const activityListBody = document.getElementById("activity-list-body");

if (activityListBody) {
    const recentQuery = query(collection(db, "recent_actions"), orderBy("timestamp", "desc"), limit(10));
    
    onSnapshot(recentQuery, (snapshot) => {
        activityListBody.innerHTML = ""; // Clear list

        if (snapshot.empty) {
            activityListBody.innerHTML = `<tr><td colspan="10" style="text-align: center;">No recent actions recorded.</td></tr>`;
            return;
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            const time = data.timestamp?.toDate().toLocaleDateString() || "Just now";
            
            // ---!! HERE IS THE FIX !! ---
            // We now read from 'data.status' instead of 'data.type'
            let statusText = data.status; // Get the status we saved
            let statusClass = "status-badge";
            
            if (data.status === "success") {
                statusText = "Success";
                statusClass += " added"; 
            } else if (data.status === "deleted") {
                statusText = "Deleted";
                statusClass += " deleted";
            } else {
                // A fallback for any other status
                statusText = data.status || data.type || "Info"; 
                statusClass += " info"; 
            }
            
            const row = document.createElement("tr");
            row.classList.add('group');
            row.innerHTML = `
                <td class="font-medium">${data.action || 'N/A'}</td>
                <td>${data.user || 'N/A'}</td>
                <td>${data.item || data.details || 'N/A'}</td> 
                <td>${time}</td>
                <td><span class="${statusClass}">${statusText}</span></td>
            `;
            activityListBody.appendChild(row);
        });
    });
}



// =======================================================
//  3. GLOBAL HELPER FUNCTIONS
// =======================================================

/**
 * Logs an action to the 'recent_actions' collection in Firestore.
 * This is the SINGLE function for all activity logging.
 */
async function logRecentActivity(action, item, status) {
  try {
    await addDoc(collection(db, "recent_actions"), {
      action: action,     // "add" or "delete"
      item: item,         // "YouTube: ..." or "Reel: ..."
      user: "Admin",      // Hardcoded "Admin"
      status: status,     // "success" or "deleted"
      timestamp: serverTimestamp()
    });
    console.log("Activity logged successfully.");
  } catch (error) {
    console.error("Error logging activity: ", error);
  }
}

/**
 * Helper function to extract ID from any YouTube URL.
 */
function getYouTubeID(url) {
  if (!url) return '';
  const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return (match && match[1]) ? match[1] : '';
}

/**
 * Helper function to extract ID from any Instagram URL.
 */
function extractReelId(url) {
    const match = url.match(/instagram\.com\/reel\/([^\/?]+)/);
    return match ? match[1] : null;
}


// =======================================================
//  4. DASHBOARD PAGE
// =======================================================
function initDashboardPage() {
    console.log("Dashboard Page Initialized");
    
    /**
     * --- FIX 2 ---
     * This function now runs ONLY on the dashboard.
     */
    async function loadReelsCount() {
        const valueElement = document.getElementById("total-reels-value");
        const statusElement = document.getElementById("reels-change-status");
        
        if (!valueElement || !statusElement) return; // This is fine now

        valueElement.textContent = "Loading...";
        statusElement.textContent = "";

        try {
            const reelsSnapshot = await getDocs(collection(db, "instagramReels"));
            const reelCount = reelsSnapshot.size;

            const recentQuery = query(
                collection(db, "instagramReels"),
                orderBy("createdAt", "desc"),
                limit(1)
            );
            const recentSnapshot = await getDocs(recentQuery);
            
            valueElement.textContent = reelCount.toLocaleString();

            if (recentSnapshot.size > 0) {
                const recentData = recentSnapshot.docs[0].data();
                const lastUpdatedTime = recentData.createdAt?.toDate().toLocaleString() || "N/A";
                statusElement.textContent = `Last added: ${lastUpdatedTime}`;
                // statusElement.style.color = "var(--color-primary)"; // You can add colors
            } else {
                statusElement.textContent = "No reels added yet.";
                // statusElement.style.color = "var(--color-gray-500)";
            }

        } catch (error) {
            console.error("Error loading reels count:", error);
            valueElement.textContent = "Error";
            statusElement.textContent = "Data error";
            // statusElement.style.color = "var(--color-error)";
        }
    }
    
    // --- Initial Load for Dashboard ---
    loadReelsCount();
    // ... add your other dashboard functions here (e.g., loadEnquiryCount)
}

// =======================================================
//  5. INSTAGRAM REELS PAGE
// =======================================================
function initReelsPage() {
    console.log("Instagram Reels Page Initialized");
    
    // Get elements
    const form = document.getElementById("new-reel-form");
    const reelInput = document.getElementById("reel-url-input");
    const reelContainer = document.getElementById("reel-cards-container");

    if (!form || !reelInput || !reelContainer) {
        console.error("Reels page elements not found. Stopping init.");
        return;
    }

 

   async function deleteReel(docId) {
        if (!confirm("Are you sure you want to delete this reel?")) {
            return;
        }
        try {
            const docRef = doc(db, "instagramReels", docId);
            const docSnap = await getDoc(docRef);
            const reelUrl = docSnap.exists() ? docSnap.data().url : `ID: ${docId}`;
            
            await deleteDoc(docRef);
            
            // --- FIX 1 ---
            // Use the new logger with the correct fields
            await logRecentActivity("delete", `Reel: ${reelUrl.substring(0, 40)}...`, 'deleted'); 
            
            console.log(`Reel ${docId} deleted successfully.`);
            loadReels(); // Reload the list
        } catch (error) {
            console.error("Error deleting reel:", error);
            alert("Failed to delete reel. Check console.");
        }
    }

    async function loadReels() {
        reelContainer.innerHTML = "<p>Loading reels...</p>"; // This will now appear
        try {
            const reelsQuery = query(
                collection(db, "instagramReels"),
                orderBy("createdAt", "desc") 
            );

            const querySnapshot = await getDocs(reelsQuery);
            reelContainer.innerHTML = ""; // Clear container

            if (querySnapshot.empty) {
                reelContainer.innerHTML = "<p>No reels added yet.</p>";
                return;
            }

            querySnapshot.forEach(docSnapshot => {
                const data = docSnapshot.data();
                const docId = docSnapshot.id;
                const reelId = extractReelId(data.url);
                
                if (!reelId) return;
                
                const card = document.createElement('div');
                card.className = 'reel-card group';
                card.innerHTML = `
                    <div class="reel-iframe-wrapper">
                        <iframe 
                            allowtransparency="true" 
                            class="w-full h-full object-cover" 
                            frameborder="0" 
                            scrolling="no" 
                            src="https://www.instagram.com/reel/${reelId}/embed"
                            width="100%"
                            height="100%"
                            allowfullscreen="true"
                        ></iframe>
                    </div>
                    <button class="reel-delete-button" data-id="${docId}">
                        <span class="material-symbols-outlined" style="font-size: 1rem;">delete</span>
                    </button>
                `;
                reelContainer.appendChild(card);
            });

        } catch (error) {
            console.error("Error loading reels:", error);
            reelContainer.innerHTML = "<p>Error loading reels. Check console.</p>";
        }
    }

    // --- Event Listeners for Reels Page ---
    
    // Add new reel
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const url = reelInput.value.trim();
        if (!url) {
            alert("Please enter a reel URL.");
            return;
        }
        const reelId = extractReelId(url);
        if (!reelId) {
            alert("Invalid Instagram Reel URL. Please use the 'instagram.com/reel/...' format.");
            return;
        }

        try {
            const docRef = await addDoc(collection(db, "instagramReels"), {
                url: url,
                createdAt: serverTimestamp()
            });
            
            // --- FIX 1 ---
            // Use the new logger with the correct fields
            await logRecentActivity("Added", `Reel: ${reelId}`, 'success');
            
            reelInput.value = "";
            loadReels(); // Reload list
        } catch (error) {
            console.error("Error adding reel:", error);
            alert("Failed to add reel. Check console.");
        }
    });

    // Delete reel (using event delegation)
    reelContainer.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.reel-delete-button');
        if (deleteBtn) {
            const docId = deleteBtn.dataset.id;
            if (docId) {
                deleteReel(docId);
            }
        }
    });

 
    // loadReelsCount() has been REMOVED from here.
    loadReels(); // This will now run correctly.
}

// =======================================================
//  6. YOUTUBE VIDEOS PAGE
// =======================================================
function initYouTubePage() {
  console.log("YouTube Page Initialized");
  const form = document.getElementById('add-video-form');
  const list = document.getElementById('video-preview-list');

  if (!form || !list) {
    console.error("YouTube page elements not found. Stopping init.");
    return;
  }

  // --- Auto-extract YouTube ID from Link ---
  const videoLinkInput = document.getElementById('video-link');
  const videoIdInput = document.getElementById('video-id');
  if (videoLinkInput && videoIdInput) {
    videoLinkInput.addEventListener('input', () => {
      const url = videoLinkInput.value;
      const videoId = getYouTubeID(url);
      if (videoId) {
        videoIdInput.value = videoId;
      }
    });
  }

  // --- YouTube Page Functions ---
  async function loadYouTubeVideos() {
    const list = document.getElementById('video-preview-list');
    if (!list) return; 
    list.innerHTML = '<p>Loading videos...</p>';
    
    try {
      const q = query(collection(db, "youtubevideos"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      list.innerHTML = '';
      
      if (querySnapshot.empty) {
        list.innerHTML = '<p>No videos have been added yet.</p>';
        return;
      }
      
      querySnapshot.forEach((doc) => {
        const video = doc.data();
        const docId = doc.id;
        const card = document.createElement('div');
        card.className = 'video-card';
        const embedUrl = `https://www.youtube.com/embed/${video.videoId}`;
        
        card.innerHTML = `
          <button class="delete-video-btn" data-id="${docId}">×</button>
          <iframe 
            class="video-card-embed" 
            src="${embedUrl}" 
            title="${video.title}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
          <div class="video-card-info">
            <h3>${video.title}</h3>
            <p><strong>Expert:</strong> ${video.expert}</p>
            <p><strong>ID:</strong> ${video.videoId}</p>
            <a href="${video.link}" target="_blank" rel="noopener noreferrer">Watch on YouTube</a>
          </div>
        `;
        list.appendChild(card);
      });
      
    } catch (error) {
      console.error("Error loading videos: ", error);
      list.innerHTML = '<p>Error loading videos. Check the console.</p>';
    }
  }

  // --- Event Listeners for YouTube Page ---

  // 1. Add Video Form Listener
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    const title = document.getElementById('video-title').value;
    const expert = document.getElementById('video-expert').value;
    const videoId = document.getElementById('video-id').value;
    const link = document.getElementById('video-link').value;
    
    if (!videoId || videoId.trim() === "") {
        alert("Video ID is empty. Please check the YouTube link.");
        return; 
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;

    try {
      const docRef = await addDoc(collection(db, "youtubevideos"), {
        title: title,
        expert: expert,
        videoId: videoId,
        link: link,
        timestamp: serverTimestamp()
      });
    
      await logRecentActivity('Added', `YouTube: ${title}`, 'success');

      form.reset();
      document.getElementById('video-expert').value = "Kripa Home Solutions"; 
      await loadYouTubeVideos();
      
    } catch (error) {
      console.error("---!! FORM SUBMIT ERROR !! ---", error);
      alert("Error adding video: " + error.message);
    } finally {
      submitBtn.textContent = 'Add Video';
      submitBtn.disabled = false;
    }
  });

  // 2. Delete Video Click Listener (using Event Delegation)
  list.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.delete-video-btn');
    if (deleteBtn) {
      const docId = deleteBtn.dataset.id;
      if (!docId) return;

      if (confirm('Are you sure you want to delete this video?')) {
        try {
          const card = deleteBtn.closest('.video-card');
          const titleElement = card.querySelector('.video-card-info h3');
          const title = titleElement ? titleElement.textContent : 'Unknown Video';

          await deleteDoc(doc(db, "youtubevideos", docId));
          
          // --- FIX 1 ---
          // Use the new logger with the correct fields
          await logRecentActivity('delete', `YouTube: ${title}`, 'deleted');
          
          card.remove();
        } catch (error) {
          console.error("Error removing document: ", error);
          alert("Error deleting video: " + error.message);
        }
      }
    }
  });

  // 3. Load videos when page inits
  loadYouTubeVideos();
}


// =======================================================
//  7. SIDEBAR & NAVIGATION LOGIC (RUNS ONCE)
// =======================================================

// --- Sidebar Toggle ---
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.querySelector('.sidebar-overlay');
const appContainer = document.querySelector('.app-container'); 

if (sidebarToggleBtn && sidebar && sidebarOverlay && appContainer) {
    function closeSidebar() {
        appContainer.classList.remove('sidebar-open');
    }
    sidebarToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        appContainer.classList.toggle('sidebar-open');
    });
    sidebarOverlay.addEventListener('click', closeSidebar);
    sidebar.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
             if (window.innerWidth <= 1024) { 
                 closeSidebar();
             }
        });
    });
}

// --- Page Toggling ---
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page-section');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const pageId = link.getAttribute('data-page');
        if (!pageId || pageId === 'logout-link') return; 

        e.preventDefault(); 
        navLinks.forEach(l => l.classList.remove('active-link'));
        link.classList.add('active-link');

        pages.forEach(page => {
            if (page.id === pageId) {
                page.classList.add('active');
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
                page.classList.remove('active');
            }
        });
        
        // --- THIS IS THE CRITICAL NAVIGATION FIX ---
        switch (pageId) {
            case 'dashboard-page-content':
                initDashboardPage();
                break;
           case 'reels-page-content':  // <-- This now matches your HTML
            initReelsPage();
            break;
            case 'youtube-page-content':
                initYouTubePage();
                break;
            case 'enquiries-page-content':
                // initEnquiriesPage(); // e.g.
                break;
            case 'recent-actions-page-content':
                // initRecentActionsPage(); // e.g.
                break;
        }
    });
});
    
// --- Initial Page Load ---
document.getElementById('dashboard-page-content').classList.add('active');
document.querySelectorAll('.page-section:not(#dashboard-page-content)').forEach(p => p.classList.add('hidden'));

// --- FIX 2 ---
// Run the dashboard init function on first load
initDashboardPage();