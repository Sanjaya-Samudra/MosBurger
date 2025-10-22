// Check authentication
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

console.log('🚀 Store Management JavaScript file loaded and executing!');

// Enhanced inventory management constants
const LOW_STOCK_THRESHOLD = 10;
const CRITICAL_STOCK_THRESHOLD = 5;

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

// Check for low stock items and show notifications
function checkLowStockItems() {
    const lowStockItems = foodItems.filter(item =>
        item.quantity <= LOW_STOCK_THRESHOLD && item.quantity > CRITICAL_STOCK_THRESHOLD
    );

    const criticalStockItems = foodItems.filter(item =>
        item.quantity <= CRITICAL_STOCK_THRESHOLD && item.quantity > 0
    );

    const outOfStockItems = foodItems.filter(item => item.quantity <= 0);

    // Show notifications for low stock items
    lowStockItems.forEach(item => {
        showNotification(
            `<strong>${item.name}</strong> is running low on stock (${item.quantity} units remaining). Consider restocking soon.`,
            'warning',
            6000
        );
    });

    // Show notifications for critical stock items
    criticalStockItems.forEach(item => {
        showNotification(
            `<strong>${item.name}</strong> has critically low stock (${item.quantity} units remaining). Restock immediately!`,
            'error',
            8000
        );
    });

    // Show notifications for out of stock items
    outOfStockItems.forEach(item => {
        showNotification(
            `<strong>${item.name}</strong> is now out of stock. This item is no longer available for sale.`,
            'error',
            8000
        );
    });
}

// Debounce utility for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Load items from localStorage or use initial data
let foodItems = [];
let editingItemCode = null;

try {
    const storedItems = localStorage.getItem('foodItems');
    console.log('💾 Raw localStorage data:', storedItems);
    
    if (storedItems) {
        foodItems = JSON.parse(storedItems);
        console.log('✅ Successfully parsed foodItems from localStorage');
    } else {
        console.log('📭 No foodItems found in localStorage');
    }
} catch (error) {
    console.error('❌ Error parsing foodItems from localStorage:', error);
    console.log('� Falling back to empty array');
    foodItems = [];
    // Clear corrupted data
    localStorage.removeItem('foodItems');
}

// Get DOM elements
const form = document.getElementById('itemForm');
const modal = document.getElementById('itemModal');
const itemsContainer = document.getElementById('itemsContainer');
const photoPreview = document.getElementById('photoPreview');
const itemPhotoInput = document.getElementById('itemPhoto');
const modalTitle = document.getElementById('modalTitle');
const modalIcon = document.getElementById('modalIcon');
const submitBtnText = document.getElementById('submitBtnText');
const cancelBtn = document.getElementById('cancelBtn');

console.log('🚀 JavaScript file loaded successfully!');
console.log('📋 DOM elements found:', {
    form: !!form,
    modal: !!modal,
    itemsContainer: !!itemsContainer,
    photoPreview: !!photoPreview,
    itemPhotoInput: !!itemPhotoInput
});
console.log('📊 Current foodItems length:', foodItems.length);

// Comprehensive initial items for testing
const initialItems = [
    // Burgers
    { code: 'B1001', name: 'Classic Beef Burger (Large)', category: 'Burgers', price: 1200.00, discount: 0, quantity: 25, image: 'items/Classic Beef Burger (Large).jpg', expiryDate: null },
    { code: 'B1002', name: 'Classic Beef Burger (Regular)', category: 'Burgers', price: 850.00, discount: 15, quantity: 30, image: 'items/Classic Beef Burger (Regular).jpg', expiryDate: null },
    { code: 'B1003', name: 'Chicken Burger (Large)', category: 'Burgers', price: 1100.00, discount: 0, quantity: 20, image: 'items/Chicken Burger (Large).jpg', expiryDate: null },
    { code: 'B1004', name: 'Chicken Burger (Regular)', category: 'Burgers', price: 750.00, discount: 10, quantity: 35, image: 'items/Chicken Burger (Regular).jpg', expiryDate: null },
    { code: 'B1005', name: 'Veggie Burger', category: 'Burgers', price: 900.00, discount: 5, quantity: 15, image: 'items/Veggie Burger.png', expiryDate: null },

    // Submarines
    { code: 'S2001', name: 'Crispy Chicken Submarine (Large)', category: 'Submarines', price: 1500.00, discount: 0, quantity: 12, image: 'items/Crispy Chicken Submarine (Large).png', expiryDate: null },
    { code: 'S2002', name: 'Crispy Chicken Submarine (Regular)', category: 'Submarines', price: 1200.00, discount: 0, quantity: 18, image: 'items/Crispy Chicken Submarine (Regular).png', expiryDate: null },
    { code: 'S2003', name: 'BBQ Chicken Submarine', category: 'Submarines', price: 1400.00, discount: 0, quantity: 8, image: 'items/BBQ Chicken Submarine.png', expiryDate: null },

    // Fries
    { code: 'F3001', name: 'Steak Fries (Large)', category: 'Fries', price: 600.00, discount: 0, quantity: 45, image: 'items/Steak Fries (Large).png', expiryDate: null },
    { code: 'F3002', name: 'Steak Fries (Regular)', category: 'Fries', price: 450.00, discount: 0, quantity: 60, image: 'items/Steak Fries (Regular).png', expiryDate: null },
    { code: 'F3003', name: 'French Fries (Large)', category: 'Fries', price: 400.00, discount: 0, quantity: 55, image: 'items/French Fries (Large).png', expiryDate: null },
    { code: 'F3004', name: 'French Fries (Regular)', category: 'Fries', price: 300.00, discount: 0, quantity: 70, image: 'items/French Fries (Regular).png', expiryDate: null },
    { code: 'F3005', name: 'Sweet Potato Fries', category: 'Fries', price: 550.00, discount: 0, quantity: 25, image: 'items/Sweet Potato Chips.png', expiryDate: null },

    // Beverages
    { code: 'D4001', name: 'Coca-Cola (330ml)', category: 'Beverages', price: 150.00, discount: 0, quantity: 100, image: 'items/Coca-Cola (330ml).png', expiryDate: null },
    { code: 'D4002', name: 'Pepsi (330ml)', category: 'Beverages', price: 140.00, discount: 5, quantity: 90, image: 'items/Pepsi (330ml).png', expiryDate: null },
    { code: 'D4003', name: 'Sprite (330ml)', category: 'Beverages', price: 140.00, discount: 0, quantity: 85, image: 'items/Sprite (330ml).png', expiryDate: null },
    { code: 'D4004', name: 'Fanta (330ml)', category: 'Beverages', price: 140.00, discount: 0, quantity: 80, image: 'items/Fanta (330ml).png', expiryDate: null },
    { code: 'D4005', name: 'Fresh Orange Juice', category: 'Beverages', price: 250.00, discount: 0, quantity: 30, image: 'items/Fresh Orange Juice.png', expiryDate: null },

    // Chicken Items
    { code: 'C5001', name: 'Fried Chicken (4 Pieces)', category: 'Chicken', price: 1200.00, discount: 0, quantity: 15, image: 'items/Fried Chicken (4 Pieces).png', expiryDate: null },
    { code: 'C5002', name: 'Fried Chicken (8 Pieces)', category: 'Chicken', price: 2200.00, discount: 10, quantity: 8, image: 'items/Fried Chicken (8 Pieces).png', expiryDate: null },
    { code: 'C5003', name: 'Grilled Chicken Breast', category: 'Chicken', price: 800.00, discount: 0, quantity: 20, image: 'items/Grilled Chicken Breast.png', expiryDate: null },

    // Pasta
    { code: 'P6001', name: 'Creamy Alfredo Pasta', category: 'Pasta', price: 950.00, discount: 0, quantity: 12, image: 'items/Creamy Alfredo Pasta.png', expiryDate: null },
    { code: 'P6002', name: 'Spaghetti Bolognese', category: 'Pasta', price: 850.00, discount: 0, quantity: 18, image: 'items/Spaghetti Bolognese.png', expiryDate: null },
    { code: 'P6003', name: 'Penne Arrabbiata', category: 'Pasta', price: 750.00, discount: 0, quantity: 15, image: 'items/Penne Arrabbiata.png', expiryDate: null }
];

// Initialize food items with comprehensive data
if (foodItems.length === 0) {
    console.log('📭 No items in localStorage, initializing with sample data...');
    foodItems = [...initialItems];
    saveItems();
    console.log('✅ Initialized store with comprehensive item data:', foodItems.length, 'items');
} else {
    // Update existing items with new image paths if they exist in initialItems
    console.log('🔄 Checking for image path updates...');
    let updated = false;
    foodItems = foodItems.map(existingItem => {
        const matchingInitialItem = initialItems.find(initial => initial.code === existingItem.code);
        if (matchingInitialItem && existingItem.image !== matchingInitialItem.image) {
            console.log(`📸 Updating image for ${existingItem.name}: ${existingItem.image} → ${matchingInitialItem.image}`);
            updated = true;
            return { ...existingItem, image: matchingInitialItem.image };
        }
        return existingItem;
    });

    if (updated) {
        saveItems();
        console.log('✅ Updated existing items with new image paths');
    }
}

console.log('📦 Loaded existing items from localStorage:', foodItems.length, 'items');

// Manual functions for debugging (call from browser console)
window.resetStoreData = function() {
    localStorage.removeItem('foodItems');
    location.reload();
};

window.forceUpdateImages = function() {
    foodItems = foodItems.map(existingItem => {
        const matchingInitialItem = initialItems.find(initial => initial.code === existingItem.code);
        if (matchingInitialItem) {
            return { ...existingItem, image: matchingInitialItem.image };
        }
        return existingItem;
    });
    saveItems();
    location.reload();
};

// Save items to localStorage with timestamp
function saveItems() {
    const timestamp = Date.now();
    foodItems.forEach(item => {
        item.updatedAt = new Date().toISOString();
        item.lastUpdated = timestamp;
    });
    localStorage.setItem('foodItems', JSON.stringify(foodItems));
    localStorage.setItem('foodItemsLastUpdate', timestamp.toString());
}

// Check for low stock items
function checkLowStockItems() {
    const lowStockItems = foodItems.filter(item => item.quantity <= LOW_STOCK_THRESHOLD);
    const criticalStockItems = foodItems.filter(item => item.quantity <= CRITICAL_STOCK_THRESHOLD);

    if (criticalStockItems.length > 0) {
        const criticalNames = criticalStockItems.map(item => item.name).join(', ');
        showNotification(`⚠️ CRITICAL: The following items are critically low on stock: ${criticalNames}`, 'error', 6000);
    } else if (lowStockItems.length > 0) {
        const lowNames = lowStockItems.map(item => item.name).join(', ');
        console.warn(`⚠️ LOW STOCK ALERT: The following items need restocking: ${lowNames}`);
        // In a real app, you might show a notification badge or send an email
    }
}

// Enhanced render items grid with stock indicators
function renderItems(items = foodItems) {
    console.log('🎯 renderItems CALLED with', items.length, 'items');
    const grid = document.getElementById('itemsContainer');
    if (!grid) {
        console.error('❌ itemsContainer element not found!');
        return;
    }

    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = '<div class="no-items"><p>No items found. Add some items to get started!</p></div>';
        return;
    }

    console.log('✅ Rendering', items.length, 'items to the grid');

    items.forEach(item => {
        const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
        const discountPrice = item.discount > 0 ? item.price - (item.price * item.discount / 100) : null;

        const itemCard = document.createElement('div');
        itemCard.className = `item-card-premium enhanced-card ${isExpired ? 'expired' : ''}`;
        itemCard.innerHTML = `
            <div class="card-hero-section">
                <div class="card-image-wrapper">
                    <img src="${item.image}" alt="${item.name}" class="card-image">
                    <div class="image-gradient-overlay"></div>
                    <div class="status-badges">
                        ${getStockBadge(item.quantity)}
                        ${item.discount > 0 ? `<div class="status-badge discount">${item.discount}% OFF</div>` : ''}
                        ${isExpired ? '<div class="status-badge expired"><i class="fas fa-ban"></i> EXPIRED</div>' : ''}
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="editItem('${item.code}')" ${isExpired ? 'disabled' : ''} title="Edit Item">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn stock" onclick="updateStock('${item.code}')" title="Update Stock">
                            <i class="fas fa-boxes"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteItem('${item.code}')" ${isExpired ? 'disabled' : ''} title="Delete Item">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-price-banner">
                    <div class="price-content">
                        ${discountPrice ? `
                            <div class="current-price">LKR ${discountPrice.toFixed(2)}</div>
                            <div class="original-price">LKR ${item.price.toFixed(2)}</div>
                            <div class="discount-badge-main">${item.discount}% OFF</div>
                        ` : `
                            <div class="current-price">LKR ${item.price.toFixed(2)}</div>
                        `}
                    </div>
                </div>
            </div>

            <div class="card-details-section">
                <div class="item-primary-info">
                    <div class="item-title-section">
                        <h3 class="item-name">${item.name}</h3>
                        <div class="item-meta">
                            <span class="item-code">${item.code}</span>
                            <span class="item-category">${item.category}</span>
                        </div>
                    </div>
                </div>

                <div class="item-metrics-grid">
                    <div class="metric-card stock-metric">
                        <div class="metric-icon">
                            <i class="fas fa-boxes"></i>
                        </div>
                        <div class="metric-data">
                            <div class="metric-value">${item.quantity}</div>
                            <div class="metric-label">In Stock</div>
                        </div>
                    </div>
                    <div class="metric-card rating-metric">
                        <div class="metric-icon">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="metric-data">
                            <div class="metric-value">4.5</div>
                            <div class="metric-label">Rating</div>
                        </div>
                    </div>
                </div>

                ${item.expiryDate ? `
                    <div class="expiry-alert ${isExpired ? 'expired' : ''}">
                        <div class="alert-icon">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="alert-content">
                            <div class="alert-title">Expiry Date</div>
                            <div class="alert-value">${new Date(item.expiryDate).toLocaleDateString()}</div>
                        </div>
                        ${isExpired ? '<div class="expired-badge">EXPIRED</div>' : ''}
                    </div>
                ` : ''}

                ${isExpired ? `
                    <div class="critical-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>This item has expired and cannot be edited or deleted</span>
                    </div>
                ` : ''}
            </div>
        `;

        grid.appendChild(itemCard);
    });

    console.log('SUCCESS: Items rendered! Count:', items.length);
}

// Helper functions for stock indicators
function getStockBadge(quantity) {
    if (quantity <= 0) return '<div class="status-badge out-of-stock"><i class="fas fa-times-circle"></i> OUT OF STOCK</div>';
    if (quantity <= CRITICAL_STOCK_THRESHOLD) return '<div class="status-badge low-stock"><i class="fas fa-exclamation-triangle"></i> LOW STOCK</div>';
    return '<div class="status-badge in-stock"><i class="fas fa-check-circle"></i> IN STOCK</div>';
}

function getStockClass(quantity) {
    if (quantity <= 0) return 'out-of-stock';
    if (quantity <= CRITICAL_STOCK_THRESHOLD) return 'low-stock';
    return 'in-stock';
}

function getStockIcon(quantity) {
    if (quantity <= CRITICAL_STOCK_THRESHOLD) return 'fa-exclamation-triangle';
    if (quantity <= LOW_STOCK_THRESHOLD) return 'fa-exclamation-circle';
    return 'fa-check-circle';
}

function getStockText(quantity) {
    if (quantity <= CRITICAL_STOCK_THRESHOLD) return 'Critical';
    if (quantity <= LOW_STOCK_THRESHOLD) return 'Low Stock';
    return 'In Stock';
}

// Update stock for an item
function updateStock(code) {
    const item = foodItems.find(item => item.code === code);
    if (!item) return;

    // Create custom stock update dialog
    const stockDialog = document.createElement('div');
    stockDialog.className = 'confirm-dialog-overlay';
    stockDialog.innerHTML = `
        <div class="confirm-dialog stock-update-dialog">
            <div class="confirm-header">
                <div class="confirm-icon stock-icon">
                    <i class="fas fa-boxes"></i>
                </div>
                <h3>Update Stock</h3>
            </div>
            <div class="confirm-body">
                <div class="stock-item-info">
                    <div class="stock-item-name">${item.name}</div>
                    <div class="stock-item-code">Code: ${item.code}</div>
                    <div class="current-stock-display">
                        <span class="current-stock-label">Current Stock:</span>
                        <span class="current-stock-value">${item.quantity} units</span>
                    </div>
                </div>
                <div class="stock-input-section">
                    <label for="newStockQuantity">New Stock Quantity:</label>
                    <input type="number" id="newStockQuantity" min="0" value="${item.quantity}" class="stock-input">
                    <small class="form-hint">Enter 0 or greater for stock quantity</small>
                </div>
            </div>
            <div class="confirm-actions">
                <button class="btn btn-secondary" id="cancelStockUpdate">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="btn btn-primary" id="confirmStockUpdate">
                    <i class="fas fa-save"></i> Update Stock
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(stockDialog);

    // Focus on input field
    setTimeout(() => {
        document.getElementById('newStockQuantity').focus();
        document.getElementById('newStockQuantity').select();
    }, 100);

    // Add event listeners
    document.getElementById('cancelStockUpdate').addEventListener('click', () => {
        document.body.removeChild(stockDialog);
    });

    document.getElementById('confirmStockUpdate').addEventListener('click', () => {
        const newQuantity = document.getElementById('newStockQuantity').value;
        const quantity = parseInt(newQuantity);

        if (isNaN(quantity) || quantity < 0) {
            alert('Please enter a valid quantity (0 or greater)');
            return;
        }

        // Update the item quantity
        item.quantity = quantity;

        // Update the current stock display in the modal
        const currentStockValue = stockDialog.querySelector('.current-stock-value');
        if (currentStockValue) {
            currentStockValue.textContent = `${quantity} units`;
        }

        // Save changes and update UI
        saveItems();
        renderItems();
        checkLowStockItems();
        updateStats();

        // Show success notification with stock level feedback
        let stockMessage = `Stock updated for ${item.name}. New quantity: ${quantity}`;
        let notificationType = 'success';

        if (quantity <= CRITICAL_STOCK_THRESHOLD && quantity > 0) {
            stockMessage += ' ⚠️ This item is now critically low!';
            notificationType = 'warning';
        } else if (quantity <= LOW_STOCK_THRESHOLD && quantity > CRITICAL_STOCK_THRESHOLD) {
            stockMessage += ' 📉 This item is running low.';
            notificationType = 'warning';
        } else if (quantity <= 0) {
            stockMessage += ' 🚫 This item is now out of stock!';
            notificationType = 'error';
        }

        showNotification(stockMessage, notificationType);

        // Close modal after a brief delay to show the updated value
        setTimeout(() => {
            document.body.removeChild(stockDialog);
        }, 800);
    });

    // Handle Enter key
    document.getElementById('newStockQuantity').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('confirmStockUpdate').click();
        }
    });

    // Close on overlay click
    stockDialog.addEventListener('click', (e) => {
        if (e.target === stockDialog) {
            document.body.removeChild(stockDialog);
        }
    });

    // Close on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(stockDialog);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Photo upload functionality
let selectedPhotoFile = null;

function initializePhotoUpload() {
    // Photo preview click handler
    photoPreview.addEventListener('click', () => {
        itemPhotoInput.click();
    });

    // File input change handler
    itemPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file.');
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                alert('Please select an image smaller than 5MB.');
                return;
            }

            selectedPhotoFile = file;

            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Enhanced form reset function
function resetForm() {
    form.reset();
    selectedPhotoFile = null;
    editingItemCode = null;
    photoPreview.innerHTML = `
        <i class="fas fa-camera"></i>
        <span>Click to upload photo</span>
    `;
    modalTitle.textContent = 'Add New Item';
    modalIcon.className = 'fas fa-plus';
    submitBtnText.textContent = 'Save Item';
}

// Enhanced modal controls
function openModal(forEditing = false) {
    if (forEditing) {
        modalTitle.textContent = 'Edit Item';
        modalIcon.className = 'fas fa-edit';
        submitBtnText.textContent = 'Update Item';
    } else {
        modalTitle.textContent = 'Add New Item';
        modalIcon.className = 'fas fa-plus';
        submitBtnText.textContent = 'Save Item';
    }
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
    resetForm();
}

// Event listeners
cancelBtn.addEventListener('click', closeModal);

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});

// Enhanced form submission with validation
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    let image = `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop`; // default

    // Handle photo upload
    if (selectedPhotoFile) {
        // Convert file to base64 for storage
        image = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(selectedPhotoFile);
        });
    } else if (editingItemCode) {
        // Keep existing image if editing and no new photo selected
        const existing = foodItems.find(item => item.code === editingItemCode);
        if (existing && existing.image) {
            image = existing.image;
        }
    }

    const itemData = {
        code: formData.get('itemCode').toUpperCase(),
        name: formData.get('itemName'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        discount: parseInt(formData.get('discount')) || 0,
        quantity: parseInt(formData.get('quantity')),
        expiryDate: formData.get('expiryDate') || null,
        image: image,
        updatedAt: new Date().toISOString()
    };

    // Validation
    if (!itemData.name || !itemData.code || !itemData.category || itemData.price <= 0) {
        showNotification('Please fill in all required fields with valid values', 'error');
        return;
    }

    if (editingItemCode) {
        // Update existing item
        const index = foodItems.findIndex(item => item.code === editingItemCode);
        if (index !== -1) {
            foodItems[index] = { ...foodItems[index], ...itemData };
        }
    } else {
        // Add new item
        if (foodItems.find(item => item.code === itemData.code)) {
            showNotification('Item code already exists! Please use a unique code.', 'error');
            return;
        }
        foodItems.push(itemData);
    }

    saveItems();
    renderItems();
    filterItems();
    checkLowStockItems();
    updateStats();
    closeModal();

    // Show success notification
    const action = editingItemCode ? 'updated' : 'added';
    showNotification(`Item "${itemData.name}" has been successfully ${action}!`, 'success');
});

// Filter items with stock indicators
function filterItems() {
    const category = document.getElementById('categoryFilter').value;
    const stockFilter = document.getElementById('stockFilter').value;
    const search = document.getElementById('searchInput').value.toLowerCase();

    let filtered = foodItems;

    if (category) {
        filtered = filtered.filter(item => item.category === category);
    }

    if (stockFilter) {
        filtered = filtered.filter(item => {
            switch(stockFilter) {
                case 'good':
                    return item.quantity > 0; // In stock
                case 'low':
                    return item.quantity <= LOW_STOCK_THRESHOLD && item.quantity > CRITICAL_STOCK_THRESHOLD;
                case 'critical':
                    return item.quantity <= CRITICAL_STOCK_THRESHOLD;
                default:
                    return true;
            }
        });
    }

    if (search) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(search) ||
            item.code.toLowerCase().includes(search) ||
            item.category.toLowerCase().includes(search)
        );
    }

    renderItems(filtered);
    updateStats();
}

// Update statistics display
function updateStats() {
    const totalItems = foodItems.length;
    const inStock = foodItems.filter(item => item.quantity > 0).length;
    const lowStock = foodItems.filter(item => item.quantity <= LOW_STOCK_THRESHOLD && item.quantity > CRITICAL_STOCK_THRESHOLD).length;
    const outOfStock = foodItems.filter(item => item.quantity <= CRITICAL_STOCK_THRESHOLD).length;

    // Update main stats cards
    document.getElementById('totalItemsCount').textContent = totalItems;
    document.getElementById('inStockCount').textContent = inStock;
    document.getElementById('lowStockCount').textContent = lowStock;
    document.getElementById('outOfStockCount').textContent = outOfStock;

    // Update header stats
    const headerTotalItems = document.getElementById('headerTotalItems');
    const headerInStock = document.getElementById('headerInStock');
    const headerLowStock = document.getElementById('headerLowStock');

    if (headerTotalItems) headerTotalItems.textContent = totalItems;
    if (headerInStock) headerInStock.textContent = inStock;
    if (headerLowStock) headerLowStock.textContent = lowStock;

    console.log('📊 Stats updated:', { totalItems, inStock, lowStock, outOfStock });
}

// Check for expired items on load
function checkExpiredItems() {
    const expiredItems = foodItems.filter(item =>
        item.expiryDate && new Date(item.expiryDate) < new Date()
    );

    if (expiredItems.length > 0) {
        const itemNames = expiredItems.map(item => item.name).join(', ');
        if (confirm(`The following items have expired: ${itemNames}. Would you like to remove them?`)) {
            expiredItems.forEach(item => deleteItem(item.code));
        }
    }
}

// Initialize with enhanced features - CONSOLIDATED INITIALIZATION
console.log('🚀 JavaScript loaded, initializing...');

// Single, robust initialization logic
function initializeFoodItems() {
    try {
        const storedItems = localStorage.getItem('foodItems');
        if (storedItems) {
            const parsedItems = JSON.parse(storedItems);
            // Validate that we have a reasonable number of items (at least 20 for full dataset)
            if (Array.isArray(parsedItems) && parsedItems.length >= 20) {
                foodItems = parsedItems;
                console.log('✅ Loaded', foodItems.length, 'items from localStorage');
                return;
            } else {
                console.warn('⚠️ localStorage has incomplete data (', parsedItems?.length || 0, 'items), falling back to full dataset');
            }
        }
    } catch (error) {
        console.error('❌ Error loading from localStorage:', error);
    }

    // Fallback to complete initial dataset
    console.log('📭 Initializing with complete', initialItems.length, 'item dataset');
    foodItems = [...initialItems];
    saveItems();
}

// Initialize once
initializeFoodItems();

// Update stats immediately after initialization
updateStats();

// Show loading indicator
function showLoading() {
    document.getElementById('loadingContainer').style.display = 'flex';
    document.getElementById('itemsContainer').style.display = 'none';
}

// Hide loading indicator
function hideLoading() {
    document.getElementById('loadingContainer').style.display = 'none';
    document.getElementById('itemsContainer').style.display = 'grid';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, ensuring store management is initialized...');
    console.log('📊 Final foodItems count:', foodItems.length);

    // Initialize photo upload functionality
    initializePhotoUpload();

    // Initialize filter event listeners
    document.getElementById('categoryFilter').addEventListener('change', filterItems);
    document.getElementById('stockFilter').addEventListener('change', filterItems);
    document.getElementById('searchInput').addEventListener('input', debounce(filterItems, 300));

    // Initialize view toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const view = this.dataset.view;
            document.getElementById('itemsContainer').className = `items-container ${view}-view`;
        });
    });

    renderItems();
    checkExpiredItems();
    checkLowStockItems();
    updateStats();
    hideLoading();
});

// Also try to initialize immediately in case DOMContentLoaded already fired
if (document.readyState !== 'loading') {
    console.log('DOM already loaded, initializing store management immediately...');

    // Initialize photo upload functionality
    initializePhotoUpload();

    // Initialize filter event listeners
    document.getElementById('categoryFilter').addEventListener('change', filterItems);
    document.getElementById('stockFilter').addEventListener('change', filterItems);
    document.getElementById('searchInput').addEventListener('input', debounce(filterItems, 300));

    // Initialize view toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const view = this.dataset.view;
            document.getElementById('itemsContainer').className = `items-container ${view}-view`;
        });
    });

    renderItems();
    checkExpiredItems();
    checkLowStockItems();
    updateStats();
    hideLoading();
}

// Edit item function
// Enhanced delete item with custom confirmation dialog
function deleteItem(code) {
    const item = foodItems.find(item => item.code === code);
    if (!item) return;

    // Create custom confirmation dialog
    const confirmDialog = document.createElement('div');
    confirmDialog.className = 'confirm-dialog-overlay';
    confirmDialog.innerHTML = `
        <div class="confirm-dialog">
            <div class="confirm-header">
                <div class="confirm-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Delete Item</h3>
            </div>
            <div class="confirm-body">
                <p>Are you sure you want to delete <strong>"${item.name}"</strong>?</p>
                ${item.quantity > 0 ? `<p class="warning-text"><i class="fas fa-exclamation-circle"></i> This item has ${item.quantity} units in stock.</p>` : ''}
                <p class="confirm-note">This action cannot be undone.</p>
            </div>
            <div class="confirm-actions">
                <button class="btn btn-secondary" id="cancelDelete">
                    <i class="fas fa-times"></i> Cancel
                </button>
                <button class="btn btn-danger" id="confirmDelete">
                    <i class="fas fa-trash"></i> Delete Item
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(confirmDialog);

    // Add event listeners
    document.getElementById('cancelDelete').addEventListener('click', () => {
        document.body.removeChild(confirmDialog);
    });

    document.getElementById('confirmDelete').addEventListener('click', () => {
        foodItems = foodItems.filter(item => item.code !== code);
        saveItems();
        renderItems();
        filterItems();
        document.body.removeChild(confirmDialog);
    });

    // Close on overlay click
    confirmDialog.addEventListener('click', (e) => {
        if (e.target === confirmDialog) {
            document.body.removeChild(confirmDialog);
        }
    });

    // Close on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            document.body.removeChild(confirmDialog);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function viewItem(code) {
    const item = foodItems.find(item => item.code === code);
    if (!item) return;

    // Create a simple view modal
    const viewModal = document.createElement('div');
    viewModal.className = 'confirm-dialog-overlay';
    viewModal.innerHTML = `
        <div class="confirm-dialog view-item-dialog">
            <div class="confirm-header">
                <div class="confirm-icon view-icon">
                    <i class="fas fa-eye"></i>
                </div>
                <h3>Item Details</h3>
            </div>
            <div class="confirm-body">
                <div class="item-details-view">
                    <div class="detail-row">
                        <strong>Name:</strong> ${item.name}
                    </div>
                    <div class="detail-row">
                        <strong>Code:</strong> ${item.code}
                    </div>
                    <div class="detail-row">
                        <strong>Category:</strong> ${item.category}
                    </div>
                    <div class="detail-row">
                        <strong>Price:</strong> LKR ${item.price.toFixed(2)}
                    </div>
                    <div class="detail-row">
                        <strong>Discount:</strong> ${item.discount}%
                    </div>
                    <div class="detail-row">
                        <strong>Stock:</strong> ${item.quantity} units
                    </div>
                    ${item.expiryDate ? `<div class="detail-row">
                        <strong>Expiry Date:</strong> ${new Date(item.expiryDate).toLocaleDateString()}
                    </div>` : ''}
                </div>
            </div>
            <div class="confirm-actions">
                <button class="btn-secondary" onclick="this.closest('.confirm-dialog-overlay').remove()">Close</button>
                <button class="btn-primary" onclick="editItem('${item.code}'); this.closest('.confirm-dialog-overlay').remove()">Edit</button>
            </div>
        </div>
    `;

    document.body.appendChild(viewModal);
}

function editItem(code) {
    const item = foodItems.find(item => item.code === code);
    if (!item) return;

    editingItemCode = code;

    // Populate form with item data
    document.getElementById('itemCode').value = item.code;
    document.getElementById('itemName').value = item.name;
    document.getElementById('category').value = item.category;
    document.getElementById('price').value = item.price;
    document.getElementById('discount').value = item.discount;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('expiryDate').value = item.expiryDate || '';

    // Show current photo if exists
    if (item.image) {
        photoPreview.innerHTML = `<img src="${item.image}" alt="Current photo">`;
    } else {
        photoPreview.innerHTML = `
            <i class="fas fa-camera"></i>
            <span>Click to upload photo</span>
        `;
    }

    // Reset selected file since we're editing
    selectedPhotoFile = null;

    // Open modal for editing
    openModal(true);
}

// Add event listener for Add Item button
document.getElementById('addItemBtn').addEventListener('click', () => {
    editingItemCode = null;
    openModal(false);
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, ensuring store management is initialized...');
    console.log('📊 Final foodItems count:', foodItems.length);
    initializePhotoUpload();
    renderItems();
    checkExpiredItems();
    checkLowStockItems();
    updateStats();
    hideLoading();

    // Add export button functionality
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportStoreData);
    }
});
document.querySelector('.close').addEventListener('click', () => {
    modal.style.display = 'none';
    editingItemCode = null;
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        editingItemCode = null;
    }
});

// Cancel button
document.getElementById('cancelBtn').addEventListener('click', () => {
    modal.style.display = 'none';
    editingItemCode = null;
});

// Manual test function - call this from browser console or button
window.testStoreRendering = function() {
    console.log('🧪 MANUAL TEST: Testing store items rendering...');
    console.log('foodItems:', foodItems);
    console.log('foodItems length:', foodItems.length);
    
    if (foodItems.length === 0) {
        console.log('No food items found, initializing sample data...');
        foodItems = [...initialItems];
        saveItems();
    }
    
    console.log('Calling renderItems with all items...');
    renderItems(foodItems);
    console.log('Test completed!');
};

// Force reset function - clears localStorage and reloads sample data
window.resetStoreData = function() {
    console.log('🔄 FORCE RESET: Clearing localStorage and reloading sample data...');
    localStorage.removeItem('foodItems');
    localStorage.removeItem('foodItemsLastUpdate');
    foodItems = [...initialItems];
    saveItems();
    console.log('✅ Reset complete! Reloading items...');
    renderItems(foodItems);
    updateStats();
    console.log('Reset completed successfully!');
    showNotification('Store data has been reset! Sample items loaded.', 'success');
};

// Inspect localStorage data
window.inspectLocalStorage = function() {
    console.log('� INSPECTING LOCALSTORAGE:');
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('foodItems raw:', localStorage.getItem('foodItems'));
    console.log('foodItemsLastUpdate:', localStorage.getItem('foodItemsLastUpdate'));
    console.log('isLoggedIn:', localStorage.getItem('isLoggedIn'));
    
    try {
        const parsed = JSON.parse(localStorage.getItem('foodItems') || '[]');
        console.log('foodItems parsed successfully:', parsed.length, 'items');
        alert(`localStorage inspection complete!\nItems in storage: ${parsed.length}\nCheck console for details.`);
    } catch (error) {
        console.error('Error parsing localStorage:', error);
        alert('Error parsing localStorage data! Check console.');
    }
};

// Export functionality for store management
function exportStoreData() {
    try {
        const foodItems = JSON.parse(localStorage.getItem('foodItems')) || [];

        // Create CSV content
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'MOS Burgers - Store Management Data Export\n';
        csvContent += 'Export Date:,' + new Date().toLocaleString() + '\n\n';

        // Food Items section
        csvContent += 'FOOD ITEMS INVENTORY\n';
        csvContent += 'Code,Name,Category,Price (LKR),Discount (%),Discounted Price (LKR),Quantity,Stock Status,Expiry Date,Last Updated\n';

        foodItems.forEach(item => {
            const discountedPrice = item.discount > 0 ? item.price - (item.price * item.discount / 100) : item.price;
            const stockStatus = item.quantity <= 0 ? 'Out of Stock' :
                              item.quantity <= 5 ? 'Critical Stock' :
                              item.quantity <= 10 ? 'Low Stock' : 'In Stock';
            const expiryDate = item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'No Expiry';
            const lastUpdated = item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'Not Available';

            csvContent += `"${item.code}","${item.name}","${item.category}",${item.price.toFixed(2)},${item.discount},${discountedPrice.toFixed(2)},${item.quantity},"${stockStatus}","${expiryDate}","${lastUpdated}"\n`;
        });
        csvContent += '\n';

        // Summary statistics
        const totalItems = foodItems.length;
        const inStock = foodItems.filter(item => item.quantity > 0).length;
        const lowStock = foodItems.filter(item => item.quantity > 0 && item.quantity <= 10).length;
        const criticalStock = foodItems.filter(item => item.quantity > 0 && item.quantity <= 5).length;
        const outOfStock = foodItems.filter(item => item.quantity <= 0).length;
        const totalValue = foodItems.reduce((sum, item) => {
            const price = item.discount > 0 ? item.price - (item.price * item.discount / 100) : item.price;
            return sum + (price * item.quantity);
        }, 0);
        const categories = [...new Set(foodItems.map(item => item.category))];

        csvContent += 'STORE INVENTORY SUMMARY\n';
        csvContent += `Total Items:,${totalItems}\n`;
        csvContent += `Categories:,${categories.length} (${categories.join(', ')})\n`;
        csvContent += `In Stock Items:,${inStock}\n`;
        csvContent += `Low Stock Items (6-10):,${lowStock}\n`;
        csvContent += `Critical Stock Items (1-5):,${criticalStock}\n`;
        csvContent += `Out of Stock Items:,${outOfStock}\n`;
        csvContent += `Total Inventory Value:,LKR ${totalValue.toFixed(2)}\n`;

        // Category breakdown
        csvContent += '\nCATEGORY BREAKDOWN\n';
        csvContent += 'Category,Total Items,In Stock,Low Stock,Critical Stock,Out of Stock,Category Value (LKR)\n';
        categories.forEach(category => {
            const categoryItems = foodItems.filter(item => item.category === category);
            const catInStock = categoryItems.filter(item => item.quantity > 0).length;
            const catLowStock = categoryItems.filter(item => item.quantity > 0 && item.quantity <= 10).length;
            const catCriticalStock = categoryItems.filter(item => item.quantity > 0 && item.quantity <= 5).length;
            const catOutOfStock = categoryItems.filter(item => item.quantity <= 0).length;
            const catValue = categoryItems.reduce((sum, item) => {
                const price = item.discount > 0 ? item.price - (item.price * item.discount / 100) : item.price;
                return sum + (price * item.quantity);
            }, 0);

            csvContent += `"${category}",${categoryItems.length},${catInStock},${catLowStock},${catCriticalStock},${catOutOfStock},${catValue.toFixed(2)}\n`;
        });

        // Create and download the file
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `mos-burgers-store-inventory-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification('Store inventory data exported successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export store data. Please try again.', 'error');
    }
}
