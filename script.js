// --- CART LOGIC ---
let cart = JSON.parse(localStorage.getItem("kailash_cart")) || [];

function saveCart() {
    localStorage.setItem("kailash_cart", JSON.stringify(cart));
    updateCartUI();
}

function addToCart(id, name, price, weight, imagePath) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id, name, price, weight, imagePath, quantity: 1 });
    }
    saveCart();
    openCart();
    
    // Toast notification
    showToast(`Added ${name} to cart!`);
}

function updateQuantity(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        saveCart();
    }
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// --- UI INTERACTIONS ---

function updateCartUI() {
    // Update badge counts
    document.querySelectorAll('.cart-count').forEach(el => {
        const count = getCartCount();
        el.innerText = count;
        if (count > 0) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });

    // Update Drawer Content
    const cartItemsContainer = document.getElementById('cart-items-container');
    if (!cartItemsContainer) return; // If drawer doesn't exist on this page

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full text-center text-[#3b5945]/60 mt-12">
                <i data-lucide="shopping-bag" class="w-16 h-16 mb-4 text-[#d4af37]"></i>
                <p class="font-medium text-lg">Your bag is empty</p>
                <p class="text-sm mt-2">Looks like you haven't added any premium flour yet.</p>
                <button onclick="closeCart()" class="mt-8 text-[#d4af37] font-semibold uppercase tracking-widest text-sm hover:underline">Continue Shopping</button>
            </div>
        `;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="flex items-center gap-4 bg-[#faf8f5] p-3 rounded-xl border border-[#3b5945]/10">
                <div class="w-20 h-24 bg-white rounded-lg flex items-center justify-center p-2 shrink-0 border border-gray-100 shadow-sm">
                    <img src="${item.imagePath}" alt="${item.name}" class="w-full h-full object-contain" />
                </div>
                <div class="flex-1">
                    <h4 class="font-heading font-bold text-[#2a4332] text-sm leading-tight">${item.name}</h4>
                    <p class="text-xs text-[#3b5945]/60 mb-2">${item.weight}</p>
                    <div class="flex items-center justify-between">
                        <div class="font-bold text-[#3b5945]">₹${item.price}</div>
                        <div class="flex items-center gap-2 bg-white rounded-full border border-gray-200 p-0.5">
                            <button onclick="updateQuantity('${item.id}', -1)" class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#3b5945]"><i data-lucide="minus" class="w-3 h-3"></i></button>
                            <span class="text-xs font-semibold w-4 text-center">${item.quantity}</span>
                            <button onclick="updateQuantity('${item.id}', 1)" class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 text-[#3b5945]"><i data-lucide="plus" class="w-3 h-3"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Update Totals
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const total = getCartTotal();
    
    if (subtotalEl) subtotalEl.innerText = `₹${total}`;
    if (totalEl) totalEl.innerText = `₹${total}`;

    // Re-initialize icons for newly added HTML
    if (window.lucide) {
        lucide.createIcons();
    }
}

function openCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        drawer.classList.remove('translate-x-full');
    }
    updateCartUI();
}

function closeCart() {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-overlay');
    if (drawer && overlay) {
        drawer.classList.add('translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Toast Notification
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#2a4332] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-2xl z-[100] animate-fade-in flex items-center gap-2';
    toast.innerHTML = `<i data-lucide="check-circle-2" class="w-4 h-4 text-[#d4af37]"></i> ${msg}`;
    document.body.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// --- LOCATION LOGIC ---
function fetchLocation() {
    const statusEl = document.getElementById('location-status');
    const inputEl = document.getElementById('live_location');
    const btnEl = document.getElementById('location-btn');
    
    statusEl.classList.remove('hidden');
    statusEl.innerText = 'Fetching your location...';
    statusEl.className = 'text-xs font-semibold mt-2 text-[#d4af37]';

    if (!navigator.geolocation) {
        statusEl.innerText = 'Geolocation is not supported by your browser.';
        statusEl.className = 'text-xs font-semibold mt-2 text-red-500';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
            
            inputEl.value = mapsLink;
            statusEl.innerText = '✓ Location fetched successfully!';
            statusEl.className = 'text-xs font-semibold mt-2 text-green-600';
            
            // Change button appearance
            btnEl.classList.remove('bg-brand-bg', 'text-brand-primary');
            btnEl.classList.add('bg-green-50', 'border-green-500', 'text-green-700');
            btnEl.innerHTML = `<i data-lucide="check-circle-2"></i> Location Saved`;
            if (window.lucide) lucide.createIcons();
        },
        (error) => {
            statusEl.innerText = 'Failed to get location. Please allow location access in your browser settings.';
            statusEl.className = 'text-xs font-semibold mt-2 text-red-500';
        },
        { enableHighAccuracy: true }
    );
}

// Check out functions (for checkout.html)
function processCheckout(event) {
    event.preventDefault();
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const form = event.target;
    const name = form.name.value;
    const phone = form.phone.value;
    const address = form.address.value;
    const landmark = form.landmark ? form.landmark.value : "None";
    const locationLink = form.live_location ? form.live_location.value : "";
    const instructions = form.instructions.value || "None";

    if (!locationLink) {
        alert("Please fetch your Live Location. It is compulsory for accurate delivery.");
        return;
    }

    let message = `*New Order - Kailash Pavitra Atta* 🌾\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${name}\n`;
    message += `Phone: ${phone}\n`;
    message += `Address: ${address}\n`;
    message += `Landmark: ${landmark}\n`;
    message += `Live Location: ${locationLink}\n`;
    message += `Instructions: ${instructions}\n\n`;
    
    message += `*Order Summary:*\n`;
    cart.forEach(item => {
        message += `• ${item.name} (${item.weight}) x ${item.quantity} = ₹${item.price * item.quantity}\n`;
    });
    
    const total = getCartTotal();
    message += `\n*Billing:*\n`;
    message += `Subtotal: ₹${total}\n`;
    message += `Delivery Fee: ₹40\n`;
    message += `Free Delivery Promo: -₹40\n`;
    message += `*Final Amount to Pay: ₹${total}*\n`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919462677346?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                navbar.classList.add('glass-nav', 'border-b', 'border-gray-200', 'shadow-sm');
                navbar.classList.remove('bg-transparent');
            } else {
                navbar.classList.remove('glass-nav', 'border-b', 'border-gray-200', 'shadow-sm');
                navbar.classList.add('bg-transparent');
            }
        });
    }

    updateCartUI();
});
