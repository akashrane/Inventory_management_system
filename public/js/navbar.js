export const API_BASE_URL = "http://localhost:3001/api";

import {addProduct, deleteProduct, fetchTransactions} from './api.js';

export const initializeNavbar = () => {

    const usernameDisplay = document.getElementById("usernameDisplay");
    const userData = localStorage.getItem("user");

    const user = userData ? JSON.parse(userData) : null;

    const username = user ? user.username : "User";

    usernameDisplay.innerText = username;

    // My Profile button
    document.getElementById("myProfileButton").addEventListener("click", () => {
        window.location.href = "profile.html"; // Redirect to a profile page
    });

    // Log Out button
    document.getElementById("logoutButton").addEventListener("click", () => {
        localStorage.clear(); // Clear all user data from local storage
        alert("Logged out successfully!");
        window.location.href = "login.html"; // Redirect to login page
    });
};

// Initialize the navbar when the DOM is loaded
document.addEventListener("DOMContentLoaded", initializeNavbar);
