export const API_BASE_URL = "http://localhost:3001/api";

export const fetchAPI = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return response.json();
};

export const fetchInventory = () => fetchAPI("/products");

export const addProduct = (productData) =>
    fetchAPI("/products", { method: "POST", body: JSON.stringify(productData) });

export const deleteProduct = (productId) =>
    fetchAPI(`/products/${productId}`, { method: "DELETE" });
