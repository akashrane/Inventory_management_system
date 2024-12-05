const API_BASE_URL = "http://localhost:3001/api";
let currentPage = 1;
const rowsPerPage = 5;
let inventoryData = [];

// Utility to get the current page name
const getCurrentPage = () => window.location.pathname.split("/").pop();

// Initialize functionality based on the current page
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const page = getCurrentPage();

    if (requiresAuth(page) && !token) {
        redirectToLogin();
        return;
    }

    if (page === "login.html") initializeLoginForm();
    if (page === "register.html") initializeRegisterForm();
    if (page === "dashboard.html") initializeDashboard(token);
});

// Redirect to login page if authentication fails
const redirectToLogin = () => {
    alert("You are not logged in!");
    window.location.href = "login.html";
};

// Check if a page requires authentication
const requiresAuth = (page) => ["dashboard.html"].includes(page);

// Initialize Login Page
const initializeLoginForm = () => {
    const loginForm = document.getElementById("loginForm");
    loginForm?.addEventListener("submit", async (e) => {
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
            alert("An error occurred. Please try again.");
        }
    });
};

// Initialize Register Page
const initializeRegisterForm = () => {
    const registerForm = document.getElementById("registerForm");
    registerForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;

        if (!role) {
            document.getElementById("message").innerText = "Please select a role.";
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
                document.getElementById("message").innerText = "Registration successful!";
                setTimeout(() => (window.location.href = "login.html"), 2000);
            } else {
                document.getElementById("message").innerText = data.error || "Registration failed!";
            }
        } catch (error) {
            console.error("Registration Error:", error);
            document.getElementById("message").innerText = "An error occurred. Please try again.";
        }
    });
};

// Initialize Dashboard Page
const initializeDashboard = (token) => {
    const addProductForm = document.getElementById("addProductForm");
    const searchBar = document.getElementById("searchBar");
    const logoutButton = document.getElementById("logoutButton");

    logoutButton?.addEventListener("click", handleLogout);
    addProductForm?.addEventListener("submit", (e) => handleAddProduct(e, token));
    searchBar?.addEventListener("input", handleSearch);

    fetchInventory(token);
};

// Fetch and Render Inventory
const fetchInventory = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        inventoryData = data;
        renderTable(inventoryData);
    } catch (error) {
        console.error("Fetch Inventory Error:", error);
        alert("Failed to fetch inventory data.");
    }
};

// Render Inventory Table with Pagination
const renderTable = (products) => {
    const inventoryDiv = document.getElementById("inventoryData");

    const totalPages = Math.ceil(products.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const paginatedProducts = products.slice(startIndex, startIndex + rowsPerPage);

    let tableHTML = `
        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th>Description</th>
                    <th>Barcode</th>
                    <th>Quantity</th>
                    <th>Location</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    paginatedProducts.forEach((product) => {
        tableHTML += `
            <tr>
                <td>${product.product_name}</td>
                <td>${product.description}</td>
                <td>${product.barcode}</td>
                <td>${product.quantity}</td>
                <td>${product.location}</td>
                <td>
                    <button class="btn btn-danger btn-sm delete-button" onclick="deleteProduct('${product.product_id}')">Delete</button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
        <div class="pagination">
            ${currentPage > 1 ? `<button onclick="changePage(-1)">Previous</button>` : ""}
            Page ${currentPage} of ${totalPages}
            ${currentPage < totalPages ? `<button onclick="changePage(1)">Next</button>` : ""}
        </div>
    `;

    inventoryDiv.innerHTML = tableHTML;

    adjustUIBasedOnRole();
};

// Handle Pagination
const changePage = (direction) => {
    currentPage += direction;
    renderTable(inventoryData);
};

// Handle Adding a Product
const handleAddProduct = async (e, token) => {
    e.preventDefault();

    const productData = {
        product_name: document.getElementById("productName").value,
        description: document.getElementById("description").value,
        barcode: document.getElementById("barcode").value,
        quantity: document.getElementById("quantity").value,
        location: document.getElementById("location").value,
        supplier_id: document.getElementById("supplierId").value,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(productData),
        });

        if (response.ok) {
            alert("Product added successfully!");
            fetchInventory(token);
        } else {
            alert("Failed to add product.");
        }
    } catch (error) {
        console.error("Add Product Error:", error);
        alert("An error occurred. Please try again.");
    }
};

// Handle Logout
const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out!");
    window.location.href = "login.html";
};

// Handle Search Functionality
const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    const filteredData = inventoryData.filter((product) =>
        ["product_name", "description", "barcode"].some((key) =>
            product[key].toLowerCase().includes(query)
        )
    );
    renderTable(filteredData);
};

// Define deleteProduct as a global function
window.deleteProduct = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            alert("Product deleted successfully!");
            // Fetch inventory again to update the table
            fetchInventory(token);
        } else {
            alert("Failed to delete product.");
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        alert("An error occurred. Please try again.");
    }
};

// Adjust UI Based on User Role
const adjustUIBasedOnRole = () => {
    const role = getUserRole();
    if (role === "manager") {
        document.querySelectorAll(".delete-button").forEach((button) => (button.style.display = "inline-block"));
        document.getElementById("addProductForm").style.display = "block";
    } else {
        document.querySelectorAll(".delete-button").forEach((button) => (button.style.display = "none"));
        document.getElementById("addProductForm").style.display = "none";
    }
};

// Decode JWT to Get User Role
const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        return jwt_decode(token).role;
    } catch (error) {
        console.error("Decode Token Error:", error);
        return null;
    }
};
