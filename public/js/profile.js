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
    
    fetchProfile();
};

// Automatically initialize profile on DOMContentLoaded
document.addEventListener("DOMContentLoaded", initializeProfile);

const fetchProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return [];
    }

    try {
        const response = await fetch(`${API_BASE_URL}/users/counts`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch counts: ${response.statusText}`);
        }

        const counts = await response.json();
        
        document.getElementById("product-count").innerText = counts.total_products;
        document.getElementById("quantity-count").innerText = counts.total_quantity;
        document.getElementById("suppliers-count").innerText = counts.total_suppliers;
        
    } catch (error) {
        console.error("Error fetching counts:", error);
        alert("Failed to load counts.");
        return [];
    }
};