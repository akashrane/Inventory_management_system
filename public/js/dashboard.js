// Base API URL
export const API_BASE_URL = "http://localhost:3001/api";
import { fetchInventory } from './api.js';
let productMap = {};

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

        // document.getElementById("logoutButton").addEventListener("click", handleLogout);
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

const fetchTopSellingProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/topselling`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) throw new Error("Failed to fetch top-selling products");
        const data = await response.json();
        renderTopSellingChart(data);
    } catch (err) {
        console.error(err.message);
        alert("Failed to load top-selling products data.");
    }
};

const renderTopSellingChart = (data) => {
    const ctx = document.getElementById('topSellingChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(product => product.product_name),
            datasets: [{
                label: 'Sales Quantity',
                data: data.map(product => product.sales_quantity),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
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

// Call the function when the dashboard loads
document.addEventListener('DOMContentLoaded', fetchTopSellingProducts);

const fetchLowStockProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/lowstock`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (!response.ok) throw new Error('Failed to fetch low stock data');

        const data = await response.json();
        renderLowStockTable(data);
    } catch (err) {
        console.error(err.message);
        alert('Failed to load low stock alerts.');
    }
};

const renderLowStockTable = (products) => {
    const lowStockTableBody = document.getElementById('lowStockTableBody');
    if (!products.length) {
        lowStockTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-gray-500">No low stock products</td>
            </tr>
        `;
        return;
    }

    const tableRows = products.map(
        ({ product_name, quantity, location }) => `
            <tr>
                <td class="px-4 py-2 border border-gray-300">${product_name}</td>
                <td class="px-4 py-2 border border-gray-300">${quantity}</td>
                <td class="px-4 py-2 border border-gray-300">${location}</td>
            </tr>
        `
    ).join('');

    lowStockTableBody.innerHTML = tableRows;
};

// Fetch low stock products on dashboard load
document.addEventListener('DOMContentLoaded', fetchLowStockProducts);

const fetchStockDistribution = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/analytics/stockdistribution`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (!response.ok) throw new Error('Failed to fetch stock distribution data');

        const data = await response.json();
        renderStockDistributionChart(data);
    } catch (err) {
        console.error(err.message);
        alert('Failed to load stock distribution data.');
    }
};

const renderStockDistributionChart = (data) => {
    const ctx = document.getElementById('stockDistributionChart').getContext('2d');
    const locations = data.map(item => item.location);
    const quantities = data.map(item => item.total_quantity);

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: locations,
            datasets: [{
                label: 'Stock Distribution',
                data: quantities,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw} units`,
                    },
                },
            },
        },
    });
};

const fetchTransactionBreakdown = async () => {
    try {
        const response = await fetch(`http://localhost:3001/api/analytics/transactionbreakdown`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (!response.ok) throw new Error('Failed to fetch transaction breakdown');

        const data = await response.json();
        renderTransactionBreakdownPieChart(data);
    } catch (err) {
        console.error('Error fetching transaction breakdown:', err);
        alert('Failed to load transaction breakdown');
    }
};

const renderTransactionBreakdownPieChart = (data) => {
    const ctx = document.getElementById('transactionBreakdownChart').getContext('2d');
    const labels = data.map(item => item.change_type); // Map change_type for labels
    const values = data.map(item => item.transaction_count); // Map transaction_count for values

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(153, 102, 255, 0.6)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 159, 64, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value}`;
                        },
                    },
                },
            },
        },
    });
};


document.addEventListener('DOMContentLoaded', fetchTransactionBreakdown);



// Fetch stock distribution data on dashboard load
document.addEventListener('DOMContentLoaded', fetchStockDistribution);

const fetchDailySalesTrends = async () => {
    try {
        const response = await fetch(`http://localhost:3001/api/analytics/dailysales`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (!response.ok) throw new Error('Failed to fetch daily sales data');

        const data = await response.json();
        renderDailySalesChart(data);
    } catch (err) {
        console.error(err.message);
        alert('Failed to load daily sales data.');
    }
};

const renderDailySalesChart = (data) => {
    const ctx = document.getElementById('dailySalesChart').getContext('2d');
    const dates = data.map(item => item.date);
    const quantities = data.map(item => item.sales_quantity);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Daily Sales Quantity',
                data: quantities,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: true,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: 'Sales Quantity',
                    },
                },
            },
        },
    });
};

// Fetch daily sales trends on dashboard load
document.addEventListener('DOMContentLoaded', fetchDailySalesTrends);



// Handle logout
const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "login.html";
};

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);
