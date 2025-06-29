
// Check authentication
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// Get data from localStorage
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];

let editingCustomerId = null;

// Save customers to localStorage
function saveCustomers() {
    localStorage.setItem('customers', JSON.stringify(customers));
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
        grid.innerHTML = '<div class="no-customers"><p>No customers found</p></div>';
        return;
    }
    
    grid.innerHTML = customersToRender.map(customer => {
        const stats = getCustomerStats(customer.phone);
        const initials = customer.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        return `
            <div class="customer-card">
                <div class="customer-header">
                    <div class="customer-avatar">${initials}</div>
                    <div>
                        <div class="customer-name">${customer.name}</div>
                        <div class="customer-phone">${customer.phone}</div>
                    </div>
                </div>
                
                <div class="customer-details">
                    ${customer.email ? `<p><strong>Email:</strong> ${customer.email}</p>` : ''}
                    ${customer.address ? `<p><strong>Address:</strong> ${customer.address}</p>` : ''}
                    <p><strong>Member Since:</strong> ${new Date(customer.joinDate).toLocaleDateString()}</p>
                </div>
                
                <div class="customer-stats">
                    <div class="stat">
                        <div class="stat-value">${stats.totalOrders}</div>
                        <div class="stat-label">Orders</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">LKR ${stats.totalSpent.toFixed(0)}</div>
                        <div class="stat-label">Total Spent</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${stats.lastOrderDate ? stats.lastOrderDate.toLocaleDateString() : 'Never'}</div>
                        <div class="stat-label">Last Order</div>
                    </div>
                </div>
                
                <div class="customer-actions">
                    <button class="btn btn-primary btn-small" onclick="viewCustomerDetails('${customer.phone}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="editCustomer('${customer.phone}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteCustomer('${customer.phone}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Search customers
function searchCustomers() {
    const query = document.getElementById('customerSearchInput').value.toLowerCase();
    const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        (customer.email && customer.email.toLowerCase().includes(query))
    );
    renderCustomers(filtered);
}

// Sort customers
function sortCustomers() {
    const sortBy = document.getElementById('sortBy').value;
    let sorted = [...customers];
    
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
    }
    
    renderCustomers(sorted);
}

// Modal management
const customerModal = document.getElementById('customerModal');
const customerDetailsModal = document.getElementById('customerDetailsModal');
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
        email: formData.get('customerEmail') || '',
        address: formData.get('customerAddress') || '',
        joinDate: editingCustomerId ? 
            customers.find(c => c.phone === editingCustomerId).joinDate : 
            new Date().toISOString()
    };
    
    if (editingCustomerId) {
        // Update existing customer
        const index = customers.findIndex(c => c.phone === editingCustomerId);
        if (index !== -1) {
            customers[index] = { ...customers[index], ...customerData };
        }
    } else {
        // Add new customer
        if (customers.find(c => c.phone === customerData.phone)) {
            alert('Customer with this phone number already exists!');
            return;
        }
        customers.push(customerData);
    }
    
    saveCustomers();
    renderCustomers();
    customerModal.style.display = 'none';
    
    alert('Customer saved successfully!');
});

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
    
    if (stats.totalOrders > 0) {
        if (!confirm(`This customer has ${stats.totalOrders} orders. Are you sure you want to delete this customer? This action cannot be undone.`)) {
            return;
        }
    } else {
        if (!confirm('Are you sure you want to delete this customer?')) {
            return;
        }
    }
    
    customers = customers.filter(c => c.phone !== phone);
    saveCustomers();
    renderCustomers();
}

// View customer details
function viewCustomerDetails(phone) {
    const customer = customers.find(c => c.phone === phone);
    if (!customer) return;
    
    const stats = getCustomerStats(phone);
    const customerOrders = orders.filter(order => order.customerId === phone);
    
    const content = document.getElementById('customerDetailsContent');
    content.innerHTML = `
        <div class="customer-full-details">
            <div class="customer-info">
                <h3>${customer.name}</h3>
                <p><strong>Phone:</strong> ${customer.phone}</p>
                ${customer.email ? `<p><strong>Email:</strong> ${customer.email}</p>` : ''}
                ${customer.address ? `<p><strong>Address:</strong> ${customer.address}</p>` : ''}
                <p><strong>Member Since:</strong> ${new Date(customer.joinDate).toLocaleDateString()}</p>
            </div>
            
            <div class="customer-statistics">
                <h4>Customer Statistics</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">Total Orders:</span>
                        <span class="stat-value">${stats.totalOrders}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Spent:</span>
                        <span class="stat-value">LKR ${stats.totalSpent.toFixed(2)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Average Order:</span>
                        <span class="stat-value">LKR ${stats.totalOrders > 0 ? (stats.totalSpent / stats.totalOrders).toFixed(2) : '0.00'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Last Order:</span>
                        <span class="stat-value">${stats.lastOrderDate ? stats.lastOrderDate.toLocaleDateString() : 'Never'}</span>
                    </div>
                </div>
            </div>
            
            <div class="customer-orders">
                <h4>Recent Orders</h4>
                ${customerOrders.length > 0 ? `
                    <div class="orders-table">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Date</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${customerOrders.slice(0, 5).map(order => `
                                    <tr>
                                        <td>#${order.id}</td>
                                        <td>${new Date(order.timestamp).toLocaleDateString()}</td>
                                        <td>${order.items.length} items</td>
                                        <td>LKR ${order.total.toFixed(2)}</td>
                                        <td><span class="status ${order.status}">${order.status}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ${customerOrders.length > 5 ? `<p><em>Showing 5 of ${customerOrders.length} orders</em></p>` : ''}
                    </div>
                ` : '<p>No orders found for this customer.</p>'}
            </div>
        </div>
    `;
    
    customerDetailsModal.style.display = 'block';
}

// Modal close functionality
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
    });
});

document.getElementById('cancelCustomerBtn').addEventListener('click', () => {
    customerModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === customerModal) {
        customerModal.style.display = 'none';
    }
    if (e.target === customerDetailsModal) {
        customerDetailsModal.style.display = 'none';
    }
});

// Event listeners
document.getElementById('customerSearchInput').addEventListener('input', searchCustomers);
document.getElementById('sortBy').addEventListener('change', sortCustomers);

// Add some sample customers if none exist
if (customers.length === 0) {
    const sampleCustomers = [
        {
            name: 'John Doe',
            phone: '0771234567',
            email: 'john.doe@email.com',
            address: '123 Main Street, Colombo',
            joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            name: 'Jane Smith',
            phone: '0779876543',
            email: 'jane.smith@email.com',
            address: '456 Queen Street, Kandy',
            joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            name: 'Mike Johnson',
            phone: '0765432109',
            email: 'mike.johnson@email.com',
            address: '789 King Street, Galle',
            joinDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    customers = sampleCustomers;
    saveCustomers();
}

// Initialize
renderCustomers();
