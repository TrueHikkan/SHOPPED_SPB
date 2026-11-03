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

// ⚠️ ТОЛЬКО для UI. Реальная защита — ADMIN_IDS в секретах Worker.
// ID всегда числом. Узнать: @userinfobot
const ADMIN_LIST = [123456789];
const ADMIN_SET = new Set(ADMIN_LIST.map(Number));
const currentUserId = tg?.initDataUnsafe?.user?.id;
const isAdmin =
  currentUserId != null && ADMIN_SET.has(Number(currentUserId));

if (tg?.initDataUnsafe?.user) {
  const u = tg.initDataUnsafe.user;
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ');
  const greetEl = document.getElementById('userGreeting');
  if (greetEl) greetEl.textContent = `Привет, ${name}! 👋${isAdmin ? ' (Админ)' : ''}`;
}

/* ============================================================
   Константы
============================================================ */
const API_BASE = 'https://shopped-worker.tecnoakk10.workers.dev';
const STOCK_URL = `${API_BASE}/stock`;
const ADMIN_STOCK_URL = `${API_BASE}/admin/stock`;
const ORDER_URL = `${API_BASE}/order`;
const DELIVERY_PRICE = 150;
const STORAGE_KEY = 'mini-shop-cart';
const ORDER_TIMEOUT_MS = 15000;

/* ============================================================
   Хелперы
============================================================ */
const $ = (sel) => document.querySelector(sel);

const hapticImpact = (style = 'light') => tg?.HapticFeedback?.impactOccurred?.(style);
const hapticNotify = (type = 'success') => tg?.HapticFeedback?.notificationOccurred?.(type);
const hapticSelection = () => tg?.HapticFeedback?.selectionChanged?.();

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (str) => String(str ?? '').replace(/[&<>"']/g, (c) => ESCAPE_MAP[c]);

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

const fmtPrice = (n) => Number(n || 0).toLocaleString('ru-RU');

function scrollTop() {
  document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;
}

function formatPhone(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return '';
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
  { id: 'pod',    name: 'Поды',       icon: '🚬' },
  { id: 'liq',    name: 'Жижи',       icon: '🧪' },
];

const PRODUCTS = [
  { id: 1, category: 'energy', title: 'Blue Monster', desc: 'Энергетик',
    fullDesc: 'Не рекомендуется к употреблению до 18 лет', price: 210,
    image: 'photos/energy/Blue-Monster.png', stock: 10 },
  { id: 2, category: 'energy', title: 'Original Monster', desc: 'Энергетик',
    fullDesc: 'Не рекомендуется к употреблению до 18 лет', price: 210,
    image: 'photos/energy/Classic-Monster.png', stock: 10 },
  { id: 3, category: 'energy', title: 'Pink Monster', desc: 'Энергетик',
    fullDesc: 'Не рекомендуется к употреблению до 18 лет', price: 210,
    image: 'photos/energy/Pink-Monster.png', stock: 10 },
  { id: 4, category: 'energy', title: 'White Monster', desc: 'Энергетик',
    fullDesc: 'Не рекомендуется к употреблению до 18 лет', price: 210,
    image: 'photos/energy/White-Monster.png', stock: 10 },

  { id: 5, category: 'liq', title: 'MONSTER HEADSHOT 80mg', desc: 'Жидкость для вейпа',
    fullDesc: 'Употребление табака приводит к риску развития рака', price: 290,
    image: 'photos/liq/headshot.png', stock: 0,
    variants: [
      { id: 'v1', title: 'Абрикос и персик', stock: 10 },
      { id: 'v2', title: 'Ананас и маракуйя', stock: 10 },
      { id: 'v3', title: 'Ананас и розовая гуава', stock: 10 },
      { id: 'v4', title: 'Апельсин и лайм', stock: 10 },
      { id: 'v5', title: 'Арбузный спрайт и ментос', stock: 10 },
      { id: 'v6', title: 'Банан и киви', stock: 10 },
      { id: 'v7', title: 'Виноградный алоэ и сакура', stock: 10 },
      { id: 'v8', title: 'Вишневая кола', stock: 10 },
      { id: 'v9', title: 'Грейпфрут и смородина', stock: 10 },
      { id: 'v10', title: 'Дыня и мята', stock: 10 },
      { id: 'v11', title: 'Земляника и персик', stock: 10 },
      { id: 'v12', title: 'Клубника и драгонфрут', stock: 10 },
      { id: 'v13', title: 'Клубника и личи', stock: 10 },
      { id: 'v14', title: 'Клубничный мохито', stock: 10 },
      { id: 'v15', title: 'Лимон и лайм', stock: 10 },
      { id: 'v16', title: 'Малина и клубника', stock: 10 },
      { id: 'v17', title: 'Черника и виноград', stock: 10 },
      { id: 'v18', title: 'Черничный энергетик', stock: 10 },
      { id: 'v19', title: 'Ягодный скиттлс', stock: 10 },
      { id: 'v20', title: 'Черешня и мята', stock: 10 },
    ] },
  { id: 6, category: 'liq', title: 'MONSTER HARDCORE 60mg', desc: 'Жидкость для вейпа',
    fullDesc: 'Употребление табака приводит к риску развития рака', price: 260,
    image: 'photos/liq/hardcore.png', stock: 0,
    variants: [
      { id: 'h1', title: 'Ананасовый коктейль', stock: 10 },
      { id: 'h2', title: 'Барбарисовый коктейль', stock: 10 },
      { id: 'h3', title: 'Гранатовый коктейль', stock: 10 },
      { id: 'h4', title: 'Грейпфрутовый коктейль', stock: 10 },
      { id: 'h5', title: 'Манговый коктейль', stock: 10 },
      { id: 'h6', title: 'Маракуйя коктейль', stock: 10 },
      { id: 'h7', title: 'Яблочный коктейль', stock: 10 },
    ] },
  { id: 7, category: 'liq', title: 'MONSTER ICEBERG 60mg', desc: 'Жидкость для вейпа',
    fullDesc: 'Употребление табака приводит к риску развития рака', price: 260,
    image: 'photos/liq/iceberg.png', stock: 0,
    variants: [
      { id: 'i1', title: 'Ледяной Персик', stock: 10 },
      { id: 'i2', title: 'Манго и Маракуйя', stock: 10 },
      { id: 'i3', title: 'Морозная Пинаколада', stock: 10 },
      { id: 'i4', title: 'Смородиной Смузи', stock: 10 },
      { id: 'i5', title: 'Фейхоа и Клубника', stock: 10 },
      { id: 'i6', title: 'Ананас и Личи', stock: 10 },
      { id: 'i7', title: 'Вишня и Грейпфрут', stock: 10 },
      { id: 'i8', title: 'Киви и Лайм', stock: 10 },
      { id: 'i9', title: 'Ледяной Гранат', stock: 10 },
    ] },
  { id: 8, category: 'liq', title: 'MONSTER SOUR 60mg', desc: 'Жидкость для вейпа',
    fullDesc: 'Употребление табака приводит к риску развития рака', price: 260,
    image: 'photos/liq/sour.png', stock: 0,
    variants: [
      { id: 's1', title: 'Малина и Грейпфрут', stock: 10 },
      { id: 's2', title: 'Маракуйя и Киви', stock: 10 },
      { id: 's3', title: 'Цитрусовая шипучка', stock: 10 },
      { id: 's4', title: 'Клубника и Лимон', stock: 10 },
      { id: 's5', title: 'Лимонад ситро', stock: 10 },
      { id: 's6', title: 'Лимонные леденцы', stock: 10 },
      { id: 's7', title: 'Ананасовая газировка', stock: 10 },
      { id: 's8', title: 'Барбарисовый швепс', stock: 10 },
      { id: 's9', title: 'Киви и Лайм', stock: 10 },
    ] },

  { id: 9, category: 'pod', title: 'XRos 6 mini', desc: 'Под-система',
    fullDesc: 'Употребление табака приводит к риску развития рака', price: 1600,
    image: 'photos/pod/xros6mini.png', stock: 10 },
];

const PRODUCTS_BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));
const PRODUCTS_BY_CATEGORY = PRODUCTS.reduce((acc, p) => {
  (acc[p.category] ||= []).push(p);
  return acc;
}, {});

const getFullDescription = (p) => p.fullDesc || p.desc || '';
const getProduct = (id) => PRODUCTS_BY_ID.get(Number(id));

/* ============================================================
   Остатки с сервера
============================================================ */
let serverStock = Object.create(null);

async function fetchStock() {
  try {
    const res = await fetch(STOCK_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('http_' + res.status);
    const data = await res.json();
    if (data && typeof data === 'object') {
      serverStock = data;
      applyServerStock();
    }
  } catch (err) {
    console.warn('[stock] не удалось загрузить остатки', err);
  }
}

function applyServerStock() {
  for (const p of PRODUCTS) {
    if (p.variants?.length) {
      for (const v of p.variants) {
        const key = `${p.id}:${v.id}`;
        if (Object.prototype.hasOwnProperty.call(serverStock, key)) {
          v.stock = Math.max(0, Number(serverStock[key]) || 0);
        }
      }
    } else {
      const key = String(p.id);
      if (Object.prototype.hasOwnProperty.call(serverStock, key)) {
        p.stock = Math.max(0, Number(serverStock[key]) || 0);
      }
    }
  }
}

/* ============================================================
   Cart IDs
============================================================ */
function makeCartId(parentId, variantId) {
  return variantId ? `${parentId}:${variantId}` : String(parentId);
}

function parseCartId(cartId) {
  const s = String(cartId ?? '');
  if (!s) return null;
  const colon = s.indexOf(':');
  if (colon === -1) {
    const product = PRODUCTS_BY_ID.get(Number(s));
    return product ? { product, variant: null } : null;
  }
  const product = PRODUCTS_BY_ID.get(Number(s.slice(0, colon)));
  if (!product || !Array.isArray(product.variants)) return null;
  const variant = product.variants.find((v) => v.id === s.slice(colon + 1));
  return variant ? { product, variant } : null;
}

function getAvailableStock(parsed) {
  if (!parsed) return 0;
  return parsed.variant ? (parsed.variant.stock || 0) : (parsed.product.stock || 0);
}

function displayName(parsed) {
  if (!parsed) return '';
  return parsed.variant
    ? `${parsed.product.title} — ${parsed.variant.title}`
    : parsed.product.title;
}

const cartItemCache = new Map();

function buildCartItem(parsed, cartId) {
  const { product, variant } = parsed;
  return {
    ...product,
    cartId,
    variant: variant || null,
    displayTitle: variant ? `${product.title} — ${variant.title}` : product.title,
    image: (variant && variant.image) || product.image,
  };
}

function getCartItem(cartId) {
  if (cartItemCache.has(cartId)) return cartItemCache.get(cartId);
  const parsed = parseCartId(cartId);
  const item = parsed ? buildCartItem(parsed, cartId) : null;
  cartItemCache.set(cartId, item);
  return item;
}

/* ============================================================
   Данные доставки
============================================================ */
const PICKUP_STATIONS = ['Комендантский проспект', 'Удельная', 'Пионерская'];
const PICKUP_STATIONS_SET = new Set(PICKUP_STATIONS);

const SPB_METRO_STATIONS = [
  "Автово","Адмиралтейская","Академическая","Балтийская","Бухарестская",
  "Василеостровская","Владимирская","Волковская","Выборгская","Горьковская",
  "Гостиный двор","Гражданский проспект","Девяткино","Достоевская","Елизаровская",
  "Звенигородская","Зенит","Кировский завод","Комендантский проспект","Крестовский остров",
  "Купчино","Ладожская","Ленинский проспект","Лесная","Лиговский проспект",
  "Ломоносовская","Маяковская","Международная","Московская","Московские ворота",
  "Нарвская","Невский проспект","Новочеркасская","Обводный канал","Обухово",
  "Озерки","Парк Победы","Парнас","Петроградская","Пионерская",
  "Площадь Александра Невского","Площадь Восстания","Площадь Ленина","Площадь Мужества",
  "Политехническая","Приморская","Пролетарская","Проспект Большевиков","Проспект Ветеранов",
  "Проспект Просвещения","Пушкинская","Рыбацкое","Садовая","Сенная площадь",
  "Спасская","Спортивная","Старая Деревня","Технологический институт","Удельная",
  "Улица Дыбенко","Фрунзенская","Черная речка","Чернышевская","Чкаловская",
  "Электросила"
];
const SPB_METRO_SET = new Set(SPB_METRO_STATIONS);

/* ============================================================
   Корзина
============================================================ */
let cart = loadCart();

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const clean = {};
    for (const id in raw) {
      const n = Math.floor(Number(raw[id]));
      if (Number.isFinite(n) && n > 0 && parseCartId(id)) clean[id] = n;
    }
    return clean;
  } catch { return {}; }
}

function saveCart() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch {}
}

function addToCart(cartId) {
  const parsed = parseCartId(cartId);
  if (!parsed) return false;

  const available = getAvailableStock(parsed);
  const currentInCart = cart[cartId] || 0;

  if (available <= 0) {
    tg?.showAlert?.('Этого товара нет в наличии.');
    return false;
  }
  if (currentInCart >= available) {
    tg?.showAlert?.(`В наличии только ${available} шт.`);
    return false;
  }
  cart[cartId] = currentInCart + 1;
  saveCart();
  updateCartUI();
  return true;
}

function changeQty(cartId, delta) {
  if (!cart[cartId]) return;
  const parsed = parseCartId(cartId);
  if (!parsed) return;

  const available = getAvailableStock(parsed);
  const newQty = cart[cartId] + delta;

  if (delta > 0 && newQty > available) {
    tg?.showAlert?.(`В наличии только ${available} шт.`);
    return;
  }
  if (newQty <= 0) delete cart[cartId];
  else cart[cartId] = newQty;
  saveCart();
  updateCartUI();
  hapticSelection();
}

function getCartStats() {
  const entries = [];
  let total = 0, count = 0;
  for (const id in cart) {
    const item = getCartItem(id);
    if (!item) continue;
    const qty = cart[id];
    entries.push({ ...item, qty });
    total += item.price * qty;
    count += qty;
  }
  return { entries, total, count };
}

function getCartCount() {
  let count = 0;
  for (const id in cart) count += cart[id];
  return count;
}

function validateCartAgainstStock() {
  const issues = [];
  for (const cartId in cart) {
    const parsed = parseCartId(cartId);
    if (!parsed) {
      issues.push('Некоторый товар больше недоступен и будет удалён.');
      delete cart[cartId];
      continue;
    }
    const available = getAvailableStock(parsed);
    const qty = cart[cartId];
    if (available <= 0) {
      issues.push(`«${displayName(parsed)}» закончился.`);
    } else if (qty > available) {
      issues.push(`«${displayName(parsed)}»: в корзине ${qty}, в наличии ${available}.`);
    }
  }
  return issues;
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
const detailStockEl = $('#detailStock');
const adminDetailControls = $('#adminDetailControls');
const detailVariants = $('#detailVariants');

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
const deliveryCostLabel = $('#deliveryCostLabel');
const pickupBlock = $('#pickupBlock');
const deliveryBlock = $('#deliveryBlock');
const pickupStationsEl = $('#pickupStations');
const deliveryPills = document.querySelectorAll('[data-delivery]');

if (deliveryCostLabel) deliveryCostLabel.textContent = fmtPrice(DELIVERY_PRICE) + ' ₽';

/* ============================================================
   Состояние
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
  promo: '',
};

/* ============================================================
   Админ: обновление склада (async, с backend)
============================================================ */
const pendingAdminUpdates = new Set();

async function handleAdminStockUpdate(btn) {
  if (!isAdmin) return;

  const action = btn.dataset.adminAction;
  const productId = Number(btn.dataset.id);
  const variantId = btn.dataset.variant || '';
  const p = getProduct(productId);
  if (!p) return;

  const parsed = variantId
    ? { product: p, variant: p.variants?.find((v) => v.id === variantId) }
    : { product: p, variant: null };
  if (variantId && !parsed.variant) return;

  const key = variantId ? `${productId}:${variantId}` : String(productId);
  if (pendingAdminUpdates.has(key)) return;

  const current = parsed.variant ? (parsed.variant.stock || 0) : (p.stock || 0);
  const next = Math.max(0, current + (action === 'inc' ? 1 : -1));
  if (next === current) return;

  pendingAdminUpdates.add(key);

  // Оптимистичное обновление
  if (parsed.variant) parsed.variant.stock = next;
  else p.stock = next;
  rerenderActive();

  try {
    const res = await fetch(ADMIN_STOCK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `tma ${tg?.initData || ''}`,
      },
      body: JSON.stringify({
        productId: String(productId),
        variantId: variantId || undefined,
        qty: next,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      // откат
      if (parsed.variant) parsed.variant.stock = current;
      else p.stock = current;
      rerenderActive();

      tg?.showAlert?.(
        data.error === 'forbidden'
          ? 'Нет прав. Проверьте ADMIN_IDS в секретах Worker.'
          : 'Не удалось сохранить остаток. Попробуйте снова.'
      );
      return;
    }

    serverStock[key] = next;
    hapticImpact('light');
  } catch (err) {
    // откат
    if (parsed.variant) parsed.variant.stock = current;
    else p.stock = current;
    rerenderActive();
    tg?.showAlert?.('Сервер недоступен. Остаток не изменён.');
  } finally {
    pendingAdminUpdates.delete(key);
  }
}

function rerenderActive() {
  if (activeView === 'category') renderCategoryProducts(currentCategoryId);
  else if (activeView === 'detail' && currentProductId != null) {
    const p = getProduct(currentProductId);
    if (p) renderDetail(p);
  } else if (activeView === 'cart') renderCart();
}

/* ============================================================
   Даты и время
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

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

function generateDates() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayNum = String(d.getDate()).padStart(2, '0');
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    const dateStr = `${dayNum}.${monthNum}`;
    const dayName = i === 0 ? 'сегодня' : i === 1 ? 'завтра' : DAY_NAMES[d.getDay()];
    dates.push({ date: dateStr, dayName, day: d.getDay() });
  }
  return dates;
}

function generateTimes(dayOfWeek, dateStr) {
  const times = [];
  let endHour = 21;
  if (dayOfWeek === 5) endHour = 18;
  else if (dayOfWeek === 0) endHour = 20;

  const now = new Date();
  const todayStr =
    String(now.getDate()).padStart(2, '0') + '.' +
    String(now.getMonth() + 1).padStart(2, '0');
  const isToday = dateStr === todayStr;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const bufferMinutes = 30;

  for (let h = 16; h < endHour; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (isToday && (h * 60 + m) < currentMinutes + bufferMinutes) continue;
      const hourStr = String(h).padStart(2, '0');
      const minStr = String(m).padStart(2, '0');
      const nextHour = m === 30 ? h + 1 : h;
      const nextMin = m === 30 ? '00' : '30';
      times.push(`${hourStr}:${minStr} – ${String(nextHour).padStart(2, '0')}:${nextMin}`);
    }
  }
  return times;
}

function renderTimeGrid(dayOfWeek, dateStr) {
  const times = generateTimes(dayOfWeek, dateStr);
  checkoutState.time = '';
  if (times.length === 0) {
    timeGrid.innerHTML = `<div style="grid-column:1/-1;padding:16px;text-align:center;color:var(--hint);font-size:14px;">Нет доступного времени на эту дату</div>`;
    return;
  }
  timeGrid.innerHTML = times.map((t) => `
    <button class="time-btn" data-time="${escapeHtml(t)}" type="button">${t}</button>
  `).join('');
}

/* ============================================================
   Переключение экранов
============================================================ */
const VIEWS = {
  catalog: catalogView, category: categoryView, cart: cartView,
  detail: detailView, checkout: checkoutView, success: successView,
};

function showView(name) {
  for (const key in VIEWS) VIEWS[key]?.classList.toggle('hidden', key !== name);
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
   Карточка товара
============================================================ */
function productCardHTML(p) {
  const title = escapeHtml(p.title);
  const desc = escapeHtml(p.desc);
  const image = escapeHtml(p.image);
  const price = fmtPrice(p.price);
  const catClass = p.category !== 'energy' ? p.category : '';

  const totalStock = p.variants
    ? p.variants.reduce((s, v) => s + (v.stock || 0), 0)
    : (p.stock || 0);
  const stockText = totalStock > 0 ? `В наличии: ${totalStock} шт.` : 'Нет в наличии';
  const stockClass = totalStock > 0 ? '' : 'out-of-stock';

  return `
    <div class="product-card ${catClass}" data-id="${p.id}">
      <img src="${image}" alt="${title}" loading="lazy"
        onerror="this.style.background='rgba(128,128,128,.15)';this.alt='📷';this.removeAttribute('src');" />
      <div class="product-info">
        <div class="product-title">${title}</div>
        <div class="product-desc">${desc}</div>
        <div class="stock-badge ${stockClass}">${stockText}</div>
        <div class="product-row">
          <div class="product-price">${price} ₽</div>
          <button class="add-btn" data-add="${p.id}" type="button" aria-label="Добавить в корзину">+</button>
        </div>
        ${isAdmin && !p.variants ? `
        <div class="admin-controls" onclick="event.stopPropagation()">
          <button class="admin-btn" data-admin-action="dec" data-id="${p.id}">−</button>
          <button class="admin-btn" data-admin-action="inc" data-id="${p.id}">+</button>
        </div>` : ''}
      </div>
    </div>
  `;
}

/* ============================================================
   Каталог
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
   Категория
============================================================ */
function renderCategoryProducts(categoryId) {
  const items = PRODUCTS_BY_CATEGORY[categoryId] || [];
  categoryProductsEl.innerHTML = items.length === 0
    ? `<div class="empty"><div class="empty-icon">📦</div><p>В этой категории пока нет товаров</p></div>`
    : items.map(productCardHTML).join('');
}

function openCategory(id, doScroll = true) {
  const cat = CATEGORIES.find((c) => c.id === id);
  if (!cat) return;
  currentCategoryId = id;
  categoryTitleEl.textContent = `${cat.icon} ${cat.name}`;
  renderCategoryProducts(id);
  showView('category');
  setTabbarVisible(true);
  setHeaderVisible(false);
  setActiveTab('catalog');
  if (doScroll) scrollTop();
  tg?.BackButton?.show?.();
}

categoryBack.addEventListener('click', () => showCatalog());

categoryProductsEl.addEventListener('click', async (e) => {
  const adminBtn = e.target.closest('[data-admin-action]');
  if (adminBtn) {
    await handleAdminStockUpdate(adminBtn);
    return;
  }

  const addBtn = e.target.closest('[data-add]');
  if (addBtn) {
    const productId = Number(addBtn.dataset.add);
    const product = getProduct(productId);
    if (product?.variants?.length) {
      openDetail(productId, 'category');
      return;
    }
    const ok = addToCart(makeCartId(productId));
    if (ok) hapticImpact('light');
    return;
  }

  const card = e.target.closest('.product-card');
  if (card) openDetail(Number(card.dataset.id), 'category');
});

/* ============================================================
   Детальный экран
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

  const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;

  if (hasVariants) {
    detailStockEl.classList.add('hidden');
    adminDetailControls.classList.add('hidden');
    detailAdd.classList.add('hidden');

    detailVariants.innerHTML =
      `<div class="detail-variants-label">Выберите вид:</div>` +
      p.variants.map((v) => `
        <div class="variant-item">
          <button class="variant-btn" data-variant="${escapeHtml(v.id)}" type="button">
            <div class="variant-row">
              <span class="variant-title">${escapeHtml(v.title)}</span>
              <span class="variant-price">${fmtPrice(p.price)} ₽</span>
            </div>
            <div class="variant-stock ${v.stock <= 0 ? 'out-of-stock' : ''}">
              ${v.stock > 0 ? `В наличии: ${v.stock} шт.` : 'Нет в наличии'}
            </div>
          </button>
          ${isAdmin ? `
          <div class="admin-controls" style="margin:0;padding:0;border:none;">
            <button class="admin-btn" data-admin-action="dec" data-id="${p.id}" data-variant="${escapeHtml(v.id)}">−</button>
            <button class="admin-btn" data-admin-action="inc" data-id="${p.id}" data-variant="${escapeHtml(v.id)}">+</button>
          </div>` : ''}
        </div>
      `).join('');
    detailVariants.classList.remove('hidden');
  } else {
    detailVariants.innerHTML = '';
    detailVariants.classList.add('hidden');
    detailAdd.classList.remove('hidden');
    detailStockEl.classList.remove('hidden');

    const stock = p.stock || 0;
    detailStockEl.textContent = stock > 0 ? `В наличии: ${stock} шт.` : 'Нет в наличии';
    detailStockEl.className = `detail-stock ${stock <= 0 ? 'out-of-stock' : ''}`;

    if (isAdmin) {
      adminDetailControls.classList.remove('hidden');
      adminDetailControls.innerHTML = `
        <button class="admin-btn" data-admin-action="dec" data-id="${p.id}">−</button>
        <span style="font-size:12px;color:var(--hint);">Изменить</span>
        <button class="admin-btn" data-admin-action="inc" data-id="${p.id}">+</button>
      `;
    } else {
      adminDetailControls.classList.add('hidden');
      adminDetailControls.innerHTML = '';
    }
  }
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

detailView.addEventListener('click', async (e) => {
  const adminBtn = e.target.closest('[data-admin-action]');
  if (adminBtn) {
    await handleAdminStockUpdate(adminBtn);
    return;
  }
});

detailAdd.addEventListener('click', () => {
  if (currentProductId == null) return;
  const product = getProduct(currentProductId);
  if (!product || product.variants?.length) return;
  const ok = addToCart(makeCartId(currentProductId));
  if (ok) {
    hapticNotify('success');
    closeDetail();
  }
});

detailVariants.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-variant]');
  if (!btn || currentProductId == null) return;
  const cartId = makeCartId(currentProductId, btn.dataset.variant);
  const ok = addToCart(cartId);
  if (ok) {
    hapticNotify('success');
    closeDetail();
  }
});

/* ============================================================
   Корзина
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
  const { entries, total } = getCartStats();

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
    const safeId = escapeHtml(item.cartId);
    const safeTitle = escapeHtml(item.displayTitle);

    const parsed = parseCartId(item.cartId);
    const available = parsed ? getAvailableStock(parsed) : 0;
    const overStock = item.qty > available;
    const atMax = item.qty >= available;

    return `
      <div class="cart-item">
        <img src="${escapeHtml(item.image)}" alt="${safeTitle}"
          onerror="this.onerror=null;this.style.background='rgba(128,128,128,.15)';this.alt='📷';this.removeAttribute('src');" />
        <div class="cart-item-info">
          <div class="cart-item-title">${safeTitle}</div>
          <div class="cart-item-price">${fmtPrice(item.price)} ₽</div>
          <div class="qty">
            <button data-action="dec" data-id="${safeId}" type="button" aria-label="Убавить">−</button>
            <span>${item.qty}</span>
            <button data-action="inc" data-id="${safeId}" type="button" aria-label="Прибавить" ${atMax ? 'disabled' : ''}>+</button>
          </div>
          ${overStock ? `<div style="font-size:11px;color:var(--error);margin-top:4px;">В наличии только ${available}</div>` : ''}
        </div>
        <div class="item-total">${fmtPrice(sum)} ₽</div>
      </div>
    `;
  }).join('');

  totalPriceEl.textContent = fmtPrice(total) + ' ₽';
}

cartItemsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn || btn.disabled) return;
  const cartId = btn.dataset.id;
  if (btn.dataset.action === 'inc') changeQty(cartId, +1);
  else if (btn.dataset.action === 'dec') changeQty(cartId, -1);
});

function updateBadge() {
  if (!cartBadge) return;
  const count = getCartCount();
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
   Оформление заказа
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
  const datesWithTimes = dates.map((d) => ({ ...d, times: generateTimes(d.day, d.date) }));
  const firstAvailableIdx = datesWithTimes.findIndex((d) => d.times.length > 0);

  if (firstAvailableIdx === -1) {
    dateScroll.innerHTML = '';
    timeGrid.innerHTML = `<div style="grid-column:1/-1;padding:16px;text-align:center;color:var(--error);font-size:14px;">Нет доступного времени. Попробуйте позже.</div>`;
    checkoutState.date = '';
    checkoutState.time = '';
    updateCheckoutSummary();
    return;
  }

  const initial = datesWithTimes[firstAvailableIdx];
  dateScroll.innerHTML = datesWithTimes.map((d) => `
    <button class="date-pill ${d.date === initial.date ? 'active' : ''}"
      data-date="${escapeHtml(d.date)}" data-day="${d.day}" type="button">
      <span class="day-num">${escapeHtml(d.date)}</span>
      <span class="day-name">${escapeHtml(d.dayName)}</span>
    </button>
  `).join('');
  checkoutState.date = initial.date;
  renderTimeGrid(initial.day, initial.date);
  updateCheckoutSummary();
}

function updateCheckoutSummary() {
  const itemsTotal = getCartStats().total;
  const deliveryCost = checkoutState.deliveryType === 'delivery' ? DELIVERY_PRICE : 0;

  summaryItems.textContent = fmtPrice(itemsTotal) + ' ₽';
  summaryTotal.textContent = fmtPrice(itemsTotal + deliveryCost) + ' ₽';

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
  if (getCartStats().entries.length === 0) return;
  showCheckout();
});

deliveryPills.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (checkoutState.deliveryType === btn.dataset.delivery) return;
    deliveryPills.forEach((b) => b.classList.toggle('active', b === btn));
    checkoutState.deliveryType = btn.dataset.delivery;

    if (checkoutState.deliveryType === 'pickup') {
      metroInput.value = '';
      checkoutState.metro = '';
      metroInput.classList.remove('invalid');
      metroError.classList.add('hidden');
    }

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

  if (!alreadyActive) renderTimeGrid(Number(pill.dataset.day), pill.dataset.date);
  hapticSelection();
});

timeGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.time-btn');
  if (!btn) return;
  timeGrid.querySelectorAll('.time-btn').forEach((b) => b.classList.toggle('active', b === btn));
  checkoutState.time = btn.dataset.time;
  hapticSelection();
});

/* -------- «Из Telegram» -------- */
fromTelegramBtn.addEventListener('click', () => {
  if (typeof tg?.requestContact !== 'function') {
    tg?.showAlert?.('Обновите Telegram до последней версии или введите номер вручную.');
    return;
  }
  tg.requestContact((shared) => {
    if (!shared) return;

    // Пытаемся получить телефон из актуального initData
    let phone = tg?.initDataUnsafe?.user?.phone_number;
    if (!phone && tg?.initData) {
      try {
        const params = new URLSearchParams(tg.initData);
        const user = JSON.parse(params.get('user') || 'null');
        phone = user?.phone_number;
      } catch {}
    }

    if (phone) {
      const formatted = formatPhone(phone);
      phoneInput.value = formatted;
      checkoutState.phone = formatted;
      phoneInput.classList.remove('invalid');
      phoneError.classList.add('hidden');
      hapticNotify('success');
    } else {
      tg?.showAlert?.('Номер отправлен боту. Введите его вручную в поле.');
    }
  });
});

/* -------- Метро -------- */
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

/* -------- Телефон -------- */
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
   Подтверждение заказа
============================================================ */
function generateOrderNumber() {
  const d = new Date();
  const year = String(d.getFullYear()).slice(-2);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `ORD-${year}${month}${day}-${random}`;
}

async function sendOrderToBot(order) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ORDER_TIMEOUT_MS);

  try {
    const res = await fetch(ORDER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
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
    console.error('[order] отправка не удалась', err);
    return { ok: false, reason: 'network' };
  }
}

confirmOrderBtn.addEventListener('click', async () => {
  if (confirmOrderBtn.disabled) return;

  // ---- 1. Валидация формы ----
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

  // ---- 2. Валидация склада ----
  const stockIssues = validateCartAgainstStock();
  if (stockIssues.length > 0) {
    saveCart();
    updateCartUI();
    tg?.showAlert?.(
      'Изменились остатки:\n\n' + stockIssues.join('\n') +
      '\n\nПроверьте корзину и попробуйте снова.'
    );
    return;
  }

  const { entries, total: itemsTotal } = getCartStats();
  if (entries.length === 0) {
    tg?.showAlert?.('Корзина пуста.');
    return;
  }

  // ---- 3. Формирование заказа ----
  confirmOrderBtn.disabled = true;
  confirmOrderBtn.textContent = 'Отправка…';

  const orderId = generateOrderNumber();
  const deliveryCost = checkoutState.deliveryType === 'delivery' ? DELIVERY_PRICE : 0;
  const orderTotal = itemsTotal + deliveryCost;
  const tgUser = tg?.initDataUnsafe?.user || null;

  const order = {
    id: orderId,
    items: entries.map((i) => ({
      id: i.cartId,
      productId: i.id,
      variantId: i.variant ? i.variant.id : '',
      variantTitle: i.variant ? i.variant.title : '',
      title: i.displayTitle,
      price: i.price,
      qty: i.qty,
      sum: i.price * i.qty,
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
      username: tgUser.username || '',
    } : null,
    initData: tg?.initData || '',
  };

  // ---- 4. Локальное сохранение (best-effort) ----
  try {
    const saved = JSON.parse(localStorage.getItem('user_orders') || '[]');
    saved.push(order);
    localStorage.setItem('user_orders', JSON.stringify(saved));
  } catch (e) {
    console.warn('[order] localStorage save failed', e);
  }

  // ---- 5. Отправка ----
  const result = await sendOrderToBot(order);

  if (!result || !result.ok) {
    confirmOrderBtn.disabled = false;
    confirmOrderBtn.textContent = 'Подтвердить заказ';

    const reason = result?.reason;
        if (reason === 'network') {
      tg?.showAlert?.('Не удалось отправить заказ. Проверьте соединение и попробуйте снова.');
    } else if (reason === 'invalid_init_data') {
      tg?.showAlert?.('Сессия Telegram устарела. Переоткройте магазин и оформите заказ заново.');
    } else if (reason === 'secrets_missing') {
      tg?.showAlert?.('Магазин временно недоступен. Попробуйте позже.');
    } else if (reason === 'too_many_items') {
      tg?.showAlert?.('Слишком много позиций в заказе. Оформите двумя заказами.');
    } else if (typeof reason === 'string' && reason.startsWith('http_')) {
      tg?.showAlert?.('Ошибка сервера. Попробуйте ещё раз через минуту.');
    } else {
      tg?.showAlert?.('Не удалось отправить заказ. Попробуйте ещё раз.');
    }
    return;
  }

  /* ---- 6. Успех: очищаем корзину и показываем экран ---- */
  cart = {};
  cartItemCache.clear();
  saveCart();
  updateCartUI(); // скроет бейдж и обновит счётчик

  // Сброс кнопки для следующего заказа (иначе она останется disabled до перезагрузки)
  confirmOrderBtn.disabled = false;
  confirmOrderBtn.textContent = 'Подтвердить заказ';

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

  showView('success');
  setTabbarVisible(false);
  setHeaderVisible(false);
  tg?.BackButton?.hide?.();
  hapticNotify('success');

  // Фоновое обновление остатков: сервер их мог уменьшить при списании.
  // Если пользователь вернётся в каталог — увидит актуальные цифры.
  fetchStock().then(() => {
    if (activeView === 'catalog') renderCategories();
    else if (activeView === 'category' && currentCategoryId) {
      renderCategoryProducts(currentCategoryId);
    }
  });
});

successCloseBtn.addEventListener('click', showCatalog);

/* ============================================================
   Кнопка «Назад» в Telegram
============================================================ */
tg?.BackButton?.onClick?.(() => {
  if (activeView === 'detail') closeDetail();
  else if (activeView === 'category') showCatalog();
  else if (activeView === 'checkout') showCart();
  else if (activeView === 'cart') showCatalog();
  else if (activeView === 'success') showCatalog();
  else tg?.close?.();
});

/* ============================================================
   Boot
============================================================ */
async function boot() {
  await fetchStock();
  renderCategories();
  updateBadge();
  showCatalog();
}

boot();
