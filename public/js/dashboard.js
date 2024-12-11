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

// Handle logout
const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "login.html";
};

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);
