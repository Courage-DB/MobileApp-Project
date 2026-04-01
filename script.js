// Sample Data
const products = [
    { id: 1, name: "Premium Wireless Headphones", price: 199.99, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { id: 2, name: "Smart Watch Series 7", price: 349.00, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
    { id: 3, name: "Minimalist Leather Backpack", price: 85.50, img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400" },
    { id: 4, name: "Mechanical Gaming Keyboard", price: 120.00, img: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400" },
    { id: 5, name: "Smart Home Speaker", price: 129.99, img: "https://images.unsplash.com/photo-1517059224940-d4af9eec41e6?w=400" },
    { id: 6, name: "Fitness Tracker Band", price: 59.99, img: "https://images.unsplash.com/photo-1519861530846-3a5db68e885e?w=400" },
    { id: 7, name: "Portable Projector", price: 229.00, img: "https://images.unsplash.com/photo-1515012872431-4dd12978f46d?w=400" },
    { id: 8, name: "Eco Travel Mug", price: 24.99, img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" },
    { id: 9, name: "Wireless Charger Pad", price: 39.99, img: "https://images.unsplash.com/photo-1510557880182-3a935f08b4fd?w=400" },
    { id: 10, name: "Noise-Cancelling Earbuds", price: 149.99, img: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400" },
    { id: 11, name: "4K Action Camera", price: 279.00, img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=400" },
    { id: 12, name: "Bluetooth Laptop Stand", price: 69.99, img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400" },
    { id: 13, name: "Portable Espresso Machine", price: 189.00, img: "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?w=400" },
    { id: 14, name: "Wireless Home Security Cam", price: 89.99, img: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=400" },
    { id: 15, name: "Classic Denim Jacket", price: 74.50, img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400" },
    { id: 16, name: "Travel Backpack Organizer", price: 34.99, img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400" }
];

let cart = [];
let currentUser = null;
let authMode = 'signin';
const USERS_KEY = 'mangoMartUsers';

const authForm = document.getElementById('auth-form');
const authDescription = document.getElementById('auth-description');
const authSubmit = document.getElementById('auth-submit');
const confirmPassword = document.getElementById('confirm-password');
const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        return alert('Please enter both username and password.');
    }

    if (authMode === 'signup') {
        const confirm = document.getElementById('confirm-password').value;
        if (!confirm) {
            return alert('Please confirm your password.');
        }
        if (password !== confirm) {
            return alert('Passwords do not match.');
        }
        try {
            const user = await registerUser(username, password);
            currentUser = user;
            showStore();
        } catch (error) {
            alert(error.message);
        }
    } else {
        const user = await authenticateUser(username, password);
        if (!user) {
            return alert('Incorrect username or password.');
        }
        currentUser = user;
        showStore();
    }
});

toggleAuthModeBtn.addEventListener('click', () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
});

initAuthDatabase();

async function initAuthDatabase() {
    const users = loadUsers();
    if (!users.some(user => user.username === 'admin')) {
        const adminHash = await hashPassword('1234');
        users.push({ username: 'admin', passwordHash: adminHash, balance: 1250.00 });
        saveUsers(users);
    }
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadUsers() {
    try {
        const saved = localStorage.getItem(USERS_KEY);
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn('Corrupt user storage, resetting auth users.', error);
        localStorage.removeItem(USERS_KEY);
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function registerUser(username, password) {
    const users = loadUsers();
    if (users.some(user => user.username === username)) {
        throw new Error('Username already exists.');
    }
    const passwordHash = await hashPassword(password);
    const newUser = { username, passwordHash, balance: 1250.00 };
    users.push(newUser);
    saveUsers(users);
    return newUser;
}

async function authenticateUser(username, password) {
    const users = loadUsers();
    const user = users.find(user => user.username === username);
    if (!user) return null;
    const passwordHash = await hashPassword(password);
    return passwordHash === user.passwordHash ? user : null;
}

function setAuthMode(mode) {
    authMode = mode;
    if (mode === 'signup') {
        authDescription.innerText = 'Create an account to start shopping';
        authSubmit.innerText = 'Sign Up';
        confirmPassword.classList.remove('hidden');
        toggleAuthModeBtn.innerText = 'Already have an account? Sign In';
    } else {
        authDescription.innerText = 'Please sign in to start shopping';
        authSubmit.innerText = 'Sign In';
        confirmPassword.classList.add('hidden');
        toggleAuthModeBtn.innerText = 'New here? Create an account';
    }
}

function showStore() {
    if (!currentUser) return;
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('store-page').classList.remove('hidden');
    document.getElementById('user-greeting').innerText = `Hi, ${currentUser.username}`;
    const balance = getUserBalance(currentUser);
    document.getElementById('account-balance').innerText = `$${balance.toFixed(2)}`;
    currentUser.balance = balance;
    authForm.reset();
    setAuthMode('signin');
    renderProducts();
}

function getUserBalance(user) {
    if (!user) return 0;
    if (typeof user.balance === 'number') return user.balance;
    if (typeof user.balance === 'string') {
        const parsed = parseFloat(user.balance);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

function viewBalance() {
    displayWalletBalance();
}

function logout() {
    currentUser = null;
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('store-page').classList.add('hidden');
}

// Product Rendering
function renderProducts(productList = products, searchQuery = '') {
    const grid = document.getElementById('product-grid');

    if (productList.length === 0) {
        grid.innerHTML = `
            <div class="product-card" style="text-align:center; padding: 2rem;">
                <h3>No local results found</h3>
                <p>Search for "${searchQuery}" on Google to find more items.</p>
                <button class="btn-primary" onclick="searchGoogle('${encodeURIComponent(searchQuery)}')">Search on Google</button>
            </div>
        `;
        return;
    }

    grid.innerHTML = productList.map(p => `
        <div class="product-card">
            <img src="${p.img}" class="product-img">
            <div class="product-info">
                <h3>${p.name}</h3>
                <p>$${p.price.toFixed(2)}</p>
                <button class="btn-primary" onclick="addToCart(${p.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

function searchProducts(event) {
    const query = event.target.value.trim();
    const filtered = products.filter(product => product.name.toLowerCase().includes(query.toLowerCase()));
    renderProducts(filtered, query);
}

function searchGoogle(query) {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
}

function searchGoogleQuery() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;
    searchGoogle(query);
}

function goHome() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleWalletMenu() {
    document.getElementById('wallet-menu').classList.toggle('hidden');
}

function displayWalletBalance() {
    if (!currentUser) return;
    currentUser.balance = getUserBalance(currentUser);
    const balanceText = `Balance: $${currentUser.balance.toFixed(2)}`;
    document.getElementById('wallet-message').innerText = balanceText;
    document.getElementById('account-balance').innerText = `$${currentUser.balance.toFixed(2)}`;
}

function depositFunds() {
    const amount = parseFloat(document.getElementById('deposit-amount').value);
    if (!amount || amount <= 0) {
        return alert('Enter a valid deposit amount.');
    }
    currentUser.balance = getUserBalance(currentUser) + amount;
    updateCurrentUserBalance();
    displayWalletBalance();
    document.getElementById('deposit-amount').value = '';
    document.getElementById('wallet-message').innerText = `Deposited $${amount.toFixed(2)} successfully.`;
}

function updateCurrentUserBalance() {
    const users = loadUsers();
    const userIndex = users.findIndex(user => user.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex].balance = currentUser.balance;
        saveUsers(users);
    }
}

// Cart Logic
function addToCart(id) {
    const item = products.find(p => p.id === id);
    cart.push(item);
    updateUI();
}

function updateUI() {
    document.getElementById('cart-count').innerText = cart.length;
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item" style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom: 1px solid #eee; padding: 5px 0;">
            <span>${item.name}</span>
            <span>$${item.price.toFixed(2)}</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('cart-total').innerText = total.toFixed(2);
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('active');
}

function checkout() {
    if(cart.length === 0) return alert("Your cart is empty!");
    alert(`Thank you for your purchase, ${currentUser}!`);
    cart = [];
    updateUI();
    toggleCart();
}