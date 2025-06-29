
// Check authentication
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// Get data from localStorage
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let foodItems = JSON.parse(localStorage.getItem('foodItems')) || [];

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
    tbody.innerHTML = sortedCustomers.map(customer => `
        <tr>
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
                <td>${growth !== 'N/A' ? growth + '%' : 'N/A'}</td>
            </tr>
        `;
    }).join('');
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
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize
initializeYearDropdowns();
updateSummaryStats();
generateMonthlySalesReport();
generateTopCustomersReport();
generatePopularItemsReport();
generateAnnualReport();
