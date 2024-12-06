
export const API_BASE_URL = "http://localhost:3001/api";

import { fetchInventory, addProduct, deleteProduct } from './api.js';

export const initializeDashboard = async () => {
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

    document.getElementById("logoutButton").addEventListener("click", handleLogout);
    document.getElementById("addProductForm").addEventListener("submit", (e) => handleAddProduct(e, token));
    window.deleteProduct = (id) => handleDeleteProduct(id, token);
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

const handleAddProduct = async (e, token) => {
    e.preventDefault();

    const productData = {
        product_name: document.getElementById("productName").value,
        description: document.getElementById("description").value,
        barcode: document.getElementById("barcode").value,
        quantity: parseInt(document.getElementById("quantity").value), // Ensure numeric value
        location: document.getElementById("location").value,
        supplier_id: document.getElementById("supplierId").value,
    };

    console.log("Product Data:", productData); // Debugging log

    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(productData),
        });

        if (response.ok) {
            alert("Product added successfully!");
            const updatedInventory = await fetchInventory();
            renderTable(updatedInventory);
        } else {
            const error = await response.json();
            alert(`Failed to add product: ${error.error}`);
        }
    } catch (error) {
        console.error("Add Product Error:", error);
        alert("Error adding product.");
    }
};


const handleDeleteProduct = async (productId, token) => {
    try {
        await deleteProduct(productId);
        alert("Product deleted successfully!");
        const updatedInventory = await fetchInventory();
        renderTable(updatedInventory);
    } catch (error) {
        console.error("Failed to delete product:", error);
        alert("Error deleting product.");
    }
};

const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "login.html";
};
