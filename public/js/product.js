import { fetchInventory } from './api.js';
export const API_BASE_URL = "http://localhost:3001/api";

export const initializeProducts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    try {
        const inventory = await fetchInventory();
        renderTable(inventory);
    } catch (error) {
        console.error("Failed to fetch inventory:", error);
        alert("Error loading dashboard data.");
    }

    // Modal and toast references
    const modal = document.getElementById("addProductModal");
    const showFormBtn = document.getElementById("showFormBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const toastContainer = document.getElementById("toastContainer");

    // Show modal when "Add Product" button is clicked
    showFormBtn.addEventListener("click", () => modal.classList.remove("hidden"));

    // Hide modal when "Cancel" button is clicked
    closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));

    // Form submission
    document.getElementById("addProductForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const success = await handleAddProduct(e, token);

        if (success) {
            modal.classList.add("hidden"); // Hide modal
            document.getElementById("addProductForm").reset(); // Reset form
            showToast("Product added successfully!"); // Show success toast
        }
    });

    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.add("hidden");
        }
    });

    // Toast notification function
    const showToast = (message) => {
        const toast = document.createElement("div");
        toast.className = `flex items-center justify-between rounded-lg shadow-lg `;

        // Toast content
        toast.innerHTML = `
            <i class="fa-regular fa-circle-check pr-3"></i>
            <p class="toast-message">${message}</p>
            <button aria-label="Close" class="px-3 text-base">&times;</button>
        `;

        toastContainer.appendChild(toast);

        // Remove toast after 5 seconds
        const timeout = setTimeout(() => {
            removeToast(toast);
        }, 5000);

        // Close button functionality
        const closeButton = toast.querySelector("button");
        closeButton.addEventListener("click", () => {
            clearTimeout(timeout);
            removeToast(toast);
        });
    };

    // Remove toast
    const removeToast = (toast) => {
        toast.classList.add("opacity-0"); // Add fade-out animation
        setTimeout(() => toast.remove(), 500); // Wait for animation to complete
    };

    // Wrap delete product function
    window.deleteProduct = (id) => handleDeleteProduct(id, token);

    document.getElementById("logoutButton").addEventListener("click", handleLogout);
};

const renderTable = (products) => {
    const inventoryDiv = document.getElementById("inventoryData");
    const tableHTML = products.length
        ? products.map((p) => generateRowHTML(p)).join("")
        : "<tr><td colspan='6'>No products available</td></tr>";
    inventoryDiv.innerHTML = tableHTML;
};

const generateRowHTML = ({ product_id, product_name, description, barcode, quantity, location }) => `
    <tr>
        <td>${product_name}</td>
        <td>${description}</td>
        <td>${barcode}</td>
        <td>${quantity}</td>
        <td>${location}</td>
        <td>
            <button onclick="deleteProduct('${product_id}')">Delete</button>
        </td>
    </tr>
`;

export const handleAddProduct = async (e, token) => {
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
            const inventory = await fetchInventory(token); // Fetch updated inventory
            renderTable(inventory); // Re-render table
            return true; // Indicate success
        } else {
            alert("Failed to add product.");
        }
    } catch (error) {
        console.error("Add Product Error:", error);
    }
    return false; // Indicate failure
};

export const handleDeleteProduct = async (productId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            alert("Product deleted successfully!");
            const inventory = await fetchInventory(token); // Fetch updated inventory
            renderTable(inventory); // Re-render table
        } else {
            alert("Failed to delete product.");
        }
    } catch (error) {
        console.error("Delete Product Error:", error);
    }
};

const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "login.html";
};