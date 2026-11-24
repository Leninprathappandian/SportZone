// Default fallback sports inventory
const sampleProducts = [
    {
        id: 1,
        name: 'Pro Match Soccer Ball',
        category: 'Soccer',
        price: 29.99,
        description: 'FIFA Quality Pro match ball with thermal bonding technology.',
        image_url: 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=500&auto=format&fit=crop&q=60',
        rating: 4.8
    },
    {
        id: 2,
        name: 'Elite Grip Basketball',
        category: 'Basketball',
        price: 34.99,
        description: 'High-tack composite leather designed for both indoor and outdoor courts.',
        image_url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=500&auto=format&fit=crop&q=60',
        rating: 4.7
    },
    {
        id: 3,
        name: 'Pro Carbon Tennis Racket',
        category: 'Tennis',
        price: 89.99,
        description: 'Lightweight carbon graphite frame for power, spin, and precision control.',
        image_url: 'https://images.unsplash.com/photo-1617083934555-563d60a169b2?w=500&auto=format&fit=crop&q=60',
        rating: 4.9
    },
    {
        id: 4,
        name: 'Velocity Pro Running Shoes',
        category: 'Running',
        price: 79.99,
        description: 'Breathable engineered mesh upper with responsive energy-return foam cushioning.',
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
        rating: 4.6
    },
    {
        id: 5,
        name: 'HyperFlex Hex Dumbbells (Pair)',
        category: 'Fitness',
        price: 49.99,
        description: 'Solid cast iron with anti-roll hexagonal rubber casing and knurled chrome handles.',
        image_url: 'https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=500&auto=format&fit=crop&q=60',
        rating: 4.8
    },
    {
        id: 6,
        name: 'Waterproof Sport Duffle Bag',
        category: 'Accessories',
        price: 39.99,
        description: 'Rugged 45L duffle featuring a separate ventilated shoe pocket and wet compartment.',
        image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
        rating: 4.5
    }
];

let products = [];
let currentCategory = 'All';
let cart = JSON.parse(localStorage.getItem('sportzone_cart')) || [];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryPills = document.querySelectorAll('.pill');
const cartBtn = document.getElementById('cartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartCount = document.getElementById('cartCount');
const cartItemCount = document.getElementById('cartItemCount');
const cartSubtotal = document.getElementById('cartSubtotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const toastNotification = document.getElementById('toastNotification');

// Fetch Products from API (with fallback)
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            products = await response.json();
        } else {
            products = sampleProducts;
        }
    } catch (err) {
        // Fallback to sample catalog if running without backend connected
        products = sampleProducts;
    }
    renderProducts();
    updateCartUI();
}

// Render Products
function renderProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filtered = products.filter(p => {
        const matchCategory = currentCategory === 'All' || p.category.toLowerCase() === currentCategory.toLowerCase();
        const matchSearch = p.name.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm);
        return matchCategory && matchSearch;
    });

    if (filtered.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #64748b;">
                <h3>No equipment found matching "${searchInput.value}"</h3>
                <p>Try searching another sport or category.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filtered.map(p => `
        <div class="product-card">
            <div class="product-img-wrapper">
                <img src="${p.image_url}" alt="${p.name}" loading="lazy">
                <span class="category-tag">${p.category}</span>
            </div>
            <div class="product-info">
                <div class="rating-row">
                    <span>★</span>
                    <span>${p.rating || '4.8'}</span>
                </div>
                <h3 class="product-title">${p.name}</h3>
                <p class="product-desc">${p.description}</p>
                <div class="product-bottom">
                    <span class="price">$${parseFloat(p.price).toFixed(2)}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${p.id})">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add Item to Cart
window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    showToast(`Added ${product.name} to cart!`);
};

// Remove or adjust quantity
window.changeQuantity = function(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    saveCart();
    updateCartUI();
};

function saveCart() {
    localStorage.setItem('sportzone_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    cartCount.textContent = totalCount;
    cartItemCount.textContent = totalCount;
    cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is currently empty.</p>';
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image_url}" alt="${item.name}">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showToast(message) {
    toastNotification.textContent = message;
    toastNotification.classList.add('show');
    setTimeout(() => {
        toastNotification.classList.remove('show');
    }, 2000);
}

// Drawer Controls
cartBtn.addEventListener('click', () => {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
});

closeCartBtn.addEventListener('click', () => {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
});

cartOverlay.addEventListener('click', () => {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
});

// Category Filter Click
categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
        categoryPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategory = pill.dataset.category;
        renderProducts();
    });
});

// Search input
searchInput.addEventListener('input', renderProducts);
searchBtn.addEventListener('click', renderProducts);

// Checkout simulation
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty! Add gear before checking out.');
        return;
    }
    alert('Thank you for choosing SportZone! Your athletic order has been processed successfully.');
    cart = [];
    saveCart();
    updateCartUI();
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
});

// Init
fetchProducts();
