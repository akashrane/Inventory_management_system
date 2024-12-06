import { API_BASE_URL } from './api.js';
import { fetchInventory } from './api.js';
export const API_BASE_URL = "http://localhost:3001/api";

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
            alert("Product added successfully!");
            fetchInventory(token).then(renderTable);
        } else {
            alert("Failed to add product.");
        }
    } catch (error) {
        console.error("Add Product Error:", error);
    }
};

export const deleteProduct = async (productId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            alert("Product deleted successfully!");
            fetchInventory(token).then(renderTable);
        } else {
            alert("Failed to delete product.");
        }
    } catch (error) {
        console.error("Delete Product Error:", error);
    }
};
