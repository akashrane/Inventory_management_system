import { fetchInventory } from './api.js';
export const API_BASE_URL = "http://localhost:3001/api";

let currentPage = 1;
let rowsPerPage = 5;
let sortOrder = "asc"; // Default sort order
let sortColumn = "product_name"; // Default sort column
let filteredData = []; // Holds filtered and sorted data

export const initializeProducts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    try {
        const inventory = await fetchInventory();
        filteredData = [...inventory]; // Initialize filtered data with full inventory

        // Initial rendering
        updateTableWithPagination(filteredData);

        // Set up search, sorting, and pagination event listeners
        setupEventListeners(inventory);

        // Add functionality for logout and modal
        document.getElementById("logoutButton").addEventListener("click", handleLogout);
        setupModalListeners(token);

        // Populate suppliers dropdown
        await fetchSuppliers();

        // Assign delete, edit, and quantity update functions globally
        window.deleteProduct = (id) => handleDeleteProduct(id, token);
        window.editProduct = editProduct;
        window.adjustQuantity = adjustQuantity;
    } catch (error) {
        console.error("Failed to fetch inventory:", error);
        alert("Error loading dashboard data.");
    }
};


// Helper function to set up search, sorting, and pagination event listeners
const setupEventListeners = (inventory) => {
    // Search functionality
    document.getElementById("searchBar").addEventListener("input", (e) => {
        const searchValue = e.target.value.toLowerCase();
        filteredData = inventory.filter((item) =>
            Object.values(item).some((value) =>
                String(value).toLowerCase().includes(searchValue)
            )
        );
        currentPage = 1; // Reset to the first page
        updateTableWithPagination(filteredData);
    });

    // Sorting functionality
    document.querySelectorAll("thead th[data-sort]").forEach((th) => {
        th.addEventListener("click", () => {
            const column = th.dataset.sort;
            sortColumn = column;
            sortOrder = sortOrder === "asc" ? "desc" : "asc";
            filteredData.sort((a, b) => {
                const valA = a[column];
                const valB = b[column];
                if (valA < valB) return sortOrder === "asc" ? -1 : 1;
                if (valA > valB) return sortOrder === "asc" ? 1 : -1;
                return 0;
            });
            updateTableWithPagination(filteredData);
        });
    });

    // Rows-per-page dropdown
    document.getElementById("rowsPerPage").addEventListener("change", (event) => {
        rowsPerPage = parseInt(event.target.value, 10);
        currentPage = 1; // Reset to the first page
        updateTableWithPagination(filteredData);
    });

    // Pagination controls
    document.getElementById("prevPage").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            updateTableWithPagination(filteredData);
        }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateTableWithPagination(filteredData);
        }
    });
};

// Setup modal listeners for Add and Edit Product functionality
const setupModalListeners = (token) => {
    const modal = document.getElementById("addProductModal");
    const showFormBtn = document.getElementById("showFormBtn");
    const closeModalBtn = document.getElementById("closeModalBtn");

    // Show modal for adding a product
    showFormBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");

        // Reset the modal title and button text for adding a new product
        document.getElementById("modalTitle").textContent = "Add Product";
        document.getElementById("modalSubmitButton").textContent = "Add";

        // Reset the form and its submit action for adding a new product
        document.getElementById("addProductForm").reset();
        document.getElementById("addProductForm").onsubmit = async (e) => {
            e.preventDefault();
            await handleAddProduct(e, token);
        };
    });

    // Hide modal
    closeModalBtn.addEventListener("click", () => modal.classList.add("hidden"));

    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.add("hidden");
        }
    });
};

// Update table with pagination
const updateTableWithPagination = (data) => {
    const paginatedData = paginateTable(data, currentPage, rowsPerPage);
    renderTable(paginatedData);

    const totalPages = Math.ceil(data.length / rowsPerPage);
    document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage === totalPages;
};

// Paginate table data
const paginateTable = (data, currentPage, rowsPerPage) => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
};

// Render table rows
const renderTable = (products) => {
    const inventoryDiv = document.getElementById("inventoryData");
    const tableHTML = products.length
        ? products.map((p) => generateRowHTML(p)).join("")
        : "<tr><td colspan='6'>No products available</td></tr>";
    inventoryDiv.innerHTML = tableHTML;
};

// Generate table rows dynamically
const generateRowHTML = ({ product_id, product_name, description, barcode, quantity, location, supplier_id }) => `
    <tr>
        <td>${product_name}</td>
        <td>${description}</td>
        <td>${barcode}</td>
        <td>
            <div class="flex items-center space-x-2">
                <button 
                    onclick="adjustQuantity(this, -1)" 
                    data-product-id="${product_id}"
                    data-product-name="${product_name}"
                    data-description="${description}"
                    data-barcode="${barcode}"
                    data-quantity="${quantity}"
                    data-location="${location}"
                    data-supplier-id="${supplier_id}"
                >
                    <i class="fa-solid fa-circle-minus text-red-600 text-lg mt-1"></i>
                </button>
                <span id="quantity-${product_id}" class="text-gray-800">${quantity}</span>
                <button 
                    onclick="adjustQuantity(this, 1)" 
                    data-product-id="${product_id}"
                    data-product-name="${product_name}"
                    data-description="${description}"
                    data-barcode="${barcode}"
                    data-quantity="${quantity}"
                    data-location="${location}"
                    data-supplier-id="${supplier_id}"
                >
                    <i class="fa-solid fa-circle-plus text-green-600 text-lg mt-1"></i>
                </button>
            </div>
        </td>
        <td>${location}</td>
        <td class="flex space-x-2">
            <button 
                class="p-2 rounded bg-blue-600 hover:bg-blue-800 text-white" 
                data-product-id="${product_id}" 
                data-product-name="${product_name}" 
                data-description="${description}" 
                data-barcode="${barcode}" 
                data-quantity="${quantity}" 
                data-location="${location}" 
                data-supplier-id="${supplier_id}"
                onclick="editProduct(this)"
            >
                <i class="fa-solid fa-pen"></i>
            </button>
            <button 
                class="p-2 rounded bg-red-600 hover:bg-red-800 text-white" 
                data-product-id="${product_id}" 
                data-product-name="${product_name}" 
                onclick="deleteProduct('${product_id}')"
            >
                <i class="fa-solid fa-trash"></i>
            </button>
        </td>
    </tr>
`;

// Adjust Quantity
export const adjustQuantity = async (buttonElement, adjustment) => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    // Retrieve product details from the button's data attributes
    const productId = buttonElement.getAttribute("data-product-id");
    const productName = buttonElement.getAttribute("data-product-name");
    const description = buttonElement.getAttribute("data-description");
    const barcode = buttonElement.getAttribute("data-barcode");
    const location = buttonElement.getAttribute("data-location");
    const supplier_id = buttonElement.getAttribute("data-supplier-id");
    const currentQuantity = parseInt(buttonElement.getAttribute("data-quantity"), 10);

    const newQuantity = currentQuantity + adjustment;

    // Ensure the new quantity is not negative
    if (newQuantity < 0) {
        alert("Quantity cannot be less than 0.");
        return;
    }

    const updatedProduct = {
        product_name: productName,
        description,
        barcode,
        quantity: newQuantity,
        location,
        supplier_id
    };

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(updatedProduct),
        });

        if (response.ok) {
            // Update the quantity in the UI
            document.getElementById(`quantity-${productId}`).textContent = newQuantity;

            // Update the button's data-quantity attribute
            const buttons = document.querySelectorAll(`[data-product-id="${productId}"]`);
            buttons.forEach((btn) => btn.setAttribute("data-quantity", newQuantity));

            showToast(`Quantity updated to ${newQuantity} for "${productName}"!`);
        } else {
            alert("Failed to update quantity.");
        }
    } catch (error) {
        console.error("Adjust Quantity Error:", error);
        alert(`Error updating quantity: ${error.message}`);
    }
};


// Handle Edit Product
export const editProduct = (buttonElement) => {
    const productId = buttonElement.getAttribute("data-product-id");
    const productName = buttonElement.getAttribute("data-product-name");
    const description = buttonElement.getAttribute("data-description");
    const barcode = buttonElement.getAttribute("data-barcode");
    const quantity = buttonElement.getAttribute("data-quantity");
    const location = buttonElement.getAttribute("data-location");
    const supplier_id = buttonElement.getAttribute("data-supplier-id");

    const modal = document.getElementById("addProductModal");
    modal.classList.remove("hidden");

    document.getElementById("modalTitle").textContent = "Update Product";
    document.getElementById("modalSubmitButton").textContent = "Update";

    document.getElementById("productName").value = productName || "";
    document.getElementById("description").value = description || "";
    document.getElementById("barcode").value = barcode || "";
    document.getElementById("quantity").value = quantity || "";
    document.getElementById("location").value = location || "";
    document.getElementById("supplierDropdown").value = supplier_id || "";

    const addProductForm = document.getElementById("addProductForm");
    addProductForm.onsubmit = async (e) => {
        e.preventDefault();
        await handleUpdateProduct(productId);
    };
};

// Handle Add Product
export const handleAddProduct = async (e, token) => {
    const productData = {
        product_name: document.getElementById("productName").value,
        description: document.getElementById("description").value,
        barcode: document.getElementById("barcode").value,
        quantity: document.getElementById("quantity").value,
        location: document.getElementById("location").value,
        supplier_id: document.getElementById("supplierDropdown").value,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(productData),
        });

        if (response.ok) {
            const inventory = await fetchInventory();
            filteredData = inventory;
            updateTableWithPagination(filteredData);

            const modal = document.getElementById("addProductModal");
            modal.classList.add("hidden");
            showToast(`Product "${productData.product_name}" added successfully!`);
        } else {
            alert("Failed to add product.");
        }
    } catch (error) {
        console.error("Add Product Error:", error);
    }
};

// Handle Update Product
export const handleUpdateProduct = async (productId) => {
    const token = localStorage.getItem("token");
    const productData = {
        product_name: document.getElementById("productName").value,
        description: document.getElementById("description").value,
        barcode: document.getElementById("barcode").value,
        quantity: document.getElementById("quantity").value,
        location: document.getElementById("location").value,
        supplier_id: document.getElementById("supplierDropdown").value,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(productData),
        });

        if (response.ok) {
            const inventory = await fetchInventory();
            filteredData = inventory;
            updateTableWithPagination(filteredData);

            const modal = document.getElementById("addProductModal");
            modal.classList.add("hidden");
            showToast(`Product "${productData.product_name}" updated successfully!`);
        } else {
            alert("Failed to update product.");
        }
    } catch (error) {
        console.error("Update Product Error:", error);
        alert(`Error updating product: ${error.message}`);
    }
};

// Handle Delete Product
export const handleDeleteProduct = async (productId, token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const inventory = await fetchInventory();
            filteredData = inventory;
            updateTableWithPagination(filteredData);

            showToast(`Product deleted successfully!`);
        } else {
            alert("Failed to delete product.");
        }
    } catch (error) {
        console.error("Delete Product Error:", error);
    }
};

const fetchSuppliers = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not logged in!");
            window.location.href = "login.html";
            return;
        }

        const response = await fetch(`${API_BASE_URL}/suppliers`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch suppliers");
        }

        const suppliers = await response.json();
        populateSupplierDropdown(suppliers);
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        alert("Could not load suppliers. Please try again later.");
    }
};

const populateSupplierDropdown = (suppliers) => {
    const supplierDropdown = document.getElementById("supplierDropdown");

    suppliers.forEach((supplier) => {
        const option = document.createElement("option");
        option.value = supplier.supplier_id; // Use supplier_id as the value
        option.textContent = supplier.supplier_name; // Display supplier_name as the option text
        supplierDropdown.appendChild(option);
    });
};

// Toast notification
const showToast = (message) => {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `flex items-center justify-between rounded-lg shadow-lg`;

    toast.innerHTML = `
        <i class="fa-regular fa-circle-check pr-3"></i>
        <p class="toast-message">${message}</p>
        <button aria-label="Close" class="px-3 text-base">&times;</button>
    `;

    toastContainer.appendChild(toast);

    const timeout = setTimeout(() => {
        removeToast(toast);
    }, 5000);

    const closeButton = toast.querySelector("button");
    closeButton.addEventListener("click", () => {
        clearTimeout(timeout);
        removeToast(toast);
    });
};

const removeToast = (toast) => {
    toast.classList.add("opacity-0");
    setTimeout(() => toast.remove(), 500);
};

const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "login.html";
};