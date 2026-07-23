/* =========================================================
   MICROBIT DELIVERY APP
   script.js
========================================================= */

"use strict";

/* =========================================================
   BASIC SETTINGS
========================================================= */

const TIME_ZONE = "America/Chicago";

/*
  Project tax setting:
  California statewide base sales-tax rate.
*/
const CALIFORNIA_TAX_RATE = 0.0725;

/*
  The tracking demo updates every five seconds.
  Real-world ETA timestamps still use the actual Central Time clock.
*/
const TRACKING_UPDATE_MS = 5000;

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

function getElement(id) {
  return document.getElementById(id);
}

function formatMoney(number) {
  return `$${number.toFixed(2)}`;
}

function formatCentralTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function formatCentralDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(date);
}

function futureTime(minutesFromNow) {
  return new Date(
    Date.now() + minutesFromNow * 60 * 1000
  );
}

function randomArrayItem(array) {
  return array[
    Math.floor(Math.random() * array.length)
  ];
}

function randomFourDigitCode() {
  return String(
    Math.floor(1000 + Math.random() * 9000)
  );
}

function randomOrderNumber() {
  return `MB${Math.floor(
    1000 + Math.random() * 9000
  )}`;
}

/* =========================================================
   VANDERBILT DELIVERY LOCATIONS
========================================================= */

const campusLocations = [
  {
    group: "The Ingram Commons",
    places: [
      "Crawford House",
      "East House",
      "Gillette House",
      "Hank Ingram House",
      "Memorial House",
      "Murray House",
      "North House",
      "Stambaugh House",
      "Sutherland House",
      "West House",
      "The Commons Center"
    ]
  },

  {
    group: "Upper-Division Housing",
    places: [
      "Lewis House",
      "Morgan House",
      "Chaffin Place",
      "Blakemore House",
      "Cole Hall",
      "Tolman Hall",
      "Village at Vanderbilt South Tower",
      "Village at Vanderbilt Townhouses",
      "Mayfield Lodge",
      "McGill Hall",
      "McTyeire International House"
    ]
  },

  {
    group: "Residential Colleges",
    places: [
      "Warren College",
      "Moore College",
      "E. Bronson Ingram College",
      "Nicholas S. Zeppos College",
      "Rothschild College"
    ]
  },

  {
    group: "Engineering and Academic Buildings",
    places: [
      "Engineering and Science Building",
      "Featheringill-Jacobs Hall",
      "Stevenson Center",
      "The Wond'ry",
      "Kirkland Hall",
      "Central Library",
      "Peabody Library",
      "Wilson Hall",
      "Buttrick Hall",
      "Calhoun Hall",
      "Garland Hall",
      "Alumni Hall",
      "Blair School of Music",
      "Vanderbilt Law School",
      "Owen Graduate School of Management",
      "Vanderbilt Divinity School"
    ]
  },

  {
    group: "Student and Faculty Locations",
    places: [
      "Sarratt Student Center",
      "Rand Dining Center",
      "Student Life Center",
      "University Club",
      "Baker Building",
      "2525 West End",
      "University Counseling Center"
    ]
  },

  {
    group: "Medical Campus",
    places: [
      "Medical Center North",
      "Light Hall",
      "Eskind Biomedical Library",
      "Vanderbilt University Hospital",
      "Monroe Carell Jr. Children's Hospital",
      "The Vanderbilt Clinic"
    ]
  },

  {
    group: "Custom Destination",
    places: [
      "Other Vanderbilt location"
    ]
  }
];

/* =========================================================
   RESTAURANTS
========================================================= */

const restaurants = [
  {
    id: "bombay",
    name: "Bombay Biryani House",
    emoji: "🍛",
    cuisine: "Indian",
    rating: 4.8
  },

  {
    id: "burger",
    name: "Campus Burger Co.",
    emoji: "🍔",
    cuisine: "Burgers",
    rating: 4.7
  },

  {
    id: "pizza",
    name: "Pizzeria 21",
    emoji: "🍕",
    cuisine: "Pizza and Pasta",
    rating: 4.6
  },

  {
    id: "sakura",
    name: "Sakura Sushi",
    emoji: "🍣",
    cuisine: "Japanese",
    rating: 4.8
  },

  {
    id: "taco",
    name: "Taco Engineering Lab",
    emoji: "🌮",
    cuisine: "Mexican",
    rating: 4.6
  },

  {
    id: "hot",
    name: "Nashville Hot Kitchen",
    emoji: "🍗",
    cuisine: "Southern",
    rating: 4.9
  },

  {
    id: "green",
    name: "Green Bowl Café",
    emoji: "🥗",
    cuisine: "Healthy",
    rating: 4.7
  },

  {
    id: "sweet",
    name: "Sweet Circuit",
    emoji: "🍰",
    cuisine: "Desserts",
    rating: 4.8
  },

  {
    id: "market",
    name: "Commodore Market",
    emoji: "🛒",
    cuisine: "Groceries",
    rating: 4.7
  }
];

/* =========================================================
   50 FOOD AND GROCERY ITEMS
========================================================= */

const products = [
  /* Bombay Biryani House — 8 items */

  {
    id: 1,
    restaurantId: "bombay",
    name: "Chicken Biryani",
    category: "Indian",
    emoji: "🍛",
    price: 14.49
  },

  {
    id: 2,
    restaurantId: "bombay",
    name: "Lamb Biryani",
    category: "Indian",
    emoji: "🍛",
    price: 16.99
  },

  {
    id: 3,
    restaurantId: "bombay",
    name: "Vegetable Biryani",
    category: "Indian",
    emoji: "🥘",
    price: 12.49
  },

  {
    id: 4,
    restaurantId: "bombay",
    name: "Butter Chicken",
    category: "Indian",
    emoji: "🍲",
    price: 15.49
  },

  {
    id: 5,
    restaurantId: "bombay",
    name: "Chicken Tikka Masala",
    category: "Indian",
    emoji: "🥘",
    price: 15.99
  },

  {
    id: 6,
    restaurantId: "bombay",
    name: "Garlic Naan",
    category: "Indian",
    emoji: "🫓",
    price: 4.49
  },

  {
    id: 7,
    restaurantId: "bombay",
    name: "Samosa Plate",
    category: "Indian",
    emoji: "🥟",
    price: 7.49
  },

  {
    id: 8,
    restaurantId: "bombay",
    name: "Mango Lassi",
    category: "Drinks",
    emoji: "🥭",
    price: 5.49,
    liquid: true
  },

  /* Campus Burger Co. — 6 items */

  {
    id: 9,
    restaurantId: "burger",
    name: "Classic Cheeseburger",
    category: "Burgers",
    emoji: "🍔",
    price: 10.99
  },

  {
    id: 10,
    restaurantId: "burger",
    name: "Double Bacon Burger",
    category: "Burgers",
    emoji: "🍔",
    price: 13.99
  },

  {
    id: 11,
    restaurantId: "burger",
    name: "Spicy Chicken Burger",
    category: "Burgers",
    emoji: "🍔",
    price: 11.79
  },

  {
    id: 12,
    restaurantId: "burger",
    name: "Veggie Burger",
    category: "Burgers",
    emoji: "🥬",
    price: 10.49
  },

  {
    id: 13,
    restaurantId: "burger",
    name: "Seasoned French Fries",
    category: "Sides",
    emoji: "🍟",
    price: 4.49
  },

  {
    id: 14,
    restaurantId: "burger",
    name: "Chocolate Milkshake",
    category: "Drinks",
    emoji: "🥤",
    price: 6.49,
    liquid: true
  },

  /* Pizzeria 21 — 6 items */

  {
    id: 15,
    restaurantId: "pizza",
    name: "Margherita Pizza",
    category: "Pizza",
    emoji: "🍕",
    price: 13.49
  },

  {
    id: 16,
    restaurantId: "pizza",
    name: "Pepperoni Pizza",
    category: "Pizza",
    emoji: "🍕",
    price: 15.49
  },

  {
    id: 17,
    restaurantId: "pizza",
    name: "BBQ Chicken Pizza",
    category: "Pizza",
    emoji: "🍕",
    price: 16.49
  },

  {
    id: 18,
    restaurantId: "pizza",
    name: "Vegetable Pizza",
    category: "Pizza",
    emoji: "🍕",
    price: 14.49
  },

  {
    id: 19,
    restaurantId: "pizza",
    name: "Chicken Alfredo",
    category: "Pasta",
    emoji: "🍝",
    price: 14.99
  },

  {
    id: 20,
    restaurantId: "pizza",
    name: "Garlic Bread",
    category: "Sides",
    emoji: "🥖",
    price: 5.49
  },

  /* Sakura Sushi — 5 items */

  {
    id: 21,
    restaurantId: "sakura",
    name: "California Roll",
    category: "Sushi",
    emoji: "🍣",
    price: 10.49
  },

  {
    id: 22,
    restaurantId: "sakura",
    name: "Spicy Tuna Roll",
    category: "Sushi",
    emoji: "🍣",
    price: 12.49
  },

  {
    id: 23,
    restaurantId: "sakura",
    name: "Salmon Avocado Roll",
    category: "Sushi",
    emoji: "🍣",
    price: 13.49
  },

  {
    id: 24,
    restaurantId: "sakura",
    name: "Shrimp Tempura Roll",
    category: "Sushi",
    emoji: "🍤",
    price: 13.99
  },

  {
    id: 25,
    restaurantId: "sakura",
    name: "Miso Soup",
    category: "Soup",
    emoji: "🍲",
    price: 4.49,
    liquid: true
  },

  /* Taco Engineering Lab — 5 items */

  {
    id: 26,
    restaurantId: "taco",
    name: "Chicken Tacos",
    category: "Mexican",
    emoji: "🌮",
    price: 10.99
  },

  {
    id: 27,
    restaurantId: "taco",
    name: "Beef Tacos",
    category: "Mexican",
    emoji: "🌮",
    price: 11.49
  },

  {
    id: 28,
    restaurantId: "taco",
    name: "Cheese Quesadilla",
    category: "Mexican",
    emoji: "🫓",
    price: 9.49
  },

  {
    id: 29,
    restaurantId: "taco",
    name: "Chicken Burrito",
    category: "Mexican",
    emoji: "🌯",
    price: 12.99
  },

  {
    id: 30,
    restaurantId: "taco",
    name: "Horchata",
    category: "Drinks",
    emoji: "🥛",
    price: 4.99,
    liquid: true
  },

  /* Nashville Hot Kitchen — 5 items */

  {
    id: 31,
    restaurantId: "hot",
    name: "Hot Chicken Plate",
    category: "Chicken",
    emoji: "🍗",
    price: 14.49
  },

  {
    id: 32,
    restaurantId: "hot",
    name: "Chicken Tenders",
    category: "Chicken",
    emoji: "🍗",
    price: 11.49
  },

  {
    id: 33,
    restaurantId: "hot",
    name: "Buffalo Wings",
    category: "Chicken",
    emoji: "🍗",
    price: 12.99
  },

  {
    id: 34,
    restaurantId: "hot",
    name: "Southern Mac and Cheese",
    category: "Sides",
    emoji: "🧀",
    price: 6.49
  },

  {
    id: 35,
    restaurantId: "hot",
    name: "Sweet Tea",
    category: "Drinks",
    emoji: "🧋",
    price: 3.99,
    liquid: true
  },

  /* Green Bowl Café — 5 items */

  {
    id: 36,
    restaurantId: "green",
    name: "Caesar Salad",
    category: "Healthy",
    emoji: "🥗",
    price: 9.99
  },

  {
    id: 37,
    restaurantId: "green",
    name: "Greek Salad",
    category: "Healthy",
    emoji: "🥗",
    price: 10.49
  },

  {
    id: 38,
    restaurantId: "green",
    name: "Avocado Power Bowl",
    category: "Healthy",
    emoji: "🥑",
    price: 12.49
  },

  {
    id: 39,
    restaurantId: "green",
    name: "Grilled Chicken Bowl",
    category: "Healthy",
    emoji: "🥙",
    price: 13.49
  },

  {
    id: 40,
    restaurantId: "green",
    name: "Berry Protein Smoothie",
    category: "Drinks",
    emoji: "🫐",
    price: 6.99,
    liquid: true
  },

  /* Sweet Circuit — 4 items */

  {
    id: 41,
    restaurantId: "sweet",
    name: "Chocolate Cake",
    category: "Desserts",
    emoji: "🍰",
    price: 6.99
  },

  {
    id: 42,
    restaurantId: "sweet",
    name: "Brownie Sundae",
    category: "Desserts",
    emoji: "🍨",
    price: 7.49
  },

  {
    id: 43,
    restaurantId: "sweet",
    name: "Glazed Donut Box",
    category: "Desserts",
    emoji: "🍩",
    price: 8.99,
    bogo: true
  },

  {
    id: 44,
    restaurantId: "sweet",
    name: "Vanilla Iced Coffee",
    category: "Drinks",
    emoji: "🧋",
    price: 5.49,
    liquid: true
  },

  /* Commodore Market — 6 items */

  {
    id: 45,
    restaurantId: "market",
    name: "Bottled Water",
    category: "Groceries",
    emoji: "💧",
    price: 2.49,
    liquid: true,
    grocery: true
  },

  {
    id: 46,
    restaurantId: "market",
    name: "Orange Juice",
    category: "Groceries",
    emoji: "🧃",
    price: 4.49,
    liquid: true,
    grocery: true,
    discount: 0.1
  },

  {
    id: 47,
    restaurantId: "market",
    name: "Sea Salt Chips",
    category: "Groceries",
    emoji: "🥔",
    price: 3.99,
    grocery: true,
    bogo: true
  },

  {
    id: 48,
    restaurantId: "market",
    name: "Granola Bar Box",
    category: "Groceries",
    emoji: "🥜",
    price: 6.49,
    grocery: true,
    bogo: true
  },

  {
    id: 49,
    restaurantId: "market",
    name: "Fresh Apple Bag",
    category: "Groceries",
    emoji: "🍎",
    price: 5.99,
    grocery: true,
    discount: 0.15
  },

  {
    id: 50,
    restaurantId: "market",
    name: "Turkey Sandwich",
    category: "Groceries",
    emoji: "🥪",
    price: 7.99,
    grocery: true,
    discount: 0.1
  }
];

/* =========================================================
   RESTRICTED SEARCH TERMS
========================================================= */

const blockedSearchTerms = [
  "alcohol",
  "beer",
  "wine",
  "vodka",
  "whiskey",
  "whisky",
  "rum",
  "tequila",
  "champagne",
  "liquor",

  "cig",
  "cigs",
  "cigarette",
  "cigarettes",
  "tobacco",
  "nicotine",
  "vape",
  "vaping",
  "juul",

  "sex",
  "sexual",
  "adult product",
  "adult toy",
  "porn",
  "vibrator",
  "dildo"
];

/* =========================================================
   RIDERS
========================================================= */

const riders = [
  {
    name: "Jordan Williams",
    phone: "(615) 555-0142"
  },

  {
    name: "Maya Thompson",
    phone: "(615) 555-0187"
  },

  {
    name: "Daniel Kim",
    phone: "(615) 555-0129"
  },

  {
    name: "Aaliyah Johnson",
    phone: "(615) 555-0165"
  },

  {
    name: "Marcus Lee",
    phone: "(615) 555-0113"
  },

  {
    name: "Sofia Martinez",
    phone: "(615) 555-0194"
  }
];

/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {
  selectedAddress: "Lewis House",
  addressDetails: "",

  selectedCategory: "All",
  selectedRestaurant: "All",

  searchQuery: "",
  dealsOnly: false,

  cart: [],

  deliveryMode: "regular",
  scheduleMinutes: 60,
  spillProtection: false,
  tip: 3,

  activeOrder: null,
  trackingTimer: null,

  notifications: [],
  messages: []
};

/* =========================================================
   DOM ELEMENTS
========================================================= */

const lockScreen = getElement("lockScreen");
const homeScreen = getElement("homeScreen");
const appScreen = getElement("appScreen");

const dynamicIsland = getElement("dynamicIsland");
const islandText = getElement("islandText");

const searchInput = getElement("searchInput");
const foodGrid = getElement("foodGrid");
const categoryRow = getElement("categoryRow");
const restaurantRow = getElement("restaurantRow");

const menuTitle = getElement("menuTitle");
const resultCount = getElement("resultCount");

const cartBadge = getElement("cartBadge");
const toast = getElement("toast");

/* =========================================================
   CLOCK
========================================================= */

function updateClock() {
  const now = new Date();

  document
    .querySelectorAll(".ct-clock")
    .forEach((clockElement) => {
      clockElement.textContent =
        formatCentralTime(now);
    });

  getElement("lockDate").textContent =
    formatCentralDate(now);
}

updateClock();

setInterval(updateClock, 1000);

/* =========================================================
   PHONE SCREEN NAVIGATION
========================================================= */

function showPhoneScreen(screenToShow) {
  [lockScreen, homeScreen, appScreen]
    .forEach((screen) => {
      screen.classList.remove("active");
    });

  screenToShow.classList.add("active");
}

function unlockPhone() {
  lockScreen.animate(
    [
      {
        transform: "translateY(0)",
        opacity: 1
      },

      {
        transform: "translateY(-100%)",
        opacity: 0
      }
    ],

    {
      duration: 430,
      easing: "cubic-bezier(.2,.8,.2,1)"
    }
  );

  setTimeout(() => {
    showPhoneScreen(homeScreen);
  }, 250);
}

/* Touch swipe */

let touchStartY = null;

lockScreen.addEventListener(
  "touchstart",
  (event) => {
    touchStartY =
      event.touches[0].clientY;
  },

  {
    passive: true
  }
);

lockScreen.addEventListener(
  "touchend",
  (event) => {
    const touchEndY =
      event.changedTouches[0].clientY;

    if (
      touchStartY !== null &&
      touchStartY - touchEndY > 55
    ) {
      unlockPhone();
    }

    touchStartY = null;
  }
);

/* Computer mouse swipe */

let mouseStartY = null;

lockScreen.addEventListener(
  "mousedown",
  (event) => {
    mouseStartY = event.clientY;
  }
);

lockScreen.addEventListener(
  "mouseup",
  (event) => {
    if (
      mouseStartY !== null &&
      mouseStartY - event.clientY > 45
    ) {
      unlockPhone();
    }

    mouseStartY = null;
  }
);

getElement("swipeZone")
  .addEventListener("click", unlockPhone);

getElement("openAppButton")
  .addEventListener("click", () => {
    showPhoneScreen(appScreen);

    animateDynamicIsland(
      "Microbit Delivery opened"
    );

    renderApplication();
  });

/* =========================================================
   DYNAMIC ISLAND AND TOASTS
========================================================= */

function animateDynamicIsland(message) {
  islandText.textContent = message;

  dynamicIsland.classList.add("expanded");

  clearTimeout(
    animateDynamicIsland.timeout
  );

  animateDynamicIsland.timeout =
    setTimeout(() => {
      dynamicIsland.classList.remove(
        "expanded"
      );
    }, 1900);
}

function showToast(message) {
  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(showToast.timeout);

  showToast.timeout =
    setTimeout(() => {
      toast.classList.remove("show");
    }, 1700);
}

/* =========================================================
   ADDRESS SELECTS
========================================================= */

function createLocationOptions() {
  return campusLocations
    .map((locationGroup) => {
      const options =
        locationGroup.places
          .map((place) => {
            return `
              <option value="${place}">
                ${place}
              </option>
            `;
          })
          .join("");

      return `
        <optgroup label="${locationGroup.group}">
          ${options}
        </optgroup>
      `;
    })
    .join("");
}

function populateAddressSelectors() {
  const options = createLocationOptions();

  getElement("addressSelect").innerHTML =
    options;

  getElement("cartAddressSelect").innerHTML =
    options;

  getElement("addressSelect").value =
    state.selectedAddress;

  getElement("cartAddressSelect").value =
    state.selectedAddress;
}

function updateAddressDisplay() {
  getElement("headerAddress").textContent =
    state.selectedAddress;

  getElement("addressSelect").value =
    state.selectedAddress;

  getElement("cartAddressSelect").value =
    state.selectedAddress;
}

populateAddressSelectors();
updateAddressDisplay();

/* Address modal */

getElement("openAddressButton")
  .addEventListener("click", () => {
    getElement("addressDetails").value =
      state.addressDetails;

    openModal("addressModal");
  });

getElement("closeAddressModal")
  .addEventListener("click", () => {
    closeModal("addressModal");
  });

getElement("saveAddressButton")
  .addEventListener("click", () => {
    state.selectedAddress =
      getElement("addressSelect").value;

    state.addressDetails =
      getElement("addressDetails")
        .value
        .trim();

    updateAddressDisplay();

    closeModal("addressModal");

    showToast(
      `Delivering to ${state.selectedAddress}`
    );

    animateDynamicIsland(
      "Destination updated"
    );

    renderFood();
  });

/* =========================================================
   RESTAURANT AND PRODUCT HELPERS
========================================================= */

function getRestaurant(restaurantId) {
  return restaurants.find(
    (restaurant) =>
      restaurant.id === restaurantId
  );
}

function getProduct(productId) {
  return products.find(
    (product) =>
      product.id === productId
  );
}

/*
  Creates a stable random-looking distance between
  the restaurant and selected Vanderbilt destination.

  The same restaurant/address combination always returns
  the same distance during the session.
*/
function calculateDistance(
  restaurantId,
  address
) {
  const combinedText =
    `${restaurantId}-${address}`;

  let hash = 0;

  for (
    let index = 0;
    index < combinedText.length;
    index += 1
  ) {
    hash =
      (hash * 31 +
        combinedText.charCodeAt(index)) %
      100000;
  }

  const distance =
    0.4 + (Math.abs(hash) % 25) / 10;

  return Number(distance.toFixed(1));
}

/* =========================================================
   CATEGORY AND RESTAURANT FILTERS
========================================================= */

const categories = [
  "All",
  ...new Set(
    products.map((product) =>
      product.category
    )
  )
];

function renderCategories() {
  categoryRow.innerHTML =
    categories
      .map((category) => {
        const activeClass =
          state.selectedCategory === category
            ? "active-filter"
            : "";

        return `
          <button
            class="filter-button ${activeClass}"
            data-category="${category}"
          >
            ${category}
          </button>
        `;
      })
      .join("");
}

function renderRestaurants() {
  const allButton = `
    <button
      class="restaurant-filter ${
        state.selectedRestaurant === "All"
          ? "active-restaurant"
          : ""
      }"
      data-restaurant="All"
    >
      <span>🍽️</span>

      <div>
        <strong>All restaurants</strong>
        <small>Browse everything</small>
      </div>
    </button>
  `;

  const restaurantButtons =
    restaurants
      .map((restaurant) => {
        const distance =
          calculateDistance(
            restaurant.id,
            state.selectedAddress
          );

        const activeClass =
          state.selectedRestaurant ===
          restaurant.id
            ? "active-restaurant"
            : "";

        return `
          <button
            class="restaurant-filter ${activeClass}"
            data-restaurant="${restaurant.id}"
          >
            <span>${restaurant.emoji}</span>

            <div>
              <strong>${restaurant.name}</strong>

              <small>
                ${restaurant.rating} ★ •
                ${distance.toFixed(1)} mi
              </small>
            </div>
          </button>
        `;
      })
      .join("");

  restaurantRow.innerHTML =
    allButton + restaurantButtons;
}

categoryRow.addEventListener(
  "click",
  (event) => {
    const button =
      event.target.closest(
        "[data-category]"
      );

    if (!button) {
      return;
    }

    state.selectedCategory =
      button.dataset.category;

    state.dealsOnly = false;

    renderApplication();
  }
);

restaurantRow.addEventListener(
  "click",
  (event) => {
    const button =
      event.target.closest(
        "[data-restaurant]"
      );

    if (!button) {
      return;
    }

    state.selectedRestaurant =
      button.dataset.restaurant;

    state.dealsOnly = false;

    renderApplication();
  }
);

/* =========================================================
   SEARCHING AND RESTRICTED PRODUCTS
========================================================= */

function searchIsRestricted(searchText) {
  const normalizedSearch =
    searchText
      .toLowerCase()
      .trim();

  return blockedSearchTerms.some(
    (blockedTerm) =>
      normalizedSearch.includes(
        blockedTerm
      )
  );
}

searchInput.addEventListener(
  "input",
  (event) => {
    const enteredText =
      event.target.value;

    if (
      searchIsRestricted(enteredText)
    ) {
      openModal("blockedModal");

      searchInput.blur();

      searchInput.value = "";

      state.searchQuery = "";

      animateDynamicIsland(
        "Restricted search blocked"
      );

      renderFood();

      return;
    }

    state.searchQuery =
      enteredText
        .toLowerCase()
        .trim();

    state.dealsOnly = false;

    renderFood();
  }
);

getElement("clearSearch")
  .addEventListener("click", () => {
    searchInput.value = "";

    state.searchQuery = "";

    renderFood();
  });

getElement("closeBlockedModal")
  .addEventListener("click", () => {
    closeModal("blockedModal");
  });

/* =========================================================
   PRODUCT FILTERING
========================================================= */

function productHasDeal(product) {
  return Boolean(
    product.bogo ||
    product.discount
  );
}

function getFilteredProducts() {
  return products.filter((product) => {
    const restaurant =
      getRestaurant(
        product.restaurantId
      );

    const matchesCategory =
      state.selectedCategory === "All" ||
      product.category ===
        state.selectedCategory;

    const matchesRestaurant =
      state.selectedRestaurant === "All" ||
      product.restaurantId ===
        state.selectedRestaurant;

    const searchableText = [
      product.name,
      product.category,
      restaurant.name,
      restaurant.cuisine
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      searchableText.includes(
        state.searchQuery
      );

    const matchesDeals =
      !state.dealsOnly ||
      productHasDeal(product);

    return (
      matchesCategory &&
      matchesRestaurant &&
      matchesSearch &&
      matchesDeals
    );
  });
}

/* =========================================================
   FOOD DISPLAY
========================================================= */

function createDealLabel(product) {
  if (product.bogo) {
    return "BOGO";
  }

  if (product.discount) {
    return `${Math.round(
      product.discount * 100
    )}% OFF`;
  }

  return "";
}

function renderFood() {
  const filteredProducts =
    getFilteredProducts();

  if (state.dealsOnly) {
    menuTitle.textContent =
      "Student deals";
  } else if (state.searchQuery) {
    menuTitle.textContent =
      "Search results";
  } else if (
    state.selectedRestaurant !== "All"
  ) {
    menuTitle.textContent =
      getRestaurant(
        state.selectedRestaurant
      ).name;
  } else if (
    state.selectedCategory !== "All"
  ) {
    menuTitle.textContent =
      state.selectedCategory;
  } else {
    menuTitle.textContent =
      "Popular near you";
  }

  resultCount.textContent =
    `${filteredProducts.length} item${
      filteredProducts.length === 1
        ? ""
        : "s"
    } available`;

  if (filteredProducts.length === 0) {
    foodGrid.innerHTML = `
      <div class="no-results">
        <span>🔎</span>

        <strong>No matching food found</strong>

        <p>
          Try another restaurant,
          category, or search.
        </p>
      </div>
    `;

    return;
  }

  foodGrid.innerHTML =
    filteredProducts
      .map((product) => {
        const restaurant =
          getRestaurant(
            product.restaurantId
          );

        const distance =
          calculateDistance(
            product.restaurantId,
            state.selectedAddress
          );

        const dealLabel =
          createDealLabel(product);

        return `
          <article class="food-card">

            <div class="food-image">
              ${product.emoji}
            </div>

            <button
              class="add-food-button"
              data-add-product="${product.id}"
              aria-label="Add ${product.name}"
            >
              +
            </button>

            <div class="food-information">

              <h3 title="${product.name}">
                ${product.name}
              </h3>

              <div class="restaurant-name">
                ${restaurant.name}
              </div>

              <div class="food-meta">
                <span>
                  ${restaurant.rating} ★
                </span>

                <span>
                  ${distance.toFixed(1)} mi
                </span>
              </div>

              <div class="food-bottom">
                <span class="food-price">
                  ${formatMoney(product.price)}
                </span>

                ${
                  dealLabel
                    ? `
                      <span class="deal-badge">
                        ${dealLabel}
                      </span>
                    `
                    : ""
                }
              </div>
            </div>
          </article>
        `;
      })
      .join("");
}

foodGrid.addEventListener(
  "click",
  (event) => {
    const addButton =
      event.target.closest(
        "[data-add-product]"
      );

    if (!addButton) {
      return;
    }

    addProductToCart(
      Number(
        addButton.dataset.addProduct
      )
    );
  }
);

/* =========================================================
   GENERAL RENDER
========================================================= */

function renderApplication() {
  renderCategories();
  renderRestaurants();
  renderFood();
  updateCartBadge();
}

/* =========================================================
   MENU AND DEAL BUTTONS
========================================================= */

function scrollToMenu() {
  const appBody =
    getElement("appBody");

  const menuSection =
    getElement("menuSection");

  appBody.scrollTo({
    top:
      menuSection.offsetTop - 145,
    behavior: "smooth"
  });
}

getElement("browseButton")
  .addEventListener("click", scrollToMenu);

getElement("showDealsButton")
  .addEventListener("click", () => {
    state.dealsOnly = true;

    state.selectedCategory = "All";
    state.selectedRestaurant = "All";
    state.searchQuery = "";

    searchInput.value = "";

    renderApplication();
    scrollToMenu();
  });

getElement("dealsNavigation")
  .addEventListener("click", () => {
    state.dealsOnly = true;

    state.selectedCategory = "All";
    state.selectedRestaurant = "All";
    state.searchQuery = "";

    searchInput.value = "";

    renderApplication();
    scrollToMenu();
  });

getElement("showAllButton")
  .addEventListener("click", () => {
    state.selectedCategory = "All";
    state.selectedRestaurant = "All";
    state.searchQuery = "";
    state.dealsOnly = false;

    searchInput.value = "";

    renderApplication();
  });

getElement("homeNavigation")
  .addEventListener("click", () => {
    state.dealsOnly = false;

    getElement("appBody").scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

/* =========================================================
   CART
========================================================= */

function getCartRestaurantId() {
  if (state.cart.length === 0) {
    return null;
  }

  const firstProduct =
    getProduct(state.cart[0].productId);

  return firstProduct.restaurantId;
}

function addProductToCart(productId) {
  const selectedProduct =
    getProduct(productId);

  const existingRestaurantId =
    getCartRestaurantId();

  if (
    existingRestaurantId &&
    existingRestaurantId !==
      selectedProduct.restaurantId
  ) {
    const existingRestaurant =
      getRestaurant(
        existingRestaurantId
      );

    const newRestaurant =
      getRestaurant(
        selectedProduct.restaurantId
      );

    const replaceCart =
      window.confirm(
        `Your cart currently contains items from ${existingRestaurant.name}.\n\nStart a new order from ${newRestaurant.name}?`
      );

    if (!replaceCart) {
      return;
    }

    state.cart = [];
  }

  const existingCartItem =
    state.cart.find(
      (cartItem) =>
        cartItem.productId === productId
    );

  if (existingCartItem) {
    existingCartItem.quantity += 1;
  } else {
    state.cart.push({
      productId,
      quantity: 1
    });
  }

  updateCartBadge();

  showToast(
    `${selectedProduct.name} added`
  );

  animateDynamicIsland(
    `Added • ${formatMoney(
      selectedProduct.price
    )}`
  );
}

function getTotalCartQuantity() {
  return state.cart.reduce(
    (total, cartItem) =>
      total + cartItem.quantity,
    0
  );
}

function updateCartBadge() {
  const quantity =
    getTotalCartQuantity();

  cartBadge.textContent = quantity;

  cartBadge.style.display =
    quantity > 0
      ? "grid"
      : "none";
}

function changeCartQuantity(
  productId,
  amount
) {
  const cartItem =
    state.cart.find(
      (item) =>
        item.productId === productId
    );

  if (!cartItem) {
    return;
  }

  cartItem.quantity += amount;

  if (cartItem.quantity <= 0) {
    state.cart =
      state.cart.filter(
        (item) =>
          item.productId !== productId
      );
  }

  updateCartBadge();
  renderCart();
}

/* =========================================================
   CART PRICE CALCULATIONS
========================================================= */

function cartContainsLiquid() {
  return state.cart.some((cartItem) => {
    const product =
      getProduct(cartItem.productId);

    return product.liquid;
  });
}

function calculateCartPrices() {
  let subtotal = 0;
  let discount = 0;

  state.cart.forEach((cartItem) => {
    const product =
      getProduct(cartItem.productId);

    const itemTotal =
      product.price *
      cartItem.quantity;

    subtotal += itemTotal;

    /*
      Regular percentage discount.
    */
    if (product.discount) {
      discount +=
        itemTotal *
        product.discount;
    }

    /*
      Buy one, get one free.
      Every second identical product is free.
    */
    if (product.bogo) {
      const freeQuantity =
        Math.floor(
          cartItem.quantity / 2
        );

      discount +=
        freeQuantity *
        product.price;
    }
  });

  const restaurantId =
    getCartRestaurantId();

  const distance =
    restaurantId
      ? calculateDistance(
          restaurantId,
          state.selectedAddress
        )
      : 0;

  let deliveryFee = 0;
  let deliveryMinutes = 0;

  if (state.deliveryMode === "scheduled") {
    deliveryFee =
      Math.max(
        1.49,
        0.85 + distance * 0.55
      );

    deliveryMinutes =
      state.scheduleMinutes;
  }

  if (state.deliveryMode === "regular") {
    deliveryFee =
      Math.max(
        2.49,
        1.5 + distance * 1.1
      );

    deliveryMinutes =
      Math.round(
        20 + distance * 5
      );
  }

  if (state.deliveryMode === "priority") {
    deliveryFee =
      Math.max(
        4.49,
        3.25 + distance * 1.55
      );

    deliveryMinutes =
      Math.round(
        12 + distance * 3.5
      );
  }

  const discountedSubtotal =
    Math.max(
      0,
      subtotal - discount
    );

  const serviceFee =
    Math.max(
      1.49,
      discountedSubtotal * 0.08
    );

  const packagingFee =
    cartContainsLiquid() &&
    state.spillProtection
      ? 1.49
      : 0;

  /*
    Simplified project tax:
    tax applies to the discounted product subtotal
    and optional packaging.
  */
  const taxableAmount =
    discountedSubtotal +
    packagingFee;

  const salesTax =
    taxableAmount *
    CALIFORNIA_TAX_RATE;

  const tip = state.tip;

  const total =
    discountedSubtotal +
    serviceFee +
    deliveryFee +
    packagingFee +
    salesTax +
    tip;

  return {
    subtotal,
    discount,
    discountedSubtotal,
    serviceFee,
    deliveryFee,
    packagingFee,
    salesTax,
    tip,
    total,
    distance,
    deliveryMinutes
  };
}

/* =========================================================
   SCHEDULED DELIVERY SLOTS
========================================================= */

function createScheduleSlots() {
  const scheduleOptions = [
    45,
    60,
    90,
    120
  ];

  getElement("scheduleSelect")
    .innerHTML =
    scheduleOptions
      .map((minutes) => {
        const slotTime =
          formatCentralTime(
            futureTime(minutes)
          );

        return `
          <option value="${minutes}">
            ${slotTime} CT
            — approximately ${minutes} minutes
          </option>
        `;
      })
      .join("");

  getElement("scheduleSelect").value =
    String(state.scheduleMinutes);
}

/* =========================================================
   DISPLAY CART
========================================================= */

function renderCart() {
  const cartItemsElement =
    getElement("cartItems");

  if (state.cart.length === 0) {
    cartItemsElement.innerHTML = `
      <div class="no-results">
        <span>🛒</span>

        <strong>Your cart is empty</strong>

        <p>
          Add an item before checking out.
        </p>
      </div>
    `;

    getElement(
      "cartRestaurantName"
    ).textContent = "YOUR ORDER";
  } else {
    const restaurant =
      getRestaurant(
        getCartRestaurantId()
      );

    getElement(
      "cartRestaurantName"
    ).textContent =
      restaurant.name.toUpperCase();

    cartItemsElement.innerHTML =
      state.cart
        .map((cartItem) => {
          const product =
            getProduct(
              cartItem.productId
            );

          return `
            <div class="cart-item">

              <div class="cart-item-emoji">
                ${product.emoji}
              </div>

              <div class="cart-item-information">
                <strong>
                  ${product.name}
                </strong>

                <small>
                  ${formatMoney(product.price)}
                  each
                </small>
              </div>

              <div class="quantity-controls">

                <button
                  data-decrease-product="${product.id}"
                >
                  −
                </button>

                <span>
                  ${cartItem.quantity}
                </span>

                <button
                  data-increase-product="${product.id}"
                >
                  +
                </button>
              </div>
            </div>
          `;
        })
        .join("");
  }

  getElement("cartAddressSelect").value =
    state.selectedAddress;

  getElement("cartAddressDetails").value =
    state.addressDetails;

  getElement("tipSelect").value =
    String(state.tip);

  getElement(
    "spillProtectionCheckbox"
  ).checked =
    state.spillProtection;

  document
    .querySelectorAll(
      'input[name="deliveryMode"]'
    )
    .forEach((radioButton) => {
      radioButton.checked =
        radioButton.value ===
        state.deliveryMode;
    });

  const containsLiquid =
    cartContainsLiquid();

  getElement("liquidProtection")
    .classList.toggle(
      "hidden",
      !containsLiquid
    );

  getElement("scheduleContainer")
    .classList.toggle(
      "hidden",
      state.deliveryMode !==
        "scheduled"
    );

  createScheduleSlots();
  updateCheckoutSummary();
}

getElement("cartItems")
  .addEventListener("click", (event) => {
    const decreaseButton =
      event.target.closest(
        "[data-decrease-product]"
      );

    const increaseButton =
      event.target.closest(
        "[data-increase-product]"
      );

    if (decreaseButton) {
      changeCartQuantity(
        Number(
          decreaseButton.dataset
            .decreaseProduct
        ),
        -1
      );
    }

    if (increaseButton) {
      changeCartQuantity(
        Number(
          increaseButton.dataset
            .increaseProduct
        ),
        1
      );
    }
  });

/* =========================================================
   UPDATE CHECKOUT SUMMARY
========================================================= */

function updateCheckoutSummary() {
  const prices =
    calculateCartPrices();

  getElement("subtotalAmount")
    .textContent =
    formatMoney(prices.subtotal);

  getElement("discountAmount")
    .textContent =
    `-${formatMoney(
      prices.discount
    )}`;

  getElement("serviceFeeAmount")
    .textContent =
    formatMoney(prices.serviceFee);

  getElement("deliveryFeeAmount")
    .textContent =
    formatMoney(prices.deliveryFee);

  getElement("packagingAmount")
    .textContent =
    formatMoney(prices.packagingFee);

  getElement("taxAmount")
    .textContent =
    formatMoney(prices.salesTax);

  getElement("tipAmount")
    .textContent =
    formatMoney(prices.tip);

  getElement("totalAmount")
    .textContent =
    formatMoney(prices.total);

  const etaDate =
    futureTime(
      prices.deliveryMinutes
    );

  getElement("checkoutEta")
    .textContent =
    `${formatCentralTime(etaDate)} CT`;

  getElement("checkoutDistance")
    .textContent =
    `${prices.distance.toFixed(
      1
    )} miles • approximately ${
      prices.deliveryMinutes
    } minutes`;
}

/* =========================================================
   CART INPUT EVENTS
========================================================= */

getElement("cartButton")
  .addEventListener("click", () => {
    renderCart();
    openModal("cartModal");
  });

getElement("closeCartModal")
  .addEventListener("click", () => {
    closeModal("cartModal");
  });

getElement("cartAddressSelect")
  .addEventListener("change", (event) => {
    state.selectedAddress =
      event.target.value;

    updateAddressDisplay();
    renderRestaurants();
    updateCheckoutSummary();
  });

getElement("cartAddressDetails")
  .addEventListener("input", (event) => {
    state.addressDetails =
      event.target.value;
  });

document
  .querySelectorAll(
    'input[name="deliveryMode"]'
  )
  .forEach((radioButton) => {
    radioButton.addEventListener(
      "change",
      (event) => {
        state.deliveryMode =
          event.target.value;

        getElement(
          "scheduleContainer"
        ).classList.toggle(
          "hidden",
          state.deliveryMode !==
            "scheduled"
        );

        updateCheckoutSummary();
      }
    );
  });

getElement("scheduleSelect")
  .addEventListener("change", (event) => {
    state.scheduleMinutes =
      Number(event.target.value);

    updateCheckoutSummary();
  });

getElement("spillProtectionCheckbox")
  .addEventListener("change", (event) => {
    state.spillProtection =
      event.target.checked;

    updateCheckoutSummary();
  });

getElement("tipSelect")
  .addEventListener("change", (event) => {
    state.tip =
      Number(event.target.value);

    updateCheckoutSummary();
  });

/* =========================================================
   PLACE ORDER
========================================================= */

getElement("placeOrderButton")
  .addEventListener("click", () => {
    if (state.cart.length === 0) {
      showToast(
        "Add an item before ordering"
      );

      return;
    }

    const prices =
      calculateCartPrices();

    const rider =
      randomArrayItem(riders);

    const orderNumber =
      randomOrderNumber();

    const handoffCode =
      randomFourDigitCode();

    const restaurant =
      getRestaurant(
        getCartRestaurantId()
      );

    const estimatedArrival =
      futureTime(
        prices.deliveryMinutes
      );

    state.activeOrder = {
      orderNumber,
      handoffCode,

      rider,
      restaurant,

      destination:
        state.selectedAddress,

      destinationDetails:
        state.addressDetails,

      deliveryMode:
        state.deliveryMode,

      distance:
        prices.distance,

      estimatedMinutes:
        prices.deliveryMinutes,

      estimatedArrival,

      total:
        prices.total,

      trackingStep: 0,

      currentStatus:
        "Order confirmed",

      currentLocation:
        `${restaurant.name}`
    };

    /*
      Preserve the order information before clearing the cart.
    */
    const orderedQuantity =
      getTotalCartQuantity();

    state.cart = [];

    updateCartBadge();

    closeModal("cartModal");

    getElement(
      "orderConfirmationText"
    ).textContent =
      `${orderedQuantity} item${
        orderedQuantity === 1
          ? ""
          : "s"
      } from ${restaurant.name} will be delivered to ${state.selectedAddress}.`;

    getElement(
      "confirmationDriver"
    ).textContent =
      rider.name;

    getElement(
      "confirmationPhone"
    ).textContent =
      rider.phone;

    getElement(
      "confirmationEta"
    ).textContent =
      `${formatCentralTime(
        estimatedArrival
      )} CT`;

    getElement(
      "confirmationCode"
    ).textContent =
      handoffCode;

    openModal("orderModal");

    addDeliveryNotification(
      "Order confirmed",
      `${restaurant.name} received your order.`
    );

    animateDynamicIsland(
      `Order ${orderNumber} confirmed`
    );

    startLiveTracking();
  });

/* =========================================================
   ORDER CONFIRMATION
========================================================= */

getElement("trackOrderButton")
  .addEventListener("click", () => {
    closeModal("orderModal");

    showTrackingSection();

    getElement("ordersButton")
      .click();
  });

/* =========================================================
   TRACKING DISPLAY
========================================================= */

function showTrackingSection() {
  if (!state.activeOrder) {
    showToast(
      "You do not have an active order"
    );

    return;
  }

  getElement("trackingSection")
    .classList.remove("hidden");

  renderTrackingInformation();
}

function renderTrackingInformation() {
  const order =
    state.activeOrder;

  if (!order) {
    return;
  }

  getElement("trackingStatus")
    .textContent =
    order.currentStatus;

  getElement("trackingOrderNumber")
    .textContent =
    `#${order.orderNumber}`;

  getElement("trackingEta")
    .textContent =
    `${formatCentralTime(
      order.estimatedArrival
    )} CT`;

  const progressPercent =
    Math.min(
      100,
      order.trackingStep * 8.34
    );

  const simulatedRemaining =
    Math.max(
      0,
      Math.round(
        order.estimatedMinutes *
          (1 - progressPercent / 100)
      )
    );

  getElement("trackingRemaining")
    .textContent =
    order.currentStatus ===
    "Delivered"
      ? `Delivered at ${formatCentralTime(
          new Date()
        )} CT`
      : `Approximately ${simulatedRemaining} minutes remaining`;

  getElement("liveLocation")
    .textContent =
    order.currentLocation;

  getElement("lastUpdated")
    .textContent =
    `Updated ${formatCentralTime(
      new Date()
    )} CT`;

  getElement("trackingDriver")
    .textContent =
    order.rider.name;

  getElement("trackingPhone")
    .textContent =
    order.rider.phone;

  getElement("handoffCode")
    .textContent =
    order.handoffCode;

  getElement("trackingProgress")
    .style.width =
    `${progressPercent}%`;

  moveRiderMarker(progressPercent);
  renderNotifications();
}

/* =========================================================
   LIVE RIDER LOCATION
========================================================= */

const routeLocations = [
  "Rider assigned and reviewing route",
  "Traveling toward the restaurant",
  "Approaching the restaurant",
  "Waiting at restaurant pickup area",
  "Restaurant is packaging the order",
  "Food picked up from restaurant",
  "Leaving the restaurant",
  "Traveling along West End Avenue",
  "Entering Vanderbilt campus",
  "Passing a campus delivery checkpoint",
  "Approaching the selected building",
  "Outside the destination entrance",
  "Delivered"
];

function moveRiderMarker(progressPercent) {
  const marker =
    getElement("riderMarker");

  /*
    The map is approximately:
    330 pixels wide and 190 pixels tall.
  */
  const startX = 62;
  const endX = 275;

  const startY = 38;
  const endY = 135;

  const progress =
    progressPercent / 100;

  const x =
    startX +
    (endX - startX) *
      progress;

  /*
    Adds a curved movement instead of
    making the rider move in a straight line.
  */
  const curve =
    Math.sin(progress * Math.PI) *
    38;

  const y =
    startY +
    (endY - startY) *
      progress +
    curve;

  marker.style.left =
    `${x}px`;

  marker.style.top =
    `${Math.min(140, y)}px`;
}

/* =========================================================
   TRACKING NOTIFICATIONS
========================================================= */

function addDeliveryNotification(
  title,
  message
) {
  state.notifications.unshift({
    title,
    message,
    time: formatCentralTime(
      new Date()
    )
  });

  if (state.notifications.length > 8) {
    state.notifications.pop();
  }

  renderNotifications();
}

function renderNotifications() {
  const notificationList =
    getElement("notificationList");

  if (state.notifications.length === 0) {
    notificationList.innerHTML = `
      <p class="no-results">
        No updates yet.
      </p>
    `;

    return;
  }

  notificationList.innerHTML =
    state.notifications
      .map((notification) => {
        return `
          <div class="notification-item">
            <strong>
              ${notification.title}
            </strong>

            <time>
              ${notification.time} CT
            </time>

            <p>
              ${notification.message}
            </p>
          </div>
        `;
      })
      .join("");
}

/* =========================================================
   START LIVE TRACKING
========================================================= */

function startLiveTracking() {
  if (state.trackingTimer) {
    clearInterval(
      state.trackingTimer
    );
  }

  state.trackingTimer =
    setInterval(() => {
      const order =
        state.activeOrder;

      if (!order) {
        clearInterval(
          state.trackingTimer
        );

        return;
      }

      order.trackingStep += 1;

      const step =
        Math.min(
          order.trackingStep,
          routeLocations.length - 1
        );

      order.currentLocation =
        routeLocations[step];

      /*
        Important milestone notifications.
      */
      if (step === 2) {
        order.currentStatus =
          "Restaurant preparing your food";

        notifyUser(
          "Restaurant preparing order",
          `${order.restaurant.name} started preparing your food.`
        );
      }

      if (step === 4) {
        order.currentStatus =
          "Rider waiting at restaurant";

        notifyUser(
          "Rider reached restaurant",
          `${order.rider.name} is waiting for the order.`
        );
      }

      if (step === 5) {
        order.currentStatus =
          "Food picked up";

        notifyUser(
          "Food picked up",
          `${order.rider.name} picked up your sealed order.`
        );
      }

      if (step === 7) {
        order.currentStatus =
          "On the way";

        notifyUser(
          "Delivery is on the way",
          `The rider is traveling toward ${order.destination}.`
        );
      }

      if (step === 10) {
        order.currentStatus =
          "Rider is approximately two minutes away";

        notifyUser(
          "Rider is nearby",
          `Please prepare to meet the rider at ${order.destination}.`
        );
      }

      if (step >= 12) {
        order.currentStatus =
          "Delivered";

        order.currentLocation =
          `Arrived at ${order.destination}`;

        notifyUser(
          "Rider reached the destination",
          `Your order has arrived at ${order.destination}.`
        );

        clearInterval(
          state.trackingTimer
        );
      }

      renderTrackingInformation();
    }, TRACKING_UPDATE_MS);
}

function notifyUser(title, message) {
  addDeliveryNotification(
    title,
    message
  );

  animateDynamicIsland(title);
  showToast(message);
}

/* =========================================================
   ORDER NAVIGATION BUTTON
========================================================= */

getElement("ordersButton")
  .addEventListener("click", () => {
    if (!state.activeOrder) {
      showToast(
        "No active delivery"
      );

      return;
    }

    showTrackingSection();

    const appBody =
      getElement("appBody");

    const trackingSection =
      getElement("trackingSection");

    appBody.scrollTo({
      top:
        trackingSection.offsetTop - 140,
      behavior: "smooth"
    });
  });

/* =========================================================
   MESSAGE RIDER
========================================================= */

function renderMessages() {
  const chatMessages =
    getElement("chatMessages");

  if (state.messages.length === 0) {
    chatMessages.innerHTML = `
      <div class="chat-bubble rider-message">
        Hello! I am your Microbit Delivery rider.
        Send me any public-entrance or handoff instructions.
      </div>
    `;

    return;
  }

  chatMessages.innerHTML =
    state.messages
      .map((message) => {
        const messageClass =
          message.sender === "customer"
            ? "customer-message"
            : "rider-message";

        return `
          <div class="chat-bubble ${messageClass}">
            ${message.text}
          </div>
        `;
      })
      .join("");

  chatMessages.scrollTop =
    chatMessages.scrollHeight;
}

getElement("messageDriverButton")
  .addEventListener("click", () => {
    renderMessages();
    openModal("messageModal");
  });

getElement("closeMessageModal")
  .addEventListener("click", () => {
    closeModal("messageModal");
  });

getElement("sendMessageButton")
  .addEventListener("click", sendMessage);

getElement("messageInput")
  .addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

function sendMessage() {
  const input =
    getElement("messageInput");

  const message =
    input.value.trim();

  if (!message) {
    return;
  }

  state.messages.push({
    sender: "customer",
    text: message
  });

  input.value = "";

  renderMessages();

  /*
    Automatic rider response.
  */
  setTimeout(() => {
    let response =
      "Understood. I will follow those delivery instructions.";

    const lowercaseMessage =
      message.toLowerCase();

    if (
      lowercaseMessage.includes("outside") ||
      lowercaseMessage.includes("entrance")
    ) {
      response =
        "Got it. I will meet you outside the selected entrance.";
    }

    if (
      lowercaseMessage.includes("where") ||
      lowercaseMessage.includes("location")
    ) {
      response =
        `I am currently at ${state.activeOrder.currentLocation}.`;
    }

    if (
      lowercaseMessage.includes("late") ||
      lowercaseMessage.includes("delay")
    ) {
      response =
        "I am still moving toward you. The live ETA will update automatically.";
    }

    state.messages.push({
      sender: "rider",
      text: response
    });

    renderMessages();

    animateDynamicIsland(
      "New message from rider"
    );
  }, 1200);
}

/* =========================================================
   REPORT A PROBLEM
========================================================= */

getElement("reportProblemButton")
  .addEventListener("click", () => {
    openModal("reportModal");
  });

getElement("closeReportModal")
  .addEventListener("click", () => {
    closeModal("reportModal");
  });

getElement("submitReportButton")
  .addEventListener("click", () => {
    const problem =
      getElement("problemSelect").value;

    const details =
      getElement("problemDetails")
        .value
        .trim();

    closeModal("reportModal");

    getElement("problemDetails").value =
      "";

    addDeliveryNotification(
      "Support report submitted",
      details
        ? `${problem}: ${details}`
        : problem
    );

    animateDynamicIsland(
      "Support report submitted"
    );

    showToast(
      "Support received your report"
    );
  });

/* =========================================================
   MODAL HELPERS
========================================================= */

function openModal(modalId) {
  getElement(modalId)
    .classList.add("open");
}

function closeModal(modalId) {
  getElement(modalId)
    .classList.remove("open");
}

/*
  Close a modal when the user clicks
  the dark area outside of it.
*/
document
  .querySelectorAll(".modal-backdrop")
  .forEach((modalBackdrop) => {
    modalBackdrop.addEventListener(
      "click",
      (event) => {
        if (
          event.target === modalBackdrop
        ) {
          modalBackdrop.classList.remove(
            "open"
          );
        }
      }
    );
  });

/* =========================================================
   INITIAL APPLICATION START
========================================================= */

renderApplication();
