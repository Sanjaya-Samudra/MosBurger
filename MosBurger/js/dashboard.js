// Check authentication
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// Enhanced dashboard data - calculated from real data
function getDashboardData() {
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const foodItems = JSON.parse(localStorage.getItem('foodItems')) || [];

    // Calculate today's date
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Filter today's orders
    const todayOrders = orders.filter(order =>
        new Date(order.timestamp) >= todayStart &&
        new Date(order.timestamp) < todayEnd
    );

    // Calculate today's sales
    const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);

    // Get top items from all orders (not just today)
    const itemSales = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            if (!itemSales[item.name]) {
                itemSales[item.name] = { quantity: 0, revenue: 0 };
            }
            itemSales[item.name].quantity += item.quantity;
            itemSales[item.name].revenue += (item.price * item.quantity);
        });
    });

    // Convert to array and sort by revenue
    const topItems = Object.entries(itemSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    // Calculate weekly sales (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

        const dayOrders = orders.filter(order =>
            new Date(order.timestamp) >= dayStart &&
            new Date(order.timestamp) < dayEnd
        );

        const daySales = dayOrders.reduce((sum, order) => sum + order.total, 0);
        last7Days.push(daySales);
    }

    return {
        totalItems: foodItems.length,
        todayOrders: todayOrders.length,
        totalCustomers: customers.length,
        todaySales: todaySales,
        weeklySales: last7Days,
        topItems: topItems
    };
}

// Animation counters for number counting effect
let animatedStats = {
    totalItems: 0,
    todayOrders: 0,
    totalCustomers: 0,
    todaySales: 0
};

// Animate numbers counting up
function animateNumber(elementId, targetValue, duration = 2000) {
    const element = document.getElementById(elementId);
    const startValue = 0;
    const startTime = performance.now();

    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutExpo);

        if (elementId === 'todaySales') {
            element.textContent = `LKR ${currentValue.toLocaleString()}`;
        } else {
            element.textContent = currentValue;
        }

        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }

    requestAnimationFrame(updateNumber);
}

// Initialize dashboard with animations
function initializeDashboard() {
    const dashboardData = getDashboardData();

    // Animate statistics
    animateNumber('totalItems', dashboardData.totalItems);
    animateNumber('todayOrders', dashboardData.todayOrders);
    animateNumber('totalCustomers', dashboardData.totalCustomers);
    animateNumber('todaySales', dashboardData.todaySales);

    // Update header statistics
    animateNumber('headerTotalItems', dashboardData.totalItems);
    animateNumber('headerTodayOrders', dashboardData.todayOrders);
    document.getElementById('headerTodaySales').textContent = 'LKR ' + dashboardData.todaySales.toLocaleString();

    // Initialize charts
    initializeCharts();

    // Populate recent orders table
    populateRecentOrders();

    // Add interactive effects
    addInteractiveEffects();
}

// Initialize charts using Chart.js
function initializeCharts() {
    const dashboardData = getDashboardData();

    // Sales Trend Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Sales (LKR)',
                data: dashboardData.weeklySales,
                borderColor: 'rgb(255, 107, 53)',
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(255, 107, 53)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgb(255, 107, 53)',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'LKR ' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });

    // Top Items Chart
    const itemsCtx = document.getElementById('itemsChart').getContext('2d');
    new Chart(itemsCtx, {
        type: 'doughnut',
        data: {
            labels: dashboardData.topItems.map(item => item.name),
            datasets: [{
                data: dashboardData.topItems.map(item => item.revenue),
                backgroundColor: [
                    'rgba(255, 107, 53, 0.8)',
                    'rgba(247, 147, 30, 0.8)',
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(0, 212, 170, 0.8)',
                    'rgba(255, 193, 7, 0.8)'
                ],
                borderColor: [
                    'rgb(255, 107, 53)',
                    'rgb(247, 147, 30)',
                    'rgb(102, 126, 234)',
                    'rgb(0, 212, 170)',
                    'rgb(255, 193, 7)'
                ],
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    callbacks: {
                        label: function(context) {
                            const item = dashboardData.topItems[context.dataIndex];
                            return `${item.name}: LKR ${item.revenue.toLocaleString()}`;
                        }
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Populate recent orders table with enhanced styling
function populateRecentOrders() {
    // Get real orders from localStorage or show empty state
    const realOrders = JSON.parse(localStorage.getItem('orders')) || [];

    if (realOrders.length === 0) {
        const tableBody = document.getElementById('recentOrdersTable');
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-light);">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;"></i>
                    <p>No orders yet. Orders will appear here when customers place them.</p>
                </td>
            </tr>
        `;
        return;
    }

    // Get customer information for each order
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const customerMap = {};
    customers.forEach(customer => {
        customerMap[customer.phone] = customer;
    });

    const tableBody = document.getElementById('recentOrdersTable');
    tableBody.innerHTML = '';

    // Show only the latest 4 orders
    const recentOrders = realOrders.slice(-4).reverse();

    recentOrders.forEach((order, index) => {
        const customer = customerMap[order.customerId] || { name: 'Unknown Customer', phone: order.customerId };
        const row = tableBody.insertRow();
        row.style.animationDelay = `${index * 0.1}s`;

        row.innerHTML = `
            <td>#${order.id}</td>
            <td>
                <div class="customer-info">
                    <strong>${customer.name}</strong>
                    <small class="order-time">${new Date(order.timestamp).toLocaleString()}</small>
                </div>
            </td>
            <td>${order.items.map(item => item.name).join(', ')}</td>
            <td><strong>LKR ${order.total.toLocaleString()}</strong></td>
            <td><span class="status ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
            <td>
                <button class="btn btn-primary btn-small" onclick="viewOrder('${order.id}')" title="View Order">
                    <i class="fas fa-eye"></i>
                </button>
                ${order.status === 'pending' ? `<button class="btn btn-warning btn-small" onclick="updateOrderStatus('${order.id}')" title="Update Status">
                    <i class="fas fa-edit"></i>
                </button>` : ''}
            </td>
        `;
    });
}

// Add interactive effects and animations
function addInteractiveEffects() {
    // Animate stat cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.stat-card').forEach(card => {
        observer.observe(card);
    });

    // Add hover effects to table rows
    document.querySelectorAll('.data-table tbody tr').forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(4px)';
        });

        row.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });

    // Chart filter interactions
    document.querySelectorAll('.chart-filter').forEach(filter => {
        filter.addEventListener('change', function() {
            // In a real app, you would update the chart data based on the filter
            console.log('Chart filter changed:', this.value);
        });
    });
}

// Add interactive effects and animations
function addInteractiveEffects() {
    // Animate stat cards on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.stat-card').forEach(card => {
        observer.observe(card);
    });

    // Add hover effects to table rows
    document.querySelectorAll('.data-table tbody tr').forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(4px)';
        });

        row.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });

    // Chart filter interactions
    document.querySelectorAll('.chart-filter').forEach(filter => {
        filter.addEventListener('change', function() {
            // In a real app, you would update the chart data based on the filter
            console.log('Chart filter changed:', this.value);
        });
    });
}
function viewOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const customers = JSON.parse(localStorage.getItem('customers')) || [];

    const order = orders.find(o => o.id === orderId);
    if (!order) {
        alert('Order not found!');
        return;
    }

    // Get customer info
    const customer = customers.find(c => c.phone === order.customerId) || { name: 'Unknown Customer', phone: order.customerId };

    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const content = document.getElementById('orderDetailsContent');
    content.innerHTML = `
        <div class="order-details-container">
            <!-- Premium Order Header -->
            <div class="order-details-header">
                <div class="order-info-primary">
                    <h2>Order #${order.id}</h2>
                    <div class="order-meta">
                        <span class="order-date">
                            <i class="fas fa-calendar"></i>
                            ${new Date(order.timestamp).toLocaleString()}
                        </span>
                        <span class="order-status ${order.status}">
                            <i class="fas fa-circle"></i>
                            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                    </div>
                </div>
                <div class="order-actions">
                    <button class="btn btn-primary" onclick="editOrder('${order.id}')">
                        <i class="fas fa-edit"></i> Edit Order
                    </button>
                    <button class="btn btn-secondary" onclick="printOrder('${order.id}')">
                        <i class="fas fa-print"></i> Print Receipt
                    </button>
                    <button class="btn btn-danger" onclick="cancelOrder('${order.id}')">
                        <i class="fas fa-times"></i> Cancel Order
                    </button>
                </div>
            </div>

            <!-- Customer & Order Info Grid -->
            <div class="order-info-grid">
                <div class="info-section">
                    <div class="info-header">
                        <i class="fas fa-user-circle"></i>
                        <h3>Customer Information</h3>
                    </div>
                    <div class="info-content">
                        <div class="info-row">
                            <label>Name:</label>
                            <span>${customer.name}</span>
                        </div>
                        <div class="info-row">
                            <label>Phone:</label>
                            <span>${customer.phone}</span>
                        </div>
                        ${customer.email ? `
                            <div class="info-row">
                                <label>Email:</label>
                                <span>${customer.email}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="info-section">
                    <div class="info-header">
                        <i class="fas fa-shopping-cart"></i>
                        <h3>Order Summary</h3>
                    </div>
                    <div class="info-content">
                        <div class="info-row">
                            <label>Order Type:</label>
                            <span>Delivery</span>
                        </div>
                        <div class="info-row">
                            <label>Payment Method:</label>
                            <span>Cash on Delivery</span>
                        </div>
                        <div class="info-row">
                            <label>Order Time:</label>
                            <span>${new Date(order.timestamp).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Premium Items Table -->
            <div class="order-items-section">
                <h3><i class="fas fa-list"></i> Order Items</h3>
                <div class="items-table">
                    <div class="table-header">
                        <span>Item</span>
                        <span>Qty</span>
                        <span>Price</span>
                        <span>Total</span>
                    </div>
                    ${order.items.map(item => `
                        <div class="table-row">
                            <span class="item-name">${item.name}</span>
                            <span class="item-quantity">${item.quantity}</span>
                            <span class="item-price">LKR ${item.price.toLocaleString()}</span>
                            <span class="item-total">LKR ${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    `).join('')}
                    <div class="table-footer">
                        <span class="total-label">Grand Total:</span>
                        <span class="total-amount">LKR ${order.total.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <!-- Spectacular Timeline -->
            <div class="order-timeline">
                <h3><i class="fas fa-history"></i> Order Timeline</h3>
                <div class="timeline">
                    <div class="timeline-item ${order.status === 'pending' ? 'active' : 'completed'}">
                        <div class="timeline-marker">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="timeline-content">
                            <h4>Order Placed</h4>
                            <p>Customer placed the order</p>
                            <small>${new Date(order.timestamp).toLocaleString()}</small>
                        </div>
                    </div>
                    ${order.status !== 'pending' ? `
                        <div class="timeline-item completed">
                            <div class="timeline-marker">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="timeline-content">
                                <h4>Order Confirmed</h4>
                                <p>Order has been confirmed by restaurant</p>
                                <small>${new Date(order.timestamp).toLocaleString()}</small>
                            </div>
                        </div>
                    ` : ''}
                    ${order.status === 'completed' ? `
                        <div class="timeline-item completed">
                            <div class="timeline-marker">
                                <i class="fas fa-truck"></i>
                            </div>
                            <div class="timeline-content">
                                <h4>Order Delivered</h4>
                                <p>Order has been delivered to customer</p>
                                <small>${new Date(order.timestamp).toLocaleString()}</small>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    orderDetailsModal.style.display = 'flex';
    setTimeout(() => {
        orderDetailsModal.classList.add('show');
    }, 10);
}

// Edit order function
function editOrder(orderId) {
    // In a real app, this would open an edit modal
    alert(`Edit functionality for order ${orderId} would be implemented here.`);
}

// Print order function
function printOrder(orderId) {
    // In a real app, this would generate a printable receipt
    window.print();
}

// Cancel order function
function cancelOrder(orderId) {
    if (confirm('Are you sure you want to cancel this order?')) {
        // In a real app, this would update the order status
        alert(`Order ${orderId} has been cancelled.`);
        closeOrderModal();
    }
}

// Close order modal function
function closeOrderModal() {
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    orderDetailsModal.classList.remove('show');
    setTimeout(() => {
        orderDetailsModal.style.display = 'none';
    }, 300);
}

// Modal close functionality for order modal and initialize everything
document.addEventListener('DOMContentLoaded', function() {
    // Add close functionality for order modal
    const orderModalClose = orderDetailsModal?.querySelector('.close');
    if (orderModalClose) {
        orderModalClose.addEventListener('click', () => {
            closeOrderModal();
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === orderDetailsModal) {
            closeOrderModal();
        }
    });

    // Initialize dashboard and start real-time updates
    initializeDashboard();
    startRealTimeUpdates();
});

// Add CSS animations for the dashboard
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .stat-card {
        opacity: 0;
        transform: translateY(20px);
    }

    .customer-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .order-time {
        color: var(--text-light);
        font-size: 0.8rem;
        font-weight: 400;
    }

    .chart-container canvas {
        max-height: 100% !important;
    }
`;
document.head.appendChild(style);
