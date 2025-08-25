import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } 
    from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// Your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyC71wc-JkZ5ZWiD4aYAuv0Y3v_YOT_FADY",
    authDomain: "kripahomesolutions-0001.firebaseapp.com",
    projectId: "kripahomesolutions-0001",
    storageBucket: "kripahomesolutions-0001.appspot.com", // fixed domain
    messagingSenderId: "218320673308",
    appId: "1:218320673308:web:107cb7040ee424553d5dd9",
    measurementId: "G-RLE4404QMG"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Elements
const loginForm = document.getElementById("adminLoginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const rememberMeCheckbox = document.getElementById("rememberMe");
const loginBtn = document.querySelector(".admin-login-btn");
const btnText = loginBtn.querySelector(".btn-text");
const btnLoading = loginBtn.querySelector(".btn-loading");

// Handle login
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeCheckbox.checked;

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    btnText.style.display = "none";
    btnLoading.style.display = "inline-block";
    loginBtn.disabled = true;

    try {
        await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Login error:", error);
        alert(error.message);
    } finally {
        btnText.style.display = "inline-block";
        btnLoading.style.display = "none";
        loginBtn.disabled = false;
    }
});