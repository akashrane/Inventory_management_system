export const API_BASE_URL = "http://localhost:3001/api";


export const initializeLoginForm = () => {
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                alert("Login successful!");
                window.location.href = "dashboard.html";
            } else {
                alert(data.error || "Login failed!");
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Error logging in.");
        }
    });
};

export const initializeRegisterForm = () => {
    const registerForm = document.getElementById("registerForm");
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        if (!role) {
            alert("Please select a role.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, role }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Registration successful!");
                window.location.href = "login.html";
            } else {
                alert(data.error || "Registration failed!");
            }
        } catch (error) {
            console.error("Registration Error:", error);
            alert("Error registering.");
        }
    });
};
