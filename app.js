/* ============================================================
   Telegram App — инициализация
============================================================ */
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  try { tg.setHeaderColor?.('bg_color'); } catch {}
  try { tg.setBackgroundColor?.('bg_color'); } catch {}
}

if (tg?.initDataUnsafe?.user) {
  const u = tg.initDataUnsafe.user;
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ');
  const greetEl = document.getElementById('userGreeting');
  if (greetEl) greetEl.textContent = `Привет, ${name}! 👋`;
}

/* ============================================================
   URL прокси-воркера
============================================================ */
const ORDER_PROXY_URL = 'https://shopped-worker.tecnoakk10.workers.dev/order';
const ORDER_PROXY_CONFIGURED = !ORDER_PROXY_URL.includes('YOUR-WORKER');

/* Стоимость доставки, ₽ */
const DELIVERY_PRICE = 150;

/* ============================================================
   Хелперы
============================================================ */
const $ = (sel) => document.querySelector(sel);

function hapticImpact(style = 'light') { tg?.HapticFeedback?.impactOccurred?.(style); }
function hapticNotify(type = 'success') { tg?.HapticFeedback?.notificationOccurred?.(type); }
function hapticSelection() { tg?.HapticFeedback?.selectionChanged?.(); }

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

function plural(n, one, few, many) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

const fmtPrice = (n) => n.toLocaleString('ru-RU');

function scrollTop() {
  document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;
}

function formatPhone(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.startsWith('8')) digits = '7' + digits.slice(1);
  if (!digits.startsWith('7')) digits = '7' + digits;
  digits = digits.slice(0, 11);
  let out = '+7';
  if (digits.length > 1) out += ' ' + digits.slice(1, 4);
  if (digits.length > 4) out += ' ' + digits.slice(4, 7);
  if (digits.length > 7) out += '-' + digits.slice(7, 9);
  if (digits.length > 9) out += '-' + digits.slice(9, 11);
  return out;
}

const isPhoneValid = (phone) => String(phone || '').replace(/\D/g, '').length === 11;

/* ============================================================
   Категории и Товары
============================================================ */
const CATEGORIES = [
  { id: 'energy', name: 'Энергетики', icon: '⚡' },
  { id: 'pod',   name: 'Поды',  icon: '🚬' },
  { id: 'liq',   name: 'Жижи',  icon: '🧪' },
];

const PRODUCTS = [
  { id: 1, category: 'energy', title: 'Блю монстер', desc: 'тропик вайб для бедных', fullDesc: 'Кстати тропический вкус почти у всех энергетиков есть. Буквально почти у всех', price: 99, image: 'photos/energy/Blue-Monster.png' },
  { id: 2, category: 'energy', title: 'Черная пародия на редбулл', desc: 'дороже редбулла', fullDesc: 'У меня он дороже редбулла, говно(((', price: 1000, image: 'photos/energy/Classic-Monster.png' },
  { id: 3, category: 'energy', title: 'Розовый, но не для пидорасов', desc: 'Для пидорасов — белый', fullDesc: 'типа дахуя женственный цвет, хаха смешно типа', price: 333, image: 'photos/energy/Pink-Monster.png' },
  { id: 4, category: 'energy', title: 'О да папочка, бей меня сильнее', desc: 'ДИСКЛЕЙМЕР: ТОЛЬКО ДЛЯ ФЕМБОЕВ', fullDesc: 'Если вы хотите чтобы вас изнасиловали в подворотне', price: 6767, image: 'photos/energy/White-Monster.png' },
  { id: 5, category: 'liq', title: 'Iceberg', desc: 'Едимнственная нормальная', fullDesc: 'О боже, она такая нормальноотфотканная, необычная. Да ценник из-за этого выше', price: 9999, image: 'photos/liq/Iceberg.png' },
  { id: 6, category: 'liq', title: 'Красные', desc: 'Не, ну тут 2 красные', fullDesc: 'Реально, прикинь, 2 красные. Я сам ахуел', price: 666, image: 'photos/liq/krasniy.png' },
  { id: 7, category: 'liq', title: 'чё злые(', desc: 'Я хз, ии злая манашка', fullDesc: 'Я их баюсь((', price: 1488, image: 'photos/liq/5_zlih.png' },
  { id: 8, category: 'liq', title: 'Зелёные', desc: 'Тут реально зелёные', fullDesc: 'Ты не понял, тут РЕАЛЬНО зелёные', price: 777, image: 'photos/liq/zeleny.png' },
  { id: 9, category: 'liq', title: 'ЗЛАЯ монашка', desc: 'РЕАЛЬНО ЗЛАЯ МОНАШКА', fullDesc: 'ТИПА ТЫ НЕ ПОНЯЛ, ТУТ РЕАЛЬНО ЗЛАЯ МОНАШКА', price: 666666, image: 'photos/liq/zlaya.png' },
  { id: 10, category: 'liq', title: 'На что я трачу свою жизнь...', desc: 'Со вкусом экзистанциалього кризиса', fullDesc: 'Я заебался давать имена переменным. ХАХАХАА, цена 67', price: 67, image: 'photos/liq/och_zlaya.png' }
];

const PRODUCTS_BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));
const PRODUCTS_BY_CATEGORY = PRODUCTS.reduce((acc, p) => {
  (acc[p.category] ||= []).push(p);
  return acc;
}, {});

const getFullDescription = (p) => p.fullDesc || p.desc || '';
const getProduct = (id) => PRODUCTS_BY_ID.get(Number(id));

/* ============================================================
   Данные для оформления заказа
============================================================ */
const PICKUP_STATIONS = ['Комендантский проспект', 'Удельная', 'Пионерская'];
const PICKUP_STATIONS_SET = new Set(PICKUP_STATIONS);

const SPB_METRO_STATIONS = [
  "Автово", "Адмиралтейская", "Академическая", "Балтийская", "Бухарестская",
  "Василеостровская", "Владимирская", "Волковская", "Выборгская", "Горьковская",
  "Гостиный двор", "Гражданский проспект", "Девяткино", "Достоевская", "Елизаровская",
  "Звенигородская", "Зенит", "Кировский завод", "Комендантский проспект", "Крестовский остров",
  "Купчино", "Ладожская", "Ленинский проспект", "Лесная", "Лиговский проспект",
  "Ломоносовская", "Маяковская", "Международная", "Московская", "Московские ворота",
  "Нарвская", "Невский проспект", "Новочеркасская", "Обводный канал", "Обухово",
  "Озерки", "Парк Победы", "Парнас", "Петроградская", "Пионерская",
  "Площадь Александра Невского", "Площадь Восстания", "Площадь Ленина", "Площадь Мужества",
  "Политехническая", "Приморская", "Пролетарская", "Проспект Большевиков", "Проспект Ветеранов",
  "Проспект Просвещения", "Пушкинская", "Рыбацкое", "Садовая", "Сенная площадь",
  "Спасская", "Спортивная", "Старая Деревня", "Технологический институт", "Удельная",
  "Улица Дыбенко", "Фрунзенская", "Черная речка", "Чернышевская", "Чкаловская",
  "Электросила"
];
const SPB_METRO_SET = new Set(SPB_METRO_STATIONS);

/* ============================================================
   Корзина (localStorage)
============================================================ */
const STORAGE_KEY = 'mini-shop-cart';
let cart = loadCart();

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const clean = {};
    for (const [id, qty] of Object.entries(raw)) {
      const n = Math.floor(Number(qty));
      if (Number.isFinite(n) && n > 0 && PRODUCTS_BY_ID.has(Number(id))) {
        clean[id] = n;
      }
    }
    return clean;
  } catch { return {}; }
}

function saveCart() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
}

function addToCart(id) {
  if (!getProduct(id)) return;
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  updateCartUI();
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  updateCartUI();
  hapticSelection();
}

function getCartEntries() {
  const out = [];
  for (const [id, qty] of Object.entries(cart)) {
    const product = getProduct(id);
    if (product) out.push({ ...product, qty });
  }
  return out;
}

function getTotalPrice() {
  let total = 0;
  for (const [id, qty] of Object.entries(cart)) {
    const p = getProduct(id);
    if (p) total += p.price * qty;
  }
  return total;
}

function getTotalCount() {
  let count = 0;
  for (const [id, qty] of Object.entries(cart)) {
    if (PRODUCTS_BY_ID.has(Number(id))) count += qty;
  }
  return count;
}

/* ============================================================
   DOM-элементы
============================================================ */
const headerEl = $('#header');
const categoriesEl = $('#categories');
const catalogView = $('#catalogView');
const categoryView = $('#categoryView');
const categoryBack = $('#categoryBack');
const categoryTitleEl = $('#categoryTitle');
const categoryProductsEl = $('#categoryProducts');
const cartView = $('#cartView');
const cartItemsEl = $('#cartItems');
const cartEmptyEl = $('#cartEmpty');
const cartFooterEl = $('#cartFooter');
const totalPriceEl = $('#totalPrice');
const checkoutBtn = $('#checkoutBtn');
const cartBadge = $('#cartBadge');
const tabbar = $('#tabbar');
const tabCatalog = $('#tabCatalog');
const tabCart = $('#tabCart');
const detailView = $('#detailView');
const detailBack = $('#detailBack');
const detailImage = $('#detailImage');
const detailTitle = $('#detailTitle');
const detailDesc = $('#detailDesc');
const detailPrice = $('#detailPrice');
const detailAdd = $('#detailAdd');

const checkoutView = $('#checkoutView');
const successView = $('#successView');
const checkoutBack = $('#checkoutBack');
const dateScroll = $('#dateScroll');
const timeGrid = $('#timeGrid');
const metroInput = $('#metroInput');
const metroList = $('#metroList');
const metroError = $('#metroError');
const phoneInput = $('#phoneInput');
const phoneError = $('#phoneError');
const fromTelegramBtn = $('#fromTelegramBtn');
const commentInput = $('#commentInput');
const promoInput = $('#promoInput');
const applyPromoBtn = $('#applyPromoBtn');
const summaryItems = $('#summaryItems');
const summaryDelivery = $('#summaryDelivery');
const summaryTotal = $('#summaryTotal');
const confirmOrderBtn = $('#confirmOrderBtn');
const cancelOrderBtn = $('#cancelOrderBtn');
const orderNumberDisplay = $('#orderNumberDisplay');
const successDetails = $('#successDetails');
const successCloseBtn = $('#successCloseBtn');

const pickupBlock = $('#pickupBlock');
const deliveryBlock = $('#deliveryBlock');
const pickupStationsEl = $('#pickupStations');
/* Безопаснее: null-safe выборка через document (раньше могло упасть при null checkoutView) */
const deliveryPills = checkoutView
  ? checkoutView.querySelectorAll('[data-delivery]')
  : document.querySelectorAll('[data-delivery]');

/* ============================================================
   Состояние приложения
============================================================ */
let activeView = 'catalog';
let currentCategoryId = null;
let currentProductId = null;
let detailOrigin = 'catalog';

const checkoutState = {
  deliveryType: 'pickup',
  pickupStation: '',
  date: '',
  time: '',
  metro: '',
  phone: '',
  comment: '',
  promo: ''
};

/* ============================================================
   Кеш HTML-заготовок
============================================================ */
let metroDatalistCache = '';
function getMetroDatalist() {
  if (!metroDatalistCache) {
    metroDatalistCache = SPB_METRO_STATIONS
      .map((s) => `<option value="${escapeHtml(s)}">`)
      .join('');
  }
  return metroDatalistCache;
}

/* ============================================================
   Генераторы дат и времени
============================================================ */
function generateDates() {
  const dates = [];
  const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayNum = String(d.getDate()).padStart(2, '0');
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const dateStr = `${dayNum}.${monthNum}`;
    const dayName = i === 0 ? 'сегодня' : (i === 1 ? 'завтра' : days[d.getDay()]);
    dates.push({ date: dateStr, dayName, day: d.getDay() });
  }
  return dates;
}

function generateTimes(dayOfWeek) {
  const times = [];
  let endHour = 21;
  if (dayOfWeek === 5) endHour = 18;
  else if (dayOfWeek === 0) endHour = 20;

  for (let h = 16; h < endHour; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hourStr = String(h).padStart(2, '0');
      const minStr = String(m).padStart(2, '0');
      const nextHour = m === 30 ? h + 1 : h;
      const nextMin = m === 30 ? '00' : '30';
      times.push(`${hourStr}:${minStr} – ${String(nextHour).padStart(2, '0')}:${nextMin}`);
    }
  }
  return times;
}

function renderTimeGrid(dayOfWeek) {
  timeGrid.innerHTML = generateTimes(dayOfWeek).map((t) => `
    <button class="time-btn" data-time="${t}" type="button">${t}</button>
  `).join('');
  checkoutState.time = '';
}

/* ============================================================
   Переключение экранов
============================================================ */
const VIEWS = {
  catalog: catalogView,
  category: categoryView,
  cart: cartView,
  detail: detailView,
  checkout: checkoutView,
  success: successView
};

function showView(name) {
  for (const key in VIEWS) {
    const el = VIEWS[key];
    if (el) el.classList.toggle('hidden', key !== name);
  }
  activeView = name;
}

function setHeaderVisible(visible) { headerEl.classList.toggle('header--hidden', !visible); }

function setTabbarVisible(visible) {
  tabbar.classList.toggle('hidden', !visible);
  document.body.classList.toggle('no-tabbar', !visible);
}

function setActiveTab(tab) {
  const isCatalog = tab === 'catalog';
  tabCatalog.classList.toggle('active', isCatalog);
  tabCart.classList.toggle('active', !isCatalog);
}

/* ============================================================
   Шаблон карточки товара
============================================================ */
function productCardHTML(p) {
  const title = escapeHtml(p.title);
  const desc = escapeHtml(p.desc);
  const image = escapeHtml(p.image);
  const price = fmtPrice(p.price);
  return `
    <div class="product-card" data-id="${p.id}">
      <img src="${image}" alt="${title}" loading="lazy"
        onerror="this.style.background='rgba(128,128,128,.15)';this.alt='📷';this.removeAttribute('src');" />
      <div class="product-info">
        <div class="product-title">${title}</div>
        <div class="product-desc">${desc}</div>
        <div class="product-row">
          <div class="product-price">${price} ₽</div>
          <button class="add-btn" data-add="${p.id}" type="button" aria-label="Добавить в корзину">+</button>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   ГЛАВНОЕ МЕНЮ
============================================================ */
function renderCategories() {
  categoriesEl.innerHTML = CATEGORIES.map((cat) => {
    const count = (PRODUCTS_BY_CATEGORY[cat.id] || []).length;
    return `
      <div class="category-card" data-category="${cat.id}">
        <div class="category-card-info">
          <div class="category-card-name">${cat.icon} ${escapeHtml(cat.name)}</div>
          <div class="category-card-count">${count} ${plural(count, 'товар', 'товара', 'товаров')}</div>
        </div>
        <div class="category-card-arrow">→</div>
      </div>
    `;
  }).join('');
}

function showCatalog() {
  currentCategoryId = null;
  currentProductId = null;
  detailOrigin = 'catalog';
  showView('catalog');
  setTabbarVisible(true);
  setHeaderVisible(true);
  setActiveTab('catalog');
  scrollTop();
  tg?.BackButton?.hide?.();
}

categoriesEl.addEventListener('click', (e) => {
  const card = e.target.closest('.category-card');
  if (!card) return;
  openCategory(card.dataset.category);
  hapticImpact('light');
});

/* ============================================================
   АССОРТИМЕНТ КАТЕГОРИИ
============================================================ */
function renderCategoryProducts(categoryId) {
  const items = PRODUCTS_BY_CATEGORY[categoryId] || [];
  categoryProductsEl.innerHTML = items.length === 0
    ? `<div class="empty"><div class="empty-icon">📦</div><p>В этой категории пока нет товаров</p></div>`
    : items.map(productCardHTML).join('');
}

function openCategory(id, scrollToTop = true) {
  const cat = CATEGORIES.find((c) => c.id === id);
  if (!cat) return;
  currentCategoryId = id;
  categoryTitleEl.textContent = `${cat.icon} ${cat.name}`;
  renderCategoryProducts(id);
  showView('category');
  setTabbarVisible(true);
  setHeaderVisible(false);
  setActiveTab('catalog');
  if (scrollToTop) scrollTop();
  tg?.BackButton?.show?.();
}

function closeCategory() { showCatalog(); }
categoryBack.addEventListener('click', closeCategory);

categoryProductsEl.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-add]');
  if (addBtn) {
    addToCart(Number(addBtn.dataset.add));
    hapticImpact('light');
    return;
  }
  const card = e.target.closest('.product-card');
  if (card) openDetail(Number(card.dataset.id), 'category');
});

/* ============================================================
   ДЕТАЛЬНЫЙ ЭКРАН
============================================================ */
function renderDetail(p) {
  detailTitle.textContent = p.title;
  detailDesc.textContent = getFullDescription(p);
  detailPrice.textContent = fmtPrice(p.price) + ' ₽';
  detailImage.onerror = () => {
    detailImage.onerror = null;
    detailImage.removeAttribute('src');
    detailImage.alt = '📷';
    detailImage.style.background = 'rgba(128,128,128,.15)';
  };
  detailImage.style.background = '';
  detailImage.src = p.image;
  detailImage.alt = p.title;
}

function openDetail(id, origin = 'catalog') {
  const p = getProduct(id);
  if (!p) return;
  detailOrigin = origin;
  currentProductId = id;
  renderDetail(p);
  showView('detail');
  setTabbarVisible(false);
  setHeaderVisible(false);
  scrollTop();
  tg?.BackButton?.show?.();
}

function closeDetail() {
  const origin = detailOrigin;
  const categoryId = currentCategoryId;
  currentProductId = null;
  detailOrigin = 'catalog';
  if (origin === 'category' && categoryId) openCategory(categoryId, false);
  else showCatalog();
}
detailBack.addEventListener('click', closeDetail);

detailAdd.addEventListener('click', () => {
  if (currentProductId == null) return;
  addToCart(currentProductId);
  hapticNotify('success');
  closeDetail();
});

/* ============================================================
   КОРЗИНА
============================================================ */
function showCart() {
  showView('cart');
  setTabbarVisible(true);
  setHeaderVisible(true);
  setActiveTab('cart');
  renderCart();
  scrollTop();
  tg?.BackButton?.hide?.();
}

function renderCart() {
  const entries = getCartEntries();

  if (entries.length === 0) {
    cartItemsEl.innerHTML = '';
    cartEmptyEl.classList.remove('hidden');
    cartFooterEl.classList.add('hidden');
    cartView.classList.remove('cart-has-footer');
    totalPriceEl.textContent = '0 ₽';
    checkoutBtn.disabled = true;
    return;
  }

  cartEmptyEl.classList.add('hidden');
  cartFooterEl.classList.remove('hidden');
  cartView.classList.add('cart-has-footer');
  checkoutBtn.disabled = false;

  cartItemsEl.innerHTML = entries.map((item) => {
    const sum = item.price * item.qty;
    return `
      <div class="cart-item">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}"
          onerror="this.onerror=null;this.style.background='rgba(128,128,128,.15)';this.alt='📷';this.removeAttribute('src');" />
        <div class="cart-item-info">
          <div class="cart-item-title">${escapeHtml(item.title)}</div>
          <div class="cart-item-price">${fmtPrice(item.price)} ₽</div>
          <div class="qty">
            <button data-action="dec" data-id="${item.id}" type="button" aria-label="Убавить">−</button>
            <span>${item.qty}</span>
            <button data-action="inc" data-id="${item.id}" type="button" aria-label="Прибавить">+</button>
          </div>
        </div>
        <div class="item-total">${fmtPrice(sum)} ₽</div>
      </div>
    `;
  }).join('');

  totalPriceEl.textContent = fmtPrice(getTotalPrice()) + ' ₽';
}

cartItemsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.action === 'inc') changeQty(id, +1);
  else if (btn.dataset.action === 'dec') changeQty(id, -1);
});

function updateBadge() {
  if (!cartBadge) return;
  const count = getTotalCount();
  if (count > 0) {
    cartBadge.textContent = count > 99 ? '99+' : String(count);
    cartBadge.classList.remove('hidden');
  } else {
    cartBadge.classList.add('hidden');
  }
}

function updateCartUI() {
  if (activeView === 'cart') renderCart();
  updateBadge();
}

tabCatalog.addEventListener('click', showCatalog);
tabCart.addEventListener('click', showCart);

/* ============================================================
   ОФОРМЛЕНИЕ ЗАКАЗА
============================================================ */
function renderPickupStations() {
  pickupStationsEl.innerHTML = PICKUP_STATIONS.map((s) => `
    <button class="pill ${checkoutState.pickupStation === s ? 'active' : ''}"
      data-pickup="${escapeHtml(s)}" type="button">${escapeHtml(s)}</button>
  `).join('');
}

function updateDeliveryBlocks() {
  const isPickup = checkoutState.deliveryType === 'pickup';
  pickupBlock.classList.toggle('hidden', !isPickup);
  deliveryBlock.classList.toggle('hidden', isPickup);
}

function initCheckoutForm() {
  metroInput.value = '';
  phoneInput.value = '';
  commentInput.value = '';
  promoInput.value = '';

  checkoutState.metro = '';
  checkoutState.phone = '';
  checkoutState.comment = '';
  checkoutState.promo = '';
  checkoutState.pickupStation = '';

  metroInput.classList.remove('invalid');
  phoneInput.classList.remove('invalid');
  metroError.classList.add('hidden');
  phoneError.classList.add('hidden');

  checkoutState.deliveryType = 'pickup';
  deliveryPills.forEach((b) => b.classList.toggle('active', b.dataset.delivery === 'pickup'));
  updateDeliveryBlocks();
  renderPickupStations();

  metroList.innerHTML = getMetroDatalist();

  const dates = generateDates();
  dateScroll.innerHTML = dates.map((d, i) => `
    <button class="date-pill ${i === 0 ? 'active' : ''}" data-date="${d.date}" data-day="${d.day}" type="button">
      <span class="day-num">${d.date}</span>
      <span class="day-name">${d.dayName}</span>
    </button>
  `).join('');
  checkoutState.date = dates[0].date;

  renderTimeGrid(dates[0].day);

  updateCheckoutSummary();
}

function updateCheckoutSummary() {
  const itemsTotal = getTotalPrice();
  const deliveryCost = checkoutState.deliveryType === 'delivery' ? DELIVERY_PRICE : 0;
  const total = itemsTotal + deliveryCost;

  summaryItems.textContent = fmtPrice(itemsTotal) + ' ₽';
  summaryTotal.textContent = fmtPrice(total) + ' ₽';

  if (summaryDelivery) {
    if (checkoutState.deliveryType === 'delivery') {
      summaryDelivery.textContent = fmtPrice(DELIVERY_PRICE) + ' ₽';
      summaryDelivery.classList.remove('free-text');
    } else {
      summaryDelivery.textContent = 'Бесплатно';
      summaryDelivery.classList.add('free-text');
    }
  }
}

function showCheckout() {
  showView('checkout');
  setTabbarVisible(false);
  setHeaderVisible(false);
  scrollTop();
  tg?.BackButton?.show?.();
  initCheckoutForm();
}

checkoutBtn.addEventListener('click', () => {
  if (getCartEntries().length === 0) return;
  showCheckout();
});

deliveryPills.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (checkoutState.deliveryType === btn.dataset.delivery) return;
    deliveryPills.forEach((b) => b.classList.toggle('active', b === btn));
    checkoutState.deliveryType = btn.dataset.delivery;
    updateDeliveryBlocks();
    updateCheckoutSummary();
    hapticSelection();
  });
});

pickupStationsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-pickup]');
  if (!btn) return;
  checkoutState.pickupStation = btn.dataset.pickup;
  pickupStationsEl.querySelectorAll('[data-pickup]')
    .forEach((b) => b.classList.toggle('active', b === btn));
  hapticSelection();
});

dateScroll.addEventListener('click', (e) => {
  const pill = e.target.closest('.date-pill');
  if (!pill) return;

  const alreadyActive = pill.classList.contains('active');
  dateScroll.querySelectorAll('.date-pill').forEach((p) => p.classList.toggle('active', p === pill));
  checkoutState.date = pill.dataset.date;

  // Если пользователь ткнул в уже выбранную дату — не сбрасываем время
  if (!alreadyActive) renderTimeGrid(Number(pill.dataset.day));
  hapticSelection();
});

timeGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.time-btn');
  if (!btn) return;
  timeGrid.querySelectorAll('.time-btn').forEach((b) => b.classList.toggle('active', b === btn));
  checkoutState.time = btn.dataset.time;
  hapticSelection();
});

/* -------- Кнопка «Из Telegram» -------- */
fromTelegramBtn.addEventListener('click', () => {
  if (typeof tg?.requestContact !== 'function') {
    tg?.showAlert?.('Обновите Telegram до последней версии или введите номер вручную.');
    return;
  }
  tg.requestContact((shared) => {
    if (!shared) {
      tg?.showAlert?.('Вы отклонили запрос. Введите номер вручную.');
    }
  });
});

tg?.onEvent?.('contactRequested', (event) => {
  const status = event?.status || event?.data?.status;
  if (status && status !== 'sent') return;

  const phone =
    event?.contact?.phone_number ||
    event?.data?.contact?.phone_number ||
    event?.data?.responseUnsafe?.contact?.phone_number ||
    tg?.initDataUnsafe?.user?.phone_number;

  if (!phone) return;

  const formatted = formatPhone(phone);
  phoneInput.value = formatted;
  checkoutState.phone = formatted;
  if (isPhoneValid(formatted)) {
    phoneInput.classList.remove('invalid');
    phoneError.classList.add('hidden');
  }
});

/* -------- Валидация метро -------- */
metroInput.addEventListener('input', (e) => {
  checkoutState.metro = e.target.value;
  const v = e.target.value.trim();
  if (!v || SPB_METRO_SET.has(v)) {
    metroInput.classList.remove('invalid');
    metroError.classList.add('hidden');
  }
});

metroInput.addEventListener('blur', () => {
  const v = metroInput.value.trim();
  if (v !== metroInput.value) metroInput.value = v;
  checkoutState.metro = v;

  if (v && !SPB_METRO_SET.has(v)) {
    metroInput.classList.add('invalid');
    metroError.classList.remove('hidden');
  } else {
    metroInput.classList.remove('invalid');
    metroError.classList.add('hidden');
  }
});

/* -------- Маска телефона -------- */
phoneInput.addEventListener('input', (e) => {
  const formatted = formatPhone(e.target.value);
  e.target.value = formatted;
  checkoutState.phone = formatted;

  if (!formatted || isPhoneValid(formatted)) {
    phoneInput.classList.remove('invalid');
    phoneError.classList.add('hidden');
  }
});

phoneInput.addEventListener('blur', () => {
  const v = phoneInput.value.trim();
  if (v && !isPhoneValid(v)) {
    phoneInput.classList.add('invalid');
    phoneError.classList.remove('hidden');
  }
});

commentInput.addEventListener('input', (e) => { checkoutState.comment = e.target.value; });
promoInput.addEventListener('input', (e) => { checkoutState.promo = e.target.value; });

applyPromoBtn.addEventListener('click', () => {
  if (checkoutState.promo.trim() === '') return;
  tg?.showAlert?.('Промокод не найден или неактивен.');
});

cancelOrderBtn.addEventListener('click', showCart);
checkoutBack.addEventListener('click', showCart);

/* ============================================================
   ПОДТВЕРЖДЕНИЕ ЗАКАЗА
============================================================ */
function generateOrderNumber() {
  const date = new Date();
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `ORD-${year}${month}${day}-${random}`;
}

async function sendOrderToBot(order) {
  if (!ORDER_PROXY_CONFIGURED) {
    console.warn('[order] ORDER_PROXY_URL не настроен — заказ сохранён только локально.');
    return { ok: false, reason: 'not_configured' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(ORDER_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      // Пытаемся получить тело для понятной причины (invalid_init_data и т.п.)
      let reason = 'http_' + res.status;
      try {
        const data = await res.json();
        if (data?.error) reason = data.error;
      } catch {}
      return { ok: false, reason };
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[order] Ошибка отправки:', err);
    return { ok: false, reason: 'network' };
  }
}

confirmOrderBtn.addEventListener('click', async () => {
  /* ---- Валидация ---- */
  if (checkoutState.deliveryType === 'pickup' && !PICKUP_STATIONS_SET.has(checkoutState.pickupStation)) {
    tg?.showAlert?.('Выберите станцию самовывоза.');
    return;
  }

  if (checkoutState.deliveryType === 'delivery') {
    const metroValue = metroInput.value.trim();
    if (!metroValue || !SPB_METRO_SET.has(metroValue)) {
      metroInput.classList.add('invalid');
      metroError.classList.remove('hidden');
      tg?.showAlert?.('Выберите станцию метро из списка.');
      return;
    }
  }

  const phoneValue = phoneInput.value.trim();
  if (!isPhoneValid(phoneValue)) {
    phoneInput.classList.add('invalid');
    phoneError.classList.remove('hidden');
    tg?.showAlert?.('Введите корректный номер телефона.');
    return;
  }

  if (!checkoutState.time) {
    tg?.showAlert?.('Пожалуйста, выберите время.');
    return;
  }

  /* ---- Формирование заказа ---- */
  confirmOrderBtn.disabled = true;
  confirmOrderBtn.textContent = 'Отправка…';

  const items = getCartEntries();
  const orderId = generateOrderNumber();
  const itemsTotal = getTotalPrice();
  const deliveryCost = checkoutState.deliveryType === 'delivery' ? DELIVERY_PRICE : 0;
  const orderTotal = itemsTotal + deliveryCost;
  const tgUser = tg?.initDataUnsafe?.user || null;

  const order = {
    id: orderId,
    items: items.map((i) => ({
      id: i.id,
      title: i.title,
      price: i.price,
      qty: i.qty,
      sum: i.price * i.qty
    })),
    total: orderTotal,
    deliveryCost,
    deliveryType: checkoutState.deliveryType,
    pickupStation: checkoutState.deliveryType === 'pickup' ? checkoutState.pickupStation : '',
    metro: checkoutState.deliveryType === 'delivery' ? metroInput.value.trim() : '',
    date: checkoutState.date,
    time: checkoutState.time,
    phone: phoneValue,
    comment: checkoutState.comment,
    promo: checkoutState.promo,
    createdAt: new Date().toISOString(),
    user: tgUser ? {
      id: tgUser.id,
      first_name: tgUser.first_name || '',
      last_name: tgUser.last_name || '',
      username: tgUser.username || ''
    } : null,
    initData: tg?.initData || ''
  };

  try {
    const savedOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
    savedOrders.push(order);
    localStorage.setItem('user_orders', JSON.stringify(savedOrders));
  } catch (e) {
    console.error('Ошибка сохранения заказа:', e);
  }

  const result = await sendOrderToBot(order);

  // Различаем сетевую ошибку и отказ от воркера (invalid_init_data и пр.)
  if (result?.ok === false) {
    if (result.reason === 'network') {
      tg?.showAlert?.('Не удалось отправить заказ. Мы свяжемся с вами вручную.');
    } else if (result.reason === 'invalid_init_data') {
      tg?.showAlert?.('Сессия Telegram устарела. Переоткройте магазин.');
    }
    // остальные причины тихо игнорируем — заказ сохранён локально
  }

  cart = {};
  saveCart();
  updateCartUI();

  const pickupOrMetro = order.deliveryType === 'pickup'
    ? `Самовывоз: ${escapeHtml(order.pickupStation)}`
    : `Метро: ${escapeHtml(order.metro)}`;

  const deliveryLine = order.deliveryType === 'delivery'
    ? `<div>Доставка: <span>${fmtPrice(deliveryCost)} ₽</span></div>`
    : `<div>Доставка: <span>Бесплатно</span></div>`;

  const usernameLine = order.user?.username
    ? `<div>Username: <span>@${escapeHtml(order.user.username)}</span></div>`
    : '';

  orderNumberDisplay.textContent = order.id;
  successDetails.innerHTML = `
    <div>${pickupOrMetro}</div>
    ${deliveryLine}
    <div>Дата и время: <span>${escapeHtml(order.date)}, ${escapeHtml(order.time)}</span></div>
    <div>Телефон: <span>${escapeHtml(order.phone)}</span></div>
    ${usernameLine}
    <div>Сумма: <span>${fmtPrice(order.total)} ₽</span></div>
  `;

  confirmOrderBtn.disabled = false;
  confirmOrderBtn.textContent = 'Подтвердить заказ';

  showView('success');
  setTabbarVisible(false);
  setHeaderVisible(false);
  tg?.BackButton?.hide?.();
  hapticNotify('success');
});

successCloseBtn.addEventListener('click', showCatalog);

/* ============================================================
   Кнопка «Назад» в Telegram
============================================================ */
tg?.BackButton?.onClick?.(() => {
  if (activeView === 'detail') closeDetail();
  else if (activeView === 'category') closeCategory();
  else if (activeView === 'checkout') showCart();
  else if (activeView === 'cart') showCatalog();
  else if (activeView === 'success') showCatalog();
  else tg?.close?.();
});

/* ============================================================
   Инициализация
============================================================ */
renderCategories();
updateCartUI();
showCatalog();
