/**
 * store.js — Pengelola State localStorage & Utilitas UI Bersama TitikBaca
 * Menangani keranjang belanja, pustaka milik pengguna, kode promo,
 * generator sampul buku editorial SVG/CSS, notifikasi toast, dan badge navigasi.
 */

(() => {
  'use strict';

  const STORAGE_KEYS = {
    CART: 'titikbaca_cart_v1',
    CART_BY_USER: 'titikbaca_cart_by_user_v1',
    OWNED: 'titikbaca_owned_v1',
    OWNED_BY_USER: 'titikbaca_owned_by_user_v1',
    PROMO: 'titikbaca_promo_v1',
    FLASH: 'titikbaca_checkout_flash_v1',
    USERS: 'titikbaca_users_v1',
    SESSION: 'titikbaca_session_v1',
    RESET_REQUESTS: 'titikbaca_reset_requests_v1'
  };

  const DEFAULT_USERS = [
    {
      id: 'usr-admin-1',
      name: 'Admin TitikBaca',
      email: 'admin@titikbaca.id',
      password: 'admin123',
      role: 'admin',
      createdAt: '2026-01-10T08:00:00.000Z',
      passwordUpdatedAt: null
    },
    {
      id: 'usr-cust-1',
      name: 'Rina Kartika',
      email: 'rina@titikbaca.id',
      password: 'user123',
      role: 'user',
      createdAt: '2026-02-14T09:30:00.000Z',
      passwordUpdatedAt: null
    },
    {
      id: 'usr-cust-2',
      name: 'Fajar Pratama',
      email: 'fajar@titikbaca.id',
      password: 'user123',
      role: 'user',
      createdAt: '2026-03-02T14:15:00.000Z',
      passwordUpdatedAt: null
    }
  ];

  const PROMO_CODES = {
    DEMOKAMPUS: {
      code: 'DEMOKAMPUS',
      rate: 0.25,
      description: 'Potongan 25% Promo Demo Kampus'
    }
  };

  /* ------------------------------------------------------------------------
     Safe localStorage Helpers
     ------------------------------------------------------------------------ */
  const readStorage = (key, fallback) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };

  const writeStorage = (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Abaikan jika storage tidak tersedia
    }
  };

  const removeStorage = (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Abaikan jika storage tidak tersedia
    }
  };

  /* ------------------------------------------------------------------------
     Auth & Role Management (Customer 'user' & 'admin' + Reset Password)
     ------------------------------------------------------------------------ */
  const ensureUsersSeeded = () => {
    const existing = readStorage(STORAGE_KEYS.USERS, null);
    if (Array.isArray(existing) && existing.length > 0) {
      return existing;
    }
    const seeded = DEFAULT_USERS.map((u) => ({ ...u }));
    writeStorage(STORAGE_KEYS.USERS, seeded);
    return seeded;
  };

  const getUsers = () => ensureUsersSeeded();

  const getCustomerUsers = () => getUsers().filter((u) => u.role === 'user');

  const getUserById = (userId) => getUsers().find((u) => u.id === userId) || null;

  const getUserByEmail = (email) => {
    const normalized = String(email || '').trim().toLowerCase();
    return getUsers().find((u) => u.email.toLowerCase() === normalized) || null;
  };

  const getCurrentUser = () => {
    const session = readStorage(STORAGE_KEYS.SESSION, null);
    if (!session || !session.userId) return null;
    const user = getUserById(session.userId);
    if (!user) {
      removeStorage(STORAGE_KEYS.SESSION);
      return null;
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      passwordUpdatedAt: user.passwordUpdatedAt
    };
  };

  const isLoggedIn = () => Boolean(getCurrentUser());
  const isAdmin = () => getCurrentUser()?.role === 'admin';
  const isCustomer = () => getCurrentUser()?.role === 'user';

  const login = (email, password) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const rawPassword = String(password || '');

    if (!normalizedEmail || !rawPassword) {
      return { ok: false, message: 'Email dan password wajib diisi.' };
    }

    const user = getUserByEmail(normalizedEmail);
    if (!user) {
      return { ok: false, message: 'Akun dengan email tersebut belum terdaftar.' };
    }
    if (user.password !== rawPassword) {
      return {
        ok: false,
        message: 'Password salah. Jika lupa password, ajukan reset password ke Admin.'
      };
    }

    writeStorage(STORAGE_KEYS.SESSION, {
      userId: user.id,
      role: user.role,
      loggedInAt: new Date().toISOString()
    });

    UI.updateNavbarBadges();
    UI.renderNavbarAuth();
    return {
      ok: true,
      user: getCurrentUser()
    };
  };

  const register = ({ name, email, password }) => {
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '');

    if (cleanName.length < 2) {
      return { ok: false, message: 'Nama lengkap minimal 2 karakter.' };
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { ok: false, message: 'Format alamat email tidak valid.' };
    }
    if (cleanPassword.length < 6) {
      return { ok: false, message: 'Password minimal 6 karakter.' };
    }
    if (getUserByEmail(cleanEmail)) {
      return { ok: false, message: 'Email tersebut sudah terdaftar. Silakan masuk.' };
    }

    const users = getUsers();
    const newUser = {
      id: `usr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: 'user',
      createdAt: new Date().toISOString(),
      passwordUpdatedAt: null
    };

    writeStorage(STORAGE_KEYS.USERS, [...users, newUser]);
    writeStorage(STORAGE_KEYS.SESSION, {
      userId: newUser.id,
      role: newUser.role,
      loggedInAt: new Date().toISOString()
    });

    UI.updateNavbarBadges();
    UI.renderNavbarAuth();
    return { ok: true, user: getCurrentUser() };
  };

  const logout = () => {
    removeStorage(STORAGE_KEYS.SESSION);
    UI.updateNavbarBadges();
    UI.renderNavbarAuth();
  };

  const getResetRequests = () => {
    const raw = readStorage(STORAGE_KEYS.RESET_REQUESTS, []);
    return Array.isArray(raw) ? raw : [];
  };

  const getPendingResetCount = () =>
    getResetRequests().filter((req) => req.status === 'pending').length;

  const requestPasswordReset = (email, note = '') => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanNote = String(note || '').trim();

    if (!cleanEmail) {
      return { ok: false, message: 'Masukkan email akun Anda terlebih dahulu.' };
    }

    const user = getUserByEmail(cleanEmail);
    if (!user) {
      return { ok: false, message: 'Email tidak ditemukan di daftar akun terdaftar.' };
    }
    if (user.role === 'admin') {
      return { ok: false, message: 'Permintaan ini hanya berlaku untuk akun Customer.' };
    }

    const requests = getResetRequests();
    const existingPending = requests.find(
      (r) => r.userId === user.id && r.status === 'pending'
    );
    if (existingPending) {
      return {
        ok: true,
        alreadyPending: true,
        message: 'Permintaan reset password Anda sudah tercatat dan sedang menunggu Admin.'
      };
    }

    const newReq = {
      id: `rst-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      email: user.email,
      note: cleanNote || 'Lupa password saat mencoba masuk.',
      requestedAt: new Date().toISOString(),
      status: 'pending',
      resolvedAt: null,
      resolvedBy: null
    };

    writeStorage(STORAGE_KEYS.RESET_REQUESTS, [newReq, ...requests]);
    return {
      ok: true,
      request: newReq,
      message: `Permintaan reset password untuk ${user.email} berhasil dikirim ke Admin.`
    };
  };

  const adminChangeUserPassword = (targetUserId, newPassword) => {
    const actor = getCurrentUser();
    if (!actor || actor.role !== 'admin') {
      return { ok: false, message: 'Hanya Admin yang memiliki izin mengubah password pengguna.' };
    }

    const cleanPassword = String(newPassword || '');
    if (cleanPassword.length < 6) {
      return { ok: false, message: 'Password baru minimal 6 karakter.' };
    }

    const users = getUsers();
    const idx = users.findIndex((u) => u.id === targetUserId);
    if (idx === -1) {
      return { ok: false, message: 'Akun pengguna tidak ditemukan.' };
    }
    if (users[idx].role !== 'user') {
      return { ok: false, message: 'Hanya password akun Customer yang dapat diubah dari panel ini.' };
    }

    const nowIso = new Date().toISOString();
    const updatedUser = {
      ...users[idx],
      password: cleanPassword,
      passwordUpdatedAt: nowIso
    };
    const nextUsers = [...users];
    nextUsers[idx] = updatedUser;
    writeStorage(STORAGE_KEYS.USERS, nextUsers);

    // Tandai seluruh permintaan lupa password user ini sebagai selesai
    const requests = getResetRequests();
    const nextRequests = requests.map((req) =>
      req.userId === targetUserId && req.status === 'pending'
        ? {
            ...req,
            status: 'resolved',
            resolvedAt: nowIso,
            resolvedBy: actor.name
          }
        : req
    );
    writeStorage(STORAGE_KEYS.RESET_REQUESTS, nextRequests);

    UI.renderNavbarAuth();
    return {
      ok: true,
      user: updatedUser,
      message: `Password untuk ${updatedUser.name} berhasil diperbarui.`
    };
  };

  /* ------------------------------------------------------------------------
     Store API
     ------------------------------------------------------------------------ */
  const getBooks = () => (window.TitikBaca && window.TitikBaca.BOOKS) || [];

  const getBookById = (bookId) => getBooks().find((book) => book.id === bookId) || null;

  const readOwnedMap = () => {
    const raw = readStorage(STORAGE_KEYS.OWNED_BY_USER, {});
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  };

  const getOwnedBooks = (specificUserId = null) => {
    const targetUserId = specificUserId || (isCustomer() ? getCurrentUser().id : null);
    if (!targetUserId) return [];

    const map = readOwnedMap();
    const raw = map[targetUserId];
    if (!Array.isArray(raw)) return [];
    const validIds = new Set(getBooks().map((b) => b.id));
    return raw.filter((entry) => entry && typeof entry.bookId === 'string' && validIds.has(entry.bookId));
  };

  const getAllOwnedCount = () => {
    const map = readOwnedMap();
    const validIds = new Set(getBooks().map((b) => b.id));
    return Object.values(map).reduce((sum, list) => {
      if (!Array.isArray(list)) return sum;
      return sum + list.filter((e) => e && validIds.has(e.bookId)).length;
    }, 0);
  };

  const getOwnedRecord = (bookId) => getOwnedBooks().find((entry) => entry.bookId === bookId) || null;

  const isOwned = (bookId) => Boolean(getOwnedRecord(bookId));

  const readCartMap = () => {
    const raw = readStorage(STORAGE_KEYS.CART_BY_USER, {});
    return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  };

  const getCart = () => {
    if (!isCustomer()) return [];
    const userId = getCurrentUser().id;
    const map = readCartMap();
    const raw = map[userId];
    if (!Array.isArray(raw)) return [];
    const validIds = new Set(getBooks().map((b) => b.id));
    const ownedIds = new Set(getOwnedBooks(userId).map((e) => e.bookId));
    // Dedup & pastikan buku yang sudah dibeli tidak muncul lagi di keranjang
    const seen = new Set();
    const cleaned = [];
    for (const id of raw) {
      if (typeof id === 'string' && validIds.has(id) && !ownedIds.has(id) && !seen.has(id)) {
        seen.add(id);
        cleaned.push(id);
      }
    }
    return cleaned;
  };

  const isInCart = (bookId) => getCart().includes(bookId);

  const addToCart = (bookId) => {
    const book = getBookById(bookId);
    if (!book) return { ok: false, reason: 'not_found' };
    if (!isLoggedIn()) return { ok: false, reason: 'auth_required', book };
    if (!isCustomer()) return { ok: false, reason: 'customer_only', book };
    if (isOwned(bookId)) return { ok: false, reason: 'already_owned', book };
    const cart = getCart();
    if (cart.includes(bookId)) return { ok: false, reason: 'already_in_cart', book };

    const userId = getCurrentUser().id;
    const map = readCartMap();
    const updated = [...cart, bookId];
    map[userId] = updated;
    writeStorage(STORAGE_KEYS.CART_BY_USER, map);
    UI.updateNavbarBadges();
    return { ok: true, book, count: updated.length };
  };

  const removeFromCart = (bookId) => {
    if (!isCustomer()) return [];
    const userId = getCurrentUser().id;
    const cart = getCart();
    const updated = cart.filter((id) => id !== bookId);
    const map = readCartMap();
    map[userId] = updated;
    writeStorage(STORAGE_KEYS.CART_BY_USER, map);
    if (updated.length === 0) {
      clearPromo();
    }
    UI.updateNavbarBadges();
    return updated;
  };

  const clearCart = () => {
    if (!isCustomer()) return;
    const userId = getCurrentUser().id;
    const map = readCartMap();
    map[userId] = [];
    writeStorage(STORAGE_KEYS.CART_BY_USER, map);
    UI.updateNavbarBadges();
  };

  const getPromo = () => {
    const code = readStorage(STORAGE_KEYS.PROMO, '');
    if (typeof code !== 'string') return '';
    const normalized = code.trim().toUpperCase();
    return PROMO_CODES[normalized] ? normalized : '';
  };

  const getPromoDetails = (code) => {
    if (!code) return null;
    return PROMO_CODES[String(code).trim().toUpperCase()] || null;
  };

  const applyPromo = (rawCode) => {
    const normalized = String(rawCode || '').trim().toUpperCase();
    if (!normalized) {
      return { ok: false, message: 'Masukkan kode promo terlebih dahulu.' };
    }
    const promo = PROMO_CODES[normalized];
    if (!promo) {
      return { ok: false, message: `Kode "${normalized}" tidak ditemukan. Coba gunakan DEMOKAMPUS.` };
    }
    writeStorage(STORAGE_KEYS.PROMO, promo.code);
    return { ok: true, promo, message: `Kode ${promo.code} berhasil diterapkan (potongan 25%).` };
  };

  const clearPromo = () => {
    removeStorage(STORAGE_KEYS.PROMO);
  };

  const getCartSummary = () => {
    const cartIds = getCart();
    const items = cartIds.map((id) => getBookById(id)).filter(Boolean);
    const subtotal = items.reduce((sum, item) => sum + item.price, 0);
    const promoCode = items.length > 0 ? getPromo() : '';
    const promoInfo = getPromoDetails(promoCode);
    const discountAmount = promoInfo ? Math.round(subtotal * promoInfo.rate) : 0;
    const total = Math.max(0, subtotal - discountAmount);

    return {
      items,
      count: items.length,
      subtotal,
      promoCode,
      promoInfo,
      discountAmount,
      total
    };
  };

  const generateOrderId = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TB-${y}${m}${d}-${rand}`;
  };

  const completeCheckout = (paymentMethod = 'QRIS Instan') => {
    const user = getCurrentUser();
    if (!user) {
      return { ok: false, reason: 'auth_required', message: 'Silakan masuk terlebih dahulu.' };
    }
    if (user.role !== 'user') {
      return { ok: false, reason: 'customer_only', message: 'Pembelian hanya tersedia untuk akun Customer.' };
    }

    const summary = getCartSummary();
    if (summary.count === 0) {
      return { ok: false, reason: 'empty_cart' };
    }

    const existingOwned = getOwnedBooks(user.id);
    const existingIds = new Set(existingOwned.map((entry) => entry.bookId));
    const nowIso = new Date().toISOString();
    const orderId = generateOrderId();

    const newEntries = summary.items
      .filter((book) => !existingIds.has(book.id))
      .map((book) => ({
        bookId: book.id,
        userId: user.id,
        buyerName: user.name,
        buyerEmail: user.email,
        purchasedAt: nowIso,
        orderId,
        paymentMethod,
        paidPrice: summary.promoInfo
          ? Math.round(book.price * (1 - summary.promoInfo.rate))
          : book.price
      }));

    // Letakkan pembelian terbaru di urutan paling atas pada pustaka user ini
    const map = readOwnedMap();
    map[user.id] = [...newEntries, ...existingOwned];
    writeStorage(STORAGE_KEYS.OWNED_BY_USER, map);
    clearCart();
    removeStorage(STORAGE_KEYS.PROMO);

    writeStorage(STORAGE_KEYS.FLASH, {
      orderId,
      userId: user.id,
      count: newEntries.length,
      totalPaid: summary.total,
      paymentMethod,
      titles: summary.items.map((b) => b.title),
      purchasedAt: nowIso
    });

    UI.updateNavbarBadges();
    return {
      ok: true,
      orderId,
      count: newEntries.length,
      totalPaid: summary.total
    };
  };

  const consumeCheckoutFlash = () => {
    const payload = readStorage(STORAGE_KEYS.FLASH, null);
    if (payload) {
      removeStorage(STORAGE_KEYS.FLASH);
    }
    return payload;
  };

  const resetDemoData = () => {
    removeStorage(STORAGE_KEYS.CART);
    removeStorage(STORAGE_KEYS.CART_BY_USER);
    removeStorage(STORAGE_KEYS.OWNED);
    removeStorage(STORAGE_KEYS.OWNED_BY_USER);
    removeStorage(STORAGE_KEYS.PROMO);
    removeStorage(STORAGE_KEYS.FLASH);
    removeStorage(STORAGE_KEYS.USERS);
    removeStorage(STORAGE_KEYS.SESSION);
    removeStorage(STORAGE_KEYS.RESET_REQUESTS);
    try {
      window.sessionStorage.removeItem('titikbaca_intro_seen');
    } catch {
      // Abaikan jika sessionStorage tidak tersedia
    }
    ensureUsersSeeded();
    UI.updateNavbarBadges();
    UI.renderNavbarAuth();
  };

  /* ------------------------------------------------------------------------
     Shared UI Utilities (Formatting, Cover Renderer, Badges, Toast)
     ------------------------------------------------------------------------ */
  const escapeHTML = (str) =>
    String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const formatRupiah = (amount) => {
    const num = Number(amount) || 0;
    const formatted = Math.abs(Math.round(num))
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${num < 0 ? '-' : ''}Rp ${formatted}`;
  };

  const formatDateID = (isoString) => {
    try {
      const date = new Date(isoString);
      if (Number.isNaN(date.getTime())) return 'Baru saja';
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'Hari ini';
    }
  };

  const renderCoverPatternSVG = (theme) => {
    const { pattern, accentPrimary, accentSecondary } = theme;

    switch (pattern) {
      case 'arch-grid':
        return `
          <svg class="w-full h-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line x1="0" y1="30" x2="200" y2="30" stroke="${accentPrimary}" stroke-opacity="0.28" stroke-width="1"/>
            <line x1="0" y1="60" x2="200" y2="60" stroke="${accentPrimary}" stroke-opacity="0.28" stroke-width="1"/>
            <line x1="0" y1="90" x2="200" y2="90" stroke="${accentPrimary}" stroke-opacity="0.28" stroke-width="1"/>
            <line x1="50" y1="0" x2="50" y2="120" stroke="${accentPrimary}" stroke-opacity="0.28" stroke-width="1"/>
            <line x1="100" y1="0" x2="100" y2="120" stroke="${accentPrimary}" stroke-opacity="0.28" stroke-width="1"/>
            <line x1="150" y1="0" x2="150" y2="120" stroke="${accentPrimary}" stroke-opacity="0.28" stroke-width="1"/>
            <rect x="50" y="30" width="50" height="60" fill="${accentPrimary}" fill-opacity="0.72"/>
            <rect x="100" y="60" width="50" height="30" fill="${accentSecondary}" fill-opacity="0.88"/>
            <circle cx="150" cy="30" r="14" stroke="${accentSecondary}" stroke-width="2"/>
          </svg>
        `;
      case 'swiss-blocks':
        return `
          <svg class="w-full h-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="16" y="18" width="66" height="66" rx="4" fill="${accentPrimary}" fill-opacity="0.85"/>
            <rect x="92" y="18" width="92" height="28" rx="4" fill="${accentSecondary}" fill-opacity="0.9"/>
            <rect x="92" y="56" width="42" height="46" rx="4" stroke="${accentSecondary}" stroke-width="1.5" stroke-opacity="0.5"/>
            <rect x="144" y="56" width="40" height="46" rx="4" fill="${accentPrimary}" fill-opacity="0.35"/>
            <circle cx="49" cy="51" r="16" fill="#FCEAD9"/>
          </svg>
        `;
      case 'data-bars':
        return `
          <svg class="w-full h-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line x1="18" y1="98" x2="182" y2="98" stroke="${accentSecondary}" stroke-opacity="0.45" stroke-width="1.2"/>
            <rect x="24" y="62" width="18" height="36" rx="2" fill="${accentSecondary}" fill-opacity="0.45"/>
            <rect x="52" y="46" width="18" height="52" rx="2" fill="${accentSecondary}" fill-opacity="0.7"/>
            <rect x="80" y="34" width="18" height="64" rx="2" fill="${accentSecondary}"/>
            <rect x="108" y="52" width="18" height="46" rx="2" fill="${accentPrimary}" fill-opacity="0.72"/>
            <rect x="136" y="22" width="18" height="76" rx="2" fill="${accentPrimary}"/>
            <path d="M33 54 L61 38 L89 28 L117 44 L145 14 L173 20" stroke="${accentPrimary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="145" cy="14" r="3.5" fill="${accentPrimary}"/>
          </svg>
        `;
      case 'orbit-rings':
        return `
          <svg class="w-full h-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="132" cy="60" r="48" stroke="${accentSecondary}" stroke-opacity="0.45" stroke-width="1.2"/>
            <circle cx="132" cy="60" r="32" stroke="${accentPrimary}" stroke-opacity="0.85" stroke-width="1.5"/>
            <circle cx="132" cy="60" r="14" fill="${accentPrimary}"/>
            <line x1="18" y1="60" x2="184" y2="60" stroke="${accentSecondary}" stroke-opacity="0.3" stroke-width="1" stroke-dasharray="3 3"/>
            <circle cx="52" cy="60" r="5" fill="${accentSecondary}"/>
          </svg>
        `;
      case 'layered-steps':
        return `
          <svg class="w-full h-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="18" y="76" width="164" height="24" rx="3" fill="${accentSecondary}" fill-opacity="0.14"/>
            <rect x="18" y="48" width="124" height="24" rx="3" fill="${accentSecondary}" fill-opacity="0.82"/>
            <rect x="18" y="20" width="84" height="24" rx="3" fill="${accentPrimary}"/>
            <rect x="110" y="20" width="72" height="24" rx="3" stroke="${accentSecondary}" stroke-opacity="0.45" stroke-width="1.2"/>
            <circle cx="160" cy="60" r="8" fill="${accentPrimary}"/>
          </svg>
        `;
      case 'editorial-type':
        return `
          <svg class="w-full h-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line x1="18" y1="22" x2="182" y2="22" stroke="#111827" stroke-opacity="0.18" stroke-width="1"/>
            <line x1="18" y1="98" x2="182" y2="98" stroke="#111827" stroke-opacity="0.18" stroke-width="1"/>
            <rect x="18" y="34" width="76" height="52" fill="${accentSecondary}" fill-opacity="0.72"/>
            <rect x="104" y="34" width="78" height="52" fill="${accentPrimary}" fill-opacity="0.65"/>
            <text x="56" y="72" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-size="40" font-weight="600" fill="#111827">Aa</text>
            <line x1="118" y1="50" x2="168" y2="50" stroke="#111827" stroke-width="2"/>
            <line x1="118" y1="60" x2="158" y2="60" stroke="#111827" stroke-opacity="0.55" stroke-width="1.5"/>
            <line x1="118" y1="70" x2="148" y2="70" stroke="#111827" stroke-opacity="0.4" stroke-width="1.5"/>
          </svg>
        `;
      case 'minimal-bands':
        return `
          <svg class="w-full h-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="18" y="20" width="164" height="14" rx="2" fill="${accentPrimary}" fill-opacity="0.78"/>
            <rect x="18" y="42" width="128" height="14" rx="2" fill="${accentSecondary}" fill-opacity="0.95"/>
            <rect x="18" y="64" width="152" height="14" rx="2" fill="#111827" fill-opacity="0.86"/>
            <rect x="18" y="86" width="88" height="14" rx="2" fill="${accentPrimary}" fill-opacity="0.4"/>
          </svg>
        `;
      case 'arc-curves':
      default:
        return `
          <svg class="w-full h-full" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M18 96 A 82 82 0 0 1 182 96" stroke="${accentSecondary}" stroke-opacity="0.28" stroke-width="1.5" fill="none"/>
            <path d="M40 96 A 60 60 0 0 1 160 96" fill="${accentPrimary}" fill-opacity="0.82"/>
            <path d="M68 96 A 32 32 0 0 1 132 96" fill="${accentSecondary}" fill-opacity="0.86"/>
            <line x1="18" y1="96" x2="182" y2="96" stroke="${accentSecondary}" stroke-width="1.5"/>
            <circle cx="100" cy="36" r="5" fill="${accentSecondary}"/>
          </svg>
        `;
    }
  };

  /**
   * Merender komponen sampul buku 2:3 editorial tanpa gambar eksternal
   * @param {Object} book
   * @param {'card'|'compact'|'hero'|'modal'|'mini'} variant
   */
  const renderBookCover = (book, variant = 'card') => {
    const theme = book.coverTheme;
    const isMini = variant === 'mini';
    const isHero = variant === 'hero';
    const isCompact = variant === 'compact';

    const paddingClass = isMini
      ? 'p-2'
      : isHero
        ? 'p-2 sm:p-3.5'
        : isCompact
          ? 'p-3 sm:p-3.5'
          : 'p-4 sm:p-5';

    const titleSizeClass = isMini
      ? 'text-[9px] leading-tight line-clamp-3'
      : isHero
        ? 'text-[10px] sm:text-[13px] leading-tight sm:leading-snug line-clamp-3'
        : isCompact
          ? 'text-xs sm:text-sm leading-snug line-clamp-3'
          : variant === 'modal'
            ? 'text-lg sm:text-xl leading-snug line-clamp-3'
            : 'text-base sm:text-[17px] leading-snug line-clamp-3';

    const metaSizeClass = isMini
      ? 'text-[7px]'
      : isHero
        ? 'text-[7px] sm:text-[9px]'
        : 'text-[10px]';

    const authorSizeClass = isMini
      ? 'text-[8px]'
      : isHero
        ? 'text-[8px] sm:text-[11px]'
        : 'text-xs';

    const patternHeightClass = isHero
      ? 'h-8 sm:h-16'
      : isCompact
        ? 'h-12 sm:h-16'
        : 'h-20 sm:h-24';

    const dividerPadding = isMini || isHero ? 'pb-1 sm:pb-1.5' : 'pb-2';
    const footerPadding = isMini || isHero ? 'pt-1 sm:pt-1.5' : 'pt-2';

    return `
      <div class="book-cover-frame select-none flex flex-col justify-between ${paddingClass}"
           style="background-color: ${theme.bg}; color: ${theme.text};">
        <div class="book-cover-spine"></div>

        <!-- Header Edisi -->
        <div class="relative z-10 flex items-center justify-between gap-1.5 border-b ${dividerPadding}"
             style="border-color: ${theme.mutedText}33;">
          <span class="${metaSizeClass} font-semibold tracking-[0.12em] uppercase shrink-0"
                style="color: ${theme.mutedText};">
            ${escapeHTML(theme.editionCode)}
          </span>
          <span class="${metaSizeClass} font-medium tracking-wide truncate ${isHero ? 'hidden sm:inline' : ''}"
                style="color: ${theme.mutedText};">
            ${isMini ? 'TitikBaca' : escapeHTML(book.category)}
          </span>
        </div>

        <!-- Judul Editorial -->
        <div class="relative z-10 my-auto py-1 sm:py-2">
          <h3 class="font-editorial font-semibold tracking-tight ${titleSizeClass}"
              style="color: ${theme.text};">
            ${escapeHTML(book.title)}
          </h3>
        </div>

        <!-- Aksen Geometris Editorial -->
        ${isMini ? '' : `
          <div class="relative z-10 my-0.5 sm:my-1 ${patternHeightClass} w-full overflow-hidden rounded">
            ${renderCoverPatternSVG(theme)}
          </div>
        `}

        <!-- Nama Penulis -->
        <div class="relative z-10 ${footerPadding} border-t flex items-center justify-between gap-1"
             style="border-color: ${theme.mutedText}33;">
          <span class="${authorSizeClass} font-medium truncate"
                style="color: ${theme.mutedText};">
            ${escapeHTML(book.author)}
          </span>
          ${isMini ? '' : `
            <span class="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0"
                  style="background-color: ${theme.accentPrimary};"></span>
          `}
        </div>
      </div>
    `;
  };

  /* ------------------------------------------------------------------------
     Navbar Badges Synchronization
     ------------------------------------------------------------------------ */
  const updateNavbarBadges = () => {
    const cartCount = getCart().length;
    const ownedCount = getOwnedBooks().length;

    const cartBadges = document.querySelectorAll('[data-cart-badge]');
    cartBadges.forEach((badge) => {
      badge.textContent = String(cartCount);
      if (cartCount > 0) {
        badge.classList.remove('hidden');
        badge.classList.add('inline-flex');
      } else {
        badge.classList.add('hidden');
        badge.classList.remove('inline-flex');
      }
    });

    const libraryBadges = document.querySelectorAll('[data-library-badge]');
    libraryBadges.forEach((badge) => {
      badge.textContent = String(ownedCount);
      if (ownedCount > 0) {
        badge.classList.remove('hidden');
        badge.classList.add('inline-flex');
      } else {
        badge.classList.add('hidden');
        badge.classList.remove('inline-flex');
      }
    });
  };

  /* ------------------------------------------------------------------------
     Toast Notification (Bottom Right)
     ------------------------------------------------------------------------ */
  const ensureToastContainer = () => {
    let container = document.getElementById('tb-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tb-toast-container';
      container.className = 'fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:bottom-5 z-50 flex flex-col gap-2.5 sm:max-w-sm sm:w-full pointer-events-none';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }
    return container;
  };

  const showToast = (message, options = {}) => {
    const { actionLabel, actionHref, duration = 3400 } = options;
    const container = ensureToastContainer();

    const toast = document.createElement('div');
    toast.className =
      'toast-enter pointer-events-auto bg-[#111827] text-white border border-gray-800 rounded-xl px-4 py-3 shadow-lg flex items-center justify-between gap-3 text-sm';

    const actionHtml =
      actionLabel && actionHref
        ? `<a href="${escapeHTML(actionHref)}" class="shrink-0 font-semibold text-[#FED7B8] hover:underline whitespace-nowrap">${escapeHTML(actionLabel)}</a>`
        : '';

    toast.innerHTML = `
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="w-2 h-2 rounded-full shrink-0" style="background: linear-gradient(135deg, #9FA5D5, #FED7B8);"></span>
        <span class="leading-snug">${escapeHTML(message)}</span>
      </div>
      ${actionHtml}
    `;

    container.appendChild(toast);

    window.setTimeout(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      window.setTimeout(() => {
        toast.remove();
      }, 200);
    }, duration);
  };

  /* ------------------------------------------------------------------------
     Navbar Auth Slot Rendering (Guest / Customer / Admin)
     ------------------------------------------------------------------------ */
  const renderNavbarAuth = () => {
    const slots = document.querySelectorAll('[data-auth-slot]');
    if (!slots.length) return;

    const user = getCurrentUser();
    const pendingResets = getPendingResetCount();

    slots.forEach((slot) => {
      if (!user) {
        slot.innerHTML = `
          <a
            href="login.html"
            class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white text-[#111827] border border-[#E5E7EB] hover:bg-gray-50 hover:border-gray-300 whitespace-nowrap transition-colors"
          >
            <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-[#4B5563]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <span>Masuk</span>
          </a>
        `;
        return;
      }

      const firstName = user.name.split(' ')[0];
      const initial = firstName.charAt(0).toUpperCase();

      if (user.role === 'admin') {
        slot.innerHTML = `
          <div class="inline-flex items-center gap-1 sm:gap-1.5">
            <a
              href="admin.html"
              class="btn-accent-gradient inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap"
              title="Buka Panel Admin"
            >
              <span>Admin</span>
              ${
                pendingResets > 0
                  ? `<span class="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold bg-[#111827] text-white">${pendingResets}</span>`
                  : ''
              }
            </a>
            <button
              type="button"
              data-logout-btn
              title="Keluar dari akun Admin"
              aria-label="Keluar"
              class="p-1.5 sm:px-2.5 sm:py-2 rounded-xl text-xs font-medium text-[#4B5563] hover:text-red-600 hover:bg-red-50 border border-[#E5E7EB] bg-white transition-colors"
            >
              <svg class="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span class="hidden sm:inline">Keluar</span>
            </button>
          </div>
        `;
        return;
      }

      slot.innerHTML = `
        <div class="inline-flex items-center gap-1 sm:gap-1.5">
          <a
            href="koleksi.html"
            class="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#FAFAFA] border border-[#E5E7EB] hover:border-gray-300 text-xs sm:text-sm font-medium text-[#111827] whitespace-nowrap transition-colors"
            title="${escapeHTML(user.name)} (${escapeHTML(user.email)})"
          >
            <span class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-signature-gradient text-[11px] font-bold text-[#111827] inline-flex items-center justify-center shrink-0">
              ${escapeHTML(initial)}
            </span>
            <span class="hidden md:inline max-w-[90px] truncate">${escapeHTML(firstName)}</span>
          </a>
          <button
            type="button"
            data-logout-btn
            title="Keluar dari akun"
            aria-label="Keluar"
            class="p-1.5 sm:px-2.5 sm:py-2 rounded-xl text-xs font-medium text-[#4B5563] hover:text-red-600 hover:bg-red-50 border border-[#E5E7EB] bg-white transition-colors"
          >
            <svg class="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            <span class="hidden sm:inline">Keluar</span>
          </button>
        </div>
      `;
    });
  };

  /* ------------------------------------------------------------------------
     Global Editorial Confirmation Alert Modal (UI.confirmDialog)
     ------------------------------------------------------------------------ */
  const confirmDialog = ({
    title = 'Konfirmasi Tindakan',
    message = 'Apakah Anda yakin ingin melanjutkan?',
    confirmLabel = 'Ya, Lanjutkan',
    cancelLabel = 'Batal',
    tone = 'default' // 'default' | 'danger'
  } = {}) =>
    new Promise((resolve) => {
      let backdrop = document.getElementById('tb-global-confirm-modal');
      if (backdrop) backdrop.remove();

      backdrop = document.createElement('div');
      backdrop.id = 'tb-global-confirm-modal';
      backdrop.className =
        'modal-backdrop fixed inset-0 z-[70] bg-[#111827]/50 backdrop-blur-[2px] flex items-center justify-center p-4';
      backdrop.setAttribute('role', 'alertdialog');
      backdrop.setAttribute('aria-modal', 'true');

      const iconHtml =
        tone === 'danger'
          ? `
            <div class="w-11 h-11 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          `
          : `
            <div class="w-11 h-11 rounded-xl bg-signature-soft border border-[#9FA5D5]/50 text-[#111827] flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          `;

      const confirmBtnClass =
        tone === 'danger'
          ? 'px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors'
          : 'px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#111827] text-white hover:bg-[#1F2937] transition-colors';

      backdrop.innerHTML = `
        <div class="modal-panel w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-2xl">
          <div class="flex items-start gap-3.5 mb-5">
            ${iconHtml}
            <div class="min-w-0">
              <h2 class="font-editorial text-xl font-semibold text-[#111827] leading-snug">${escapeHTML(title)}</h2>
              <p class="text-sm text-[#4B5563] leading-relaxed mt-1">${escapeHTML(message)}</p>
            </div>
          </div>
          <div class="flex items-center justify-end gap-2.5">
            <button
              type="button"
              data-tb-confirm-cancel
              class="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-[#E5E7EB] text-[#111827] hover:bg-gray-50 transition-colors"
            >
              ${escapeHTML(cancelLabel)}
            </button>
            <button
              type="button"
              data-tb-confirm-ok
              class="${confirmBtnClass}"
            >
              ${escapeHTML(confirmLabel)}
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(backdrop);
      document.body.style.overflow = 'hidden';

      window.requestAnimationFrame(() => {
        backdrop.classList.add('is-open');
      });

      const cleanup = (answer) => {
        document.removeEventListener('keydown', onKeyDown);
        backdrop.classList.remove('is-open');
        document.body.style.overflow = '';
        window.setTimeout(() => {
          backdrop.remove();
          resolve(answer);
        }, 180);
      };

      const onKeyDown = (event) => {
        if (event.key === 'Escape') cleanup(false);
      };

      document.addEventListener('keydown', onKeyDown);

      backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) cleanup(false);
      });

      const cancelBtn = backdrop.querySelector('[data-tb-confirm-cancel]');
      const okBtn = backdrop.querySelector('[data-tb-confirm-ok]');
      if (cancelBtn) cancelBtn.addEventListener('click', () => cleanup(false));
      if (okBtn) okBtn.addEventListener('click', () => cleanup(true));
    });

  /* ------------------------------------------------------------------------
     Global Editorial Action Loading Overlay (UI.runLoadingFlow)
     ------------------------------------------------------------------------ */
  const runLoadingFlow = ({
    badge = 'Memproses',
    title = 'Mohon Tunggu...',
    desc = 'Sistem sedang memproses permintaan Anda.',
    durationMs = 650,
    onProcess = null,
    successBadge = 'Selesai',
    successTitle = '',
    successDesc = '',
    successDurationMs = 700,
    keepOpenOnSuccess = false
  } = {}) =>
    new Promise((resolve) => {
      let overlay = document.getElementById('tb-global-loading-overlay');
      if (overlay) overlay.remove();

      overlay = document.createElement('div');
      overlay.id = 'tb-global-loading-overlay';
      overlay.className =
        'modal-backdrop fixed inset-0 z-[80] bg-[#FAFAFA]/95 backdrop-blur-sm flex items-center justify-center p-4';
      overlay.setAttribute('role', 'status');
      overlay.setAttribute('aria-live', 'polite');

      overlay.innerHTML = `
        <div class="modal-panel w-full max-w-md bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-xl text-center">
          <div data-tb-stage-loading class="relative w-[76px] h-[76px] mx-auto mb-6 flex items-center justify-center">
            <div class="tb-pay-ring absolute inset-0" aria-hidden="true"></div>
            <img
              src="assets/logo-mark.svg"
              alt="Logo TitikBaca"
              width="46"
              height="46"
              class="w-[46px] h-[46px] rounded-xl relative z-10"
            >
          </div>

          <div data-tb-stage-success class="hidden w-[76px] h-[76px] mx-auto mb-6 items-center justify-center">
            <div class="tb-pay-success-badge w-[72px] h-[72px] rounded-full bg-signature-gradient p-[3px] flex items-center justify-center">
              <div class="w-full h-full rounded-full bg-[#111827] flex items-center justify-center">
                <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.6" aria-hidden="true">
                  <path class="tb-pay-check-path" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
            </div>
          </div>

          <p data-tb-badge class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] bg-[#FAFAFA] border border-[#E5E7EB] text-[#4B5563] mb-3">
            ${escapeHTML(badge)}
          </p>
          <h2 data-tb-title class="font-editorial text-2xl font-semibold text-[#111827] leading-tight">
            ${escapeHTML(title)}
          </h2>
          <p data-tb-desc class="text-sm text-[#4B5563] mt-2 leading-relaxed">
            ${escapeHTML(desc)}
          </p>

          <div class="mt-6 w-full h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
            <div data-tb-progress class="tb-pay-progress-fill h-full rounded-full" style="width: 18%;"></div>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      const progressEl = overlay.querySelector('[data-tb-progress]');
      window.requestAnimationFrame(() => {
        overlay.classList.add('is-open');
        if (progressEl) progressEl.style.width = '58%';
      });

      const closeOverlay = (result) => {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
        window.setTimeout(() => {
          overlay.remove();
          resolve(result);
        }, 200);
      };

      window.setTimeout(() => {
        const result = typeof onProcess === 'function' ? onProcess() : { ok: true };

        if (result && result.ok === false) {
          closeOverlay(result);
          return;
        }

        if (successTitle) {
          const loadingStage = overlay.querySelector('[data-tb-stage-loading]');
          const successStage = overlay.querySelector('[data-tb-stage-success]');
          const badgeEl = overlay.querySelector('[data-tb-badge]');
          const titleEl = overlay.querySelector('[data-tb-title]');
          const descEl = overlay.querySelector('[data-tb-desc]');

          if (loadingStage) loadingStage.classList.add('hidden');
          if (successStage) {
            successStage.classList.remove('hidden');
            successStage.classList.add('flex');
          }
          if (badgeEl) {
            badgeEl.textContent = successBadge;
            badgeEl.className =
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] bg-signature-soft border border-[#9FA5D5]/50 text-[#111827] mb-3';
          }
          if (titleEl) titleEl.textContent = successTitle;
          if (descEl && successDesc) descEl.textContent = successDesc;
          if (progressEl) progressEl.style.width = '100%';

          window.setTimeout(() => {
            if (keepOpenOnSuccess) {
              resolve(result);
            } else {
              closeOverlay(result);
            }
          }, successDurationMs);
        } else {
          if (progressEl) progressEl.style.width = '100%';
          window.setTimeout(() => {
            if (keepOpenOnSuccess) {
              resolve(result);
            } else {
              closeOverlay(result);
            }
          }, 220);
        }
      }, durationMs);
    });

  const UI = {
    escapeHTML,
    formatRupiah,
    formatDateID,
    renderBookCover,
    updateNavbarBadges,
    renderNavbarAuth,
    showToast,
    confirmDialog,
    runLoadingFlow
  };

  const Auth = {
    getUsers,
    getCustomerUsers,
    getUserById,
    getUserByEmail,
    getCurrentUser,
    isLoggedIn,
    isAdmin,
    isCustomer,
    login,
    register,
    logout,
    getResetRequests,
    getPendingResetCount,
    requestPasswordReset,
    adminChangeUserPassword
  };

  const Store = {
    getBooks,
    getBookById,
    getCart,
    isInCart,
    addToCart,
    removeFromCart,
    clearCart,
    getOwnedBooks,
    getAllOwnedCount,
    getOwnedRecord,
    isOwned,
    getPromo,
    getPromoDetails,
    applyPromo,
    clearPromo,
    getCartSummary,
    completeCheckout,
    consumeCheckoutFlash,
    resetDemoData
  };

  window.TitikBaca = window.TitikBaca || {};
  window.TitikBaca.Auth = Auth;
  window.TitikBaca.Store = Store;
  window.TitikBaca.UI = UI;

  // Pastikan data user demo selalu tersedia & sinkronkan navigasi
  document.addEventListener('DOMContentLoaded', () => {
    ensureUsersSeeded();
    UI.updateNavbarBadges();
    UI.renderNavbarAuth();

    document.addEventListener('click', async (event) => {
      const logoutBtn = event.target.closest('[data-logout-btn]');
      if (!logoutBtn) return;

      const user = getCurrentUser();
      const confirmed = await UI.confirmDialog({
        title: 'Keluar dari akun Anda?',
        message: user
          ? `Anda sedang masuk sebagai ${user.name} (${user.email}). Yakin ingin mengakhiri sesi ini?`
          : 'Yakin ingin keluar dari sesi akun Anda saat ini?',
        confirmLabel: 'Ya, Keluar',
        cancelLabel: 'Batal',
        tone: 'danger'
      });

      if (!confirmed) return;

      await UI.runLoadingFlow({
        badge: 'Sesi Akun',
        title: 'Mengeluarkan Sesi...',
        desc: 'Membersihkan sesi login Anda dengan aman.',
        durationMs: 620,
        onProcess: () => {
          logout();
          return { ok: true };
        },
        successBadge: 'Berhasil Keluar',
        successTitle: 'Anda Telah Keluar',
        successDesc: 'Mengalihkan kembali ke halaman masuk...',
        successDurationMs: 650,
        keepOpenOnSuccess: true
      });

      window.location.href = 'login.html?status=keluar';
    });
  });

  window.addEventListener('storage', () => {
    UI.updateNavbarBadges();
    UI.renderNavbarAuth();
  });
})();
