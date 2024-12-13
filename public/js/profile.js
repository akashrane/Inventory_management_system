import { fetchInventory } from './api.js';
export const API_BASE_URL = "http://localhost:3001/api";


export const initializeProfile = () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("No user data found! Redirecting to login.");
        window.location.href = "login.html";
        return;
    }

    // Update profile details dynamically
    const usernameElement = document.getElementById("profileUsername");
    const roleElement = document.getElementById("profileRole");

    if (usernameElement) {
        usernameElement.textContent = user.username || "N/A";
    }

    if (roleElement) {
        roleElement.textContent = user.role || "N/A";
    }
};

// Automatically initialize profile on DOMContentLoaded
document.addEventListener("DOMContentLoaded", initializeProfile);