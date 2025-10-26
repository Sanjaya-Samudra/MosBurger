// Check authentication
// TEMPORARILY AUTO-LOGIN FOR TESTING
if (localStorage.getItem('isLoggedIn') !== 'true') {
    console.log('Auto-logging in for testing...');
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', 'admin');
} else {
    console.log('Already logged in');
}

console.log('🚀 Order Management JavaScript file loaded and executing!');

// Get data from localStorage with better error handling
let foodItems = [];
let customers = [];
let orders = [];

try {
    const storedFoodItems = localStorage.getItem('foodItems');
    foodItems = storedFoodItems ? JSON.parse(storedFoodItems) : [];
} catch (e) {
    console.error('Error loading foodItems from localStorage:', e);
    foodItems = [];
}

try {
    const storedCustomers = localStorage.getItem('customers');
    customers = storedCustomers ? JSON.parse(storedCustomers) : [];
} catch (e) {
    console.error('Error loading customers from localStorage:', e);
    customers = [];
}

try {
    const storedOrders = localStorage.getItem('orders');
    orders = storedOrders ? JSON.parse(storedOrders) : [];
} catch (e) {
    console.error('Error loading orders from localStorage:', e);
    orders = [];
}

// Always ensure we have sample data for testing
function initializeSampleData() {
    console.log('Initializing sample data...');
    console.log('Current foodItems length:', foodItems.length);
    console.log('Current customers length:', customers.length);
    const defaultFoodItems = [
        // Burgers
        { code: 'B1001', name: 'Classic Beef Burger (Large)', category: 'Burgers', price: 1200.00, discount: 0, quantity: 25, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'B1002', name: 'Classic Beef Burger (Regular)', category: 'Burgers', price: 850.00, discount: 15, quantity: 30, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'B1003', name: 'Chicken Burger (Large)', category: 'Burgers', price: 1100.00, discount: 0, quantity: 20, image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'B1004', name: 'Chicken Burger (Regular)', category: 'Burgers', price: 750.00, discount: 10, quantity: 35, image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'B1005', name: 'Veggie Burger', category: 'Burgers', price: 900.00, discount: 5, quantity: 15, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop', expiryDate: null },

        // Submarines
        { code: 'S2001', name: 'Crispy Chicken Submarine (Large)', category: 'Submarines', price: 1500.00, discount: 0, quantity: 12, image: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'S2002', name: 'Crispy Chicken Submarine (Regular)', category: 'Submarines', price: 1200.00, discount: 0, quantity: 18, image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'S2003', name: 'BBQ Chicken Submarine', category: 'Submarines', price: 1400.00, discount: 0, quantity: 8, image: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=300&h=200&fit=crop', expiryDate: null },

        // Fries
        { code: 'F3001', name: 'Steak Fries (Large)', category: 'Fries', price: 600.00, discount: 0, quantity: 45, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'F3002', name: 'Steak Fries (Regular)', category: 'Fries', price: 450.00, discount: 0, quantity: 60, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'F3003', name: 'French Fries (Large)', category: 'Fries', price: 400.00, discount: 0, quantity: 55, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'F3004', name: 'French Fries (Regular)', category: 'Fries', price: 300.00, discount: 0, quantity: 70, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'F3005', name: 'Sweet Potato Fries', category: 'Fries', price: 550.00, discount: 0, quantity: 25, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop', expiryDate: null },

        // Beverages
        { code: 'D4001', name: 'Coca-Cola (330ml)', category: 'Beverages', price: 150.00, discount: 0, quantity: 100, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'D4002', name: 'Pepsi (330ml)', category: 'Beverages', price: 140.00, discount: 5, quantity: 90, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'D4003', name: 'Sprite (330ml)', category: 'Beverages', price: 140.00, discount: 0, quantity: 85, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'D4004', name: 'Fanta (330ml)', category: 'Beverages', price: 140.00, discount: 0, quantity: 80, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'D4005', name: 'Fresh Orange Juice', category: 'Beverages', price: 250.00, discount: 0, quantity: 30, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=200&fit=crop', expiryDate: null },

        // Chicken Items
        { code: 'C5001', name: 'Fried Chicken (4 Pieces)', category: 'Chicken', price: 1200.00, discount: 0, quantity: 15, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'C5002', name: 'Fried Chicken (8 Pieces)', category: 'Chicken', price: 2200.00, discount: 10, quantity: 8, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'C5003', name: 'Grilled Chicken Breast', category: 'Chicken', price: 800.00, discount: 0, quantity: 20, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=300&h=200&fit=crop', expiryDate: null },

        // Pasta
        { code: 'P6001', name: 'Creamy Alfredo Pasta', category: 'Pasta', price: 950.00, discount: 0, quantity: 12, image: 'https://images.unsplash.com/photo-1551892374-ecf87916f7b4?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'P6002', name: 'Spaghetti Bolognese', category: 'Pasta', price: 850.00, discount: 0, quantity: 18, image: 'https://images.unsplash.com/photo-1551892374-ecf87916f7b4?w=300&h=200&fit=crop', expiryDate: null },
        { code: 'P6003', name: 'Penne Arrabbiata', category: 'Pasta', price: 800.00, discount: 0, quantity: 15, image: 'https://images.unsplash.com/photo-1551892374-ecf87916f7b4?w=300&h=200&fit=crop', expiryDate: null }
    ];

    const defaultCustomers = [
        {
            name: 'John Doe',
            phone: '123-456-7890',
            email: 'john@example.com'
        },
        {
            name: 'Jane Smith',
            phone: '098-765-4321',
            email: 'jane@example.com'
        },
        {
            name: 'Mike Johnson',
            phone: '555-123-4567',
            email: 'mike@example.com'
        }
    ];

    // Only set default data if no items exist (don't override existing data)
    if (foodItems.length === 0) {
        foodItems = defaultFoodItems;
        localStorage.setItem('foodItems', JSON.stringify(foodItems));
        console.log('Initialized with default food items');
    } else {
        console.log('Using existing food items from localStorage:', foodItems.length, 'items');
    }

    if (customers.length === 0) {
        customers = defaultCustomers;
        localStorage.setItem('customers', JSON.stringify(customers));
        console.log('Initialized with default customers');
    } else {
        console.log('Using existing customers from localStorage:', customers.length, 'customers');
    }
}

let currentCart = [];
let selectedCustomer = null;

// Generate order ID
function generateOrderId() {
    return 'ORD' + Date.now().toString().slice(-6);
}

// Save orders to localStorage
function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Search items
function searchItems(query) {
    return foodItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.code.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );
}

// Show out of stock message when clicking on out of stock items
function showOutOfStockMessage(itemName) {
    showNotification(`Sorry, ${itemName} is currently out of stock and cannot be added to your cart.`, 'error', 5000);
}

// Add item to cart with inventory check
function addToCart(item) {
    // Check if item is in stock
    if (item.quantity <= 0) {
        showNotification(`Sorry, ${item.name} is currently out of stock!`, 'error');
        return;
    }

    // Check if adding would exceed available stock
    const existingItem = currentCart.find(cartItem => cartItem.code === item.code);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newQuantity = currentQuantity + 1;

    if (newQuantity > item.quantity) {
        showNotification(`Sorry, only ${item.quantity} units of ${item.name} are available!`, 'error');
        return;
    }

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

// Update item quantity in cart with stock validation
function updateCartQuantity(code, quantity) {
    const item = currentCart.find(item => item.code === code);
    const foodItem = foodItems.find(item => item.code === code);

    if (item && foodItem) {
        const newQuantity = Math.max(1, quantity);

        // Check if new quantity would exceed available stock
        if (newQuantity > foodItem.quantity) {
            alert(`Sorry, only ${foodItem.quantity} units of ${item.name} are available!`);
            return;
        }

        item.quantity = newQuantity;
        updateCartDisplay();
        updateOrderSummary();
    }
}

// Update cart display
function updateCartDisplay() {
    const cartContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');

    // Update cart count
    cartCount.textContent = currentCart.length;

    if (currentCart.length === 0) {
        cartContainer.innerHTML = `
            <div class="empty-cart-modern">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <span>Add items from the menu</span>
            </div>
        `;
        updatePlaceOrderButton();
        return;
    }

    cartContainer.innerHTML = currentCart.map(item => `
        <div class="item-card-horizontal" onclick="removeFromCart('${item.code}')" style="width: 100%; max-width: 380px;">
            <div class="item-image-horizontal">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x80?text=No+Image'">
            </div>
            <div class="item-details-horizontal">
                <h4 class="item-name-horizontal">${item.name}</h4>
                <span class="item-code-horizontal">Code: ${item.code}</span>
                <div class="item-price-horizontal">
                    <span class="price-current-horizontal">LKR ${item.cartPrice.toFixed(2)} × ${item.quantity}</span>
                    <span class="cart-item-total">LKR ${(item.cartPrice * item.quantity).toFixed(2)}</span>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn-modern" onclick="event.stopPropagation(); updateCartQuantity('${item.code}', ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn-modern" onclick="event.stopPropagation(); updateCartQuantity('${item.code}', ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-item-btn" onclick="event.stopPropagation(); removeFromCart('${item.code}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    updatePlaceOrderButton();
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

// Place order with inventory management
function placeOrder() {
    if (currentCart.length === 0) {
        showNotification('Cart is empty!', 'error');
        return;
    }

    if (!selectedCustomer) {
        showNotification('Please select a customer!', 'error');
        return;
    }

    // Check inventory before placing order
    for (const cartItem of currentCart) {
        const foodItem = foodItems.find(item => item.code === cartItem.code);
        if (cartItem.quantity > foodItem.quantity) {
            showNotification(`Insufficient stock for ${cartItem.name}. Available: ${foodItem.quantity}`, 'error');
            return;
        }
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
        timestamp: new Date().toISOString(),
        createdBy: 'admin' // In real app, would be current user
    };

    // Update inventory
    currentCart.forEach(cartItem => {
        const foodItem = foodItems.find(item => item.code === cartItem.code);
        if (foodItem) {
            foodItem.quantity -= cartItem.quantity;
        }
    });

    orders.unshift(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('foodItems', JSON.stringify(foodItems));

    // Generate receipt
    generateReceipt(order);

    // Clear cart and reset form
    currentCart = [];
    selectedCustomer = null;
    document.getElementById('itemSearch').value = '';
    document.getElementById('orderDiscount').value = 0;

    updateCartDisplay();
    updateOrderSummary();
    updateSelectedCustomerDisplay();
    displayOrders();

    showNotification('Order placed successfully!', 'success');

    // Refresh dashboard data if on dashboard page
    if (window.location.pathname.includes('dashboard.html')) {
        location.reload();
    }
}

// Cancel order - clear all items from cart
function cancelOrder() {
    if (currentCart.length === 0) {
        showNotification('Cart is already empty!', 'info');
        return;
    }

    // Calculate cart summary for display
    const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = currentCart.reduce((sum, item) => sum + (item.cartPrice * item.quantity), 0);
    const discountPercent = parseFloat(document.getElementById('orderDiscount').value) || 0;
    const discountAmount = subtotal * (discountPercent / 100);
    const total = subtotal - discountAmount;

    // Create beautiful confirmation modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content cancel-modal">
            <div class="modal-header">
                <div class="modal-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="modal-title">
                    <h2>Cancel Order</h2>
                    <span>Current Order</span>
                </div>
                <span class="close">&times;</span>
            </div>
            <div class="modal-body">
                <div class="cancel-warning">
                    <div class="warning-icon">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <h3>Cancel Current Order?</h3>
                    <p>You are about to cancel your current order and remove all items from the cart. This action <strong>cannot be undone</strong>.</p>
                </div>

                <div class="order-summary">
                    <h4><i class="fas fa-shopping-cart"></i> Order Summary</h4>
                    <div class="summary-details">
                        <div class="summary-row">
                            <span>Items in Cart:</span>
                            <span class="value">${totalItems} items</span>
                        </div>
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span class="value">LKR ${subtotal.toFixed(2)}</span>
                        </div>
                        ${discountPercent > 0 ? `
                        <div class="summary-row">
                            <span>Discount (${discountPercent}%):</span>
                            <span class="value discount">-LKR ${discountAmount.toFixed(2)}</span>
                        </div>
                        ` : ''}
                        <div class="summary-row total-row">
                            <span>Total:</span>
                            <span class="value total">LKR ${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary cancel-btn">
                    <i class="fas fa-arrow-left"></i> Keep Order
                </button>
                <button class="btn btn-danger confirm-btn">
                    <i class="fas fa-times-circle"></i> Cancel Order
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle modal interactions
    let confirmed = false;

    const closeModal = () => {
        document.body.removeChild(modal);
    };

    const confirmCancel = () => {
        confirmed = true;
        closeModal();

        // Clear cart
        currentCart = [];
        selectedCustomer = null;

        // Reset form inputs
        document.getElementById('itemSearch').value = '';
        document.getElementById('orderDiscount').value = 0;

        // Update UI
        updateCartDisplay();
        updateOrderSummary();
        updateSelectedCustomerDisplay();
        updatePlaceOrderButton();

        // Enhanced notification
        showNotification(`Order cancelled successfully! ${totalItems} item${totalItems !== 1 ? 's' : ''} removed from cart.`, 'warning');
    };

    // Add event listeners
    modal.querySelector('.close').addEventListener('click', closeModal);
    modal.querySelector('.cancel-btn').addEventListener('click', closeModal);
    modal.querySelector('.confirm-btn').addEventListener('click', confirmCancel);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Focus the cancel button by default
    modal.querySelector('.cancel-btn').focus();
}

// Start new order - clear current cart and reset UI
function startNewOrder() {
    // Check if there's an existing order in progress
    if (currentCart.length > 0) {
        // Populate new order modal with cart info
        const newOrderInfo = document.getElementById('newOrderInfo');
        const totalItems = currentCart.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = currentCart.reduce((sum, item) => sum + (item.cartPrice * item.quantity), 0);

        newOrderInfo.innerHTML = `
            <div class="new-order-details">
                <div class="new-order-stat">
                    <span class="new-order-stat-value">${totalItems}</span>
                    <span class="new-order-stat-label">Items in Cart</span>
                </div>
                <div class="new-order-stat">
                    <span class="new-order-stat-value">LKR ${totalValue.toFixed(2)}</span>
                    <span class="new-order-stat-label">Total Value</span>
                </div>
                ${selectedCustomer ? `
                    <div class="new-order-customer">
                        <span class="new-order-customer-label">Selected Customer:</span>
                        <span class="new-order-customer-name">${selectedCustomer.name}</span>
                    </div>
                ` : ''}
            </div>
        `;

        // Show modal
        newOrderModal.style.display = 'block';
        return;
    }

    // If no items in cart, proceed directly
    proceedWithNewOrder();
}

// Proceed with creating a new order (clear cart and reset UI)
function proceedWithNewOrder() {
    // Clear cart and reset state
    currentCart = [];
    selectedCustomer = null;

    // Reset form inputs
    document.getElementById('itemSearch').value = '';
    document.getElementById('customerSearch').value = '';
    document.getElementById('orderDiscount').value = 0;

    // Clear customer selection
    document.querySelectorAll('.customer-card-simple').forEach(card => {
        card.classList.remove('selected');
    });

    // Update UI
    updateCartDisplay();
    updateOrderSummary();
    updateSelectedCustomerDisplay();
    updatePlaceOrderButton();

    // Scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });

    showNotification('Ready to start a new order!', 'success');
}

// Export orders to CSV
function exportOrders() {
    try {
        // Get all orders
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');

        if (orders.length === 0) {
            showNotification('No orders found to export!', 'warning');
            return;
        }

        // Create CSV header
        const csvHeader = [
            'Order ID',
            'Customer Name',
            'Customer Phone',
            'Order Date',
            'Order Time',
            'Status',
            'Items Count',
            'Subtotal (LKR)',
            'Discount (%)',
            'Discount Amount (LKR)',
            'Total (LKR)',
            'Payment Method'
        ];

        // Create CSV rows
        const csvRows = orders.map(order => {
            const orderDate = new Date(order.timestamp);
            return [
                order.id,
                order.customerName,
                order.customerId || '', // Customer phone is stored as customerId
                orderDate.toLocaleDateString(),
                orderDate.toLocaleTimeString(),
                order.status || 'Completed',
                order.items.length,
                order.subtotal.toFixed(2),
                order.discount || 0, // Discount percentage is stored as 'discount'
                order.discountAmount.toFixed(2),
                order.total.toFixed(2),
                order.paymentMethod || 'Cash'
            ];
        });

        // Combine header and rows
        const csvContent = [csvHeader, ...csvRows]
            .map(row => row.map(field => `"${field}"`).join(','))
            .join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `mos-burgers-orders-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showNotification(`Successfully exported ${orders.length} orders to CSV!`, 'success');
        } else {
            // Fallback for older browsers
            showNotification('CSV export is not supported in this browser. Please use a modern browser.', 'error');
        }

    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export orders. Please try again.', 'error');
    }
}

// Generate receipt
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

    // Create downloadable text file as PDF simulation
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Display orders with enhanced functionality
function displayOrders() {
    const ordersList = document.getElementById('ordersList');

    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders-modern">No orders found</p>';
        return;
    }

    ordersList.innerHTML = orders.slice(0, 10).map(order => `
        <div class="order-card-modern">
            <div class="order-card-header">
                <div class="order-info">
                    <h4>#${order.id}</h4>
                    <span class="order-customer">${order.customerName}</span>
                </div>
                <span class="status-modern ${order.status}">${order.status.toUpperCase()}</span>
            </div>
            <div class="order-card-body">
                <div class="order-meta">
                    <span><i class="fas fa-shopping-cart"></i> ${order.items.length} items</span>
                    <span><i class="fas fa-clock"></i> ${new Date(order.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="order-total">
                    <span>LKR ${order.total.toFixed(2)}</span>
                </div>
            </div>
            <div class="order-card-actions">
                <button class="btn btn-sm btn-outline" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-sm btn-outline" onclick="editOrderStatus('${order.id}')">
                    <i class="fas fa-edit"></i> Status
                </button>
                <button class="btn btn-sm btn-outline" onclick="reprintReceipt('${order.id}')">
                    <i class="fas fa-print"></i> Print
                </button>
            </div>
        </div>
    `).join('');

    updateOrderStats();
}

// View order details in modal
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Create and show order details modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content order-details-modal">
            <div class="modal-header">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #3498db, #2980b9); display: flex; align-items: center; justify-content: center; color: white;">
                        <i class="fas fa-receipt" style="font-size: 1.5rem;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 1.5rem;">Order Details</h2>
                        <span style="color: #666; font-size: 0.9rem;">Order #${order.id}</span>
                    </div>
                </div>
                <span class="close" style="font-size: 2rem; color: #666;">&times;</span>
            </div>
            <div class="modal-body" style="padding: 32px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px;">
                    <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
                        <h3 style="margin: 0 0 16px 0; color: #2d3748; font-size: 1.2rem;"><i class="fas fa-info-circle" style="margin-right: 8px;"></i>Order Information</h3>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 500; color: #4a5568;">Customer:</span>
                                <span style="color: #2d3748;">${order.customerName}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 500; color: #4a5568;">Status:</span>
                                <span class="status ${order.status}" style="padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">${order.status.toUpperCase()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 500; color: #4a5568;">Date & Time:</span>
                                <span style="color: #2d3748;">${new Date(order.timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 24px; border-radius: 16px; border: 1px solid #b3e5fc;">
                        <h3 style="margin: 0 0 16px 0; color: #2d3748; font-size: 1.2rem;"><i class="fas fa-calculator" style="margin-right: 8px;"></i>Payment Summary</h3>
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 500; color: #4a5568;">Subtotal:</span>
                                <span style="color: #2d3748;">LKR ${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="font-weight: 500; color: #4a5568;">Discount (${order.discount}%):</span>
                                <span style="color: #e53e3e;">-LKR ${order.discountAmount.toFixed(2)}</span>
                            </div>
                            <hr style="border: none; border-top: 1px solid #cbd5e0; margin: 8px 0;">
                            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.1rem;">
                                <span style="color: #2d3748;">Total:</span>
                                <span style="color: #38a169;">LKR ${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="background: linear-gradient(135deg, #fefefe, #f7fafc); padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0;">
                    <h3 style="margin: 0 0 20px 0; color: #2d3748; font-size: 1.2rem;"><i class="fas fa-shopping-cart" style="margin-right: 8px;"></i>Order Items (${order.items.length} items)</h3>
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        ${order.items.map(item => `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                                <div style="display: flex; align-items: center; gap: 16px;">
                                    <div style="width: 50px; height: 50px; border-radius: 10px; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                                        ${item.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 style="margin: 0; color: #2d3748; font-size: 1rem;">${item.name}</h4>
                                        <span style="color: #718096; font-size: 0.8rem;">${item.code}</span>
                                    </div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 24px; text-align: right;">
                                    <div>
                                        <div style="font-weight: 600; color: #2d3748;">Qty: ${item.quantity}</div>
                                        <div style="color: #718096; font-size: 0.9rem;">LKR ${item.cartPrice.toFixed(2)} each</div>
                                    </div>
                                    <div style="font-weight: 700; color: #38a169; font-size: 1.1rem;">LKR ${(item.cartPrice * item.quantity).toFixed(2)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div style="padding: 24px 32px; border-top: 1px solid #e2e8f0; background: #f8fafc; display: flex; justify-content: flex-end; gap: 12px;">
                <button class="btn btn-secondary" onclick="editOrderStatus('${order.id}')" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-edit"></i> Update Status
                </button>
                <button class="btn btn-warning" onclick="reprintReceipt('${order.id}')" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-print"></i> Print Receipt
                </button>
                <button class="btn btn-danger" onclick="deleteOrder('${order.id}')" style="display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-trash-alt"></i> Delete Order
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add close functionality
    modal.querySelector('.close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    modal.style.display = 'block';
}

// Edit order status
function editOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Create status update modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white;">
                        <i class="fas fa-edit" style="font-size: 1.5rem;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 1.5rem;">Update Order Status</h2>
                        <span style="color: #666; font-size: 0.9rem;">Order #${order.id}</span>
                    </div>
                </div>
                <span class="close" style="font-size: 2rem; color: #666;">&times;</span>
            </div>
            <div style="padding: 32px;">
                <div style="margin-bottom: 24px;">
                    <label style="display: block; font-weight: 600; color: #2d3748; margin-bottom: 12px;">Current Status:</label>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span class="status ${order.status}" style="padding: 8px 16px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">${order.status.toUpperCase()}</span>
                        <span style="color: #718096; font-size: 0.9rem;">for ${order.customerName}</span>
                    </div>
                </div>

                <div style="margin-bottom: 32px;">
                    <label style="display: block; font-weight: 600; color: #2d3748; margin-bottom: 12px;">New Status:</label>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px;">
                        <label style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; ${order.status === 'pending' ? 'border-color: #fbbf24; background: #fefce8;' : ''}">
                            <input type="radio" name="status" value="pending" ${order.status === 'pending' ? 'checked' : ''} style="display: none;">
                            <div style="width: 16px; height: 16px; border-radius: 50%; border: 2px solid #fbbf24; display: flex; align-items: center; justify-content: center;">
                                <div style="width: 8px; height: 8px; border-radius: 50%; background: #fbbf24; display: none;"></div>
                            </div>
                            <span style="font-weight: 500; color: #92400e;">Pending</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; ${order.status === 'confirmed' ? 'border-color: #3b82f6; background: #eff6ff;' : ''}">
                            <input type="radio" name="status" value="confirmed" ${order.status === 'confirmed' ? 'checked' : ''} style="display: none;">
                            <div style="width: 16px; height: 16px; border-radius: 50%; border: 2px solid #3b82f6; display: flex; align-items: center; justify-content: center;">
                                <div style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; display: none;"></div>
                            </div>
                            <span style="font-weight: 500; color: #1e40af;">Confirmed</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; ${order.status === 'completed' ? 'border-color: #10b981; background: #f0fdf4;' : ''}">
                            <input type="radio" name="status" value="completed" ${order.status === 'completed' ? 'checked' : ''} style="display: none;">
                            <div style="width: 16px; height: 16px; border-radius: 50%; border: 2px solid #10b981; display: flex; align-items: center; justify-content: center;">
                                <div style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: none;"></div>
                            </div>
                            <span style="font-weight: 500; color: #047857;">Completed</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; padding: 12px; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; ${order.status === 'cancelled' ? 'border-color: #ef4444; background: #fef2f2;' : ''}">
                            <input type="radio" name="status" value="cancelled" ${order.status === 'cancelled' ? 'checked' : ''} style="display: none;">
                            <div style="width: 16px; height: 16px; border-radius: 50%; border: 2px solid #ef4444; display: flex; align-items: center; justify-content: center;">
                                <div style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; display: none;"></div>
                            </div>
                            <span style="font-weight: 500; color: #dc2626;">Cancelled</span>
                        </label>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn btn-secondary" onclick="document.body.removeChild(this.closest('.modal'))">Cancel</button>
                    <button class="btn btn-primary" id="updateStatusBtn">Update Status</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Initialize dots for currently selected status
    const currentSelected = modal.querySelector('input[name="status"]:checked');
    if (currentSelected) {
        const currentLabel = currentSelected.closest('label');
        const statusValue = currentSelected.value;
        const statusColors = {
            'pending': { border: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
            'confirmed': { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
            'completed': { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
            'cancelled': { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
        };
        const colors = statusColors[statusValue];
        currentLabel.style.borderColor = colors.border;
        currentLabel.style.background = colors.bg;
        currentLabel.querySelector('div:last-child').style.display = 'block';
    }

    // Add radio button functionality
    const radioLabels = modal.querySelectorAll('label');
    radioLabels.forEach(label => {
        label.addEventListener('click', function() {
            // Remove selected state from all labels
            radioLabels.forEach(l => {
                l.style.borderColor = '#e2e8f0';
                l.style.background = 'transparent';
                l.querySelector('div:last-child').style.display = 'none';
            });
            // Add selected state to clicked label immediately
            const statusValue = this.querySelector('input').value;
            const statusColors = {
                'pending': { border: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
                'confirmed': { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
                'completed': { border: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
                'cancelled': { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' }
            };
            const colors = statusColors[statusValue];
            this.style.borderColor = colors.border;
            this.style.background = colors.bg;
            this.querySelector('div:last-child').style.display = 'block';
            // Check the radio button
            this.querySelector('input').checked = true;
        });
    });

    // Add update functionality
    modal.querySelector('#updateStatusBtn').addEventListener('click', () => {
        const selectedStatuses = modal.querySelectorAll('input[name="status"]:checked');
        if (selectedStatuses.length > 0) {
            // For now, take the first selected status (in case multiple are selected)
            const newStatus = selectedStatuses[0].value;
            order.status = newStatus;

            // If cancelling order, restore inventory
            if (newStatus === 'cancelled') {
                order.items.forEach(item => {
                    const foodItem = foodItems.find(fi => fi.code === item.code);
                    if (foodItem) {
                        foodItem.quantity += item.quantity;
                    }
                });
                localStorage.setItem('foodItems', JSON.stringify(foodItems));
            }

            saveOrders();
            displayOrders();
            document.body.removeChild(modal);

            // Show success message
            showNotification(`Order #${order.id} status updated to ${newStatus}`, 'success');
        } else {
            showNotification('Please select a status', 'error');
        }
    });

    // Add close functionality
    modal.querySelector('.close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    modal.style.display = 'block';
}

// Reprint receipt
function reprintReceipt(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        generateReceipt(order);
    }
}

// Delete order with confirmation
function deleteOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Create delete confirmation modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 450px;">
            <div class="modal-header">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #ef4444, #dc2626); display: flex; align-items: center; justify-content: center; color: white;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 1.5rem;"></i>
                    </div>
                    <div>
                        <h2 style="margin: 0; font-size: 1.5rem; color: #dc2626;">Delete Order</h2>
                        <span style="color: #666; font-size: 0.9rem;">Order #${order.id}</span>
                    </div>
                </div>
                <span class="close" style="font-size: 2rem; color: #666;">&times;</span>
            </div>
            <div style="padding: 32px;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #fef2f2, #fee2e2); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                        <i class="fas fa-trash-alt" style="font-size: 2rem; color: #dc2626;"></i>
                    </div>
                    <h3 style="margin: 0 0 12px 0; color: #2d3748;">Are you sure?</h3>
                    <p style="margin: 0; color: #718096; line-height: 1.6;">
                        You are about to delete order <strong>#${order.id}</strong> for <strong>${order.customerName}</strong>.<br>
                        This action <strong>cannot be undone</strong> and will restore the inventory quantities.
                    </p>
                </div>

                <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); padding: 20px; border-radius: 12px; border: 1px solid #fecaca; margin-bottom: 32px;">
                    <h4 style="margin: 0 0 12px 0; color: #dc2626; font-size: 1rem;"><i class="fas fa-info-circle" style="margin-right: 8px;"></i>Order Summary</h4>
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.9rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #4a5568;">Items:</span>
                            <span style="color: #2d3748; font-weight: 500;">${order.items.length} items</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #4a5568;">Total Amount:</span>
                            <span style="color: #2d3748; font-weight: 500;">LKR ${order.total.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #4a5568;">Status:</span>
                            <span class="status ${order.status}" style="padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">${order.status.toUpperCase()}</span>
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn btn-secondary" onclick="document.body.removeChild(this.closest('.modal'))">
                        <i class="fas fa-times" style="margin-right: 8px;"></i>Cancel
                    </button>
                    <button class="btn btn-danger" id="confirmDeleteBtn" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
                        <i class="fas fa-trash-alt" style="margin-right: 8px;"></i>Delete Order
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add delete functionality
    modal.querySelector('#confirmDeleteBtn').addEventListener('click', () => {
        // Restore inventory if order is not cancelled
        if (order.status !== 'cancelled') {
            order.items.forEach(item => {
                const foodItem = foodItems.find(fi => fi.code === item.code);
                if (foodItem) {
                    foodItem.quantity += item.quantity;
                }
            });
            localStorage.setItem('foodItems', JSON.stringify(foodItems));
        }

        orders = orders.filter(o => o.id !== orderId);
        saveOrders();
        displayOrders();
        document.body.removeChild(modal);

        // Show success message
        showNotification(`Order #${orderId} has been deleted successfully`, 'success');

        // Refresh dashboard if on dashboard page
        if (window.location.pathname.includes('dashboard.html')) {
            location.reload();
        }
    });

    // Add close functionality
    modal.querySelector('.close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    modal.style.display = 'block';
}

// Item Search and Selection
const itemSearchInput = document.getElementById('itemSearch');
const itemSuggestions = document.getElementById('itemSuggestions');
const itemGrid = document.getElementById('itemGrid');
let currentCategoryFilter = ['all']; // Changed to array to support multiple selections

// Initialize item grid with all items
function initializeItemGrid() {
    console.log('🔄 Initializing item grid...');
    console.log('📊 Current foodItems count:', foodItems.length);
    console.log('📊 Current foodItems data:', foodItems);

    const itemGrid = document.getElementById('itemGrid');
    console.log('🎯 itemGrid element:', itemGrid);

    if (itemGrid) {
        console.log('✅ itemGrid element found, rendering items...');

        // If no items loaded, try to initialize sample data first
        if (foodItems.length === 0) {
            console.log('⚠️ No items found, initializing sample data...');
            initializeSampleData();
        }

        // Force render all items initially
        renderItemGrid(foodItems);
        setupCategoryFilters();
        setupItemSearch();
        console.log('✅ Item grid initialization complete');
    } else {
        console.error('❌ itemGrid element not found!');
    }
}

// Setup category filter buttons
function setupCategoryFilters() {
    console.log('Setting up category filters...');
    const filterButtons = document.querySelectorAll('.filter-btn');
    console.log('Found', filterButtons.length, 'filter buttons');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            console.log('Filter button clicked:', category);

            if (category === 'all') {
                // If "All" is clicked, select only "all" and deselect others
                currentCategoryFilter = ['all'];
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.category === 'all') {
                        btn.classList.add('active');
                    }
                });
            } else {
                // Remove "all" from selection if a specific category is clicked
                currentCategoryFilter = currentCategoryFilter.filter(cat => cat !== 'all');

                // Toggle the clicked category
                if (currentCategoryFilter.includes(category)) {
                    currentCategoryFilter = currentCategoryFilter.filter(cat => cat !== category);
                    button.classList.remove('active');
                } else {
                    currentCategoryFilter.push(category);
                    button.classList.add('active');
                }

                // If no categories are selected, default to "all"
                if (currentCategoryFilter.length === 0) {
                    currentCategoryFilter = ['all'];
                    filterButtons.forEach(btn => {
                        btn.classList.remove('active');
                        if (btn.dataset.category === 'all') {
                            btn.classList.add('active');
                        }
                    });
                } else {
                    // Remove active class from "all" button
                    filterButtons.forEach(btn => {
                        if (btn.dataset.category === 'all') {
                            btn.classList.remove('active');
                        }
                    });
                }
            }

            console.log('Current category filter:', currentCategoryFilter);
            filterAndRenderItems();
        });
    });
}

// Setup item search functionality
function setupItemSearch() {
    const itemSearchInput = document.getElementById('itemSearch');
    if (itemSearchInput) {
        itemSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterAndRenderItems(query);
        });
    }
}

function filterAndRenderItems(searchQuery = '') {
    console.log('Filtering items with category:', currentCategoryFilter, 'and search:', searchQuery);
    let filteredItems = foodItems;
    console.log('Starting with', filteredItems.length, 'items');

    // Apply category filter
    if (!currentCategoryFilter.includes('all')) {
        filteredItems = filteredItems.filter(item => currentCategoryFilter.includes(item.category));
        console.log('After category filter:', filteredItems.length, 'items');
    }

    // Apply search filter
    if (searchQuery) {
        filteredItems = filteredItems.filter(item =>
            item.name.toLowerCase().includes(searchQuery) ||
            item.code.toLowerCase().includes(searchQuery) ||
            item.category.toLowerCase().includes(searchQuery)
        );
        console.log('After search filter:', filteredItems.length, 'items');
    }

    renderItemGrid(filteredItems);
}

function renderItemGrid(items) {
    console.log('🎯 renderItemGrid CALLED with', items.length, 'items');
    const itemGrid = document.getElementById('itemGrid');
    if (!itemGrid) {
        console.error('❌ itemGrid element not found!');
        return;
    }

    console.log('✅ itemGrid element found');

    if (items.length === 0) {
        itemGrid.innerHTML = '<p style="padding: 20px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; color: #721c24;">No items available</p>';
        return;
    }

    // Use flexbox layout for horizontal cards in a responsive grid
    itemGrid.style.display = 'flex';
    itemGrid.style.flexWrap = 'wrap';
    itemGrid.style.justifyContent = 'center';
    itemGrid.style.gap = '20px';
    itemGrid.style.padding = '24px';

    // Generate horizontal HTML cards
    let html = '';
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const discountedPrice = item.discount > 0 ? item.price - (item.price * item.discount / 100) : item.price;
        const isOutOfStock = item.quantity <= 0;
        const isLowStock = item.quantity <= 5 && item.quantity > 0;

        html += `
            <div class="item-card-horizontal ${isOutOfStock ? 'out-of-stock' : ''}" ${isOutOfStock ? `onclick="showOutOfStockMessage('${item.name}')"` : `onclick="addToCartFromSearch('${item.code}')"`}>
                <div class="item-image-horizontal">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/120x120?text=No+Image'">
                    ${isOutOfStock ? '<div class="out-of-stock-overlay">Out of Stock</div>' : ''}
                </div>
                <div class="item-details-horizontal">
                    <h4 class="item-name-horizontal">${item.name}</h4>
                    <span class="item-code-horizontal">Code: ${item.code}</span>
                    <span class="item-category-horizontal">${getCategoryIcon(item.category)} ${item.category}</span>
                    <div class="item-price-horizontal">
                        <span class="price-current-horizontal">LKR ${discountedPrice.toFixed(2)}</span>
                        ${item.discount > 0 ? `<span class="price-original-horizontal">LKR ${item.price.toFixed(2)}</span>` : ''}
                        ${item.discount > 0 ? `<span class="discount-badge-horizontal">${item.discount}% OFF</span>` : ''}
                    </div>
                    <div class="stock-info-horizontal ${isLowStock ? 'low-stock' : ''} ${isOutOfStock ? 'out-of-stock' : ''}">
                        <i class="fas ${isOutOfStock ? 'fa-times-circle' : isLowStock ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
                        ${isOutOfStock ? 'Out of Stock' : `In Stock: ${item.quantity}`}
                    </div>
                </div>
            </div>
        `;
    }

    itemGrid.innerHTML = html;
    console.log('✅ Rendered', items.length, 'items in horizontal layout');
}

function getCategoryIcon(category) {
    const icons = {
        'Burgers': '🍔',
        'Submarines': '🥖',
        'Fries': '🍟',
        'Pasta': '🍝',
        'Chicken': '🍗',
        'Beverages': '🥤'
    };
    return icons[category] || '🍽️';
}

function addToCartFromSearch(itemCode) {
    const item = foodItems.find(i => i.code === itemCode);
    if (item) {
        addToCart(item);
        showNotification(`${item.name} added to cart`, 'success');
    }
}



// Customer Search and Selection
const customerSearchInput = document.getElementById('customerSearch');
const customerSuggestions = document.getElementById('customerSuggestions');
const customerGrid = document.getElementById('customerGrid');
const selectedCustomerDisplay = document.getElementById('selectedCustomerDisplay');

// Initialize customer grid with all customers
function initializeCustomerGrid() {
    console.log('Initializing customer grid...');
    const customerGrid = document.getElementById('customerGrid');
    console.log('customerGrid element:', customerGrid);
    if (customerGrid) {
        renderCustomerGrid(customers);
        updateSelectedCustomerDisplay();
        setupCustomerSearch();
    } else {
        console.error('customerGrid element not found!');
    }
}

// Setup customer search functionality
function setupCustomerSearch() {
    const customerSearchInput = document.getElementById('customerSearch');
    const customerSuggestions = document.getElementById('customerSuggestions');
    const customerGrid = document.getElementById('customerGrid');

    if (customerSearchInput) {
        customerSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            // If no query, hide suggestions and show full grid
            if (!query) {
                if (customerSuggestions) {
                    customerSuggestions.innerHTML = '';
                    customerSuggestions.style.display = 'none';
                }
                if (customerGrid) customerGrid.style.display = 'flex';
                return;
            }

            // Find matching customers
            const matches = customers.filter(c =>
                c.name.toLowerCase().includes(query) ||
                c.phone.toLowerCase().includes(query) ||
                (c.email || '').toLowerCase().includes(query)
            );

            // Render suggestions if any, otherwise show grid
            if (customerSuggestions) {
                customerSuggestions.innerHTML = matches.map(c =>
                    `<div class="suggestion" onclick="selectCustomer('${c.phone}')">${c.name} - ${c.phone}</div>`
                ).join('');
                customerSuggestions.style.display = matches.length ? 'block' : 'none';
            }

            if (customerGrid) customerGrid.style.display = matches.length ? 'none' : 'flex';
        });
    }
}

function selectCustomer(phone) {
    selectedCustomer = customers.find(c => c.phone === phone);
    const customerSearchInput = document.getElementById('customerSearch');
    const customerSuggestions = document.getElementById('customerSuggestions');
    const customerGrid = document.getElementById('customerGrid');

    if (customerSearchInput) customerSearchInput.value = '';
    if (customerSuggestions) {
        customerSuggestions.innerHTML = '';
        customerSuggestions.style.display = 'none';
    }
    if (customerGrid) customerGrid.style.display = 'flex';

    // Update visual indicators on all customer cards
    const customerCards = customerGrid.querySelectorAll('.customer-select-indicator');
    customerCards.forEach(indicator => {
        const card = indicator.closest('.customer-card-compact');
        const cardPhone = card.onclick.toString().match(/'([^']+)'/)[1];
        if (cardPhone === phone) {
            indicator.classList.add('selected');
        } else {
            indicator.classList.remove('selected');
        }
    });

    updateSelectedCustomerDisplay();
    updatePlaceOrderButton();
}

function renderCustomerGrid(customerList) {
    const customerGrid = document.getElementById('customerGrid');
    if (!customerGrid) {
        console.error('customerGrid element not found!');
        return;
    }

    if (customerList.length === 0) {
        customerGrid.innerHTML = '<p class="no-data">No customers available</p>';
        return;
    }

    customerGrid.innerHTML = customerList.map(customer => `
        <div class="customer-card-compact" onclick="selectCustomer('${customer.phone}')">
            <div class="customer-card-compact-left">
                <div class="customer-avatar-compact">
                    ${customer.name.charAt(0).toUpperCase()}
                </div>
                <div class="customer-info-compact">
                    <h4>${customer.name}</h4>
                    <div class="phone">${customer.phone}</div>
                    <div class="email">${customer.email || 'No email'}</div>
                </div>
            </div>
            <div class="customer-card-compact-right">
                <div class="customer-select-indicator ${selectedCustomer && selectedCustomer.phone === customer.phone ? 'selected' : ''}"></div>
            </div>
        </div>
    `).join('');
}

function updateSelectedCustomerDisplay() {
    const selectedCustomerDisplay = document.getElementById('selectedCustomerDisplay');
    if (!selectedCustomerDisplay) {
        console.error('selectedCustomerDisplay element not found!');
        return;
    }

    if (selectedCustomer) {
        selectedCustomerDisplay.innerHTML = `
            <div class="selected-customer-card">
                <div class="selected-customer-header">
                    <div class="selected-customer-info">
                        <div class="customer-avatar-small">
                            ${selectedCustomer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h4>${selectedCustomer.name}</h4>
                            <span>${selectedCustomer.phone}</span>
                        </div>
                    </div>
                    <button class="remove-customer-btn" onclick="removeSelectedCustomer()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    } else {
        selectedCustomerDisplay.innerHTML = `
            <div class="no-customer-selected">
                <i class="fas fa-user-plus"></i>
                <span>No customer selected</span>
            </div>
        `;
    }
}

function removeSelectedCustomer() {
    selectedCustomer = null;
    updateSelectedCustomerDisplay();
    updatePlaceOrderButton();
}

// Customer modal management
const customerModal = document.getElementById('customerModal');
const addCustomerBtn = document.getElementById('addCustomerBtn');
const customerForm = document.getElementById('customerForm');
const successModal = document.getElementById('successModal');

console.log('🎯 Modal elements found:');
console.log('customerModal:', customerModal);
console.log('addCustomerBtn:', addCustomerBtn);
console.log('customerForm:', customerForm);
console.log('successModal:', successModal);

// Success modal functions
function showSuccessModal(title, message) {
    console.log('🎉 Showing success modal:', title, message);
    const successTitleEl = document.getElementById('successTitle');
    const successMessageEl = document.getElementById('successMessage');
    console.log('successTitle element:', successTitleEl);
    console.log('successMessage element:', successMessageEl);

    if (successTitleEl && successMessageEl && successModal) {
        successTitleEl.textContent = title;
        successMessageEl.textContent = message;
        successModal.style.display = 'block';
        console.log('✅ Success modal should now be visible');
    } else {
        console.error('❌ Success modal elements not found:', {
            successTitleEl,
            successMessageEl,
            successModal
        });
    }
}

function hideSuccessModal() {
    console.log('❌ Hiding success modal');
    successModal.style.display = 'none';
}

addCustomerBtn.addEventListener('click', () => {
    customerModal.style.display = 'block';
});

customerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('📝 Customer form submitted');

    const formData = new FormData(customerForm);
    const customerData = {
        name: formData.get('customerName'),
        phone: formData.get('customerPhone'),
        email: formData.get('customerEmail') || '',
        address: formData.get('customerAddress') || '',
        joinDate: new Date().toISOString()
    };

    console.log('👤 Customer data:', customerData);

    // Check if customer already exists
    if (customers.find(c => c.phone === customerData.phone)) {
        showNotification('⚠️ A customer with this phone number already exists! Please use a different phone number.', 'warning');
        return;
    }

    customers.push(customerData);
    localStorage.setItem('customers', JSON.stringify(customers));
    console.log('💾 Customer saved to localStorage, total customers:', customers.length);

    customerModal.style.display = 'none';
    customerForm.reset();

    // Refresh customer list in the selection modal
    renderCustomerGrid(customers);
    console.log('🔄 Customer grid refreshed');

    showSuccessModal(
        'Customer Added Successfully!',
        'Welcome to MOS Burgers! The customer has been added to your database.'
    );
});

// Modal close functionality
document.querySelector('.close').addEventListener('click', () => {
    customerModal.style.display = 'none';
});

document.getElementById('cancelCustomerBtn').addEventListener('click', () => {
    customerModal.style.display = 'none';
});

document.getElementById('successOkBtn').addEventListener('click', () => {
    hideSuccessModal();
});

// Modal close functionality for all modals
window.addEventListener('click', (e) => {
    if (e.target === customerModal) {
        customerModal.style.display = 'none';
    }
    if (e.target === successModal) {
        hideSuccessModal();
    }
    // ... existing modal close handlers
});
document.getElementById('orderSearch').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    if (query.length < 1) {
        displayOrders();
        return;
    }

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query)
    );

    const ordersList = document.getElementById('ordersList');

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">No orders match your search</p>';
        return;
    }

    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h3>#${order.id}</h3>
                <span class="status ${order.status}">${order.status.toUpperCase()}</span>
            </div>
            <div class="order-details">
                <p><strong>Customer:</strong> ${order.customerName}</p>
                <p><strong>Items:</strong> ${order.items.length} items</p>
                <p><strong>Total:</strong> LKR ${order.total.toFixed(2)}</p>
                <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleDateString()}</p>
            </div>
            <div class="order-actions">
                <button class="btn btn-primary btn-small" onclick="viewOrderDetails('${order.id}')"><i class="fas fa-eye"></i> View</button>
                <button class="btn btn-secondary btn-small" onclick="editOrderStatus('${order.id}')"><i class="fas fa-edit"></i> Status</button>
                <button class="btn btn-warning btn-small" onclick="reprintReceipt('${order.id}')"><i class="fas fa-print"></i> Print</button>
                <button class="btn btn-danger btn-small" onclick="deleteOrder('${order.id}')"><i class="fas fa-trash-alt"></i> Delete</button>
            </div>
        </div>
    `).join('');
});

// Order discount change
document.getElementById('orderDiscount').addEventListener('input', updateOrderSummary);

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

// Update place order button state
function updatePlaceOrderButton() {
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const cancelOrderBtn = document.getElementById('cancelOrderBtn');

    const shouldEnable = selectedCustomer && currentCart.length > 0;

    placeOrderBtn.disabled = !shouldEnable;
    cancelOrderBtn.disabled = currentCart.length === 0;
}

// Initialize collapsible recent orders
function initializeRecentOrders() {
    const toggleBtn = document.getElementById('toggleOrders');
    const content = document.getElementById('recentOrdersContent');

    if (toggleBtn && content) {
        toggleBtn.addEventListener('click', () => {
            const isExpanded = content.style.display !== 'none' && content.style.display !== '';
            content.style.display = isExpanded ? 'none' : 'block';
            toggleBtn.querySelector('i').className = isExpanded ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
        });
    }
}

// Update order stats in header
function updateOrderStats() {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => new Date(order.timestamp).toDateString() === today);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;

    const totalOrdersEl = document.getElementById('totalOrders');
    const pendingOrdersEl = document.getElementById('pendingOrders');

    if (totalOrdersEl) totalOrdersEl.textContent = todayOrders.length;
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOMContentLoaded fired - starting initialization...');

    // Check if we have data, initialize if needed
    console.log('📊 Checking data before initialization...');
    console.log('Current foodItems length:', foodItems.length);
    console.log('Current customers length:', customers.length);

    // Only initialize sample data if we don't have any
    if (foodItems.length === 0 || customers.length === 0) {
        console.log('⚠️ No data found, initializing sample data...');
        initializeSampleData();
        console.log('✅ Sample data initialized');
    } else {
        console.log('✅ Using existing data - Food items:', foodItems.length, 'Customers:', customers.length);
    }

    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
        console.log('⏰ Starting UI component initialization...');
        displayOrders();
        updateOrderSummary();
        updateOrderStats();
        initializeCustomerGrid();
        initializeItemGrid();
        initializeRecentOrders();
        updatePlaceOrderButton();

        // Add event listeners for order buttons
        document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
        document.getElementById('cancelOrderBtn').addEventListener('click', cancelOrder);

        // Add event listeners for header buttons
        document.getElementById('newOrderBtn').addEventListener('click', startNewOrder);
        document.getElementById('exportOrdersBtn').addEventListener('click', exportOrders);

        // Add event listeners for new order modal buttons
        document.getElementById('cancelNewOrderBtn').addEventListener('click', () => {
            newOrderModal.style.display = 'none';
        });
        document.getElementById('confirmNewOrderBtn').addEventListener('click', () => {
            newOrderModal.style.display = 'none';
            proceedWithNewOrder();
        });
        document.getElementById('closeNewOrderModal').addEventListener('click', () => {
            newOrderModal.style.display = 'none';
        });

        // Close modal when clicking outside
        newOrderModal.addEventListener('click', (e) => {
            if (e.target === newOrderModal) {
                newOrderModal.style.display = 'none';
            }
        });

        console.log('✅ UI initialization complete');

        // Final check
        setTimeout(() => {
            console.log('🔍 Final check - Items in grid:', document.getElementById('itemGrid').children.length);
            console.log('🔍 Final check - Customers in grid:', document.getElementById('customerGrid').children.length);
        }, 500);
    }, 100);
});// Also try to initialize immediately in case DOMContentLoaded already fired
if (document.readyState !== 'loading') {
    console.log('DOM already loaded, initializing immediately...');
    initializeSampleData();
    console.log('Food items:', foodItems.length);
    console.log('Customers:', customers.length);

    setTimeout(() => {
        displayOrders();
        updateOrderSummary();
        updateOrderStats();
        initializeCustomerGrid();
        initializeItemGrid(); // Force immediate initialization
        initializeRecentOrders();
        updatePlaceOrderButton();

        // Add event listeners for order buttons
        document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
        document.getElementById('cancelOrderBtn').addEventListener('click', cancelOrder);

        console.log('Immediate initialization complete');
    }, 100);
} else {
    console.log('DOM still loading, will initialize on DOMContentLoaded');
}

// Manual test function - call this from browser console
window.testItemRendering = function() {
    console.log('🔧 TEST ITEM RENDERING: Starting debug...');
    console.log('Current foodItems array:', foodItems);
    console.log('Food items length:', foodItems.length);
    
    const itemGrid = document.getElementById('itemGrid');
    console.log('itemGrid element:', itemGrid);
    
    if (itemGrid) {
        console.log('✅ itemGrid found, calling renderItemGrid...');
        renderItemGrid(foodItems);
        console.log('✅ renderItemGrid called');
    } else {
        console.error('❌ itemGrid element not found!');
    }
    
    alert('Test completed! Check console for details.');
};

// Manual test function - call this from browser console
window.forceInitializeOrderData = function() {
    console.log('🔄 FORCE INITIALIZE: Loading sample data for order management...');
    initializeSampleData();
    console.log('✅ Data initialized! Food items:', foodItems.length, 'Customers:', customers.length);

    // Re-initialize the grids
    setTimeout(() => {
        initializeCustomerGrid();
        initializeItemGrid();
        updatePlaceOrderButton();
        console.log('✅ Grids updated!');
    }, 200);

    alert('Order data initialized! Items: ' + foodItems.length + ', Customers: ' + customers.length);
};

// Modal close functionality for clicking outside
window.addEventListener('click', (e) => {
    if (e.target === customerModal) {
        customerModal.style.display = 'none';
    }
    if (e.target === successModal) {
        hideSuccessModal();
    }
    // Add other modal close handlers here if needed
});

// Debug function to check current state
window.debugOrderData = function() {
    console.log('🔍 DEBUG: Current Order Data State');
    console.log('📊 foodItems length:', foodItems.length);
    console.log('👥 customers length:', customers.length);
    console.log('📊 foodItems data:', foodItems);
    console.log('👥 customers data:', customers);

    const itemGrid = document.getElementById('itemGrid');
    console.log('🎯 itemGrid element:', itemGrid);
    if (itemGrid) {
        console.log('🎯 itemGrid innerHTML length:', itemGrid.innerHTML.length);
        console.log('🎯 itemGrid innerHTML:', itemGrid.innerHTML.substring(0, 200));
    }

    alert('Check console for debug info!\nItems: ' + foodItems.length + '\nCustomers: ' + customers.length);
};

// Force render items manually
window.forceRenderItems = function() {
    console.log('🔄 FORCE RENDER: Manually rendering items...');
    if (foodItems.length === 0) {
        console.log('⚠️ No items, initializing sample data...');
        initializeSampleData();
    }
    renderItemGrid(foodItems);
    console.log('✅ Items rendered manually!');
    alert('Items rendered! Check the menu items section.');
};
