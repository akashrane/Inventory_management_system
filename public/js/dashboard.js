// Base API URL
export const API_BASE_URL = "http://localhost:3001/api";


// Initialize the dashboard
export const initializeDashboard = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    try {
        await fetchAndRenderAnalytics();
        const transactions = await fetchTransactions(); 
        renderTransactionsTable(transactions);
        

        document.getElementById("logoutButton").addEventListener("click", handleLogout);
    } catch (error) {
        console.error("Error initializing dashboard:", error);
        alert("Failed to load dashboard data.");
    }
};

const fetchAndRenderAnalytics = async () => {
    try {
        // Fetch analytics data for total products and quantities
        const analyticsResponse = await fetch(`${API_BASE_URL}/analytics/quantities`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (!analyticsResponse.ok) {
            throw new Error("Failed to fetch analytics data");
        }

        const analyticsData = await analyticsResponse.json();

        // Update total products and total quantities
        document.getElementById('totalProducts').textContent = analyticsData.totalProducts;
        document.getElementById('totalQuantity').textContent = analyticsData.totalQuantity;

        // Fetch products data for chart
        const productsResponse = await fetch(`${API_BASE_URL}/products`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (!productsResponse.ok) {
            throw new Error("Failed to fetch product data");
        }

        const productsData = await productsResponse.json();

        // Render the chart
        renderProductQuantityChart(productsData);
    } catch (error) {
        console.error("Error fetching and rendering analytics:", error);
        alert("Failed to load dashboard data.");
    }
};

// Render product quantities chart
const renderProductQuantityChart = (products) => {
    const ctx = document.getElementById('productChart').getContext('2d');
    const labels = products.map(product => product.product_name);
    const quantities = products.map(product => product.quantity);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Product Quantities',
                data: quantities,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' },
            },
        },
    });
};


// Fetch transactions from the API
const fetchTransactions = async () => {
    const token = localStorage.getItem("token"); // Retrieve the token from localStorage

    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return [];
    }

    try {
        // Send the request to the API endpoint
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`, // Add token to the request header
                "Content-Type": "application/json",
            },
        });

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`Failed to fetch transactions: ${response.statusText}`);
        }

        // Parse and return the JSON response
        const transactions = await response.json();
        return transactions;
    } catch (error) {
        console.error("Error fetching transactions:", error);
        alert("Failed to load transactions.");
        return []; // Return an empty array on failure
    }
};

const renderTransactionsTable = (transactions) => {
    const rowsPerPage = 10; // Number of rows per page
    let currentPage = 1; // Initial page

    const inventoryDiv = document.getElementById("transactionsTableBody");
    if (!inventoryDiv) {
        console.error("Table body element not found");
        return;
    }

    const totalPages = Math.ceil(transactions.length / rowsPerPage);

    const updateTable = () => {
        const rowsPerPage = 10; // Number of rows per page
        const inventoryDiv = document.getElementById("transactionsTableBody"); // Table body element
    
        if (!inventoryDiv) {
            console.error("Table body element not found!");
            return;
        }
    
        const totalPages = Math.ceil(transactions.length / rowsPerPage); // Calculate total pages
        const startIndex = (currentPage - 1) * rowsPerPage;
        const paginatedTransactions = transactions.slice(startIndex, startIndex + rowsPerPage);
    
        // Build table HTML
        let tableHTML = `
            <thead>
                <tr>
                    <th>Transaction ID</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Type</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
        `;
    
        paginatedTransactions.forEach(transaction => {
            tableHTML += `
                <tr>
                    <td>${transaction.transaction_id}</td>
                    <td>${transaction.product_id}</td>
                    <td>${transaction.quantity}</td>
                    <td>${transaction.change_type}</td>
                    <td>${transaction.timestamp}</td>
                </tr>
            `;
        });
    
        tableHTML += `</tbody>`;
        inventoryDiv.innerHTML = tableHTML;
    
        // Add pagination controls
        const paginationContainer = document.getElementById("paginationControls");
    
        if (paginationContainer) {
            paginationContainer.innerHTML = ""; // Clear previous controls
    
            // Generate Previous button
            if (currentPage > 1) {
                const prevButton = document.createElement("button");
                prevButton.textContent = "Previous";
                prevButton.className = "btn btn-primary";
                prevButton.addEventListener("click", () => changePage(-1));
                paginationContainer.appendChild(prevButton);
            }
    
            // Generate page numbers
            for (let page = 1; page <= totalPages; page++) {
                const pageButton = document.createElement("button");
                pageButton.textContent = page;
                pageButton.className = `btn ${page === currentPage ? "btn-secondary" : "btn-outline-primary"}`;
                pageButton.addEventListener("click", () => goToPage(page));
                paginationContainer.appendChild(pageButton);
            }
    
            // Generate Next button
            if (currentPage < totalPages) {
                const nextButton = document.createElement("button");
                nextButton.textContent = "Next";
                nextButton.className = "btn btn-primary";
                nextButton.addEventListener("click", () => changePage(1));
                paginationContainer.appendChild(nextButton);
            }
        }
    };
    
    // Change page function
    const changePage = (direction) => {
        currentPage += direction;
        updateTable();
    };
    
    // Go to specific page function
    const goToPage = (page) => {
        currentPage = page;
        updateTable();
    };
    

    updateTable();
    



    window.changePage = changePage;
};


// Handle logout
const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "login.html";
};

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);
