const API_BASE_URL = "http://localhost:3001/api";

let currentPage = 1;
const rowsPerPage = 5;

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
            filteredData = data; 
            renderTable(filteredData);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch inventory data.");
        }
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


// Decode token to get user role
const getUserRole = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded = jwt_decode(token); // Requires 'jwt-decode' package
        console.log("Decoded Token:", decoded); // Debugging line
        return decoded.role;
    } catch (err) {
        console.error("Error decoding token:", err);
        return null;
    }
};


// Example: Hide or disable buttons based on role
const adjustUIBasedOnRole = () => {
    const userRole = getUserRole(); // Decode the user's role from the JWT
    if (!userRole) return;

    // Hide "Add Product" section for employees
    const addProductSection = document.getElementById("addProductForm");
    const addProductText = document.querySelector("h3"); // Assuming the "Add New Product" text is in an <h3> tag

    if (userRole !== "manager") {
        if (addProductSection) addProductSection.style.display = "none";
        if (addProductText && addProductText.innerText === "Add New Product") {
            addProductText.style.display = "none";
        }
    }

    // Hide "Delete" buttons in the table for employees
    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
        button.style.display = "none";
    });

    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.style.display = "block";
    }
};

// Reapply UI adjustments after rendering the table
const renderTable = (products) => {
    const inventoryDiv = document.getElementById("inventoryData");

    // Calculate pagination
    const totalPages = Math.ceil(products.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    // Render table
    let table = `
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
        table += `
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
    table += `
            </tbody>
        </table>
    `;

    // Add pagination controls
    table += `
        <div class="pagination">
            ${currentPage > 1 ? `<button class="btn btn-secondary" onclick="changePage(-1)">Previous</button>` : ""}
            Page ${currentPage} of ${totalPages}
            ${currentPage < totalPages ? `<button class="btn btn-secondary" onclick="changePage(1)">Next</button>` : ""}
        </div>
    `;

    inventoryDiv.innerHTML = table;

    adjustUIBasedOnRole();
};

// Change page function
const changePage = (direction) => {
    currentPage += direction;
    renderTable(filteredData); // Use the filtered data to maintain search functionality
};


// Call adjustUIBasedOnRole after DOM loads
document.addEventListener("DOMContentLoaded", () => {
    adjustUIBasedOnRole();
});

// Handle registration form submission
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
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
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ username, email, password, role }),
                });

                const data = await response.json();
                if (response.ok) {
                    document.getElementById("message").innerText = "Registration successful!";
                    setTimeout(() => {
                        window.location.href = "login.html";
                    }, 2000);
                } else {
                    document.getElementById("message").innerText = data.error || "Registration failed!";
                }
            } catch (err) {
                console.error(err);
                document.getElementById("message").innerText = "An error occurred. Please try again.";
            }
        });
    }
});