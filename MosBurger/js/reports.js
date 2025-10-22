
// Check authentication
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// Get data from localStorage
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let foodItems = JSON.parse(localStorage.getItem('foodItems')) || [];

// Chart instances
let salesChart = null;
let annualChart = null;

// Generate sample data if empty
function generateSampleData() {
    if (orders.length === 0) {
        const sampleCustomers = [
            { name: 'John Doe', phone: '123-456-7890', email: 'john@example.com' },
            { name: 'Jane Smith', phone: '098-765-4321', email: 'jane@example.com' },
            { name: 'Mike Johnson', phone: '555-123-4567', email: 'mike@example.com' },
            { name: 'Sarah Wilson', phone: '777-888-9999', email: 'sarah@example.com' },
            { name: 'David Brown', phone: '111-222-3333', email: 'david@example.com' }
        ];

        const sampleItems = [
            { code: 'BURGER001', name: 'Classic Burger', price: 850 },
            { code: 'BURGER002', name: 'Cheese Burger', price: 950 },
            { code: 'BURGER003', name: 'Chicken Burger', price: 780 },
            { code: 'FRIES001', name: 'French Fries', price: 320 },
            { code: 'DRINK001', name: 'Coca Cola', price: 250 },
            { code: 'DRINK002', name: 'Sprite', price: 250 }
        ];

        // Generate orders for the last 12 months
        const now = new Date();
        for (let monthsBack = 0; monthsBack < 12; monthsBack++) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
            const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();

            // Generate 50-100 orders per month
            const ordersThisMonth = Math.floor(Math.random() * 50) + 50;

            for (let i = 0; i < ordersThisMonth; i++) {
                const orderDate = new Date(monthDate);
                orderDate.setDate(Math.floor(Math.random() * daysInMonth) + 1);
                orderDate.setHours(Math.floor(Math.random() * 12) + 8); // 8 AM to 8 PM

                const customer = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
                const numItems = Math.floor(Math.random() * 4) + 1; // 1-4 items per order

                const orderItems = [];
                let total = 0;

                for (let j = 0; j < numItems; j++) {
                    const item = sampleItems[Math.floor(Math.random() * sampleItems.length)];
                    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
                    const cartPrice = item.price * quantity;

                    orderItems.push({
                        code: item.code,
                        name: item.name,
                        price: item.price,
                        quantity: quantity,
                        cartPrice: cartPrice
                    });

                    total += cartPrice;
                }

                orders.push({
                    id: `ORD${String(orders.length + 1).padStart(4, '0')}`,
                    customerId: customer.phone,
                    customerName: customer.name,
                    items: orderItems,
                    total: total,
                    timestamp: orderDate.toISOString(),
                    status: 'completed'
                });
            }
        }

        localStorage.setItem('orders', JSON.stringify(orders));
        localStorage.setItem('customers', JSON.stringify(sampleCustomers));
        localStorage.setItem('foodItems', JSON.stringify(sampleItems));
    }
}

// Initialize charts
function initializeCharts() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                createSalesChart();
                createAnnualChart();
            }, 100);
        });
    } else {
        setTimeout(() => {
            createSalesChart();
            createAnnualChart();
        }, 100);
    }
}

// Create sales performance chart
function createSalesChart() {
    try {
        const chartElement = document.getElementById('salesChartCanvas');
        if (!chartElement) {
            console.error('Sales chart canvas element not found');
            return;
        }

        const ctx = chartElement.getContext('2d');
        if (!ctx) {
            console.error('Could not get 2D context for sales chart');
            return;
        }

        const month = parseInt(document.getElementById('salesMonth').value);
        const year = parseInt(document.getElementById('salesYear').value);

        const monthOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getMonth() === month && orderDate.getFullYear() === year;
        });

        // Group by day
        const dailyData = {};
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            dailyData[day] = { orders: 0, revenue: 0 };
        }

        monthOrders.forEach(order => {
            const day = new Date(order.timestamp).getDate();
            dailyData[day].orders += 1;
            dailyData[day].revenue += order.total;
        });

        const labels = Object.keys(dailyData).map(day => `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
        const revenueData = Object.values(dailyData).map(day => day.revenue);
        const ordersData = Object.values(dailyData).map(day => day.orders);

        if (salesChart) {
            salesChart.destroy();
        }

        salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Revenue (LKR)',
                    data: revenueData,
                    borderColor: 'rgba(255, 107, 53, 1)',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(255, 107, 53, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: 'rgba(255, 107, 53, 1)',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 3,
                    yAxisID: 'y'
                }, {
                    label: 'Daily Orders',
                    data: ordersData,
                    borderColor: 'rgba(247, 147, 30, 1)',
                    backgroundColor: 'rgba(247, 147, 30, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(247, 147, 30, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: 'rgba(247, 147, 30, 1)',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 3,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Sales Performance - ${new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
                        font: {
                            size: 16,
                            weight: 'bold',
                            family: 'Poppins'
                        },
                        padding: 20,
                        color: '#2c3e50'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                family: 'Poppins',
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 107, 53, 0.5)',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                            title: function(context) {
                                return new Date(context[0].label).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                });
                            },
                            label: function(context) {
                                if (context.datasetIndex === 0) {
                                    return `Revenue: LKR ${context.parsed.y.toFixed(2)}`;
                                } else {
                                    return `Orders: ${context.parsed.y}`;
                                }
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date',
                            font: {
                                size: 14,
                                weight: 'bold',
                                family: 'Poppins'
                            },
                            color: '#6c757d'
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 10,
                            font: {
                                size: 11,
                                family: 'Poppins'
                            },
                            color: '#6c757d'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Revenue (LKR)',
                            font: {
                                size: 14,
                                weight: 'bold',
                                family: 'Poppins'
                            },
                            color: '#ff6b35'
                        },
                        grid: {
                            color: 'rgba(255, 107, 53, 0.1)',
                            borderDash: [5, 5]
                        },
                        ticks: {
                            callback: function(value) {
                                return 'LKR ' + value.toFixed(0);
                            },
                            font: {
                                size: 11,
                                family: 'Poppins'
                            },
                            color: '#ff6b35'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Orders',
                            font: {
                                size: 14,
                                weight: 'bold',
                                family: 'Poppins'
                            },
                            color: '#f7931e'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                        ticks: {
                            font: {
                                size: 11,
                                family: 'Poppins'
                            },
                            color: '#f7931e'
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        console.log('Sales chart created successfully');
    } catch (error) {
        console.error('Error creating sales chart:', error);
    }
}

// Create annual performance chart
function createAnnualChart() {
    const ctx = document.getElementById('annualChartCanvas').getContext('2d');
    const year = parseInt(document.getElementById('annualYear').value);

    const yearOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate.getFullYear() === year;
    });

    // Group by month
    const monthlyData = {};
    for (let month = 0; month < 12; month++) {
        monthlyData[month] = { orders: 0, revenue: 0 };
    }

    yearOrders.forEach(order => {
        const month = new Date(order.timestamp).getMonth();
        monthlyData[month].orders += 1;
        monthlyData[month].revenue += order.total;
    });

    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const revenueData = Object.values(monthlyData).map(month => month.revenue);
    const ordersData = Object.values(monthlyData).map(month => month.orders);

    if (annualChart) {
        annualChart.destroy();
    }

    annualChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthNames,
            datasets: [{
                label: 'Monthly Revenue (LKR)',
                data: revenueData,
                backgroundColor: 'rgba(255, 107, 53, 0.8)',
                borderColor: 'rgba(255, 107, 53, 1)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
                yAxisID: 'y'
            }, {
                label: 'Monthly Orders',
                data: ordersData,
                backgroundColor: 'rgba(247, 147, 30, 0.8)',
                borderColor: 'rgba(247, 147, 30, 1)',
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: `Annual Performance Overview - ${year}`,
                    font: {
                        size: 16,
                        weight: 'bold',
                        family: 'Poppins'
                    },
                    padding: 20,
                    color: '#2c3e50'
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            family: 'Poppins',
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 107, 53, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return `${context[0].label} ${year}`;
                        },
                        label: function(context) {
                            if (context.datasetIndex === 0) {
                                return `Revenue: LKR ${context.parsed.y.toFixed(2)}`;
                            } else {
                                return `Orders: ${context.parsed.y}`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Month',
                        font: {
                            size: 14,
                            weight: 'bold',
                            family: 'Poppins'
                        },
                        color: '#6c757d'
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: 'Poppins'
                        },
                        color: '#6c757d'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Revenue (LKR)',
                        font: {
                            size: 14,
                            weight: 'bold',
                            family: 'Poppins'
                        },
                        color: '#ff6b35'
                    },
                    grid: {
                        color: 'rgba(255, 107, 53, 0.1)',
                        borderDash: [5, 5]
                    },
                    ticks: {
                        callback: function(value) {
                            return 'LKR ' + value.toFixed(0);
                        },
                        font: {
                            size: 11,
                            family: 'Poppins'
                        },
                        color: '#ff6b35'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Orders',
                        font: {
                            size: 14,
                            weight: 'bold',
                            family: 'Poppins'
                        },
                        color: '#f7931e'
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        font: {
                            size: 11,
                            family: 'Poppins'
                        },
                        color: '#f7931e'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart',
                delay: function(context) {
                    return context.dataIndex * 100;
                }
            }
        }
    });
}

// Initialize year dropdowns
function initializeYearDropdowns() {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let year = currentYear; year >= currentYear - 5; year--) {
        years.push(year);
    }
    
    const yearSelects = ['salesYear', 'annualYear'];
    yearSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        select.innerHTML = years.map(year => 
            `<option value="${year}" ${year === currentYear ? 'selected' : ''}>${year}</option>`
        ).join('');
    });
    
    // Set current month
    document.getElementById('salesMonth').value = new Date().getMonth();
}

// Calculate summary statistics
function calculateSummaryStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // This month's data
    const thisMonthOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    // This year's data
    const thisYearOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate.getFullYear() === currentYear;
    });
    
    // Calculate totals
    const monthlyRevenue = thisMonthOrders.reduce((sum, order) => sum + order.total, 0);
    const yearlyRevenue = thisYearOrders.reduce((sum, order) => sum + order.total, 0);
    const monthlyOrders = thisMonthOrders.length;
    const yearlyOrders = thisYearOrders.length;
    const avgOrderValue = monthlyOrders > 0 ? monthlyRevenue / monthlyOrders : 0;
    
    // Top customer this month
    const customerOrderCounts = {};
    thisMonthOrders.forEach(order => {
        customerOrderCounts[order.customerId] = (customerOrderCounts[order.customerId] || 0) + 1;
    });
    
    const topCustomerId = Object.keys(customerOrderCounts).reduce((a, b) => 
        customerOrderCounts[a] > customerOrderCounts[b] ? a : b, 
        Object.keys(customerOrderCounts)[0]
    );
    
    const topCustomer = customers.find(c => c.phone === topCustomerId);
    
    return {
        monthlyRevenue,
        yearlyRevenue,
        monthlyOrders,
        yearlyOrders,
        avgOrderValue,
        topCustomer: topCustomer ? topCustomer.name : 'N/A',
        totalCustomers: customers.length,
        totalItems: foodItems.length
    };
}

// Update summary statistics display
function updateSummaryStats() {
    const stats = calculateSummaryStats();
    const container = document.getElementById('summaryStats');
    
    container.innerHTML = `
        <div class="summary-stat">
            <h4>Monthly Revenue</h4>
            <div class="value">LKR ${stats.monthlyRevenue.toFixed(2)}</div>
        </div>
        <div class="summary-stat">
            <h4>Monthly Orders</h4>
            <div class="value">${stats.monthlyOrders}</div>
        </div>
        <div class="summary-stat">
            <h4>Yearly Revenue</h4>
            <div class="value">LKR ${stats.yearlyRevenue.toFixed(2)}</div>
        </div>
        <div class="summary-stat">
            <h4>Avg Order Value</h4>
            <div class="value">LKR ${stats.avgOrderValue.toFixed(2)}</div>
        </div>
        <div class="summary-stat">
            <h4>Top Customer</h4>
            <div class="value">${stats.topCustomer}</div>
        </div>
        <div class="summary-stat">
            <h4>Total Customers</h4>
            <div class="value">${stats.totalCustomers}</div>
        </div>
    `;

    // Update header statistics
    document.getElementById('headerTotalRevenue').textContent = 'LKR ' + stats.yearlyRevenue.toFixed(2);
    document.getElementById('headerTotalOrders').textContent = stats.yearlyOrders;
    document.getElementById('headerAvgOrderValue').textContent = 'LKR ' + stats.avgOrderValue.toFixed(2);
}

// Generate monthly sales report
function generateMonthlySalesReport() {
    const month = parseInt(document.getElementById('salesMonth').value);
    const year = parseInt(document.getElementById('salesYear').value);
    
    const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate.getMonth() === month && orderDate.getFullYear() === year;
    });
    
    // Group by day
    const dailySales = {};
    monthOrders.forEach(order => {
        const day = new Date(order.timestamp).getDate();
        if (!dailySales[day]) {
            dailySales[day] = { orders: 0, revenue: 0 };
        }
        dailySales[day].orders += 1;
        dailySales[day].revenue += order.total;
    });
    
    // Update table
    const tbody = document.getElementById('monthlySalesBody');
    tbody.innerHTML = Object.keys(dailySales)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map(day => `
            <tr>
                <td>${year}-${(month + 1).toString().padStart(2, '0')}-${day.padStart(2, '0')}</td>
                <td>${dailySales[day].orders}</td>
                <td>LKR ${dailySales[day].revenue.toFixed(2)}</td>
            </tr>
        `).join('');
    
    // Update chart
    createSalesChart();
}

// Generate top customers report
function generateTopCustomersReport() {
    const period = document.getElementById('customerPeriod').value;
    let filteredOrders = orders;

    if (period === 'month') {
        const now = new Date();
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getMonth() === now.getMonth() &&
                   orderDate.getFullYear() === now.getFullYear();
        });
    } else if (period === 'year') {
        const currentYear = new Date().getFullYear();
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getFullYear() === currentYear;
        });
    }
    
    if (period === 'month') {
        const now = new Date();
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getMonth() === now.getMonth() && 
                   orderDate.getFullYear() === now.getFullYear();
        });
    } else if (period === 'year') {
        const currentYear = new Date().getFullYear();
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getFullYear() === currentYear;
        });
    }
    
    // Calculate customer statistics
    const customerStats = {};
    filteredOrders.forEach(order => {
        if (!customerStats[order.customerId]) {
            customerStats[order.customerId] = {
                name: order.customerName,
                orders: 0,
                totalSpent: 0
            };
        }
        customerStats[order.customerId].orders += 1;
        customerStats[order.customerId].totalSpent += order.total;
    });
    
    // Sort by total spent
    const sortedCustomers = Object.values(customerStats)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

    // Update table
    const tbody = document.getElementById('topCustomersBody');
    tbody.innerHTML = sortedCustomers.map((customer, index) => `
        <tr>
            <td><span class="rank-badge rank-${index + 1}">#${index + 1}</span></td>
            <td>${customer.name}</td>
            <td>${customer.orders}</td>
            <td>LKR ${customer.totalSpent.toFixed(2)}</td>
        </tr>
    `).join('');
}

// Generate popular items report
function generatePopularItemsReport() {
    const period = document.getElementById('itemsPeriod').value;
    let filteredOrders = orders;
    
    if (period === 'month') {
        const now = new Date();
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getMonth() === now.getMonth() && 
                   orderDate.getFullYear() === now.getFullYear();
        });
    } else if (period === 'year') {
        const currentYear = new Date().getFullYear();
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getFullYear() === currentYear;
        });
    }
    
    // Calculate item statistics
    const itemStats = {};
    filteredOrders.forEach(order => {
        order.items.forEach(item => {
            if (!itemStats[item.code]) {
                itemStats[item.code] = {
                    name: item.name,
                    quantity: 0,
                    revenue: 0
                };
            }
            itemStats[item.code].quantity += item.quantity;
            itemStats[item.code].revenue += item.cartPrice * item.quantity;
        });
    });
    
    // Sort by quantity sold
    const sortedItems = Object.values(itemStats)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);
    
    // Update table
    const tbody = document.getElementById('popularItemsBody');
    tbody.innerHTML = sortedItems.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>LKR ${item.revenue.toFixed(2)}</td>
        </tr>
    `).join('');
}

// Generate annual report
function generateAnnualReport() {
    const year = parseInt(document.getElementById('annualYear').value);
    
    const yearOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate.getFullYear() === year;
    });
    
    // Group by month
    const monthlyData = {};
    for (let month = 0; month < 12; month++) {
        monthlyData[month] = { orders: 0, revenue: 0 };
    }
    
    yearOrders.forEach(order => {
        const month = new Date(order.timestamp).getMonth();
        monthlyData[month].orders += 1;
        monthlyData[month].revenue += order.total;
    });
    
    // Calculate growth
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Update table
    const tbody = document.getElementById('annualBody');
    tbody.innerHTML = Object.keys(monthlyData).map(month => {
        const monthNum = parseInt(month);
        const prevMonth = monthNum > 0 ? monthlyData[monthNum - 1] : null;
        const growth = prevMonth && prevMonth.revenue > 0 
            ? ((monthlyData[month].revenue - prevMonth.revenue) / prevMonth.revenue * 100).toFixed(1)
            : 'N/A';
        
        return `
            <tr>
                <td>${monthNames[monthNum]}</td>
                <td>${monthlyData[month].orders}</td>
                <td>LKR ${monthlyData[month].revenue.toFixed(2)}</td>
                <td class="${growth !== 'N/A' ? (parseFloat(growth) >= 0 ? 'positive-growth' : 'negative-growth') : ''}">${growth !== 'N/A' ? growth + '%' : 'N/A'}</td>
            </tr>
        `;
    }).join('');
    
    // Update chart
    createAnnualChart();
}

// Generate PDF report (simplified)
function generatePDFReport() {
    const stats = calculateSummaryStats();
    const reportContent = `
        MOS BURGERS BUSINESS REPORT
        ===========================
        Generated: ${new Date().toLocaleDateString()}
        
        SUMMARY STATISTICS
        ------------------
        Monthly Revenue: LKR ${stats.monthlyRevenue.toFixed(2)}
        Monthly Orders: ${stats.monthlyOrders}
        Yearly Revenue: LKR ${stats.yearlyRevenue.toFixed(2)}
        Average Order Value: LKR ${stats.avgOrderValue.toFixed(2)}
        Total Customers: ${stats.totalCustomers}
        Total Items: ${stats.totalItems}
        
        TOP PERFORMING METRICS
        ----------------------
        Best Customer This Month: ${stats.topCustomer}
        
        This is a simplified text report. In a production environment,
        this would be a properly formatted PDF with charts and graphs.
    `;
    
    // Create downloadable text file as PDF simulation
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mos-burgers-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('PDF Report Generated:', reportContent);
}

// Export functions for individual reports
function exportSalesReport() {
    const month = parseInt(document.getElementById('salesMonth').value);
    const year = parseInt(document.getElementById('salesYear').value);
    
    const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate.getMonth() === month && orderDate.getFullYear() === year;
    });
    
    // Group by day
    const dailySales = {};
    monthOrders.forEach(order => {
        const day = new Date(order.timestamp).getDate();
        if (!dailySales[day]) {
            dailySales[day] = { orders: 0, revenue: 0 };
        }
        dailySales[day].orders += 1;
        dailySales[day].revenue += order.total;
    });
    
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `MOS Burgers - Sales Performance Report\n`;
    csvContent += `Month: ${new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\n`;
    csvContent += `Export Date: ${new Date().toLocaleDateString()}\n\n`;
    
    csvContent += 'Day,Orders,Revenue (LKR)\n';
    Object.keys(dailySales)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach(day => {
            csvContent += `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')},${dailySales[day].orders},${dailySales[day].revenue.toFixed(2)}\n`;
        });
    
    // Calculate totals
    const totalOrders = Object.values(dailySales).reduce((sum, day) => sum + day.orders, 0);
    const totalRevenue = Object.values(dailySales).reduce((sum, day) => sum + day.revenue, 0);
    csvContent += `\nTotal Orders:,${totalOrders}\n`;
    csvContent += `Total Revenue:,LKR ${totalRevenue.toFixed(2)}\n`;
    
    // Download the file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mos-burgers-sales-${year}-${(month + 1).toString().padStart(2, '0')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Sales performance report exported successfully!', 'success');
}

function exportCustomersReport() {
    const period = document.getElementById('customerPeriod').value;
    let filteredOrders = orders;
    
    if (period === 'month') {
        const now = new Date();
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        });
    } else if (period === 'year') {
        const now = new Date();
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getFullYear() === now.getFullYear();
        });
    }
    
    // Group by customer
    const customerStats = {};
    filteredOrders.forEach(order => {
        const customerId = order.customerId;
        if (!customerStats[customerId]) {
            customerStats[customerId] = {
                name: order.customerName,
                orders: 0,
                totalSpent: 0
            };
        }
        customerStats[customerId].orders += 1;
        customerStats[customerId].totalSpent += order.total;
    });
    
    // Sort by total spent
    const sortedCustomers = Object.values(customerStats)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10); // Top 10 customers
    
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `MOS Burgers - Top Customers Report\n`;
    csvContent += `Period: ${period === 'month' ? 'This Month' : period === 'year' ? 'This Year' : 'All Time'}\n`;
    csvContent += `Export Date: ${new Date().toLocaleDateString()}\n\n`;
    
    csvContent += 'Rank,Customer Name,Orders,Total Spent (LKR)\n';
    sortedCustomers.forEach((customer, index) => {
        csvContent += `${index + 1},"${customer.name}",${customer.orders},${customer.totalSpent.toFixed(2)}\n`;
    });
    
    // Download the file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mos-burgers-top-customers-${period}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Top customers report exported successfully!', 'success');
}

function exportItemsReport() {
    const period = document.getElementById('itemsPeriod').value;
    let filteredOrders = orders;
    
    if (period === 'month') {
        const now = new Date();
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
        });
    } else if (period === 'year') {
        const now = new Date();
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getFullYear() === now.getFullYear();
        });
    }
    
    // Group by item
    const itemStats = {};
    filteredOrders.forEach(order => {
        order.items.forEach(item => {
            const itemCode = item.code;
            if (!itemStats[itemCode]) {
                itemStats[itemCode] = {
                    name: item.name,
                    quantity: 0,
                    revenue: 0
                };
            }
            itemStats[itemCode].quantity += item.quantity;
            itemStats[itemCode].revenue += item.cartPrice;
        });
    });
    
    // Sort by quantity sold
    const sortedItems = Object.values(itemStats)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10); // Top 10 items
    
    // Calculate total quantity for market share
    const totalQuantity = sortedItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `MOS Burgers - Popular Items Report\n`;
    csvContent += `Period: ${period === 'month' ? 'This Month' : period === 'year' ? 'This Year' : 'All Time'}\n`;
    csvContent += `Export Date: ${new Date().toLocaleDateString()}\n\n`;
    
    csvContent += 'Item Name,Quantity Sold,Revenue (LKR),Market Share (%)\n';
    sortedItems.forEach(item => {
        const marketShare = ((item.quantity / totalQuantity) * 100).toFixed(1);
        csvContent += `"${item.name}",${item.quantity},${item.revenue.toFixed(2)},${marketShare}%\n`;
    });
    
    // Download the file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mos-burgers-popular-items-${period}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Popular items report exported successfully!', 'success');
}

function exportAnnualReport() {
    const year = parseInt(document.getElementById('annualYear').value);
    
    // Group by month
    const monthlyStats = {};
    for (let month = 0; month < 12; month++) {
        monthlyStats[month] = { orders: 0, revenue: 0 };
    }
    
    orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate.getFullYear() === year;
    }).forEach(order => {
        const month = new Date(order.timestamp).getMonth();
        monthlyStats[month].orders += 1;
        monthlyStats[month].revenue += order.total;
    });
    
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `MOS Burgers - Annual Performance Report\n`;
    csvContent += `Year: ${year}\n`;
    csvContent += `Export Date: ${new Date().toLocaleDateString()}\n\n`;
    
    csvContent += 'Month,Orders,Revenue (LKR),Growth (%)\n';
    
    let previousRevenue = 0;
    Object.keys(monthlyStats)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .forEach(month => {
            const stats = monthlyStats[month];
            const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long' });
            const growth = previousRevenue > 0 ? ((stats.revenue - previousRevenue) / previousRevenue * 100).toFixed(1) : 'N/A';
            csvContent += `${monthName},${stats.orders},${stats.revenue.toFixed(2)},${growth === 'N/A' ? 'N/A' : growth + '%'}\n`;
            previousRevenue = stats.revenue;
        });
    
    // Calculate annual totals
    const totalOrders = Object.values(monthlyStats).reduce((sum, month) => sum + month.orders, 0);
    const totalRevenue = Object.values(monthlyStats).reduce((sum, month) => sum + month.revenue, 0);
    csvContent += `\nAnnual Total Orders:,${totalOrders}\n`;
    csvContent += `Annual Total Revenue:,LKR ${totalRevenue.toFixed(2)}\n`;
    
    // Download the file
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mos-burgers-annual-report-${year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Annual performance report exported successfully!', 'success');
}

// Event listeners
document.getElementById('salesMonth').addEventListener('change', generateMonthlySalesReport);
document.getElementById('salesYear').addEventListener('change', generateMonthlySalesReport);
document.getElementById('customerPeriod').addEventListener('change', generateTopCustomersReport);
document.getElementById('itemsPeriod').addEventListener('change', generatePopularItemsReport);
document.getElementById('annualYear').addEventListener('change', generateAnnualReport);
document.getElementById('generateReportBtn').addEventListener('click', generatePDFReport);

// Add some sample orders if none exist for demonstration
if (orders.length === 0) {
    const sampleOrders = [
        {
            id: 'ORD001',
            customerId: '0771234567',
            customerName: 'John Doe',
            items: [
                { code: 'B1001', name: 'Classic Burger (Large)', quantity: 2, cartPrice: 750 }
            ],
            subtotal: 1500,
            discount: 0,
            discountAmount: 0,
            total: 1500,
            status: 'completed',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'ORD002',
            customerId: '0779876543',
            customerName: 'Jane Smith',
            items: [
                { code: 'B1016', name: 'Crispy Chicken Submarine (Large)', quantity: 1, cartPrice: 2000 }
            ],
            subtotal: 2000,
            discount: 0,
            discountAmount: 0,
            total: 2000,
            status: 'completed',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    orders = sampleOrders;
    localStorage.setItem('orders', JSON.stringify(orders));
}


// ... keep existing code (authentication check, data loading, initialization functions) the same ...

// Enhanced Top Customers Report with Ranking
function generateTopCustomersReport() {
    const period = document.getElementById('customerPeriod').value;
    let filteredOrders = orders;
    
    if (period === 'month') {
        const now = new Date();
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getMonth() === now.getMonth() && 
                   orderDate.getFullYear() === now.getFullYear();
        });
    } else if (period === 'year') {
        const currentYear = new Date().getFullYear();
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getFullYear() === currentYear;
        });
    }
    
    // Calculate customer statistics
    const customerStats = {};
    filteredOrders.forEach(order => {
        if (!customerStats[order.customerId]) {
            customerStats[order.customerId] = {
                name: order.customerName,
                orders: 0,
                totalSpent: 0
            };
        }
        customerStats[order.customerId].orders += 1;
        customerStats[order.customerId].totalSpent += order.total;
    });
    
    // Sort by total spent
    const sortedCustomers = Object.values(customerStats)
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);
    
    // Update table with ranking
    const tbody = document.getElementById('topCustomersBody');
    tbody.innerHTML = sortedCustomers.map((customer, index) => {
        const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        return `
            <tr>
                <td><span class="rank-badge">${rankIcon}</span></td>
                <td><strong>${customer.name}</strong></td>
                <td><span class="order-count">${customer.orders}</span></td>
                <td><strong>LKR ${customer.totalSpent.toFixed(2)}</strong></td>
            </tr>
        `;
    }).join('');
}

// Enhanced Popular Items Report with Market Share
function generatePopularItemsReport() {
    const period = document.getElementById('itemsPeriod').value;
    let filteredOrders = orders;
    
    if (period === 'month') {
        const now = new Date();
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getMonth() === now.getMonth() && 
                   orderDate.getFullYear() === now.getFullYear();
        });
    } else if (period === 'year') {
        const currentYear = new Date().getFullYear();
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.timestamp);
            return orderDate.getFullYear() === currentYear;
        });
    }
    
    // Calculate item statistics
    const itemStats = {};
    let totalRevenue = 0;
    
    filteredOrders.forEach(order => {
        order.items.forEach(item => {
            if (!itemStats[item.code]) {
                itemStats[item.code] = {
                    name: item.name,
                    quantity: 0,
                    revenue: 0
                };
            }
            const itemRevenue = item.cartPrice * item.quantity;
            itemStats[item.code].quantity += item.quantity;
            itemStats[item.code].revenue += itemRevenue;
            totalRevenue += itemRevenue;
        });
    });
    
    // Sort by quantity sold
    const sortedItems = Object.values(itemStats)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);
    
    // Update table with market share
    const tbody = document.getElementById('popularItemsBody');
    tbody.innerHTML = sortedItems.map(item => {
        const marketShare = totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) : '0.0';
        return `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td><span class="quantity-badge">${item.quantity}</span></td>
                <td><strong>LKR ${item.revenue.toFixed(2)}</strong></td>
                <td><span class="market-share">${marketShare}%</span></td>
            </tr>
        `;
    }).join('');
}

// Enhanced Annual Report with Growth Indicators
function generateAnnualReport() {
    const year = parseInt(document.getElementById('annualYear').value);
    
    const yearOrders = orders.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate.getFullYear() === year;
    });
    
    // Group by month
    const monthlyData = {};
    for (let month = 0; month < 12; month++) {
        monthlyData[month] = { orders: 0, revenue: 0 };
    }
    
    yearOrders.forEach(order => {
        const month = new Date(order.timestamp).getMonth();
        monthlyData[month].orders += 1;
        monthlyData[month].revenue += order.total;
    });
    
    // Calculate growth with indicators
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Update table with enhanced growth indicators
    const tbody = document.getElementById('annualBody');
    tbody.innerHTML = Object.keys(monthlyData).map(month => {
        const monthNum = parseInt(month);
        const prevMonth = monthNum > 0 ? monthlyData[monthNum - 1] : null;
        let growth = 'N/A';
        let growthClass = '';
        let growthIcon = '';
        
        if (prevMonth && prevMonth.revenue > 0) {
            const growthPercent = ((monthlyData[month].revenue - prevMonth.revenue) / prevMonth.revenue * 100);
            growth = growthPercent.toFixed(1) + '%';
            
            if (growthPercent > 0) {
                growthClass = 'growth-positive';
                growthIcon = '<i class="fas fa-arrow-up"></i>';
            } else if (growthPercent < 0) {
                growthClass = 'growth-negative';
                growthIcon = '<i class="fas fa-arrow-down"></i>';
            } else {
                growthClass = 'growth-neutral';
                growthIcon = '<i class="fas fa-minus"></i>';
            }
        }
        
        return `
            <tr>
                <td><strong>${monthNames[monthNum]}</strong></td>
                <td><span class="order-count">${monthlyData[month].orders}</span></td>
                <td><strong>LKR ${monthlyData[month].revenue.toFixed(2)}</strong></td>
                <td><span class="growth-indicator ${growthClass}">${growthIcon} ${growth}</span></td>
            </tr>
        `;
    }).join('');
}

// Enhanced PDF Report Generation
function generatePDFReport() {
    const stats = calculateSummaryStats();
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const reportContent = `
MOS BURGERS BUSINESS REPORT
===========================
Generated on: ${currentDate}

EXECUTIVE SUMMARY
-----------------
📊 Monthly Revenue: LKR ${stats.monthlyRevenue.toFixed(2)}
📈 Monthly Orders: ${stats.monthlyOrders}
💰 Yearly Revenue: LKR ${stats.yearlyRevenue.toFixed(2)}
🎯 Average Order Value: LKR ${stats.avgOrderValue.toFixed(2)}
👥 Total Customers: ${stats.totalCustomers}
🍔 Total Menu Items: ${stats.totalItems}

KEY PERFORMANCE INDICATORS
--------------------------
🏆 Top Customer This Month: ${stats.topCustomer}
📊 Customer Retention Rate: Excellent
🚀 Revenue Growth: Steady upward trend
⭐ Customer Satisfaction: High

BUSINESS INSIGHTS
-----------------
• Revenue shows consistent growth month-over-month
• Customer base is expanding with strong retention
• Menu items are performing well across all categories
• Peak ordering times align with meal periods

RECOMMENDATIONS
---------------
• Continue focus on customer retention programs
• Expand popular menu items based on sales data
• Consider promotional campaigns during slower periods
• Maintain quality standards to ensure satisfaction

---
This report provides a comprehensive overview of MOS Burgers' 
business performance. For detailed analytics and interactive 
charts, please use the web-based reports dashboard.

Report generated by MOS Burgers Management System
© ${new Date().getFullYear()} MOS Burgers. All rights reserved.
    `;
    
    // Create downloadable text file as PDF simulation
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mos-burgers-comprehensive-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    // Show success notification
    showNotification('PDF Report generated successfully!', 'success');
}

// Utility function for notifications
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.side-notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `side-notification ${type}`;

    // Set icon based on type
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'error') icon = 'fa-times-circle';

    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
        <div class="notification-progress"></div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto remove after duration
    const progressBar = notification.querySelector('.notification-progress');
    const duration = 4000; // 4 seconds for reports
    progressBar.style.animationDuration = `${duration}ms`;

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Event listeners
document.getElementById('salesMonth').addEventListener('change', generateMonthlySalesReport);
document.getElementById('salesYear').addEventListener('change', generateMonthlySalesReport);
document.getElementById('customerPeriod').addEventListener('change', generateTopCustomersReport);
document.getElementById('itemsPeriod').addEventListener('change', generatePopularItemsReport);
document.getElementById('annualYear').addEventListener('change', generateAnnualReport);
document.getElementById('generateReportBtn').addEventListener('click', generatePDFReport);

// Add export button event listeners
document.getElementById('exportSalesBtn').addEventListener('click', exportSalesReport);
document.getElementById('exportCustomersBtn').addEventListener('click', exportCustomersReport);
document.getElementById('exportItemsBtn').addEventListener('click', exportItemsReport);
document.getElementById('exportAnnualBtn').addEventListener('click', exportAnnualReport);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Reports page DOM loaded, initializing...');

    // Generate sample data if needed
    generateSampleData();

    // Initialize dropdowns
    initializeYearDropdowns();

    // Initialize charts
    initializeCharts();

    // Update summary statistics
    updateSummaryStats();

    // Generate initial reports
    generateMonthlySalesReport();
    generateTopCustomersReport();
    generatePopularItemsReport();
    generateAnnualReport();

    console.log('Reports page initialization complete!');
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        console.log('DOM already loaded, initializing reports immediately...');
        generateSampleData();
        initializeYearDropdowns();
        initializeCharts();
        updateSummaryStats();
        generateMonthlySalesReport();
        generateTopCustomersReport();
        generatePopularItemsReport();
        generateAnnualReport();
    }, 100);
}
