import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    setPersistence, 
    browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Auth");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

const emailLoginForm = document.getElementById('email-login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');
const togglePasswordButton = document.getElementById('togglePasswordVisibility');

async function logLogin(userEmail, method) {
    try {
        await addDoc(collection(db, "recent_actions"), {
            action: "Admin Login",
            details: `User logged in via ${method}`,
            type: "login", 
            user: userEmail || "Unknown", 
            timestamp: serverTimestamp()
        });
        console.log("Login activity logged.");
    } catch (error) {
        console.error("Failed to log login activity:", error);
    }
}

// Email/Password Login
if (emailLoginForm) {
    emailLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        errorMessage.textContent = '';
        const email = emailInput.value;
        const password = passwordInput.value;

        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => { 
                console.log("User signed in:", userCredential.user);
                await logLogin(userCredential.user.email, "Email/Password"); 
                window.location.href = 'adminpanel.html';
            })
            .catch((error) => {
                console.error("Login Error:", error);
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                     errorMessage.textContent = 'Invalid email or password.';
                } else if (error.code === 'auth/invalid-email') {
                     errorMessage.textContent = 'Please enter a valid email address.';
                }
                 else {
                    errorMessage.textContent = 'Login failed. Please try again.';   
                 }
            });
    });
    }

if (passwordInput && togglePasswordButton) {
    togglePasswordButton.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        const icon = this.querySelector('span');
        icon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
    });
}