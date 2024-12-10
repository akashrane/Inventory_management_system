export const API_BASE_URL = "http://localhost:3001/api";

import { fetchAPI } from './api.js';
import { tryCatch, bindEvent } from './utils.js';

const handleLogin = async (e) => {
    e.preventDefault();

    // Get email and password from the form
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Handle login with error handling
    await tryCatch(async () => {
        const response = await fetchAPI("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        // Extract token and username from the response
        const token = response.token;
        const username = response.username;

        if (!token && !username) {
            throw new Error("Invalid response from server: Missing token or username");
        }

        // Store token and username in local storage
        localStorage.setItem("token", token);
        localStorage.setItem("username", response.username);

        alert("Login successful!");
        window.location.href = "dashboard.html";
    });
};

export const initializeLogin = () => {
    // Bind the login form submit event to the handler
    bindEvent("#loginForm", "submit", handleLogin);
};
