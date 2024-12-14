export const API_BASE_URL = "http://localhost:3001/api";
import { fetchInventory } from './api.js';
let productMap = {};
let currentPage = 1;
let rowsPerPage = 5;
let filteredTransactions = []; // Holds filtered data

export const initializeTransactions = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    try {
        await initializeProductMap();
        const transactions = await fetchTransactions();
        filteredTransactions = [...transactions]; // Initialize filtered transactions
        updateTableWithPagination(filteredTransactions);

        setupEventListeners(transactions);
    } catch (error) {
        console.error("Error initializing transaction:", error);
        alert("Failed to load transaction data.");
    }
};

// Fetch transactions from the API
const fetchTransactions = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return [];
    }

    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch transactions: ${response.statusText}`);
        }

        const transactions = await response.json();
        return transactions;
        
    } catch (error) {
        console.error("Error fetching transactions:", error);
        alert("Failed to load transactions.");
        return [];
    }
};

// Initialize product map
const initializeProductMap = async () => {
    try {
        const inventory = await fetchInventory();
        productMap = inventory.reduce((map, product) => {
            map[product.product_id] = product.product_name;
            return map;
        }, {});
    } catch (error) {
        console.error("Error initializing product map:", error);
        alert("Failed to load product data.");
    }
};

// Render transactions table with pagination
const updateTableWithPagination = (transactions) => {
    const paginatedData = paginateTable(transactions, currentPage, rowsPerPage);
    renderTransactionsTable(paginatedData);

    const totalPages = Math.ceil(transactions.length / rowsPerPage);
    document.getElementById("pageInfo").textContent = `Page ${currentPage} of ${totalPages}`;
    document.getElementById("prevPage").disabled = currentPage === 1;
    document.getElementById("nextPage").disabled = currentPage === totalPages;
};

// Paginate data
const paginateTable = (data, currentPage, rowsPerPage) => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
};

// Render the transactions table
const renderTransactionsTable = (transactions) => {
    const inventoryDiv = document.getElementById("transactionsTableBody");
    if (!inventoryDiv) {
        console.error("Table body element not found");
        return;
    }

    const tableHTML = transactions.map((transaction) => {
        const productName = productMap[transaction.product_id] || "Unknown Product";
        return `
            <tr>
                <td>${productName}</td>
                <td>${transaction.quantity}</td>
                <td>${transaction.change_type}</td>
                <td>${transaction.timestamp}</td>
            </tr>
        `;
    }).join("");

    inventoryDiv.innerHTML = tableHTML;
};

// Set up event listeners for search and pagination
const setupEventListeners = (transactions) => {
    // Search functionality
    document.getElementById("searchBar").addEventListener("input", (e) => {
        const searchValue = e.target.value.toLowerCase();
        filteredTransactions = transactions.filter((transaction) =>
            Object.values(transaction).some((value) =>
                String(value).toLowerCase().includes(searchValue)
            ) || (productMap[transaction.product_id] || "").toLowerCase().includes(searchValue)
        );
        currentPage = 1; // Reset to the first page
        updateTableWithPagination(filteredTransactions);
    });

    // Rows-per-page dropdown
    document.getElementById("rowsPerPage").addEventListener("change", (event) => {
        rowsPerPage = parseInt(event.target.value, 10);
        currentPage = 1; // Reset to the first page
        updateTableWithPagination(filteredTransactions);
    });

    // Pagination controls
    document.getElementById("prevPage").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            updateTableWithPagination(filteredTransactions);
        }
    });

    document.getElementById("nextPage").addEventListener("click", () => {
        const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updateTableWithPagination(filteredTransactions);
        }
    });
};