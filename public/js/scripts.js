const API_BASE_URL = "http://localhost:3001/api";

// Utility to get the current page
const getCurrentPage = () => window.location.pathname.split("/").pop();

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const currentPage = getCurrentPage();

    // Pages that require authentication
    const protectedPages = ["dashboard.html"];

    // Redirect to login if not logged in on protected pages
    if (protectedPages.includes(currentPage) && !token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    // Initialize login form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        handleLoginForm(loginForm);
    }

    // Initialize logout button
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        handleLogout(logoutButton);
    }

    // Handle dashboard functionalities
    if (currentPage === "dashboard.html") {
        handleDashboard(token);
    }
});

// Handle login form submission
const handleLoginForm = (form) => {
    form.addEventListener("submit", async (e) => {
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
        } catch (err) {
            console.error(err);
            alert("An error occurred. Please try again.");
        }
    });
};

// Handle logout functionality
const handleLogout = (button) => {
    button.addEventListener("click", () => {
        localStorage.removeItem("token");
        alert("Logged out!");
        window.location.href = "login.html";
    });
};

// Handle dashboard functionality
const handleDashboard = (token) => {
    const inventoryDiv = document.getElementById("inventoryData");
    const addProductForm = document.getElementById("addProductForm");
    const searchBar = document.getElementById("searchBar");

    let inventoryData = [];

    // Fetch and display inventory
    const fetchInventory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            inventoryData = data; // Store full inventory for search and filtering
            renderTable(data);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch inventory data.");
        }
    };

    // Render inventory table
    const renderTable = (products) => {
        let table = `
            <table class="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th onclick="sortTable('product_name')">Product Name</th>
                        <th>Description</th>
                        <th>Barcode</th>
                        <th>Quantity</th>
                        <th>Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;
        products.forEach((product) => {
            table += `
                <tr>
                    <td>${product.product_name}</td>
                    <td>${product.description}</td>
                    <td>${product.barcode}</td>
                    <td>${product.quantity}</td>
                    <td>${product.location}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.product_id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
        table += `
                </tbody>
            </table>
        `;
        inventoryDiv.innerHTML = table;
    };

    // Add new product
    if (addProductForm) {
        addProductForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const productName = document.getElementById("productName").value;
            const description = document.getElementById("description").value;
            const barcode = document.getElementById("barcode").value;
            const quantity = document.getElementById("quantity").value;
            const location = document.getElementById("location").value;
            const supplierId = document.getElementById("supplierId").value;

            try {
                const response = await fetch(`${API_BASE_URL}/products`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        product_name: productName,
                        description,
                        barcode,
                        quantity,
                        location,
                        supplier_id: supplierId,
                    }),
                });

                const data = await response.json();
                if (response.ok) {
                    alert("Product added successfully!");
                    fetchInventory();
                } else {
                    alert(data.error || "Failed to add product.");
                }
            } catch (err) {
                console.error(err);
                alert("An error occurred. Please try again.");
            }
        });
    }

    // Delete a product
    window.deleteProduct = async (productId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                alert("Product deleted successfully!");
                fetchInventory();
            } else {
                alert("Failed to delete product.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred. Please try again.");
        }
    };

    // Search functionality
    if (searchBar) {
        searchBar.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            const filteredData = inventoryData.filter(
                (product) =>
                    product.product_name.toLowerCase().includes(query) ||
                    product.description.toLowerCase().includes(query) ||
                    product.barcode.toLowerCase().includes(query)
            );
            renderTable(filteredData);
        });
    }

    // Initial inventory fetch
    fetchInventory();
};

// Sort table function
const sortTable = (column) => {
    inventoryData.sort((a, b) => {
        if (a[column] < b[column]) return -1;
        if (a[column] > b[column]) return 1;
        return 0;
    });
    renderTable(inventoryData);
};
