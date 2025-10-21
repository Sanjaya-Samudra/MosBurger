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

// Global variable to track if we're showing all orders or just recent ones
let showingAllOrders = false;

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

    // Populate recent orders table (show only latest 5 by default)
    populateRecentOrders(false);

    // Add interactive effects
    addInteractiveEffects();

    // Setup View All button functionality
    setupViewAllButton();
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
function populateRecentOrders(showAll = false) {
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

    // Show only the latest 5 orders or all orders based on showAll parameter
    const ordersToShow = showAll ? realOrders : realOrders.slice(-5);
    const recentOrders = ordersToShow.reverse();

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

// Setup View All button functionality
function setupViewAllButton() {
    const viewAllButton = document.querySelector('.section-header .btn-secondary');
    if (viewAllButton) {
        viewAllButton.addEventListener('click', function() {
            showingAllOrders = !showingAllOrders;
            populateRecentOrders(showingAllOrders);

            // Update button text and icon
            if (showingAllOrders) {
                this.innerHTML = '<i class="fas fa-eye-slash"></i> Show Less';
                this.classList.remove('btn-secondary');
                this.classList.add('btn-warning');
            } else {
                this.innerHTML = '<i class="fas fa-eye"></i> View All';
                this.classList.remove('btn-warning');
                this.classList.add('btn-secondary');
            }
        });
    }
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

            <!-- Ultra-Modern Order Summary Showcase -->
            <div class="ultra-order-summary">
                <div class="summary-glass-header">
                    <div class="header-glow"></div>
                    <div class="header-content">
                        <div class="summary-icon-wrapper">
                            <div class="summary-icon-bg">
                                <i class="fas fa-clipboard-list"></i>
                            </div>
                        </div>
                        <div class="summary-info">
                            <h3>Order Summary</h3>
                            <p>Complete order information & details</p>
                        </div>
                        <div class="order-status-badge">
                            <div class="status-indicator ${order.status}">
                                <i class="fas fa-circle"></i>
                                <span>${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="summary-content-grid">
                    <!-- Order Details Card -->
                    <div class="summary-card order-details-card">
                        <div class="card-glow"></div>
                        <div class="card-content">
                            <div class="card-header">
                                <div class="card-icon">
                                    <i class="fas fa-info-circle"></i>
                                </div>
                                <h4>Order Details</h4>
                            </div>
                            <div class="order-compact-info">
                                <div class="order-main">
                                    <div class="order-id">#${order.id}</div>
                                    <div class="order-meta">
                                        <i class="fas fa-truck"></i>
                                        <span>Delivery</span>
                                    </div>
                                    <div class="order-meta">
                                        <i class="fas fa-credit-card"></i>
                                        <span>Cash on Delivery</span>
                                    </div>
                                </div>
                                <div class="order-time">
                                    <i class="fas fa-clock"></i>
                                    <div class="time-info">
                                        <span class="time-date">${new Date(order.timestamp).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}</span>
                                        <span class="time-clock">${new Date(order.timestamp).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Customer Information Card -->
                    <div class="summary-card customer-info-card">
                        <div class="card-glow"></div>
                        <div class="card-content">
                            <div class="card-header">
                                <div class="card-icon">
                                    <i class="fas fa-user-circle"></i>
                                </div>
                                <h4>Customer Info</h4>
                            </div>
                            <div class="customer-compact-info">
                                <div class="customer-main">
                                    <div class="customer-name">${customer.name}</div>
                                    <div class="customer-contact">
                                        <i class="fas fa-phone"></i>
                                        <span>${customer.phone}</span>
                                    </div>
                                    ${customer.email ? `
                                        <div class="customer-contact">
                                            <i class="fas fa-envelope"></i>
                                            <span>${customer.email}</span>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="customer-address">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>Standard Delivery</span>
                                    <small>30-45 minutes</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ultra-Modern Order Items Showcase -->
            <div class="ultra-order-items">
                <div class="items-glass-header">
                    <div class="header-glow"></div>
                    <div class="header-content">
                        <div class="items-icon-wrapper">
                            <div class="items-icon-bg">
                                <i class="fas fa-shopping-basket"></i>
                            </div>
                        </div>
                        <div class="items-info">
                            <h3>Order Items</h3>
                            <p>${order.items.length} delicious item${order.items.length > 1 ? 's' : ''} in your order</p>
                        </div>
                        <div class="items-counter">
                            <div class="counter-badge">
                                <span class="counter-number">${order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                <span class="counter-label">Total Qty</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="items-showcase">
                    ${order.items.map((item, index) => `
                        <div class="item-card" style="animation-delay: ${index * 0.1}s">
                            <div class="item-glow"></div>
                            <div class="item-content">
                                <div class="item-header">
                                    <div class="item-name-section">
                                        <h4 class="item-name">${item.name}</h4>
                                        <div class="item-category">
                                            <span class="category-badge">
                                                <i class="fas fa-utensils"></i>
                                                Premium
                                            </span>
                                        </div>
                                    </div>
                                    <div class="item-quantity-display">
                                        <div class="quantity-circle">
                                            <span class="quantity-number">${item.quantity}</span>
                                            <span class="quantity-label">Qty</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="item-details">
                                    <div class="price-breakdown">
                                        <div class="price-row">
                                            <span class="price-label">Unit Price:</span>
                                            <span class="price-value">LKR ${item.price.toLocaleString()}</span>
                                        </div>
                                        <div class="price-row total-row">
                                            <span class="price-label">Subtotal:</span>
                                            <span class="price-value total-value">LKR ${(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="item-visual">
                                    <div class="item-decoration">
                                        <div class="decoration-line"></div>
                                        <div class="decoration-dot"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="order-total-showcase">
                    <div class="total-card">
                        <div class="total-glow"></div>
                        <div class="total-content">
                            <div class="total-header">
                                <div class="total-icon">
                                    <i class="fas fa-calculator"></i>
                                </div>
                                <h4>Order Total</h4>
                            </div>
                            <div class="total-breakdown">
                                <div class="total-row">
                                    <span class="total-label">Subtotal (${order.items.length} item${order.items.length > 1 ? 's' : ''}):</span>
                                    <span class="total-value">LKR ${order.total.toLocaleString()}</span>
                                </div>
                                <div class="total-row delivery-row">
                                    <span class="total-label">Delivery Fee:</span>
                                    <span class="total-value">FREE</span>
                                </div>
                                <div class="total-row grand-total-row">
                                    <span class="total-label">Grand Total:</span>
                                    <span class="grand-total-value">LKR ${order.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ultra-Modern Spectacular Timeline -->
            <div class="ultra-timeline">
                <div class="timeline-glass-header">
                    <div class="header-glow"></div>
                    <div class="header-content">
                        <div class="timeline-icon-wrapper">
                            <div class="timeline-icon-bg">
                                <i class="fas fa-route"></i>
                            </div>
                        </div>
                        <div class="timeline-info">
                            <h3>Order Journey</h3>
                            <p>Real-time order tracking</p>
                        </div>
                        <div class="progress-indicator">
                            <div class="progress-ring">
                                <svg width="60" height="60">
                                    <circle cx="30" cy="30" r="25" stroke="#e2e8f0" stroke-width="4" fill="none"/>
                                    <circle cx="30" cy="30" r="25" stroke="url(#progressGradient)"
                                            stroke-width="4" fill="none"
                                            stroke-dasharray="${2 * Math.PI * 25}"
                                            stroke-dashoffset="${2 * Math.PI * 25 * (1 - (order.status === 'completed' ? 1 : order.status === 'confirmed' ? 0.6 : 0.3))}"
                                            transform="rotate(-90 30 30)"/>
                                </svg>
                                <div class="progress-text">${order.status === 'completed' ? '100' : order.status === 'confirmed' ? '60' : '30'}%</div>
                            </div>
                            <defs>
                                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" style="stop-color:#ff6b35"/>
                                    <stop offset="50%" style="stop-color:#ff8c42"/>
                                    <stop offset="100%" style="stop-color:#ffb366"/>
                                </linearGradient>
                            </defs>
                        </div>
                    </div>
                </div>

                <div class="timeline-flow">
                    <!-- Order Placed Step -->
                    <div class="flow-step ${order.status === 'pending' ? 'active' : 'completed'}">
                        <div class="step-node">
                            <div class="node-core">
                                <i class="fas fa-shopping-cart"></i>
                            </div>
                            <div class="node-pulse"></div>
                            <div class="node-glow"></div>
                        </div>
                        <div class="step-card">
                            <div class="card-header">
                                <h4>Order Placed</h4>
                                <div class="time-stamp">
                                    <i class="fas fa-clock"></i>
                                    ${new Date(order.timestamp).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            <p>Your delicious order has been received and is being processed.</p>
                            <div class="step-status">
                                <span class="status-dot completed"></span>
                                Confirmed
                            </div>
                        </div>
                    </div>

                    <!-- Order Confirmed Step -->
                    ${order.status !== 'pending' ? `
                        <div class="flow-connector completed"></div>
                        <div class="flow-step completed">
                            <div class="step-node">
                                <div class="node-core">
                                    <i class="fas fa-check-double"></i>
                                </div>
                                <div class="node-pulse"></div>
                                <div class="node-glow"></div>
                            </div>
                            <div class="step-card">
                                <div class="card-header">
                                    <h4>Order Confirmed</h4>
                                    <div class="time-stamp">
                                        <i class="fas fa-clock"></i>
                                        ${new Date(new Date(order.timestamp).getTime() + 5 * 60 * 1000).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <p>Your order is confirmed and our chefs are preparing your meal.</p>
                                <div class="step-status">
                                    <span class="status-dot completed"></span>
                                    In Kitchen
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Order Ready Step -->
                    ${order.status === 'completed' ? `
                        <div class="flow-connector completed"></div>
                        <div class="flow-step completed">
                            <div class="step-node">
                                <div class="node-core">
                                    <i class="fas fa-box-open"></i>
                                </div>
                                <div class="node-pulse"></div>
                                <div class="node-glow"></div>
                            </div>
                            <div class="step-card">
                                <div class="card-header">
                                    <h4>Ready for Pickup</h4>
                                    <div class="time-stamp">
                                        <i class="fas fa-clock"></i>
                                        ${new Date(new Date(order.timestamp).getTime() + 20 * 60 * 1000).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <p>Your order is freshly prepared and ready for delivery!</p>
                                <div class="step-status">
                                    <span class="status-dot completed"></span>
                                    Ready
                                </div>
                            </div>
                        </div>

                        <div class="flow-connector completed"></div>
                        <div class="flow-step completed">
                            <div class="step-node">
                                <div class="node-core">
                                    <i class="fas fa-truck"></i>
                                </div>
                                <div class="node-pulse"></div>
                                <div class="node-glow"></div>
                            </div>
                            <div class="step-card">
                                <div class="card-header">
                                    <h4>Out for Delivery</h4>
                                    <div class="time-stamp">
                                        <i class="fas fa-clock"></i>
                                        ${new Date(new Date(order.timestamp).getTime() + 25 * 60 * 1000).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <p>Your order is on the way! Our delivery partner will arrive soon.</p>
                                <div class="step-status">
                                    <span class="status-dot completed"></span>
                                    En Route
                                </div>
                            </div>
                        </div>

                        <div class="flow-connector completed"></div>
                        <div class="flow-step completed">
                            <div class="step-node">
                                <div class="node-core">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="node-pulse"></div>
                                <div class="node-glow"></div>
                            </div>
                            <div class="step-card">
                                <div class="card-header">
                                    <h4>Delivered</h4>
                                    <div class="time-stamp">
                                        <i class="fas fa-clock"></i>
                                        ${new Date(new Date(order.timestamp).getTime() + 35 * 60 * 1000).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <p>Enjoy your meal! Thank you for choosing MOS Burgers.</p>
                                <div class="step-status">
                                    <span class="status-dot completed"></span>
                                    Complete
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Order Cancelled -->
                    ${order.status === 'cancelled' ? `
                        <div class="flow-connector cancelled"></div>
                        <div class="flow-step cancelled">
                            <div class="step-node">
                                <div class="node-core">
                                    <i class="fas fa-times-circle"></i>
                                </div>
                                <div class="node-pulse"></div>
                                <div class="node-glow"></div>
                            </div>
                            <div class="step-card">
                                <div class="card-header">
                                    <h4>Order Cancelled</h4>
                                    <div class="time-stamp">
                                        <i class="fas fa-clock"></i>
                                        ${new Date().toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <p>Your order has been cancelled. Refund will be processed shortly.</p>
                                <div class="step-status">
                                    <span class="status-dot cancelled"></span>
                                    Cancelled
                                </div>
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

// Edit order function - opens edit modal
function editOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const foodItems = JSON.parse(localStorage.getItem('foodItems')) || [];

    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Order not found!', 'error');
        return;
    }

    const customer = customers.find(c => c.phone === order.customerId) || { name: 'Unknown Customer', phone: order.customerId };

    // Create edit modal
    const editModal = document.createElement('div');
    editModal.id = 'editOrderModal';
    editModal.className = 'modal-overlay';
    editModal.innerHTML = `
        <div class="edit-modal">
            <div class="edit-modal-header">
                <h2><i class="fas fa-edit"></i> Edit Order #${order.id}</h2>
                <button class="close-btn" onclick="closeEditModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="edit-modal-body">
                <form id="editOrderForm">
                    <div class="edit-section">
                        <h3><i class="fas fa-user"></i> Customer Information</h3>
                        <div class="form-group">
                            <label>Customer Name</label>
                            <input type="text" id="editCustomerName" value="${customer.name}" required>
                        </div>
                        <div class="form-group">
                            <label>Phone Number</label>
                            <input type="tel" id="editCustomerPhone" value="${customer.phone}" required>
                        </div>
                        <div class="form-group">
                            <label>Email (Optional)</label>
                            <input type="email" id="editCustomerEmail" value="${customer.email || ''}">
                        </div>
                    </div>

                    <div class="edit-section">
                        <h3><i class="fas fa-shopping-cart"></i> Order Items</h3>
                        <div id="editOrderItems">
                            ${order.items.map((item, index) => `
                                <div class="edit-item" data-index="${index}">
                                    <div class="item-info">
                                        <span class="item-name">${item.name}</span>
                                        <span class="item-price">LKR ${item.price.toLocaleString()}</span>
                                    </div>
                                    <div class="quantity-controls">
                                        <button type="button" class="qty-btn" onclick="changeItemQuantity(${index}, -1)">
                                            <i class="fas fa-minus"></i>
                                        </button>
                                        <input type="number" class="qty-input" value="${item.quantity}" min="1" onchange="updateItemQuantity(${index}, this.value)">
                                        <button type="button" class="qty-btn" onclick="changeItemQuantity(${index}, 1)">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <button type="button" class="remove-item-btn" onclick="removeOrderItem(${index})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" class="add-item-btn" onclick="showAddItemModal()">
                            <i class="fas fa-plus"></i> Add Item
                        </button>
                    </div>

                    <div class="edit-section">
                        <h3><i class="fas fa-info-circle"></i> Order Details</h3>
                        <div class="form-group">
                            <label>Order Type</label>
                            <select id="editOrderType">
                                <option value="delivery" ${order.type === 'delivery' ? 'selected' : ''}>Delivery</option>
                                <option value="pickup" ${order.type === 'pickup' ? 'selected' : ''}>Pickup</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Payment Method</label>
                            <select id="editPaymentMethod">
                                <option value="cash" ${order.paymentMethod === 'cash' ? 'selected' : ''}>Cash on Delivery</option>
                                <option value="card" ${order.paymentMethod === 'card' ? 'selected' : ''}>Card</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Special Instructions</label>
                            <textarea id="editSpecialInstructions" rows="3" placeholder="Any special instructions...">${order.specialInstructions || ''}</textarea>
                        </div>
                    </div>
                </form>
            </div>
            <div class="edit-modal-footer">
                <div class="order-total">
                    <span>Total: LKR <span id="editOrderTotal">${order.total.toLocaleString()}</span></span>
                </div>
                <div class="edit-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeEditModal()">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button type="button" class="btn btn-primary" onclick="saveOrderChanges('${order.id}')">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(editModal);
    setTimeout(() => editModal.classList.add('show'), 10);

    // Store current order for editing
    window.currentEditingOrder = order;
}

// Print order function - generates printable receipt
function printOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const customers = JSON.parse(localStorage.getItem('customers')) || [];

    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Order not found!', 'error');
        return;
    }

    const customer = customers.find(c => c.phone === order.customerId) || { name: 'Unknown Customer', phone: order.customerId };

    // Create printable receipt
    const printWindow = window.open('', '_blank');
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>MOS Burger - Order Receipt #${order.id}</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    max-width: 400px;
                    margin: 0 auto;
                    padding: 20px;
                    line-height: 1.4;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #ff6b35;
                    padding-bottom: 20px;
                    margin-bottom: 20px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #ff6b35;
                    margin-bottom: 10px;
                }
                .receipt-title {
                    font-size: 18px;
                    color: #333;
                    margin-bottom: 20px;
                }
                .order-info {
                    margin-bottom: 20px;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    padding: 5px 0;
                }
                .info-label {
                    font-weight: bold;
                    color: #666;
                }
                .info-value {
                    color: #333;
                }
                .items-section {
                    margin: 20px 0;
                }
                .item-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;
                    border-bottom: 1px dashed #ddd;
                }
                .item-name {
                    flex: 1;
                    font-weight: 500;
                }
                .item-qty {
                    margin-right: 10px;
                    color: #666;
                }
                .item-price {
                    text-align: right;
                    min-width: 80px;
                }
                .total-section {
                    border-top: 2px solid #ff6b35;
                    padding-top: 15px;
                    margin-top: 20px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 18px;
                    font-weight: bold;
                    color: #ff6b35;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 12px;
                    color: #666;
                }
                @media print {
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">MOS BURGER</div>
                <div class="receipt-title">Order Receipt</div>
                <div>Order #${order.id}</div>
            </div>

            <div class="order-info">
                <div class="info-row">
                    <span class="info-label">Date:</span>
                    <span class="info-value">${new Date(order.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Time:</span>
                    <span class="info-value">${new Date(order.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Customer:</span>
                    <span class="info-value">${customer.name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Phone:</span>
                    <span class="info-value">${customer.phone}</span>
                </div>
                ${customer.email ? `
                    <div class="info-row">
                        <span class="info-label">Email:</span>
                        <span class="info-value">${customer.email}</span>
                    </div>
                ` : ''}
                <div class="info-row">
                    <span class="info-label">Order Type:</span>
                    <span class="info-value">${order.type || 'Delivery'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payment:</span>
                    <span class="info-value">${order.paymentMethod || 'Cash on Delivery'}</span>
                </div>
            </div>

            <div class="items-section">
                <h3 style="margin-bottom: 15px; color: #333;">Order Items</h3>
                ${order.items.map(item => `
                    <div class="item-row">
                        <span class="item-name">${item.name}</span>
                        <span class="item-qty">x${item.quantity}</span>
                        <span class="item-price">LKR ${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                `).join('')}
            </div>

            <div class="total-section">
                <div class="total-row">
                    <span>Total Amount:</span>
                    <span>LKR ${order.total.toLocaleString()}</span>
                </div>
            </div>

            <div class="footer">
                <div>Thank you for choosing MOS Burger!</div>
                <div>Enjoy your delicious meal!</div>
                <div style="margin-top: 10px; font-size: 10px;">
                    Printed on ${new Date().toLocaleString()}
                </div>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = function() {
        printWindow.print();
        printWindow.close();
    };

    showNotification('Receipt generated successfully!', 'success');
}

// Cancel order function - shows confirmation and updates status
function cancelOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        showNotification('Order not found!', 'error');
        return;
    }

    // Check if order can be cancelled
    if (order.status === 'completed' || order.status === 'cancelled') {
        showNotification(`Cannot cancel order with status: ${order.status}`, 'error');
        return;
    }

    // Create confirmation modal
    const confirmModal = document.createElement('div');
    confirmModal.id = 'cancelOrderModal';
    confirmModal.className = 'modal-overlay';
    confirmModal.innerHTML = `
        <div class="cancel-modal">
            <div class="cancel-modal-header">
                <div class="cancel-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Cancel Order</h2>
                <p>Are you sure you want to cancel Order #${order.id}?</p>
            </div>
            <div class="cancel-modal-body">
                <div class="cancel-warning">
                    <div class="warning-item">
                        <i class="fas fa-user"></i>
                        <span>Customer: ${order.customerId}</span>
                    </div>
                    <div class="warning-item">
                        <i class="fas fa-shopping-cart"></i>
                        <span>${order.items.length} items • LKR ${order.total.toLocaleString()}</span>
                    </div>
                    <div class="warning-item">
                        <i class="fas fa-clock"></i>
                        <span>Ordered: ${new Date(order.timestamp).toLocaleString()}</span>
                    </div>
                </div>
                <div class="cancel-notice">
                    <i class="fas fa-info-circle"></i>
                    <p>Cancelling this order will:</p>
                    <ul>
                        <li>Change order status to "Cancelled"</li>
                        <li>Stop any ongoing delivery process</li>
                        <li>Process refund if payment was made</li>
                    </ul>
                </div>
            </div>
            <div class="cancel-modal-footer">
                <button class="btn btn-secondary" onclick="closeCancelModal()">
                    <i class="fas fa-times"></i> Keep Order
                </button>
                <button class="btn btn-danger" onclick="confirmCancelOrder('${order.id}')">
                    <i class="fas fa-times-circle"></i> Cancel Order
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(confirmModal);
    setTimeout(() => confirmModal.classList.add('show'), 10);
}

// Helper functions for edit modal
function closeEditModal() {
    const modal = document.getElementById('editOrderModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

function changeItemQuantity(index, change) {
    const qtyInput = document.querySelector(`.edit-item[data-index="${index}"] .qty-input`);
    const newQty = Math.max(1, parseInt(qtyInput.value) + change);
    qtyInput.value = newQty;
    updateOrderTotal();
}

function updateItemQuantity(index, quantity) {
    const qty = Math.max(1, parseInt(quantity) || 1);
    document.querySelector(`.edit-item[data-index="${index}"] .qty-input`).value = qty;
    updateOrderTotal();
}

function removeOrderItem(index) {
    if (confirm('Remove this item from the order?')) {
        document.querySelector(`.edit-item[data-index="${index}"]`).remove();
        updateOrderTotal();
    }
}

function showAddItemModal() {
    const foodItems = JSON.parse(localStorage.getItem('foodItems')) || [];
    const addModal = document.createElement('div');
    addModal.id = 'addItemModal';
    addModal.className = 'modal-overlay';
    addModal.innerHTML = `
        <div class="add-item-modal">
            <div class="add-item-header">
                <h3><i class="fas fa-plus"></i> Add Item to Order</h3>
                <button class="close-btn" onclick="closeAddItemModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="add-item-body">
                ${foodItems.map(item => `
                    <div class="add-item-option" onclick="addItemToOrder('${item.name}', ${item.price})">
                        <div class="item-details">
                            <span class="item-name">${item.name}</span>
                            <span class="item-price">LKR ${item.price.toLocaleString()}</span>
                        </div>
                        <div class="add-icon">
                            <i class="fas fa-plus-circle"></i>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(addModal);
    setTimeout(() => addModal.classList.add('show'), 10);
}

function closeAddItemModal() {
    const modal = document.getElementById('addItemModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

function addItemToOrder(itemName, itemPrice) {
    const orderItems = document.getElementById('editOrderItems');
    const newIndex = orderItems.children.length;

    const itemElement = document.createElement('div');
    itemElement.className = 'edit-item';
    itemElement.setAttribute('data-index', newIndex);
    itemElement.innerHTML = `
        <div class="item-info">
            <span class="item-name">${itemName}</span>
            <span class="item-price">LKR ${itemPrice.toLocaleString()}</span>
        </div>
        <div class="quantity-controls">
            <button type="button" class="qty-btn" onclick="changeItemQuantity(${newIndex}, -1)">
                <i class="fas fa-minus"></i>
            </button>
            <input type="number" class="qty-input" value="1" min="1" onchange="updateItemQuantity(${newIndex}, this.value)">
            <button type="button" class="qty-btn" onclick="changeItemQuantity(${newIndex}, 1)">
                <i class="fas fa-plus"></i>
            </button>
        </div>
        <button type="button" class="remove-item-btn" onclick="removeOrderItem(${newIndex})">
            <i class="fas fa-trash"></i>
        </button>
    `;

    orderItems.appendChild(itemElement);
    updateOrderTotal();
    closeAddItemModal();
}

function updateOrderTotal() {
    const items = document.querySelectorAll('.edit-item');
    let total = 0;

    items.forEach(item => {
        const priceText = item.querySelector('.item-price').textContent;
        const price = parseInt(priceText.replace(/[^\d]/g, ''));
        const quantity = parseInt(item.querySelector('.qty-input').value) || 1;
        total += price * quantity;
    });

    document.getElementById('editOrderTotal').textContent = total.toLocaleString();
}

function saveOrderChanges(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
        showNotification('Order not found!', 'error');
        return;
    }

    // Get updated customer info
    const customerName = document.getElementById('editCustomerName').value.trim();
    const customerPhone = document.getElementById('editCustomerPhone').value.trim();
    const customerEmail = document.getElementById('editCustomerEmail').value.trim();

    // Update customer info
    let customer = customers.find(c => c.phone === orders[orderIndex].customerId);
    if (customer) {
        customer.name = customerName;
        customer.email = customerEmail;
        if (customer.phone !== customerPhone) {
            // Phone changed, update order reference
            orders[orderIndex].customerId = customerPhone;
            customer.phone = customerPhone;
        }
    } else {
        // Create new customer
        customer = {
            name: customerName,
            phone: customerPhone,
            email: customerEmail
        };
        customers.push(customer);
    }

    // Get updated order items
    const items = [];
    document.querySelectorAll('.edit-item').forEach(item => {
        const itemName = item.querySelector('.item-name').textContent;
        const priceText = item.querySelector('.item-price').textContent;
        const price = parseInt(priceText.replace(/[^\d]/g, ''));
        const quantity = parseInt(item.querySelector('.qty-input').value) || 1;

        items.push({
            name: itemName,
            price: price,
            quantity: quantity
        });
    });

    // Calculate new total
    const newTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Update order
    orders[orderIndex].items = items;
    orders[orderIndex].total = newTotal;
    orders[orderIndex].type = document.getElementById('editOrderType').value;
    orders[orderIndex].paymentMethod = document.getElementById('editPaymentMethod').value;
    orders[orderIndex].specialInstructions = document.getElementById('editSpecialInstructions').value.trim();

    // Save to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('customers', JSON.stringify(customers));

    // Close modal and refresh
    closeEditModal();
    closeOrderModal();
    populateRecentOrders();
    showNotification('Order updated successfully!', 'success');

    // Refresh dashboard data
    initializeDashboard();
}

// Helper functions for cancel modal
function closeCancelModal() {
    const modal = document.getElementById('cancelOrderModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

function confirmCancelOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex !== -1) {
        orders[orderIndex].status = 'cancelled';
        orders[orderIndex].cancelledAt = new Date().toISOString();

        localStorage.setItem('orders', JSON.stringify(orders));

        closeCancelModal();
        closeOrderModal();
        populateRecentOrders();
        showNotification('Order cancelled successfully!', 'success');

        // Refresh dashboard data
        initializeDashboard();
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
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
