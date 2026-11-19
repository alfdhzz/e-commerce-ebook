/**
 * app.js — Logika Halaman Utama & Katalog E-Book TitikBaca (index.html)
 * Menangani pencarian real-time, filter kategori, pengurutan, status dinamis kartu,
 * modal detail buku, serta mode pratinjau baca cuplikan Bab 1.
 */

(() => {
  'use strict';

  const { Store, UI, CATEGORIES } = window.TitikBaca;

  const state = {
    searchQuery: '',
    activeCategory: 'Semua',
    sortBy: 'recommended',
    activeModalBookId: null,
    modalMode: 'detail' // 'detail' | 'preview'
  };

  // Referensi elemen DOM
  const els = {};

  const cacheDOM = () => {
    els.heroCovers = document.getElementById('hero-featured-covers');
    els.searchInput = document.getElementById('catalog-search');
    els.searchClearBtn = document.getElementById('search-clear-btn');
    els.categoryTabs = document.getElementById('category-tabs');
    els.sortSelect = document.getElementById('catalog-sort');
    els.resultCount = document.getElementById('catalog-result-count');
    els.catalogGrid = document.getElementById('catalog-grid');
    els.emptyState = document.getElementById('catalog-empty');
    els.resetFiltersBtn = document.getElementById('reset-filters-btn');
    els.copyPromoBtn = document.getElementById('copy-promo-btn');
    els.modalBackdrop = document.getElementById('book-modal');
    els.modalContent = document.getElementById('book-modal-content');
    els.modalCloseBtn = document.getElementById('book-modal-close');
  };

  /* ------------------------------------------------------------------------
     Hero Editorial Showcase (3 Sampul Kurasi Tanpa Gambar Eksternal)
     ------------------------------------------------------------------------ */
  const renderHeroShowcase = () => {
    if (!els.heroCovers) return;
    const featuredBooks = Store.getBooks().slice(0, 3);

    els.heroCovers.innerHTML = featuredBooks
      .map(
        (book, index) => `
        <button
          type="button"
          data-open-detail="${UI.escapeHTML(book.id)}"
          class="group text-left focus:outline-none transition-transform duration-300 hover:-translate-y-1.5 ${
            index === 1 ? 'sm:-translate-y-3' : ''
          }"
          title="Lihat detail ${UI.escapeHTML(book.title)}"
        >
          ${UI.renderBookCover(book, 'hero')}
        </button>
      `
      )
      .join('');
  };

  /* ------------------------------------------------------------------------
     Category Tabs
     ------------------------------------------------------------------------ */
  const renderCategoryTabs = () => {
    if (!els.categoryTabs) return;

    els.categoryTabs.innerHTML = CATEGORIES.map((category) => {
      const isActive = state.activeCategory === category;
      const classes = isActive
        ? 'bg-[#111827] text-white border-[#111827] font-semibold'
        : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-gray-300 hover:text-[#111827] font-medium';

      return `
        <button
          type="button"
          data-category="${UI.escapeHTML(category)}"
          aria-pressed="${isActive}"
          class="px-4 py-2 rounded-full text-sm border transition-colors whitespace-nowrap shrink-0 ${classes}"
        >
          ${UI.escapeHTML(category)}
        </button>
      `;
    }).join('');
  };

  /* ------------------------------------------------------------------------
     Filtering & Sorting Logic
     ------------------------------------------------------------------------ */
  const getFilteredBooks = () => {
    const query = state.searchQuery.trim().toLowerCase();
    let list = [...Store.getBooks()];

    if (state.activeCategory !== 'Semua') {
      list = list.filter((book) => book.category === state.activeCategory);
    }

    if (query) {
      list = list.filter((book) => {
        const haystack = `${book.title} ${book.author} ${book.category} ${book.subtitle}`.toLowerCase();
        return haystack.includes(query);
      });
    }

    switch (state.sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'recommended':
      default:
        list.sort((a, b) => a.recommendRank - b.recommendRank);
        break;
    }

    return list;
  };

  /* ------------------------------------------------------------------------
     Catalog Grid Rendering
     ------------------------------------------------------------------------ */
  const renderCardActionButton = (book) => {
    if (Store.isOwned(book.id)) {
      return `
        <a
          href="koleksi.html?baca=${encodeURIComponent(book.id)}"
          class="btn-accent-gradient flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm text-center"
        >
          <span>Buka di Pustaka</span>
        </a>
      `;
    }

    if (Store.isInCart(book.id)) {
      return `
        <a
          href="checkout.html"
          class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#EEF0FA] text-[#111827] border border-[#9FA5D5] hover:bg-[#E4E7F7] transition-colors text-center"
          title="Lihat di halaman keranjang"
        >
          <span>Di Keranjang ✓</span>
        </a>
      `;
    }

    return `
      <button
        type="button"
        data-add-cart="${UI.escapeHTML(book.id)}"
        class="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#111827] text-white hover:bg-[#1F2937] transition-colors"
      >
        <span>+ Keranjang</span>
      </button>
    `;
  };

  const renderStatusBadge = (book) => {
    if (Store.isOwned(book.id)) {
      return `
        <span class="bg-signature-gradient inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold shadow-sm">
          Dimiliki
        </span>
      `;
    }
    if (book.badge) {
      return `
        <span class="bg-white/95 text-[#111827] border border-[#E5E7EB] inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold shadow-sm">
          ${UI.escapeHTML(book.badge)}
        </span>
      `;
    }
    return '';
  };

  const renderCatalog = () => {
    if (!els.catalogGrid) return;

    const totalBooks = Store.getBooks().length;
    const filtered = getFilteredBooks();

    if (els.resultCount) {
      els.resultCount.textContent = `Menampilkan ${filtered.length} dari ${totalBooks} judul`;
    }

    if (filtered.length === 0) {
      els.catalogGrid.innerHTML = '';
      els.catalogGrid.classList.add('hidden');
      if (els.emptyState) els.emptyState.classList.remove('hidden');
      return;
    }

    els.catalogGrid.classList.remove('hidden');
    if (els.emptyState) els.emptyState.classList.add('hidden');

    els.catalogGrid.innerHTML = filtered
      .map((book) => {
        const badgeHtml = renderStatusBadge(book);
        return `
          <article class="book-card rounded-2xl p-4 flex flex-col justify-between animate-fade-up">
            <div>
              <!-- Sampul 2:3 -->
              <div class="relative mb-4">
                <button
                  type="button"
                  data-open-detail="${UI.escapeHTML(book.id)}"
                  class="block w-full text-left focus:outline-none"
                  aria-label="Lihat detail ${UI.escapeHTML(book.title)}"
                >
                  ${UI.renderBookCover(book, 'card')}
                </button>
                ${badgeHtml ? `<div class="absolute top-2.5 left-2.5 z-20 pointer-events-none">${badgeHtml}</div>` : ''}
              </div>

              <!-- Tag Kategori & Rating -->
              <div class="flex items-center justify-between gap-2 mb-2">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-[#4B5563] truncate">
                  ${UI.escapeHTML(book.category)}
                </span>
                <span class="inline-flex items-center gap-1 text-xs font-semibold text-[#111827] shrink-0">
                  <svg class="w-3.5 h-3.5 text-amber-500 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  ${book.rating.toFixed(1)}
                </span>
              </div>

              <!-- Judul & Penulis -->
              <h3 class="font-editorial text-lg font-semibold text-[#111827] leading-snug mb-1 line-clamp-2">
                <button
                  type="button"
                  data-open-detail="${UI.escapeHTML(book.id)}"
                  class="text-left hover:underline decoration-[#9FA5D5] underline-offset-4"
                >
                  ${UI.escapeHTML(book.title)}
                </button>
              </h3>
              <p class="text-sm text-[#4B5563] mb-3">${UI.escapeHTML(book.author)}</p>
            </div>

            <!-- Metadata, Harga & Aksi -->
            <div class="pt-3 border-t border-[#E5E7EB]">
              <div class="flex items-baseline justify-between gap-2 mb-3.5">
                <span class="text-base sm:text-lg font-bold text-[#111827] tracking-tight">
                  ${UI.formatRupiah(book.price)}
                </span>
                <span class="text-xs text-[#4B5563]">
                  ${book.pages} hlm · ${book.year}
                </span>
              </div>

              <div class="flex items-center gap-2">
                ${renderCardActionButton(book)}
                <button
                  type="button"
                  data-open-detail="${UI.escapeHTML(book.id)}"
                  class="px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium bg-white text-[#111827] border border-[#E5E7EB] hover:bg-gray-50 hover:border-gray-300 transition-colors shrink-0"
                >
                  Detail
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  };

  /* ------------------------------------------------------------------------
     Book Detail & Chapter 1 Sample Preview Modal
     ------------------------------------------------------------------------ */
  const renderModalPrimaryAction = (book) => {
    if (Store.isOwned(book.id)) {
      return `
        <a
          href="koleksi.html?baca=${encodeURIComponent(book.id)}"
          class="btn-accent-gradient inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
        >
          <span>Buka di Pustaka</span>
        </a>
      `;
    }

    if (Store.isInCart(book.id)) {
      return `
        <a
          href="checkout.html"
          class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-[#EEF0FA] text-[#111827] border border-[#9FA5D5] hover:bg-[#E4E7F7] transition-colors"
        >
          <span>Di Keranjang ✓ — Lanjut Checkout</span>
        </a>
      `;
    }

    return `
      <button
        type="button"
        data-modal-add-cart="${UI.escapeHTML(book.id)}"
        class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-[#111827] text-white hover:bg-[#1F2937] transition-colors"
      >
        <span>Tambah ke Keranjang</span>
      </button>
    `;
  };

  const renderModalContent = () => {
    if (!els.modalContent || !state.activeModalBookId) return;
    const book = Store.getBookById(state.activeModalBookId);
    if (!book) return;

    if (state.modalMode === 'preview') {
      const { sampleChapter } = book;
      els.modalContent.innerHTML = `
        <div class="flex flex-col max-h-[88dvh]">
          <!-- Header Pratinjau Baca -->
          <div class="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#E5E7EB] bg-[#FAFAFA] rounded-t-2xl">
            <button
              type="button"
              data-modal-mode="detail"
              class="inline-flex items-center gap-1.5 text-sm font-semibold text-[#111827] hover:text-[#4B5563] transition-colors"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
              </svg>
              <span>Kembali ke Detail</span>
            </button>
            <div class="flex items-center gap-2 pr-8">
              <span class="bg-signature-soft px-3 py-1 rounded-full text-xs font-semibold text-[#111827]">
                Pratinjau Gratis · ${UI.escapeHTML(sampleChapter.readingTime)}
              </span>
            </div>
          </div>

          <!-- Area Baca Nyaman -->
          <div class="overflow-y-auto px-6 sm:px-10 py-8 sm:py-10 bg-white">
            <div class="max-w-2xl mx-auto">
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-[#4B5563] mb-2">
                ${UI.escapeHTML(book.title)} — ${UI.escapeHTML(book.author)}
              </p>
              <p class="text-sm font-semibold text-[#4B5563] mb-1">${UI.escapeHTML(sampleChapter.number)}</p>
              <h2 class="font-editorial text-2xl sm:text-3xl font-semibold text-[#111827] leading-tight mb-8 pb-5 border-b border-[#E5E7EB]">
                ${UI.escapeHTML(sampleChapter.title)}
              </h2>

              <div class="reader-prose reader-size-md">
                ${sampleChapter.paragraphs.map((para) => `<p>${UI.escapeHTML(para)}</p>`).join('')}
              </div>

              <!-- Catatan Akhir Cuplikan -->
              <div class="mt-10 p-5 rounded-xl bg-signature-soft border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p class="text-sm font-semibold text-[#111827]">Akhir Cuplikan Gratis ${UI.escapeHTML(sampleChapter.number)}</p>
                  <p class="text-xs sm:text-sm text-[#4B5563] mt-0.5">
                    Dapatkan edisi lengkap ${book.pages} halaman dalam format ${UI.escapeHTML(book.format)}.
                  </p>
                </div>
                <div class="shrink-0">
                  ${renderModalPrimaryAction(book)}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Mode Detail Buku
    els.modalContent.innerHTML = `
      <div class="overflow-y-auto max-h-[88dvh] p-6 sm:p-8">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
          <!-- Kolom Sampul & Metadata -->
          <div class="md:col-span-4 flex flex-col gap-4">
            <div class="max-w-[240px] mx-auto md:max-w-none w-full">
              ${UI.renderBookCover(book, 'modal')}
            </div>

            <div class="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 space-y-2.5 text-xs sm:text-sm">
              <div class="flex justify-between gap-2">
                <span class="text-[#4B5563]">Format</span>
                <span class="font-semibold text-[#111827]">${UI.escapeHTML(book.format)}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-[#4B5563]">Jumlah Halaman</span>
                <span class="font-semibold text-[#111827]">${book.pages} halaman</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-[#4B5563]">Tahun Terbit</span>
                <span class="font-semibold text-[#111827]">${book.year}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-[#4B5563]">Bahasa</span>
                <span class="font-semibold text-[#111827]">${UI.escapeHTML(book.language)}</span>
              </div>
              <div class="flex justify-between gap-2">
                <span class="text-[#4B5563]">ISBN</span>
                <span class="font-medium text-[#111827]">${UI.escapeHTML(book.isbn)}</span>
              </div>
              <div class="pt-2.5 mt-1 border-t border-[#E5E7EB]">
                ${
                  Store.isOwned(book.id)
                    ? `
                      <div class="flex items-center gap-2 text-emerald-700 font-semibold text-xs">
                        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Pembayaran lunas · Unduh PDF terbuka</span>
                      </div>
                    `
                    : `
                      <div class="flex items-start gap-2 text-[#4B5563] text-xs leading-snug">
                        <svg class="w-4 h-4 shrink-0 text-[#111827] mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                        <span><strong class="text-[#111827]">Unduh PDF terkunci.</strong> Selesaikan pembayaran untuk membuka unduhan file PDF penuh.</span>
                      </div>
                    `
                }
              </div>
            </div>
          </div>

          <!-- Kolom Informasi & Sinopsis -->
          <div class="md:col-span-8 flex flex-col justify-between">
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-3 pr-8">
                <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FAFAFA] border border-[#E5E7EB] text-[#4B5563]">
                  ${UI.escapeHTML(book.category)}
                </span>
                ${
                  Store.isOwned(book.id)
                    ? `<span class="bg-signature-gradient px-2.5 py-1 rounded-md text-xs font-semibold">Sudah Dimiliki</span>`
                    : book.badge
                      ? `<span class="bg-signature-soft px-2.5 py-1 rounded-md text-xs font-semibold text-[#111827]">${UI.escapeHTML(book.badge)}</span>`
                      : ''
                }
                <span class="inline-flex items-center gap-1 text-xs font-semibold text-[#111827] ml-auto">
                  <svg class="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  ${book.rating.toFixed(1)} (${book.reviewCount} ulasan)
                </span>
              </div>

              <h2 class="font-editorial text-2xl sm:text-3xl font-semibold text-[#111827] leading-tight mb-1.5">
                ${UI.escapeHTML(book.title)}
              </h2>
              <p class="text-sm sm:text-base text-[#4B5563] mb-3">
                ${UI.escapeHTML(book.subtitle)}
              </p>
              <p class="text-sm text-[#111827] font-medium mb-5 pb-5 border-b border-[#E5E7EB]">
                Oleh <span class="font-semibold">${UI.escapeHTML(book.author)}</span>
                <span class="text-[#4B5563] font-normal"> · ${UI.escapeHTML(book.authorRole)}</span>
              </p>

              <!-- Sinopsis -->
              <div class="mb-5">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-[#4B5563] mb-2">Sinopsis</h3>
                <div class="space-y-3 text-sm sm:text-[15px] leading-relaxed text-[#4B5563]">
                  ${book.synopsis.map((p) => `<p>${UI.escapeHTML(p)}</p>`).join('')}
                </div>
              </div>

              <!-- Poin Pembahasan -->
              <div class="mb-6">
                <h3 class="text-xs font-semibold uppercase tracking-wider text-[#4B5563] mb-2.5">Pokok Bahasan Utama</h3>
                <ul class="space-y-2">
                  ${book.highlights
                    .map(
                      (item) => `
                    <li class="flex items-start gap-2.5 text-sm text-[#111827]">
                      <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#9FA5D5] shrink-0"></span>
                      <span>${UI.escapeHTML(item)}</span>
                    </li>
                  `
                    )
                    .join('')}
                </ul>
              </div>
            </div>

            <!-- Bar Harga & Dua Tombol Aksi Utama -->
            <div class="pt-5 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span class="block text-xs text-[#4B5563]">Edisi Digital Penuh (Tanpa DRM)</span>
                <span class="text-2xl font-bold text-[#111827] tracking-tight">${UI.formatRupiah(book.price)}</span>
              </div>

              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  data-modal-mode="preview"
                  class="btn-accent-gradient inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                  <span>Baca Cuplikan Bab 1</span>
                </button>
                ${renderModalPrimaryAction(book)}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const openBookModal = (bookId, mode = 'detail') => {
    const book = Store.getBookById(bookId);
    if (!book || !els.modalBackdrop) return;

    state.activeModalBookId = bookId;
    state.modalMode = mode;
    renderModalContent();

    els.modalBackdrop.classList.add('is-open');
    els.modalBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeBookModal = () => {
    if (!els.modalBackdrop) return;
    els.modalBackdrop.classList.remove('is-open');
    els.modalBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.activeModalBookId = null;
    state.modalMode = 'detail';
  };

  /* ------------------------------------------------------------------------
     Actions & Event Listeners
     ------------------------------------------------------------------------ */
  const handleAddToCart = (bookId) => {
    const result = Store.addToCart(bookId);
    if (result.ok) {
      renderCatalog();
      if (state.activeModalBookId === bookId) {
        renderModalContent();
      }
      UI.showToast(`"${result.book.title}" ditambahkan ke keranjang.`, {
        actionLabel: 'Lihat Keranjang',
        actionHref: 'checkout.html'
      });
    } else if (result.reason === 'already_in_cart') {
      UI.showToast('Judul ini sudah berada di keranjang Anda.', {
        actionLabel: 'Checkout',
        actionHref: 'checkout.html'
      });
    } else if (result.reason === 'already_owned') {
      UI.showToast('Anda sudah memiliki e-book ini di Pustaka Saya.', {
        actionLabel: 'Buka Pustaka',
        actionHref: 'koleksi.html'
      });
    }
  };

  const handleCopyPromo = async () => {
    const code = 'DEMOKAMPUS';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      }
      UI.showToast(`Kode promo ${code} disalin. Gunakan saat checkout untuk diskon 25%.`);
    } catch {
      UI.showToast(`Gunakan kode promo ${code} di halaman checkout untuk diskon 25%.`);
    }
  };

  const bindEvents = () => {
    // Pencarian real-time
    if (els.searchInput) {
      els.searchInput.addEventListener('input', (event) => {
        state.searchQuery = event.target.value;
        if (els.searchClearBtn) {
          els.searchClearBtn.classList.toggle('hidden', state.searchQuery.length === 0);
        }
        renderCatalog();
      });
    }

    if (els.searchClearBtn) {
      els.searchClearBtn.addEventListener('click', () => {
        state.searchQuery = '';
        if (els.searchInput) {
          els.searchInput.value = '';
          els.searchInput.focus();
        }
        els.searchClearBtn.classList.add('hidden');
        renderCatalog();
      });
    }

    // Tab kategori
    if (els.categoryTabs) {
      els.categoryTabs.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-category]');
        if (!btn) return;
        state.activeCategory = btn.getAttribute('data-category') || 'Semua';
        renderCategoryTabs();
        renderCatalog();
      });
    }

    // Dropdown urutkan
    if (els.sortSelect) {
      els.sortSelect.addEventListener('change', (event) => {
        state.sortBy = event.target.value;
        renderCatalog();
      });
    }

    // Reset filter di empty state
    if (els.resetFiltersBtn) {
      els.resetFiltersBtn.addEventListener('click', () => {
        state.searchQuery = '';
        state.activeCategory = 'Semua';
        state.sortBy = 'recommended';
        if (els.searchInput) els.searchInput.value = '';
        if (els.searchClearBtn) els.searchClearBtn.classList.add('hidden');
        if (els.sortSelect) els.sortSelect.value = 'recommended';
        renderCategoryTabs();
        renderCatalog();
      });
    }

    // Salin kode promo banner
    if (els.copyPromoBtn) {
      els.copyPromoBtn.addEventListener('click', handleCopyPromo);
    }

    // Delegasi klik pada Hero Showcase & Katalog
    document.addEventListener('click', (event) => {
      const detailTrigger = event.target.closest('[data-open-detail]');
      if (detailTrigger) {
        const bookId = detailTrigger.getAttribute('data-open-detail');
        openBookModal(bookId, 'detail');
        return;
      }

      const addCartBtn = event.target.closest('[data-add-cart]');
      if (addCartBtn) {
        const bookId = addCartBtn.getAttribute('data-add-cart');
        handleAddToCart(bookId);
        return;
      }

      const modalModeBtn = event.target.closest('[data-modal-mode]');
      if (modalModeBtn && state.activeModalBookId) {
        state.modalMode = modalModeBtn.getAttribute('data-modal-mode') || 'detail';
        renderModalContent();
        return;
      }

      const modalAddBtn = event.target.closest('[data-modal-add-cart]');
      if (modalAddBtn) {
        const bookId = modalAddBtn.getAttribute('data-modal-add-cart');
        handleAddToCart(bookId);
      }
    });

    // Tutup modal
    if (els.modalCloseBtn) {
      els.modalCloseBtn.addEventListener('click', closeBookModal);
    }

    if (els.modalBackdrop) {
      els.modalBackdrop.addEventListener('click', (event) => {
        if (event.target === els.modalBackdrop) {
          closeBookModal();
        }
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && state.activeModalBookId) {
        closeBookModal();
      }
    });
  };

  /* ------------------------------------------------------------------------
     Opening Preloader (Logo + Nama Web TitikBaca)
     ------------------------------------------------------------------------ */
  const initPreloader = () => {
    const preloader = document.getElementById('tb-preloader');
    if (!preloader) return;

    if (document.documentElement.classList.contains('tb-skip-splash')) {
      preloader.remove();
      return;
    }

    document.body.style.overflow = 'hidden';

    const prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const displayDuration = prefersReduced ? 350 : 1350;

    window.setTimeout(() => {
      preloader.classList.add('is-leaving');
      document.body.style.overflow = '';
      try {
        window.sessionStorage.setItem('titikbaca_intro_seen', '1');
      } catch {
        // Abaikan jika sessionStorage tidak tersedia
      }
      window.setTimeout(() => {
        preloader.remove();
      }, 480);
    }, displayDuration);
  };

  /* ------------------------------------------------------------------------
     Init
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    cacheDOM();
    renderHeroShowcase();
    renderCategoryTabs();
    renderCatalog();
    bindEvents();
  });
})();
