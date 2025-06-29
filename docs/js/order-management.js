
// Check authentication
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// Get data from localStorage
let foodItems = JSON.parse(localStorage.getItem('foodItems')) || [];
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];

let currentCart = [];
let selectedCustomer = null;

// Generate order ID
function generateOrderId() {
    return 'ORD' + Date.now().toString().slice(-6);
}

// Search items
function searchItems(query) {
    return foodItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.code.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );
}

// Add item to cart
function addToCart(item) {
    const existingItem = currentCart.find(cartItem => cartItem.code === item.code);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        currentCart.push({
            ...item,
            quantity: 1,
            cartPrice: item.discount > 0 ? item.price - (item.price * item.discount / 100) : item.price
        });
    }
    
    updateCartDisplay();
    updateOrderSummary();
}

// Remove item from cart
function removeFromCart(code) {
    currentCart = currentCart.filter(item => item.code !== code);
    updateCartDisplay();
    updateOrderSummary();
}

// Update item quantity in cart
function updateCartQuantity(code, quantity) {
    const item = currentCart.find(item => item.code === code);
    if (item) {
        item.quantity = Math.max(1, quantity);
        updateCartDisplay();
        updateOrderSummary();
    }
}

// Update cart display
function updateCartDisplay() {
    const cartContainer = document.getElementById('cartItems');
    
    if (currentCart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">Cart is empty</p>';
        document.getElementById('placeOrderBtn').disabled = true;
        return;
    }
    
    cartContainer.innerHTML = currentCart.map(item => `
        <div class="cart-item">
            <div class="item-info">
                <h4>${item.name}</h4>
                <span class="item-code">${item.code}</span>
                <span class="item-price">LKR ${item.cartPrice.toFixed(2)}</span>
            </div>
            <div class="quantity-controls">
                <button onclick="updateCartQuantity('${item.code}', ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartQuantity('${item.code}', ${item.quantity + 1})">+</button>
            </div>
            <div class="item-total">
                LKR ${(item.cartPrice * item.quantity).toFixed(2)}
            </div>
            <button class="remove-btn" onclick="removeFromCart('${item.code}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    document.getElementById('placeOrderBtn').disabled = false;
}

// Update order summary
function updateOrderSummary() {
    const subtotal = currentCart.reduce((sum, item) => sum + (item.cartPrice * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('orderDiscount').value) || 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;
    
    document.getElementById('subtotal').textContent = `LKR ${subtotal.toFixed(2)}`;
    document.getElementById('discountAmount').textContent = `LKR ${discountAmount.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `LKR ${total.toFixed(2)}`;
}

// Item search functionality
const itemSearch = document.getElementById('itemSearch');
const itemSuggestions = document.getElementById('itemSuggestions');

itemSearch.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        itemSuggestions.innerHTML = '';
        itemSuggestions.style.display = 'none';
        return;
    }
    
    const results = searchItems(query);
    
    if (results.length === 0) {
        itemSuggestions.innerHTML = '<div class="no-results">No items found</div>';
    } else {
        itemSuggestions.innerHTML = results.map(item => `
            <div class="suggestion-item" onclick="addToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <div class="suggestion-info">
                    <strong>${item.name}</strong>
                    <span class="suggestion-code">${item.code}</span>
                    <span class="suggestion-price">LKR ${item.price.toFixed(2)}</span>
                    ${item.discount > 0 ? `<span class="suggestion-discount">${item.discount}% OFF</span>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    itemSuggestions.style.display = 'block';
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!itemSearch.contains(e.target) && !itemSuggestions.contains(e.target)) {
        itemSuggestions.style.display = 'none';
    }
});

// Customer search functionality
const customerSearch = document.getElementById('customerSearch');

customerSearch.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        selectedCustomer = null;
        return;
    }
    
    const customer = customers.find(c => 
        c.phone.includes(query) || 
        c.name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (customer) {
        selectedCustomer = customer;
        customerSearch.style.borderColor = '#28a745';
    } else {
        selectedCustomer = null;
        customerSearch.style.borderColor = '#dc3545';
    }
});

// Place order
document.getElementById('placeOrderBtn').addEventListener('click', () => {
    if (currentCart.length === 0) {
        alert('Cart is empty!');
        return;
    }
    
    if (!selectedCustomer) {
        alert('Please select a customer!');
        return;
    }
    
    const subtotal = currentCart.reduce((sum, item) => sum + (item.cartPrice * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('orderDiscount').value) || 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;
    
    const order = {
        id: generateOrderId(),
        customerId: selectedCustomer.phone,
        customerName: selectedCustomer.name,
        items: [...currentCart],
        subtotal: subtotal,
        discount: discountPercent,
        discountAmount: discountAmount,
        total: total,
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    
    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Generate PDF receipt (simplified)
    generateReceipt(order);
    
    // Clear cart
    currentCart = [];
    selectedCustomer = null;
    customerSearch.value = '';
    itemSearch.value = '';
    document.getElementById('orderDiscount').value = 0;
    
    updateCartDisplay();
    updateOrderSummary();
    displayOrders();
    
    alert('Order placed successfully!');
});

// Generate receipt (simplified PDF simulation)
function generateReceipt(order) {
    const receiptContent = `
        MOS BURGERS RECEIPT
        ===================
        Order ID: ${order.id}
        Customer: ${order.customerName}
        Date: ${new Date(order.timestamp).toLocaleDateString()}
        Time: ${new Date(order.timestamp).toLocaleTimeString()}
        
        ITEMS:
        ${order.items.map(item => 
            `${item.name} x${item.quantity} @ LKR ${item.cartPrice.toFixed(2)} = LKR ${(item.cartPrice * item.quantity).toFixed(2)}`
        ).join('\n')}
        
        -------------------
        Subtotal: LKR ${order.subtotal.toFixed(2)}
        Discount (${order.discount}%): LKR ${order.discountAmount.toFixed(2)}
        TOTAL: LKR ${order.total.toFixed(2)}
        
        Thank you for your order!
    `;
    
    // In a real application, you would use a library like jsPDF
    console.log('Receipt generated:', receiptContent);
    
    // Create downloadable text file as PDF simulation
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Display orders
function displayOrders() {
    const ordersList = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">No orders found</p>';
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h3>#${order.id}</h3>
                <span class="status ${order.status}">${order.status}</span>
            </div>
            <div class="order-details">
                <p><strong>Customer:</strong> ${order.customerName}</p>
                <p><strong>Items:</strong> ${order.items.length} items</p>
                <p><strong>Total:</strong> LKR ${order.total.toFixed(2)}</p>
                <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleDateString()}</p>
            </div>
            <div class="order-actions">
                <button class="btn btn-primary btn-small" onclick="viewOrder('${order.id}')">View</button>
                <button class="btn btn-secondary btn-small" onclick="editOrder('${order.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteOrder('${order.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Order search
document.getElementById('orderSearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query)
    );
    
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h3>#${order.id}</h3>
                <span class="status ${order.status}">${order.status}</span>
            </div>
            <div class="order-details">
                <p><strong>Customer:</strong> ${order.customerName}</p>
                <p><strong>Items:</strong> ${order.items.length} items</p>
                <p><strong>Total:</strong> LKR ${order.total.toFixed(2)}</p>
                <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleDateString()}</p>
            </div>
            <div class="order-actions">
                <button class="btn btn-primary btn-small" onclick="viewOrder('${order.id}')">View</button>
                <button class="btn btn-secondary btn-small" onclick="editOrder('${order.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteOrder('${order.id}')">Delete</button>
            </div>
        </div>
    `).join('');
});

// Order management functions
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        alert(`Order Details:\n${JSON.stringify(order, null, 2)}`);
    }
}

function editOrder(orderId) {
    // Simplified edit - in real app, would open edit modal
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const newStatus = prompt('Enter new status (pending/completed/cancelled):', order.status);
        if (newStatus && ['pending', 'completed', 'cancelled'].includes(newStatus)) {
            order.status = newStatus;
            localStorage.setItem('orders', JSON.stringify(orders));
            displayOrders();
        }
    }
}

function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        orders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('orders', JSON.stringify(orders));
        displayOrders();
    }
}

// Customer modal
const customerModal = document.getElementById('customerModal');
const addCustomerBtn = document.getElementById('addCustomerBtn');
const customerForm = document.getElementById('customerForm');

addCustomerBtn.addEventListener('click', () => {
    customerModal.style.display = 'block';
});

customerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const customerData = {
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        email: document.getElementById('customerEmail').value || '',
        joinDate: new Date().toISOString()
    };
    
    customers.push(customerData);
    localStorage.setItem('customers', JSON.stringify(customers));
    
    customerModal.style.display = 'none';
    customerForm.reset();
    
    alert('Customer added successfully!');
});

// Modal close functionality
document.querySelector('.close').addEventListener('click', () => {
    customerModal.style.display = 'none';
});

document.getElementById('cancelCustomerBtn').addEventListener('click', () => {
    customerModal.style.display = 'none';
});

// Order discount change
document.getElementById('orderDiscount').addEventListener('input', updateOrderSummary);

// Initialize
displayOrders();
updateOrderSummary();
