export const API_BASE_URL = "http://localhost:3001/api";

import {addProduct, deleteProduct, fetchTransactions} from './api.js';

export const initializeDashboard = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    try {
        const transaction = await fetchTransactions();
        renderTable(transaction);
    } catch (error) {
        console.error("Failed to fetch inventory:", error);
        alert("Error loading dashboard data.");
    }

    document.getElementById("logoutButton").addEventListener("click", handleLogout);
};

const renderTable = (products) => {
    const transactionDiv = document.getElementById("transactionData");
    const tableHTML = products.length
        ? products.map((p) => generateRowHTML(p)).join("")
        : "<tr><td colspan='6'>No transaction available</td></tr>";
    transactionDiv.innerHTML = tableHTML;
};

const generateRowHTML = ({ product_id, quantity, timestamp, notes }) => `
    <tr>
        <td>${product_id}</td>
        <td>${quantity}</td>
        <td>${timestamp}</td>
        <td>${notes}</td>
    </tr>
    </tbody>
`;

// const handleTransaction = async (productId, changeType, token) => {
//     const transactionDetail = {
//         product_id: null,
//         user_id: null,
//         changeType: changeType.value,
//         quantity: parseInt(10), // Ensure numeric value
//         notes: changeType.value,
//     };

//     console.log("Transaction Data:", transactionDetail); // Debugging log

//     try {
//         const response = await fetch(`${API_BASE_URL}/transactions`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//             body: JSON.stringify(transactionDetail),
//         });

//         if (response.ok) {
//             alert("Transaction recorded successfully!");
//             const updatedInventory = await fetchInventory();
//             renderTable(updatedInventory);
//         } else {
//             const error = await response.json();
//             alert(`Failed to record transaction: ${error.error}`);
//         }
//     } catch (error) {
//         console.error("Trasaction recording Error:", error);
//         alert("Error recording Transaction product.");
//     }
// };

const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logged out successfully!");
    window.location.href = "login.html";
};
