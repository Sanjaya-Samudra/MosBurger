
// Check authentication
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
}

// Initial food items data
const initialItems = [
    // Burgers
    { code: 'B1001', name: 'Classic Burger (Large)', category: 'Burgers', price: 750.00, discount: 0, quantity: 25, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop' },
    { code: 'B1002', name: 'Classic Burger (Regular)', category: 'Burgers', price: 1500.00, discount: 15, quantity: 30, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=200&fit=crop' },
    { code: 'B1005', name: 'Chicken Burger (Regular)', category: 'Burgers', price: 800.00, discount: 20, quantity: 40, image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=300&h=200&fit=crop' },

    // Submarines
    { code: 'B1016', name: 'Crispy Chicken Submarine (Large)', category: 'Submarines', price: 2000.00, discount: 0, quantity: 15, image: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=300&h=200&fit=crop' },
    { code: 'B1017', name: 'Crispy Chicken Submarine (Regular)', category: 'Submarines', price: 1500.00, discount: 0, quantity: 20, image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=300&h=200&fit=crop' },

    // Fries
    { code: 'B1025', name: 'Steak Fries (Large)', category: 'Fries', price: 1200.00, discount: 0, quantity: 50, image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=300&h=200&fit=crop' },
    { code: 'B1027', name: 'French Fries (Large)', category: 'Fries', price: 800.00, discount: 0, quantity: 60, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop' },

    // Beverages
    { code: 'B1044', name: 'Pepsi (330ml)', category: 'Beverages', price: 990.00, discount: 5, quantity: 100, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVwc2l8ZW58MHx8MHx8fDA%3D' },
    { code: 'B1045', name: 'Coca-Cola (330ml)', category: 'Beverages', price: 1230.00, discount: 0, quantity: 80, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=300&h=200&fit=crop' }
];

// Load items from localStorage or use initial data
let foodItems = initialItems;

// Save items to localStorage
function saveItems() {
    localStorage.setItem('foodItems', JSON.stringify(foodItems));
}

// Render items grid
function renderItems(items = foodItems) {
    const grid = document.getElementById('itemsGrid');
    grid.innerHTML = '';

    items.forEach(item => {
        const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
        const discountPrice = item.discount > 0 ? item.price - (item.price * item.discount / 100) : null;

        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="item-image">
            <div class="item-content">
                ${isExpired ? '<div class="expiry-warning"><i class="fas fa-exclamation-triangle"></i> Item Expired!</div>' : ''}
                <div class="item-header">
                    <div>
                        <h3 class="item-name">${item.name}</h3>
                        <span class="item-code">${item.code}</span>
                    </div>
                    ${item.discount > 0 ? `<span class="discount-badge">${item.discount}% OFF</span>` : ''}
                </div>
                <div class="item-price">
                    ${discountPrice ? `<span style="text-decoration: line-through; color: #999; font-size: 0.9rem;">LKR ${item.price.toFixed(2)}</span><br>` : ''}
                    LKR ${discountPrice ? discountPrice.toFixed(2) : item.price.toFixed(2)}
                </div>
                <div class="item-details">
                    <span>Qty: ${item.quantity}</span>
                    <span>${item.category}</span>
                </div>
                ${item.expiryDate ? `<div class="item-details"><small>Expires: ${new Date(item.expiryDate).toLocaleDateString()}</small></div>` : ''}
                <div class="item-actions">
                    <button class="btn btn-primary btn-small" onclick="editItem('${item.code}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-small" onclick="deleteItem('${item.code}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;

        grid.appendChild(itemCard);
    });
}

// Filter items
function filterItems() {
    const category = document.getElementById('categoryFilter').value;
    const search = document.getElementById('searchInput').value.toLowerCase();

    let filtered = foodItems;

    if (category) {
        filtered = filtered.filter(item => item.category === category);
    }

    if (search) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(search) ||
            item.code.toLowerCase().includes(search)
        );
    }

    renderItems(filtered);
}

// Modal management
const modal = document.getElementById('itemModal');
const addBtn = document.getElementById('addItemBtn');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const form = document.getElementById('itemForm');

let editingItemCode = null;

addBtn.addEventListener('click', () => {
    editingItemCode = null;
    document.getElementById('modalTitle').textContent = 'Add New Item';
    form.reset();
    modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Edit item
function editItem(code) {
    const item = foodItems.find(item => item.code === code);
    if (!item) return;

    editingItemCode = code;
    document.getElementById('modalTitle').textContent = 'Edit Item';

    document.getElementById('itemCode').value = item.code;
    document.getElementById('itemName').value = item.name;
    document.getElementById('category').value = item.category;
    document.getElementById('price').value = item.price;
    document.getElementById('discount').value = item.discount;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('expiryDate').value = item.expiryDate || '';

    modal.style.display = 'block';
}

// Delete item
function deleteItem(code) {
    if (confirm('Are you sure you want to delete this item?')) {
        foodItems = foodItems.filter(item => item.code !== code);
        saveItems();
        renderItems();
        filterItems();
    }
}

// Form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    let image = `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop`; // default
    if (editingItemCode) {
        const existing = foodItems.find(item => item.code === editingItemCode);
        if (existing && existing.image) {
            image = existing.image;
        }
    }

    const itemData = {
        code: formData.get('itemCode'),
        name: formData.get('itemName'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        discount: parseInt(formData.get('discount')) || 0,
        quantity: parseInt(formData.get('quantity')),
        expiryDate: formData.get('expiryDate') || null,
        image: image
    };


    if (editingItemCode) {
        // Update existing item
        const index = foodItems.findIndex(item => item.code === editingItemCode);
        if (index && index.image) {
            image = index.image;
        }
        if (index !== -1) {
            foodItems[index] = { ...foodItems[index], ...itemData };
        }
    } else {
        // Add new item
        if (foodItems.find(item => item.code === itemData.code)) {
            alert('Item code already exists!');
            return;
        }
        foodItems.push(itemData);
    }

    saveItems();
    renderItems();
    filterItems();
    modal.style.display = 'none';
});

// Event listeners for filters
document.getElementById('categoryFilter').addEventListener('change', filterItems);
document.getElementById('searchInput').addEventListener('input', filterItems);

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

// Initialize
renderItems();
checkExpiredItems();

// Save initial data if not exists
if (!localStorage.getItem('foodItems')) {
    saveItems();
}
