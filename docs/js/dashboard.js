
// Check authentication
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// Sample data for dashboard
const dashboardData = {
    totalItems: 47,
    todayOrders: 24,
    totalCustomers: 156,
    todaySales: 45670
};

// Update dashboard stats
document.getElementById('totalItems').textContent = dashboardData.totalItems;
document.getElementById('todayOrders').textContent = dashboardData.todayOrders;
document.getElementById('totalCustomers').textContent = dashboardData.totalCustomers;
document.getElementById('todaySales').textContent = `LKR ${dashboardData.todaySales.toLocaleString()}`;

// Sample recent orders
const recentOrders = [
    {
        id: 'ORD001',
        customer: 'John Doe',
        items: 'Classic Burger, Pepsi',
        total: 1740,
        status: 'completed'
    },
    {
        id: 'ORD002',
        customer: 'Jane Smith',
        items: 'Chicken Submarine',
        total: 1800,
        status: 'pending'
    },
    {
        id: 'ORD003',
        customer: 'Mike Johnson',
        items: 'Double-Cheese Burger, Fries',
        total: 1850,
        status: 'completed'
    },
    {
        id: 'ORD004',
        customer: 'Sarah Wilson',
        items: 'Crispy Chicken Burger, Sprite',
        total: 3100,
        status: 'pending'
    }
];

// Populate recent orders table
const tableBody = document.getElementById('recentOrdersTable');
recentOrders.forEach(order => {
    const row = tableBody.insertRow();
    row.innerHTML = `
        <td>#${order.id}</td>
        <td>${order.customer}</td>
        <td>${order.items}</td>
        <td>LKR ${order.total.toLocaleString()}</td>
        <td><span class="status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
    `;
});

// Auto-refresh dashboard data every 30 seconds
setInterval(() => {
    // In a real app, you would fetch fresh data from the server
    const randomOrders = Math.floor(Math.random() * 10) + 20;
    const randomSales = Math.floor(Math.random() * 20000) + 30000;
    
    document.getElementById('todayOrders').textContent = randomOrders;
    document.getElementById('todaySales').textContent = `LKR ${randomSales.toLocaleString()}`;
}, 30000);
