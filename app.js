const foodItems = [
  ["Classic Cheeseburger", "Burgers", "🍔", 8.99], ["Double Smash Burger", "Burgers", "🍔", 11.49],
  ["Crispy Chicken Burger", "Burgers", "🍔", 9.79], ["Veggie Burger", "Burgers", "🥬", 8.49],
  ["Margherita Pizza", "Pizza", "🍕", 12.99], ["Pepperoni Pizza", "Pizza", "🍕", 14.49],
  ["BBQ Chicken Pizza", "Pizza", "🍕", 15.29], ["Vegetable Supreme Pizza", "Pizza", "🍕", 13.99],
  ["Chicken Biryani", "Rice", "🍛", 13.49], ["Beef Biryani", "Rice", "🍛", 14.49],
  ["Vegetable Fried Rice", "Rice", "🍚", 9.49], ["Chicken Teriyaki Rice", "Rice", "🍱", 12.29],
  ["Beef Tacos", "Mexican", "🌮", 10.49], ["Chicken Tacos", "Mexican", "🌮", 9.99],
  ["Cheese Quesadilla", "Mexican", "🫓", 8.29], ["Loaded Burrito", "Mexican", "🌯", 11.99],
  ["Chicken Alfredo", "Pasta", "🍝", 13.79], ["Spaghetti Bolognese", "Pasta", "🍝", 12.99],
  ["Pesto Penne", "Pasta", "🍝", 11.49], ["Mac and Cheese", "Pasta", "🧀", 8.99],
  ["California Roll", "Sushi", "🍣", 10.99], ["Salmon Avocado Roll", "Sushi", "🍣", 12.49],
  ["Shrimp Tempura Roll", "Sushi", "🍤", 13.29], ["Vegetable Sushi Set", "Sushi", "🍱", 9.99],
  ["Grilled Chicken Salad", "Healthy", "🥗", 10.49], ["Caesar Salad", "Healthy", "🥗", 8.99],
  ["Greek Salad", "Healthy", "🥗", 9.49], ["Avocado Power Bowl", "Healthy", "🥑", 11.79],
  ["Chicken Shawarma Wrap", "Wraps", "🌯", 10.99], ["Falafel Wrap", "Wraps", "🧆", 9.49],
  ["Philly Cheesesteak", "Sandwiches", "🥪", 12.49], ["Turkey Club Sandwich", "Sandwiches", "🥪", 9.99],
  ["Chicken Noodle Soup", "Soups", "🍲", 7.99], ["Tomato Basil Soup", "Soups", "🍅", 6.99],
  ["Ramen Bowl", "Soups", "🍜", 12.79], ["Pho Beef Noodle Soup", "Soups", "🍜", 13.29],
  ["Fried Chicken Meal", "Chicken", "🍗", 12.99], ["Buffalo Wings", "Chicken", "🍗", 11.99],
  ["Chicken Tenders", "Chicken", "🍗", 9.49], ["Grilled Chicken Plate", "Chicken", "🍗", 12.49],
  ["French Fries", "Sides", "🍟", 3.99], ["Onion Rings", "Sides", "🧅", 4.49],
  ["Garlic Bread", "Sides", "🥖", 4.29], ["Mozzarella Sticks", "Sides", "🧀", 6.49],
  ["Chocolate Cake", "Desserts", "🍰", 6.49], ["New York Cheesecake", "Desserts", "🍰", 6.99],
  ["Chocolate Chip Cookies", "Desserts", "🍪", 4.99], ["Strawberry Ice Cream", "Desserts", "🍨", 5.49],
  ["Mango Smoothie", "Drinks", "🥭", 5.99], ["Fresh Lemonade", "Drinks", "🍋", 3.99]
].map((item, index) => ({ id: index + 1, name: item[0], category: item[1], emoji: item[2], price: item[3], time: 14 + (index % 5) * 3 }));

const blockedTerms = [
  "alcohol", "beer", "wine", "vodka", "whiskey", "whisky", "rum", "tequila", "champagne", "liquor",
  "cig", "cigs", "cigarette", "cigarettes", "tobacco", "vape", "vaping", "nicotine", "juul",
  "sex", "sexual", "condom", "condoms", "vibrator", "dildo", "porn", "adult toy", "adult product"
];

const state = { category: "All", query: "", cart: [] };
const lockScreen = document.getElementById("lockScreen");
const homeScreen = document.getElementById("homeScreen");
const appScreen = document.getElementById("appScreen");
const searchInput = document.getElementById("searchInput");
const foodGrid = document.getElementById("foodGrid");
const categoryRow = document.getElementById("categoryRow");
const resultCount = document.getElementById("resultCount");
const menuTitle = document.getElementById("menuTitle");
const blockedModal = document.getElementById("blockedModal");
const cartModal = document.getElementById("cartModal");
const toast = document.getElementById("toast");

function activate(view) {
  [lockScreen, homeScreen, appScreen].forEach(v => v.classList.remove("active"));
  view.classList.add("active");
}

function unlockPhone() {
  lockScreen.animate([
    { transform: "translateY(0)", opacity: 1 },
    { transform: "translateY(-100%)", opacity: 0 }
  ], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
  setTimeout(() => activate(homeScreen), 250);
}

let touchStartY = null;
lockScreen.addEventListener("touchstart", event => { touchStartY = event.touches[0].clientY; }, { passive: true });
lockScreen.addEventListener("touchend", event => {
  const endY = event.changedTouches[0].clientY;
  if (touchStartY !== null && touchStartY - endY > 55) unlockPhone();
  touchStartY = null;
});

let mouseStartY = null;
lockScreen.addEventListener("mousedown", event => { mouseStartY = event.clientY; });
lockScreen.addEventListener("mouseup", event => {
  if (mouseStartY !== null && mouseStartY - event.clientY > 45) unlockPhone();
  mouseStartY = null;
});
document.getElementById("swipeZone").addEventListener("click", unlockPhone);

document.getElementById("openDeliveryApp").addEventListener("click", () => {
  activate(appScreen);
  animateIsland("Delivery app opened");
  renderFood();
});

function animateIsland(message) {
  const island = document.getElementById("dynamicIsland");
  document.getElementById("islandText").textContent = message;
  island.classList.add("expanded");
  setTimeout(() => island.classList.remove("expanded"), 1700);
}

const categories = ["All", ...new Set(foodItems.map(item => item.category))];
function renderCategories() {
  categoryRow.innerHTML = categories.map(category => `
    <button class="category-button ${state.category === category ? "active" : ""}" data-category="${category}">${category}</button>
  `).join("");
  categoryRow.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    state.category = button.dataset.category;
    menuTitle.textContent = state.category === "All" ? "Popular near you" : state.category;
    renderCategories();
    renderFood();
  }));
}

function isBlocked(query) {
  const normalized = query.toLowerCase().trim();
  return blockedTerms.some(term => normalized.includes(term));
}

function filteredFood() {
  return foodItems.filter(item => {
    const matchesCategory = state.category === "All" || item.category === state.category;
    const matchesSearch = item.name.toLowerCase().includes(state.query) || item.category.toLowerCase().includes(state.query);
    return matchesCategory && matchesSearch;
  });
}

function renderFood() {
  const results = filteredFood();
  resultCount.textContent = `${results.length} item${results.length === 1 ? "" : "s"} available`;
  if (!results.length) {
    foodGrid.innerHTML = `<div class="no-results"><span>🔎</span><strong>No food found</strong><p>Try another food name or category.</p></div>`;
    return;
  }
  foodGrid.innerHTML = results.map(item => `
    <article class="food-card">
      <div class="food-image">${item.emoji}</div>
      <button class="add-button" data-id="${item.id}" aria-label="Add ${item.name}">+</button>
      <div class="food-info">
        <h3 title="${item.name}">${item.name}</h3>
        <div class="food-meta"><span>${item.category}</span><span>${item.time}-${item.time + 8} min</span></div>
        <div class="food-price">$${item.price.toFixed(2)}</div>
      </div>
    </article>
  `).join("");
  foodGrid.querySelectorAll(".add-button").forEach(button => button.addEventListener("click", () => addToCart(Number(button.dataset.id))));
}

function openBlockedModal() {
  blockedModal.classList.add("open");
  blockedModal.setAttribute("aria-hidden", "false");
  searchInput.blur();
  animateIsland("Restricted search blocked");
}

searchInput.addEventListener("input", event => {
  const value = event.target.value;
  if (isBlocked(value)) {
    state.query = "";
    openBlockedModal();
    setTimeout(() => { searchInput.value = ""; renderFood(); }, 150);
    return;
  }
  state.query = value.toLowerCase().trim();
  menuTitle.textContent = state.query ? `Results for “${value}”` : (state.category === "All" ? "Popular near you" : state.category);
  renderFood();
});

document.getElementById("clearSearch").addEventListener("click", () => {
  searchInput.value = "";
  state.query = "";
  menuTitle.textContent = state.category === "All" ? "Popular near you" : state.category;
  renderFood();
});

document.getElementById("closeBlockedModal").addEventListener("click", () => blockedModal.classList.remove("open"));
blockedModal.addEventListener("click", event => { if (event.target === blockedModal) blockedModal.classList.remove("open"); });

document.getElementById("browseButton").addEventListener("click", () => document.querySelector(".section-heading").scrollIntoView({ behavior: "smooth" }));
document.getElementById("showAllButton").addEventListener("click", () => {
  state.category = "All"; state.query = ""; searchInput.value = ""; menuTitle.textContent = "All menu items"; renderCategories(); renderFood();
});

function addToCart(id) {
  const item = foodItems.find(food => food.id === id);
  state.cart.push(item);
  updateCartBadge();
  showToast(`${item.name} added`);
  animateIsland(`Added • $${item.price.toFixed(2)}`);
}

function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  badge.textContent = state.cart.length;
  badge.style.display = state.cart.length ? "grid" : "none";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1300);
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  if (!state.cart.length) {
    cartItems.innerHTML = `<div class="no-results"><span>🛒</span><strong>Your cart is empty</strong></div>`;
  } else {
    const grouped = state.cart.reduce((acc, item) => {
      acc[item.id] = acc[item.id] || { ...item, quantity: 0 };
      acc[item.id].quantity += 1;
      return acc;
    }, {});
    cartItems.innerHTML = Object.values(grouped).map(item => `
      <div class="cart-line"><div><strong>${item.emoji} ${item.name}</strong><small>Quantity: ${item.quantity}</small></div><strong>$${(item.price * item.quantity).toFixed(2)}</strong></div>
    `).join("");
  }
  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  document.getElementById("cartTotal").textContent = `$${total.toFixed(2)}`;
}

document.getElementById("cartButton").addEventListener("click", () => { renderCart(); cartModal.classList.add("open"); });
document.getElementById("closeCartModal").addEventListener("click", () => cartModal.classList.remove("open"));
cartModal.addEventListener("click", event => { if (event.target === cartModal) cartModal.classList.remove("open"); });
document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!state.cart.length) return showToast("Add food before checkout");
  cartModal.classList.remove("open");
  showToast("Order sent to Microbit robot!");
  animateIsland("Robot delivery started");
  state.cart = [];
  updateCartBadge();
});

document.getElementById("ordersButton").addEventListener("click", () => showToast("No previous orders yet"));

function setClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  document.getElementById("lockTime").textContent = time;
  document.getElementById("lockTimeSmall").textContent = time;
  document.getElementById("lockDate").textContent = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

setClock();
renderCategories();
renderFood();
