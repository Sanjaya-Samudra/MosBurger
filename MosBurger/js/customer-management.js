// Check authentication
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// Get data from localStorage
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];

let editingCustomerId = null;
let currentFilter = 'all';

// Add sample data if empty
if (customers.length === 0) {
    customers = [
        {
            name: 'John Doe',
            phone: '123-456-7890',
            email: 'john@example.com',
            address: '123 Main St, Colombo',
            joinDate: new Date().toISOString()
        },
        {
            name: 'Jane Smith',
            phone: '098-765-4321',
            email: 'jane@example.com',
            address: '456 Oak Ave, Kandy',
            joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            name: 'Mike Johnson',
            phone: '555-123-4567',
            email: 'mike@example.com',
            address: '789 Pine Rd, Galle',
            joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    localStorage.setItem('customers', JSON.stringify(customers));
}

// Save customers to localStorage
function saveCustomers() {
    localStorage.setItem('customers', JSON.stringify(customers));
}

// Enhanced notification system
function showNotification(message, type = 'info', duration = 4000) {
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

// Success modal functions
function showSuccessModal(title, message) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = message;
    successModal.style.display = 'block';
}

function hideSuccessModal() {
    successModal.style.display = 'none';
}

// Get customer order statistics
function getCustomerStats(customerId) {
    const customerOrders = orders.filter(order => order.customerId === customerId);
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
    const lastOrderDate = customerOrders.length > 0
        ? Math.max(...customerOrders.map(order => new Date(order.timestamp).getTime()))
        : null;

    return {
        totalOrders,
        totalSpent,
        lastOrderDate: lastOrderDate ? new Date(lastOrderDate) : null
    };
}

// Render customers
function renderCustomers(customersToRender = customers) {
    const grid = document.getElementById('customerGrid');

    if (customersToRender.length === 0) {
        grid.innerHTML = '<div class="no-data"><i class="fas fa-users"></i><p>No customers found</p></div>';
        return;
    }

    grid.innerHTML = customersToRender.map(customer => {
        const stats = getCustomerStats(customer.phone);
        const initials = customer.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const isNewCustomer = new Date(customer.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const isActiveCustomer = stats.lastOrderDate && stats.lastOrderDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        return `
            <div class="customer-card-modern ${isNewCustomer ? 'new-customer' : ''} ${isActiveCustomer ? 'active-customer' : ''}">
                <div class="customer-card-header">
                    <div class="customer-avatar-modern">
                        ${initials}
                        ${isNewCustomer ? '<span class="new-badge">NEW</span>' : ''}
                    </div>
                    <div class="customer-actions-modern">
                        <button class="action-btn view-btn" onclick="viewCustomerDetails('${customer.phone}')" title="View Customer Details">
                            <div class="btn-content">
                                <i class="fas fa-eye"></i>
                                <span class="btn-text">View</span>
                            </div>
                        </button>
                        <button class="action-btn edit-btn" onclick="editCustomer('${customer.phone}')" title="Edit Customer Information">
                            <div class="btn-content">
                                <i class="fas fa-edit"></i>
                                <span class="btn-text">Edit</span>
                            </div>
                        </button>
                        <button class="action-btn delete-btn" onclick="deleteCustomer('${customer.phone}')" title="Delete Customer">
                            <div class="btn-content">
                                <i class="fas fa-trash-alt"></i>
                                <span class="btn-text">Delete</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div class="customer-info-modern">
                    <h3 class="customer-name-modern">${customer.name}</h3>
                    <div class="customer-contact-modern">
                        <span class="contact-item"><i class="fas fa-phone"></i> ${customer.phone}</span>
                        ${customer.email ? `<span class="contact-item"><i class="fas fa-envelope"></i> ${customer.email}</span>` : ''}
                    </div>
                    ${customer.address ? `<p class="customer-address-modern"><i class="fas fa-map-marker-alt"></i> ${customer.address}</p>` : ''}
                </div>

                <div class="customer-stats-modern">
                    <div class="stat-item-modern">
                        <div class="stat-value-modern">${stats.totalOrders}</div>
                        <div class="stat-label-modern">Orders</div>
                    </div>
                    <div class="stat-item-modern">
                        <div class="stat-value-modern">LKR ${stats.totalSpent.toFixed(0)}</div>
                        <div class="stat-label-modern">Total Spent</div>
                    </div>
                    <div class="stat-item-modern">
                        <div class="stat-value-modern">${stats.lastOrderDate ? stats.lastOrderDate.toLocaleDateString() : 'Never'}</div>
                        <div class="stat-label-modern">Last Order</div>
                    </div>
                </div>

                <div class="customer-status-modern">
                    <span class="join-date-modern">Member since ${new Date(customer.joinDate).toLocaleDateString()}</span>
                    ${isActiveCustomer ? '<span class="status-badge active">Active</span>' : '<span class="status-badge inactive">Inactive</span>'}
                </div>
            </div>
        `;
    }).join('');
}

// Search customers
function searchCustomers() {
    const query = document.getElementById('customerSearchInput').value.toLowerCase();

    // First apply current filter
    let filteredCustomers = customers;
    if (currentFilter === 'active') {
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        filteredCustomers = customers.filter(customer => {
            const stats = getCustomerStats(customer.phone);
            return stats.lastOrderDate && stats.lastOrderDate > oneMonthAgo;
        });
    } else if (currentFilter === 'new') {
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        filteredCustomers = customers.filter(customer => {
            return new Date(customer.joinDate) > oneMonthAgo;
        });
    }

    // Then apply search
    if (query) {
        filteredCustomers = filteredCustomers.filter(customer =>
            customer.name.toLowerCase().includes(query) ||
            customer.phone.includes(query) ||
            (customer.email && customer.email.toLowerCase().includes(query))
        );
    }

    renderCustomers(filteredCustomers);
}

// Sort customers
function sortCustomers() {
    const sortBy = document.getElementById('sortBy').value;

    // First apply current filter
    let customersToSort = customers;
    if (currentFilter === 'active') {
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        customersToSort = customers.filter(customer => {
            const stats = getCustomerStats(customer.phone);
            return stats.lastOrderDate && stats.lastOrderDate > oneMonthAgo;
        });
    } else if (currentFilter === 'new') {
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        customersToSort = customers.filter(customer => {
            return new Date(customer.joinDate) > oneMonthAgo;
        });
    }

    let sorted = [...customersToSort];

    switch (sortBy) {
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'joinDate':
            sorted.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
            break;
        case 'orders':
            sorted.sort((a, b) => {
                const statsA = getCustomerStats(a.phone);
                const statsB = getCustomerStats(b.phone);
                return statsB.totalOrders - statsA.totalOrders;
            });
            break;
        case 'spent':
            sorted.sort((a, b) => {
                const statsA = getCustomerStats(a.phone);
                const statsB = getCustomerStats(b.phone);
                return statsB.totalSpent - statsA.totalSpent;
            });
            break;
    }

    // Apply current search if any
    const query = document.getElementById('customerSearchInput').value.toLowerCase();
    if (query) {
        sorted = sorted.filter(customer =>
            customer.name.toLowerCase().includes(query) ||
            customer.phone.includes(query) ||
            (customer.email && customer.email.toLowerCase().includes(query))
        );
    }

    renderCustomers(sorted);
}

// Edit customer
function editCustomer(phone) {
    const customer = customers.find(c => c.phone === phone);
    if (!customer) return;

    editingCustomerId = phone;
    document.getElementById('customerModalTitle').textContent = 'Edit Customer';

    document.getElementById('customerName').value = customer.name;
    document.getElementById('customerPhone').value = customer.phone;
    document.getElementById('customerEmail').value = customer.email || '';
    document.getElementById('customerAddress').value = customer.address || '';

    customerModal.style.display = 'block';
}

// Delete customer
function deleteCustomer(phone) {
    const customer = customers.find(c => c.phone === phone);
    if (!customer) return;

    const stats = getCustomerStats(phone);

    // Populate delete modal with customer info
    const deleteInfo = document.getElementById('deleteCustomerInfo');
    deleteInfo.innerHTML = `
        <div class="delete-customer-details">
            <div class="delete-customer-name">${customer.name}</div>
            <div class="delete-customer-contact">
                <span><i class="fas fa-phone"></i> ${customer.phone}</span>
                ${customer.email ? `<span><i class="fas fa-envelope"></i> ${customer.email}</span>` : ''}
            </div>
            <div class="delete-customer-stats">
                <div class="delete-stat-item">
                    <span class="delete-stat-value">${stats.totalOrders}</span>
                    <span class="delete-stat-label">Total Orders</span>
                </div>
                <div class="delete-stat-item">
                    <span class="delete-stat-value">LKR ${stats.totalSpent.toFixed(0)}</span>
                    <span class="delete-stat-label">Total Spent</span>
                </div>
            </div>
        </div>
    `;

    // Store customer phone for deletion
    document.getElementById('confirmDeleteBtn').dataset.customerPhone = phone;

    // Show modal
    deleteCustomerModal.style.display = 'block';
}

// View customer details
function viewCustomerDetails(phone) {
    const customer = customers.find(c => c.phone === phone);
    if (!customer) return;

    const stats = getCustomerStats(phone);
    const customerOrders = orders.filter(order => order.customerId === phone);

    const content = document.getElementById('customerDetailsContent');
    content.innerHTML = `
        <div class="customer-details-modern">
            <!-- Customer Header -->
            <div class="customer-details-header">
                <div class="customer-avatar-large">
                    ${customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div class="customer-details-info">
                    <h2>${customer.name}</h2>
                    <div class="customer-details-contact">
                        <span class="contact-detail"><i class="fas fa-phone"></i> ${customer.phone}</span>
                        ${customer.email ? `<span class="contact-detail"><i class="fas fa-envelope"></i> ${customer.email}</span>` : ''}
                    </div>
                    <div class="customer-details-meta">
                        <span class="meta-item"><i class="fas fa-calendar-plus"></i> Joined ${new Date(customer.joinDate).toLocaleDateString()}</span>
                        <span class="meta-item"><i class="fas fa-clock"></i> Last: ${stats.lastOrderDate ? stats.lastOrderDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}</span>
                    </div>
                </div>
                <div class="customer-details-actions">
                    <button class="btn btn-primary" onclick="editCustomer('${customer.phone}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteCustomer('${customer.phone}')">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            </div>

            <!-- Customer Stats -->
            <div class="customer-details-stats">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">${stats.totalOrders}</div>
                        <div class="stat-label">Total Orders</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">LKR ${stats.totalSpent.toFixed(0)}</div>
                        <div class="stat-label">Total Spent</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="stat-info">
                        <div class="stat-value">${stats.lastOrderDate ? stats.lastOrderDate.toLocaleDateString() : 'Never'}</div>
                        <div class="stat-label">Last Order</div>
                    </div>
                </div>
            </div>

            <!-- Customer Information -->
            <div class="customer-details-info-section">
                <h3><i class="fas fa-info-circle"></i> Customer Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <label>Full Name</label>
                        <span>${customer.name}</span>
                    </div>
                    <div class="info-item">
                        <label>Phone Number</label>
                        <span>${customer.phone}</span>
                    </div>
                    ${customer.email ? `
                        <div class="info-item">
                            <label>Email Address</label>
                            <span>${customer.email}</span>
                        </div>
                    ` : ''}
                    ${customer.address ? `
                        <div class="info-item full-width">
                            <label>Address</label>
                            <span>${customer.address}</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Recent Orders -->
            ${customerOrders.length > 0 ? `
                <div class="customer-orders-section">
                    <h3><i class="fas fa-history"></i> Recent Orders</h3>
                    <div class="orders-list">
                        ${customerOrders.slice(0, 5).map(order => `
                            <div class="order-item">
                                <div class="order-info">
                                    <span class="order-id">${order.id}</span>
                                    <span class="order-date">${new Date(order.timestamp).toLocaleDateString()}</span>
                                </div>
                                <div class="order-total">LKR ${order.total.toFixed(2)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    customerDetailsModal.style.display = 'block';
}

// Update customer statistics
function updateCustomerStats() {
    const totalCustomersEl = document.getElementById('totalCustomers');
    const activeCustomersEl = document.getElementById('activeCustomers');
    const newCustomersEl = document.getElementById('newCustomers');

    if (totalCustomersEl) totalCustomersEl.textContent = customers.length;

    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let activeCount = 0;
    let newCount = 0;

    customers.forEach(customer => {
        const stats = getCustomerStats(customer.phone);
        const joinDate = new Date(customer.joinDate);

        if (stats.lastOrderDate && stats.lastOrderDate > oneMonthAgo) {
            activeCount++;
        }

        if (joinDate > oneMonthAgo) {
            newCount++;
        }
    });

    if (activeCustomersEl) activeCustomersEl.textContent = activeCount;
    if (newCustomersEl) newCustomersEl.textContent = newCount;
}

// Export customers to CSV
function exportCustomers() {
    if (customers.length === 0) {
        showNotification('No customers found to export!', 'warning');
        return;
    }

    // Prepare CSV headers
    const headers = [
        'Name',
        'Phone',
        'Email',
        'Address',
        'Join Date',
        'Total Orders',
        'Total Spent (LKR)',
        'Last Order Date',
        'Status'
    ];

    // Prepare CSV data
    const csvData = customers.map(customer => {
        const stats = getCustomerStats(customer.phone);
        const now = new Date();
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const isActive = stats.lastOrderDate && stats.lastOrderDate > oneMonthAgo;

        return [
            `"${customer.name.replace(/"/g, '""')}"`,
            `"${customer.phone}"`,
            customer.email ? `"${customer.email.replace(/"/g, '""')}"` : '',
            customer.address ? `"${customer.address.replace(/"/g, '""')}"` : '',
            `"${new Date(customer.joinDate).toLocaleDateString()}"`,
            stats.totalOrders,
            stats.totalSpent.toFixed(2),
            stats.lastOrderDate ? `"${stats.lastOrderDate.toLocaleDateString()}"` : 'Never',
            isActive ? 'Active' : 'Inactive'
        ];
    });

    // Combine headers and data
    const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(`Successfully exported ${customers.length} customers to CSV!`, 'success');
}

// Filter customers
function filterCustomers(filterType) {
    currentFilter = filterType;

    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');

    let filteredCustomers = customers;

    if (filterType === 'active') {
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        filteredCustomers = customers.filter(customer => {
            const stats = getCustomerStats(customer.phone);
            return stats.lastOrderDate && stats.lastOrderDate > oneMonthAgo;
        });
    } else if (filterType === 'new') {
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        filteredCustomers = customers.filter(customer => {
            return new Date(customer.joinDate) > oneMonthAgo;
        });
    }

    renderCustomers(filteredCustomers);
}

// Setup filter buttons
function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filterType = e.target.closest('.filter-btn').dataset.filter;
            filterCustomers(filterType);
        });
    });
}

// Modal management
const customerModal = document.getElementById('customerModal');
const customerDetailsModal = document.getElementById('customerDetailsModal');
const deleteCustomerModal = document.getElementById('deleteCustomerModal');
const successModal = document.getElementById('successModal');
const addCustomerBtn = document.getElementById('addCustomerBtn');
const customerForm = document.getElementById('customerForm');

// Open add customer modal
addCustomerBtn.addEventListener('click', () => {
    editingCustomerId = null;
    document.getElementById('customerModalTitle').textContent = 'Add Customer';
    customerForm.reset();
    customerModal.style.display = 'block';
});

// Form submission
customerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(customerForm);
    const customerData = {
        name: formData.get('customerName'),
        phone: formData.get('customerPhone'),
        email: formData.get('customerEmail'),
        address: formData.get('customerAddress'),
        joinDate: editingCustomerId ? customers.find(c => c.phone === editingCustomerId).joinDate : new Date().toISOString()
    };

    if (editingCustomerId) {
        // Update existing customer
        const index = customers.findIndex(c => c.phone === editingCustomerId);
        if (index !== -1) {
            customers[index] = { ...customers[index], ...customerData };
        }
    } else {
        // Check if customer with this phone already exists
        const existingCustomer = customers.find(c => c.phone === customerData.phone);
        if (existingCustomer) {
            showNotification('⚠️ A customer with this phone number already exists! Please use a different phone number.', 'warning');
            return;
        }
        // Add new customer
        customers.push(customerData);
    }

    saveCustomers();
    renderCustomers();
    updateCustomerStats();
    customerModal.style.display = 'none';
    showSuccessModal(
        editingCustomerId ? 'Customer Updated!' : 'Customer Added Successfully!',
        editingCustomerId ? 'Customer information has been updated successfully.' : 'Welcome to MOS Burgers! The customer has been added to your database.'
    );
});

// Modal close functionality
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
    });
});

document.getElementById('cancelCustomerBtn').addEventListener('click', () => {
    customerModal.style.display = 'none';
});

document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    deleteCustomerModal.style.display = 'none';
});

document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    const phone = document.getElementById('confirmDeleteBtn').dataset.customerPhone;
    if (phone) {
        customers = customers.filter(c => c.phone !== phone);
        saveCustomers();
        renderCustomers();
        updateCustomerStats();
        deleteCustomerModal.style.display = 'none';
        showNotification('Customer deleted successfully.', 'success');
    }
});

document.getElementById('successOkBtn').addEventListener('click', () => {
    hideSuccessModal();
});

window.addEventListener('click', (e) => {
    if (e.target === customerModal) {
        customerModal.style.display = 'none';
    }
    if (e.target === customerDetailsModal) {
        customerDetailsModal.style.display = 'none';
    }
    if (e.target === deleteCustomerModal) {
        deleteCustomerModal.style.display = 'none';
    }
    if (e.target === successModal) {
        hideSuccessModal();
    }
});

// Event listeners
document.getElementById('customerSearchInput').addEventListener('input', searchCustomers);
document.getElementById('sortBy').addEventListener('change', sortCustomers);
document.getElementById('exportCustomersBtn').addEventListener('click', exportCustomers);

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateCustomerStats();
    setupFilterButtons();
    renderCustomers();
});
