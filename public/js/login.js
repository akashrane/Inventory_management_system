export const API_BASE_URL = "http://localhost:3001/api";

import { fetchAPI } from './api.js';
import { tryCatch, bindEvent } from './utils.js';

const handleLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    await tryCatch(async () => {
        const { token } = await fetchAPI("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        localStorage.setItem("token", token);
        alert("Login successful!");
        window.location.href = "dashboard.html";
    });
};

export const initializeLogin = () => {
    bindEvent("#loginForm", "submit", handleLogin);
};
