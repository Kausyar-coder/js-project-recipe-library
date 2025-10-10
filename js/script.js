/*
---------------------------------------
| APP JS (single file, cleaned & fixed)
| Comments are in English
---------------------------------------
*/

/* ==========================
   DOM REFERENCES / BUTTONS
   ========================== */
const filterItems = document.querySelectorAll(".filter__item");

const mainCoffee = document.querySelector(".main-coffee");
const mainJuice = document.querySelector(".main-juice");
const mainTea = document.querySelector(".main-tea");
const mainFavorites = document.querySelector(".main-favorites");

const containerCoffee = document.getElementById("coffee-container");
const containerJuice = document.getElementById("juice-container");
const containerTea = document.getElementById("tea-container");
const containerFavorites = document.getElementById("favorites-container");

const buttonCoffee = document.getElementById("button-coffee");
const buttonJuice = document.getElementById("button-juice");
const buttonTea = document.getElementById("button-tea");
const buttonFavorites = document.querySelectorAll(".button-favorites");
const buttons = [buttonCoffee, buttonJuice, buttonTea, ...buttonFavorites];

/* ==========================
   GLOBALS / CONFIG
   ========================== */
// IMPORTANT: do NOT keep your real key in the browser in production.
// Point to a secure backend proxy that injects the Spoonacular key server-side.
const SPOON_BASE = "https://api.spoonacular.com";
const API_KEY = "YOUR_BACKEND_PROXY_KEY"; // replace with your proxy if you have one

// LocalStorage keys
const LS_COFFEE = "coffeeData";
const LS_JUICE = "juiceData";
const LS_FAVORITES = "favorites";

// Render flags
let coffeeRendered = false;
let juiceRendered = false;

// Favorites state
let favorites = [];

/* ==========================
   UTILITIES
   ========================== */
function setActiveButton(activeBtn) {
  buttons.filter(Boolean).forEach((btn) => btn.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function guessCuisineFromTitle(title = "") {
  const t = title.toLowerCase();
  if (/ital|spaghe|lasagn|risott|pesto/.test(t)) return ["italian"];
  if (
    /asian|thai|japan|sushi|ramen|udon|pho|kimchi|korean|chinese|indian/.test(t)
  )
    return ["asian"];
  if (/middle\s*east|arab|leban|turk|shawarma|hummus|falafel|persian/.test(t))
    return ["middle eastern"];
  return ["other"];
}

function fetchJSON(url) {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}

function cacheSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function cacheGet(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function ensureFavoritesLoaded() {
  try {
    const data = JSON.parse(localStorage.getItem(LS_FAVORITES) || "[]");
    favorites = Array.isArray(data) ? data : [];
  } catch {
    favorites = [];
  }
}

// Which section is visible right now?
function getCurrentCategory() {
  if (mainCoffee && !mainCoffee.classList.contains("hidden")) return "coffee";
  if (mainJuice && !mainJuice.classList.contains("hidden")) return "juice";
  if (mainTea && !mainTea.classList.contains("hidden")) return "tea";
  return "coffee";
}

/* ==========================
   STARTUP
   ========================== */
window.addEventListener("DOMContentLoaded", () => {
  setActiveButton(buttonCoffee);
  mainJuice?.classList.add("hidden");
  mainTea?.classList.add("hidden");
  mainFavorites?.classList.add("hidden");

  ensureFavoritesLoaded();
  renderFavorites();

  renderCoffeeCards();
  renderJuiceCards();
});

buttonCoffee?.addEventListener("click", () => {
  mainCoffee?.classList.remove("hidden");
  mainJuice?.classList.add("hidden");
  mainTea?.classList.add("hidden");
  mainFavorites?.classList.add("hidden");
  setActiveButton(buttonCoffee);
});

buttonJuice?.addEventListener("click", () => {
  mainCoffee?.classList.add("hidden");
  mainJuice?.classList.remove("hidden");
  mainTea?.classList.add("hidden");
  mainFavorites?.classList.add("hidden");
  setActiveButton(buttonJuice);
});

buttonTea?.addEventListener("click", () => {
  mainCoffee?.classList.add("hidden");
  mainJuice?.classList.add("hidden");
  mainTea?.classList.remove("hidden");
  mainFavorites?.classList.add("hidden");
  setActiveButton(buttonTea);
});

buttonFavorites.forEach((btn) => {
  btn.addEventListener("click", () => {
    mainCoffee?.classList.add("hidden");
    mainJuice?.classList.add("hidden");
    mainTea?.classList.add("hidden");
    mainFavorites?.classList.remove("hidden");
    setActiveButton(btn);
  });
});

/* ==========================
   RENDER: COFFEE
   ========================== */
async function renderCoffeeCards() {
  if (coffeeRendered) return;
  coffeeRendered = true;
  containerCoffee && (containerCoffee.innerHTML = "");

  try {
    const url = `${SPOON_BASE}/recipes/complexSearch?query=coffee&type=dessert&addRecipeInformation=true&number=10&apiKey=${API_KEY}`;
    const data = await fetchJSON(url);
    const arr = data.results || [];
    if (!arr.length) throw new Error("No coffee results");
    cacheSet(LS_COFFEE, arr);
    arr.forEach(addCoffeeCard);
  } catch {
    const cached = cacheGet(LS_COFFEE);
    if (Array.isArray(cached) && cached.length) cached.forEach(addCoffeeCard);
    else showEmptyCoffeeCard();
  }
}

function addCoffeeCard(r) {
  const cuisines = (
    r.cuisines?.length ? r.cuisines : guessCuisineFromTitle(r.title)
  ).map((c) => String(c).toLowerCase());

  const card = document.createElement("div");
  card.classList.add("cards__coffee-card");
  card.dataset.id = String(r.id);
  card.dataset.cuisine = cuisines.join("|");
  card.dataset.cooking = String(r.readyInMinutes ?? "0"); // used for speed sort
  card.dataset.popularity = String(r.aggregateLikes ?? 0);

  card.innerHTML = `
    <img src="${r.image}" alt="${r.title}" class="cards__coffee-card__img">
    <h2 class="cards__coffee-card__title">${r.title}</h2>
    <span class="divider"></span>
    <div>
      <p class="cards__coffee-card__meta"><span class="text-bold">Cuisine:</span> ${cuisines.join(
        ", "
      )}</p>
      <p class="cards__coffee-card__time"><span class="text-bold">Cooking time:</span> ${
        r.readyInMinutes ?? "N/A"
      } min</p>
      <p class="cards__coffee-card__time"><span class="text-bold">Popularity:</span> ${
        r.aggregateLikes ?? 0
      }</p>
    </div>
    <span class="divider"></span>
    <div>
      <h3 class="cards__coffee-card__subtitle">Ingredients:</h3>
      <ul class="cards__coffee-card__ingredients">
        ${
          r.extendedIngredients?.map((i) => `<li>${i.name}</li>`).join("") ?? ""
        }
      </ul>
    </div>
  `;

  if (favorites.some((f) => f.id === String(r.id)))
    card.classList.add("active");
  card.addEventListener("click", () => toggleFavoriteCard(card));
  containerCoffee?.appendChild(card);
}

function showEmptyCoffeeCard() {
  const emptyCard = document.createElement("div");
  emptyCard.classList.add("cards__coffee-card", "empty-card");
  emptyCard.innerHTML = `
    <div class="empty-card__box">
      <h2>🍰 Oops! API limit reached 😅</h2>
      <p>Looks like we’ve hit the maximum number of requests for today. Try again later or use local recipes!</p>
    </div>
  `;
  containerCoffee?.appendChild(emptyCard);
}

/* ==========================
   RENDER: JUICE (Desserts)
   ========================== */
async function renderJuiceCards() {
  if (juiceRendered) return;
  juiceRendered = true;
  containerJuice && (containerJuice.innerHTML = "");

  try {
    const url = `${SPOON_BASE}/recipes/complexSearch?query=dessert&type=dessert&addRecipeInformation=true&number=10&apiKey=${API_KEY}`;
    const data = await fetchJSON(url);
    const arr = data.results || [];
    if (!arr.length) throw new Error("No dessert results");
    cacheSet(LS_JUICE, arr);
    arr.forEach(addJuiceCard);
  } catch {
    const cached = cacheGet(LS_JUICE);
    if (Array.isArray(cached) && cached.length) cached.forEach(addJuiceCard);
    else showEmptyJuiceCard();
  }
}

function addJuiceCard(r) {
  const cuisines = (
    r.cuisines?.length ? r.cuisines : guessCuisineFromTitle(r.title)
  ).map((c) => String(c).toLowerCase());

  const card = document.createElement("div");
  card.classList.add("cards__juice-card");
  card.dataset.id = String(r.id);
  card.dataset.cuisine = cuisines.join("|");
  card.dataset.cooking = String(r.readyInMinutes ?? "0");
  card.dataset.popularity = String(r.aggregateLikes ?? 0);

  card.innerHTML = `
    <img src="${r.image}" alt="${r.title}" class="cards__juice-card__img">
    <h2 class="cards__juice-card__title">${r.title}</h2>
    <span class="divider"></span>
    <div>
      <p class="cards__juice-card__meta"><span class="text-bold">Cuisine:</span> ${cuisines.join(
        ", "
      )}</p>
      <p class="cards__juice-card__time"><span class="text-bold">Cooking time:</span> ${
        r.readyInMinutes ?? "N/A"
      } min</p>
      <p class="cards__juice-card__time"><span class="text-bold">Popularity:</span> ${
        r.aggregateLikes ?? 0
      }</p>
    </div>
    <span class="divider"></span>
    <div>
      <h3 class="cards__juice-card__subtitle">Ingredients:</h3>
      <ul class="cards__juice-card__ingredients">
        ${
          r.extendedIngredients?.map((i) => `<li>${i.name}</li>`).join("") ?? ""
        }
      </ul>
    </div>
  `;

  if (favorites.some((f) => f.id === String(r.id)))
    card.classList.add("active");
  card.addEventListener("click", () => toggleFavoriteCard(card));
  containerJuice?.appendChild(card);
}

function showEmptyJuiceCard() {
  const emptyCard = document.createElement("div");
  emptyCard.classList.add("cards__juice-card", "empty-card");
  emptyCard.innerHTML = `
    <div class="empty-card__box">
      <h2>🍰 Oops! API limit reached 😅</h2>
      <p>Looks like we’ve hit the maximum number of requests for today. Try again later or use local recipes!</p>
    </div>
  `;
  containerJuice?.appendChild(emptyCard);
}

/* ==========================
   FAVORITES (save / render / toggle)
   ========================== */
function toggleFavoriteCard(cardEl) {
  const recipeId = String(cardEl.dataset.id || "");
  if (!recipeId) {
    console.warn("No data-id on card");
    return;
  }

  const index = favorites.findIndex((f) => f.id === recipeId);

  if (index === -1) {
    favorites.push({
      id: recipeId,
      innerHTML: cardEl.innerHTML,
      className: cardEl.className,
    });
    cardEl.classList.add("active");
  } else {
    favorites.splice(index, 1);
    cardEl.classList.remove("active");
  }

  localStorage.setItem(LS_FAVORITES, JSON.stringify(favorites));
  renderFavorites();
}

function renderFavorites() {
  if (!containerFavorites) return;

  containerFavorites.innerHTML = "";
  if (!favorites.length) {
    containerFavorites.innerHTML = "<p>No favorites yet 💔</p>";
    return;
  }

  favorites.forEach((f) => {
    const favCard = document.createElement("div");
    favCard.className = f.className;
    favCard.innerHTML = f.innerHTML;
    favCard.dataset.id = String(f.id);
    favCard.addEventListener("click", () => toggleFavoriteCard(favCard));
    containerFavorites.appendChild(favCard);
  });
}

/* ==========================
   FILTERS / SORTING (single .filters block)
   ========================== */
let speedDescending = true;
let popularityDescending = true;

filterItems.forEach((item) => {
  item.addEventListener("click", async () => {
    const type = item.dataset.type; // 'cuisine', 'sort', etc.
    const value = item.dataset.value;

    // Visual "active" state inside the same <ul>
    item.parentElement
      ?.querySelectorAll(".filter__item")
      .forEach((li) => li.classList.remove("active"));
    item.classList.add("active");

    // Work against the currently visible category
    const category = getCurrentCategory();
    const container =
      category === "coffee"
        ? containerCoffee
        : category === "juice"
        ? containerJuice
        : containerTea;

    if (!container) return;

    // Sorting: speed -> by data-cooking
    if (type === "sort" && value === "speed") {
      speedDescending = !speedDescending;
      item.textContent = speedDescending ? "Descending" : "Ascending";
      sortCards(container, "cooking", speedDescending);
      return;
    }

    // Sorting: popularity -> by data-popularity
    if (type === "sort" && value === "popular") {
      popularityDescending = !popularityDescending;
      item.textContent = popularityDescending ? "More popular" : "Less popular";
      sortCards(container, "popularity", popularityDescending);
      return;
    }

    // Sorting: random -> fetch new random card for current category
    if (type === "sort" && value === "random") {
      await fetchRandomCard(category);
      return;
    }

    // Filtering: cuisine (pipe-separated) or generic
    filterCards(container, type, value);
  });
});

function filterCards(container, type, value) {
  const cards = container.querySelectorAll(
    ".cards__coffee-card, .cards__juice-card"
  );

  if (type === "cuisine") {
    const wanted = (value || "all").toLowerCase();
    cards.forEach((card) => {
      if (wanted === "all") {
        card.style.display = "";
        return;
      }
      const list = (card.dataset.cuisine || "")
        .toLowerCase()
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      card.style.display = list.includes(wanted) ? "" : "none";
    });
    return;
  }

  // Generic fallback (for future data-keys)
  cards.forEach((card) => {
    card.style.display =
      value === "all" || card.dataset[type] == value ? "" : "none";
  });
}

function sortCards(container, field, descending) {
  const cards = Array.from(
    container.querySelectorAll(".cards__coffee-card, .cards__juice-card")
  );
  cards.sort((a, b) => {
    const aVal = toNum(a.dataset[field]);
    const bVal = toNum(b.dataset[field]);
    return descending ? bVal - aVal : aVal - bVal;
  });
  cards.forEach((card) => container.appendChild(card));
}

/* ==========================
   RANDOM PICK (real random + fallbacks)
   ========================== */
function getCardById(container, id) {
  return (
    container?.querySelector(`[data-id="${CSS.escape(String(id))}"]`) || null
  );
}

function pickRandomFromStorage(storageKey) {
  try {
    const arr = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(arr) || !arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  } catch {
    return null;
  }
}

function pickRandomFromRendered(container) {
  const cards = container?.querySelectorAll(
    ".cards__coffee-card, .cards__juice-card"
  );
  if (!cards || !cards.length) return null;
  return cards[Math.floor(Math.random() * cards.length)];
}

async function fetchRandomCard(category) {
  const isCoffee = category === "coffee";
  const container = isCoffee ? containerCoffee : containerJuice; // tea not implemented for random
  if (!container) return;

  // 1) Try true random endpoint
  try {
    const tags = "dessert"; // since you said these are desserts
    const urlRandom = `${SPOON_BASE}/recipes/random?number=1&tags=${encodeURIComponent(
      tags
    )}&apiKey=${API_KEY}`;
    const j1 = await fetchJSON(urlRandom);
    const recipe = j1.recipes?.[0];
    if (recipe) {
      if (getCardById(container, recipe.id)) {
        getCardById(container, recipe.id).scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return;
      }
      isCoffee ? addCoffeeCard(recipe) : addJuiceCard(recipe);
      return;
    }
  } catch {}

  // 2) Fallback: complexSearch with random offset
  try {
    const query = isCoffee ? "coffee dessert" : "dessert";
    const headUrl = `${SPOON_BASE}/recipes/complexSearch?query=${encodeURIComponent(
      query
    )}&type=dessert&addRecipeInformation=true&number=1&apiKey=${API_KEY}`;
    const head = await fetchJSON(headUrl);
    const total = head.totalResults || 0;
    if (total > 0) {
      const capped = Math.min(total, 900);
      const offset = Math.floor(Math.random() * Math.max(capped - 1, 1));
      const pickUrl = `${SPOON_BASE}/recipes/complexSearch?query=${encodeURIComponent(
        query
      )}&type=dessert&addRecipeInformation=true&number=1&offset=${offset}&apiKey=${API_KEY}`;
      const pick = await fetchJSON(pickUrl);
      const recipe = pick.results?.[0];
      if (recipe) {
        if (getCardById(container, recipe.id)) {
          getCardById(container, recipe.id).scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          return;
        }
        isCoffee ? addCoffeeCard(recipe) : addJuiceCard(recipe);
        return;
      }
    }
  } catch {}

  // 3) Fallbacks: cache -> rendered
  const storageKey = isCoffee ? LS_COFFEE : LS_JUICE;
  const cached = pickRandomFromStorage(storageKey);
  if (cached) {
    if (!getCardById(container, cached.id)) {
      isCoffee ? addCoffeeCard(cached) : addJuiceCard(cached);
    } else {
      getCardById(container, cached.id).scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    return;
  }

  const rendered = pickRandomFromRendered(container);
  if (rendered) {
    rendered.classList.add("pulse"); // optional CSS animation if you add it
    setTimeout(() => rendered.classList.remove("pulse"), 800);
    rendered.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  // If absolutely nothing exists
  isCoffee ? showEmptyCoffeeCard() : showEmptyJuiceCard();
}
