/**
 * checkout.js — Logika Keranjang Belanja, Kode Promo, & Simulasi Pembayaran (checkout.html)
 */

(() => {
  'use strict';

  const { Auth, Store, UI } = window.TitikBaca;

  const VA_BANKS = {
    BCA: { name: 'BCA Virtual Account', number: '8801 0812 9402 3318' },
    Mandiri: { name: 'Mandiri Virtual Account', number: '8902 2049 1184 7721' },
    BNI: { name: 'BNI Virtual Account', number: '8810 4521 9033 1140' },
    BRI: { name: 'BRIVA Virtual Account', number: '8881 0293 4410 6629' }
  };

  const state = {
    paymentMethod: 'qris', // 'qris' | 'va'
    selectedBank: 'BCA',
    isProcessing: false,
    promoFeedback: null // { type: 'success'|'error', text: string }
  };

  const els = {};

  const cacheDOM = () => {
    els.emptyView = document.getElementById('checkout-empty');
    els.contentView = document.getElementById('checkout-content');
    els.cartCountLabel = document.getElementById('cart-items-count');
    els.cartItemsList = document.getElementById('cart-items-list');
    els.promoForm = document.getElementById('promo-form');
    els.promoInput = document.getElementById('promo-input');
    els.promoSubmitBtn = document.getElementById('promo-submit-btn');
    els.promoActivePill = document.getElementById('promo-active-pill');
    els.promoFeedback = document.getElementById('promo-feedback');
    els.quickPromoBtn = document.getElementById('quick-promo-btn');
    els.summarySubtotal = document.getElementById('summary-subtotal');
    els.summaryDiscountRow = document.getElementById('summary-discount-row');
    els.summaryDiscountLabel = document.getElementById('summary-discount-label');
    els.summaryDiscountValue = document.getElementById('summary-discount-value');
    els.summaryTotal = document.getElementById('summary-total');
    els.methodQrisBtn = document.getElementById('method-qris-btn');
    els.methodVaBtn = document.getElementById('method-va-btn');
    els.panelQris = document.getElementById('payment-panel-qris');
    els.panelVa = document.getElementById('payment-panel-va');
    els.qrisAmount = document.getElementById('qris-amount');
    els.vaBankSelect = document.getElementById('va-bank-select');
    els.vaBankName = document.getElementById('va-bank-name');
    els.vaNumber = document.getElementById('va-number');
    els.vaAmount = document.getElementById('va-amount');
    els.copyVaBtn = document.getElementById('copy-va-btn');
    els.checkoutAuthBanner = document.getElementById('checkout-auth-banner');
    els.paySimulateBtn = document.getElementById('pay-simulate-btn');
    els.crossSellSection = document.getElementById('cross-sell-section');
    els.crossSellList = document.getElementById('cross-sell-list');
    els.paymentOverlay = document.getElementById('payment-processing-overlay');
    els.paymentStageLoading = document.getElementById('payment-stage-loading');
    els.paymentStageSuccess = document.getElementById('payment-stage-success');
    els.paymentOverlayBadge = document.getElementById('payment-overlay-badge');
    els.paymentOverlayTitle = document.getElementById('payment-overlay-title');
    els.paymentOverlayDesc = document.getElementById('payment-overlay-desc');
    els.paymentOverlayProgress = document.getElementById('payment-overlay-progress');
    els.paymentStep1 = document.getElementById('payment-step-1');
    els.paymentStep2 = document.getElementById('payment-step-2');
  };

  /* ------------------------------------------------------------------------
     Render Cart Items
     ------------------------------------------------------------------------ */
  const renderCartItems = (summary) => {
    if (!els.cartItemsList) return;

    if (els.cartCountLabel) {
      els.cartCountLabel.textContent = `${summary.count} judul dipilih`;
    }

    els.cartItemsList.innerHTML = summary.items
      .map(
        (book) => `
        <article class="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 flex gap-4 items-start transition-colors hover:border-gray-300">
          <!-- Sampul Mini 2:3 -->
          <div class="w-16 sm:w-20 shrink-0">
            ${UI.renderBookCover(book, 'mini')}
          </div>

          <!-- Info Item -->
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-[11px] font-semibold uppercase tracking-wider text-[#4B5563] mb-1">
                  ${UI.escapeHTML(book.category)}
                </p>
                <h3 class="font-editorial text-lg font-semibold text-[#111827] leading-snug">
                  ${UI.escapeHTML(book.title)}
                </h3>
                <p class="text-sm text-[#4B5563] mt-0.5">${UI.escapeHTML(book.author)}</p>
              </div>
              <button
                type="button"
                data-remove-cart="${UI.escapeHTML(book.id)}"
                class="p-1.5 rounded-lg text-[#4B5563] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                title="Hapus dari keranjang"
                aria-label="Hapus ${UI.escapeHTML(book.title)} dari keranjang"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>

            <div class="mt-3 pt-3 border-t border-[#E5E7EB] flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2 text-xs text-[#4B5563]">
                <span class="px-2 py-0.5 rounded bg-[#FAFAFA] border border-[#E5E7EB] font-medium text-[#111827]">
                  1 unit
                </span>
                <span>Edisi Digital (${UI.escapeHTML(book.format)})</span>
              </div>
              <span class="text-base font-bold text-[#111827]">
                ${UI.formatRupiah(book.price)}
              </span>
            </div>
          </div>
        </article>
      `
      )
      .join('');
  };

  /* ------------------------------------------------------------------------
     Render Promo & Price Summary
     ------------------------------------------------------------------------ */
  const renderSummary = (summary) => {
    if (els.summarySubtotal) {
      els.summarySubtotal.textContent = UI.formatRupiah(summary.subtotal);
    }

    if (els.summaryDiscountRow) {
      if (summary.promoInfo && summary.discountAmount > 0) {
        els.summaryDiscountRow.classList.remove('hidden');
        els.summaryDiscountRow.classList.add('flex');
        if (els.summaryDiscountLabel) {
          els.summaryDiscountLabel.textContent = `Diskon (${summary.promoInfo.code} 25%)`;
        }
        if (els.summaryDiscountValue) {
          els.summaryDiscountValue.textContent = `-${UI.formatRupiah(summary.discountAmount)}`;
        }
      } else {
        els.summaryDiscountRow.classList.add('hidden');
        els.summaryDiscountRow.classList.remove('flex');
      }
    }

    const totalFormatted = UI.formatRupiah(summary.total);
    if (els.summaryTotal) els.summaryTotal.textContent = totalFormatted;
    if (els.qrisAmount) els.qrisAmount.textContent = totalFormatted;
    if (els.vaAmount) els.vaAmount.textContent = totalFormatted;

    // Promo active pill
    if (els.promoActivePill) {
      if (summary.promoInfo) {
        els.promoActivePill.classList.remove('hidden');
        els.promoActivePill.classList.add('flex');
        els.promoActivePill.innerHTML = `
          <div class="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#111827]">
            <span class="w-2 h-2 rounded-full bg-[#111827]"></span>
            <span>Kode <strong>${UI.escapeHTML(summary.promoInfo.code)}</strong> aktif — Hemat ${UI.formatRupiah(summary.discountAmount)}</span>
          </div>
          <button
            type="button"
            id="remove-promo-btn"
            class="text-xs font-semibold text-[#111827] underline hover:opacity-75"
          >
            Hapus
          </button>
        `;
      } else {
        els.promoActivePill.classList.add('hidden');
        els.promoActivePill.classList.remove('flex');
        els.promoActivePill.innerHTML = '';
      }
    }

    if (els.promoInput && summary.promoInfo && !els.promoInput.value) {
      els.promoInput.value = summary.promoInfo.code;
    }

    // Feedback inline
    if (els.promoFeedback) {
      if (state.promoFeedback) {
        els.promoFeedback.classList.remove('hidden');
        els.promoFeedback.textContent = state.promoFeedback.text;
        els.promoFeedback.className =
          state.promoFeedback.type === 'success'
            ? 'mt-2 text-xs font-medium text-emerald-700'
            : 'mt-2 text-xs font-medium text-red-600';
      } else {
        els.promoFeedback.classList.add('hidden');
        els.promoFeedback.textContent = '';
      }
    }
  };

  /* ------------------------------------------------------------------------
     Render Payment Panel State (QRIS / Virtual Account)
     ------------------------------------------------------------------------ */
  const renderPaymentMethod = () => {
    const isQris = state.paymentMethod === 'qris';

    if (els.methodQrisBtn && els.methodVaBtn) {
      els.methodQrisBtn.className = isQris
        ? 'px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-[#111827] bg-white text-left transition-colors'
        : 'px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] hover:bg-white text-left transition-colors';

      els.methodVaBtn.className = !isQris
        ? 'px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-[#111827] bg-white text-left transition-colors'
        : 'px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] hover:bg-white text-left transition-colors';

      els.methodQrisBtn.setAttribute('aria-pressed', String(isQris));
      els.methodVaBtn.setAttribute('aria-pressed', String(!isQris));
    }

    if (els.panelQris && els.panelVa) {
      els.panelQris.classList.toggle('hidden', !isQris);
      els.panelVa.classList.toggle('hidden', isQris);
    }

    const bank = VA_BANKS[state.selectedBank] || VA_BANKS.BCA;
    if (els.vaBankName) els.vaBankName.textContent = bank.name;
    if (els.vaNumber) els.vaNumber.textContent = bank.number;
  };

  /* ------------------------------------------------------------------------
     Cross-Sell Recommendations (Maks. 2 Judul Relevan yang Belum Dimiliki)
     ------------------------------------------------------------------------ */
  const getCrossSellRecommendations = (summary) => {
    const cartCategories = new Set(summary.items.map((item) => item.category));
    const candidates = Store.getBooks().filter(
      (book) => !Store.isInCart(book.id) && !Store.isOwned(book.id)
    );

    // Prioritaskan kategori yang sama dengan item di keranjang, lalu urutkan rekomendasi
    candidates.sort((a, b) => {
      const aMatch = cartCategories.has(a.category) ? 1 : 0;
      const bMatch = cartCategories.has(b.category) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return a.recommendRank - b.recommendRank;
    });

    return candidates.slice(0, 2);
  };

  const renderCrossSell = (summary) => {
    if (!els.crossSellSection || !els.crossSellList) return;

    const recommendations = getCrossSellRecommendations(summary);
    if (recommendations.length === 0) {
      els.crossSellSection.classList.add('hidden');
      els.crossSellList.innerHTML = '';
      return;
    }

    els.crossSellSection.classList.remove('hidden');
    els.crossSellList.innerHTML = recommendations
      .map(
        (book) => `
        <article class="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-3.5 flex gap-3.5 items-start hover:border-gray-300 transition-colors animate-fade-up">
          <div class="w-14 shrink-0">
            ${UI.renderBookCover(book, 'mini')}
          </div>
          <div class="flex-1 min-w-0 flex flex-col justify-between h-full">
            <div>
              <p class="text-[10px] font-semibold uppercase tracking-wider text-[#4B5563] truncate">
                ${UI.escapeHTML(book.category)}
              </p>
              <h3 class="font-editorial text-sm sm:text-[15px] font-semibold text-[#111827] leading-snug line-clamp-2 mt-0.5">
                ${UI.escapeHTML(book.title)}
              </h3>
              <p class="text-xs text-[#4B5563] mt-0.5 truncate">${UI.escapeHTML(book.author)}</p>
            </div>

            <div class="mt-3 pt-2.5 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-[#111827]">${UI.formatRupiah(book.price)}</span>
              <button
                type="button"
                data-cross-sell-add="${UI.escapeHTML(book.id)}"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#111827] text-white hover:bg-[#1F2937] transition-colors shrink-0"
              >
                + Tambah
              </button>
            </div>
          </div>
        </article>
      `
      )
      .join('');
  };

  /* ------------------------------------------------------------------------
     Render Status Akun Pembeli (Customer Gate)
     ------------------------------------------------------------------------ */
  const renderAuthStatus = () => {
    if (!els.checkoutAuthBanner) return;
    const user = Auth.getCurrentUser();

    if (!user) {
      els.checkoutAuthBanner.innerHTML = `
        <div class="bg-signature-soft border border-[#9FA5D5]/50 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="text-xs text-[#111827] leading-snug">
            <p class="font-bold">Masuk terlebih dahulu untuk membayar</p>
            <p class="text-[#4B5563] mt-0.5">E-book &amp; akses PDF akan disimpan ke akun Customer Anda.</p>
          </div>
          <a
            href="login.html?next=checkout.html"
            class="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#111827] text-white hover:bg-[#1F2937] whitespace-nowrap text-center shrink-0 transition-colors"
          >
            Masuk / Daftar
          </a>
        </div>
      `;
      if (els.paySimulateBtn && !state.isProcessing) {
        els.paySimulateBtn.innerHTML = `
          <span>Masuk untuk Melanjutkan Pembayaran</span>
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        `;
      }
      return;
    }

    if (user.role === 'admin') {
      els.checkoutAuthBanner.innerHTML = `
        <div class="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="text-xs text-[#111827] leading-snug">
            <p class="font-bold">Anda sedang masuk sebagai Admin</p>
            <p class="text-[#4B5563] mt-0.5">Gunakan akun Customer untuk menyelesaikan pembelian e-book.</p>
          </div>
          <a
            href="admin.html"
            class="btn-accent-gradient px-3.5 py-2 rounded-lg text-xs whitespace-nowrap text-center shrink-0"
          >
            Ke Panel Admin
          </a>
        </div>
      `;
      if (els.paySimulateBtn && !state.isProcessing) {
        els.paySimulateBtn.disabled = true;
        els.paySimulateBtn.classList.add('opacity-60', 'cursor-not-allowed');
        els.paySimulateBtn.innerHTML = `<span>Khusus Akun Customer</span>`;
      }
      return;
    }

    els.checkoutAuthBanner.innerHTML = `
      <div class="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs">
        <div class="min-w-0">
          <span class="text-[#4B5563]">Akun Pembeli:</span>
          <strong class="text-[#111827] ml-1">${UI.escapeHTML(user.name)}</strong>
          <span class="text-[#4B5563] hidden sm:inline">(${UI.escapeHTML(user.email)})</span>
        </div>
        <span class="px-2 py-0.5 rounded bg-signature-soft font-semibold text-[#111827] shrink-0">Customer</span>
      </div>
    `;

    if (els.paySimulateBtn && !state.isProcessing) {
      els.paySimulateBtn.disabled = false;
      els.paySimulateBtn.classList.remove('opacity-60', 'cursor-not-allowed');
      els.paySimulateBtn.innerHTML = `
        <span>Simulasi Pembayaran Berhasil</span>
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
        </svg>
      `;
    }
  };

  /* ------------------------------------------------------------------------
     Master Page Render
     ------------------------------------------------------------------------ */
  const renderPage = () => {
    const summary = Store.getCartSummary();

    if (summary.count === 0) {
      if (els.emptyView) els.emptyView.classList.remove('hidden');
      if (els.contentView) els.contentView.classList.add('hidden');
      return;
    }

    if (els.emptyView) els.emptyView.classList.add('hidden');
    if (els.contentView) els.contentView.classList.remove('hidden');

    renderCartItems(summary);
    renderCrossSell(summary);
    renderSummary(summary);
    renderPaymentMethod();
    renderAuthStatus();
  };

  /* ------------------------------------------------------------------------
     Handlers
     ------------------------------------------------------------------------ */
  const applyPromoCode = (code) => {
    if (els.promoSubmitBtn) {
      els.promoSubmitBtn.disabled = true;
      els.promoSubmitBtn.innerHTML = `<span class="inline-flex items-center gap-1.5"><span class="tb-spinner" aria-hidden="true"></span><span>Memeriksa...</span></span>`;
    }

    window.setTimeout(() => {
      const result = Store.applyPromo(code);
      if (els.promoSubmitBtn) {
        els.promoSubmitBtn.disabled = false;
        els.promoSubmitBtn.textContent = 'Terapkan';
      }

      if (result.ok) {
        state.promoFeedback = { type: 'success', text: result.message };
        if (els.promoInput) els.promoInput.value = result.promo.code;
        UI.showToast(`Diskon 25% (${result.promo.code}) diterapkan.`);
      } else {
        state.promoFeedback = { type: 'error', text: result.message };
      }
      renderPage();
    }, 360);
  };

  const handleSimulatePayment = () => {
    if (state.isProcessing) return;

    const currentUser = Auth.getCurrentUser();
    if (!currentUser) {
      window.location.href = 'login.html?next=checkout.html';
      return;
    }
    if (currentUser.role !== 'user') {
      UI.showToast('Masuk menggunakan akun Customer untuk menyelesaikan pembayaran.');
      return;
    }

    const summary = Store.getCartSummary();
    if (summary.count === 0) return;

    state.isProcessing = true;
    const methodLabel =
      state.paymentMethod === 'qris'
        ? 'QRIS Instan'
        : VA_BANKS[state.selectedBank]?.name || 'Transfer Virtual Account';

    if (els.paySimulateBtn) {
      els.paySimulateBtn.disabled = true;
      els.paySimulateBtn.classList.add('opacity-90', 'cursor-wait');
      els.paySimulateBtn.innerHTML = `
        <span class="tb-spinner" aria-hidden="true"></span>
        <span>Memverifikasi Pembayaran...</span>
      `;
    }

    // Tahap 1: Tampilkan overlay loading verifikasi pembayaran
    if (els.paymentOverlay) {
      if (els.paymentStageLoading) els.paymentStageLoading.classList.remove('hidden');
      if (els.paymentStageSuccess) {
        els.paymentStageSuccess.classList.add('hidden');
        els.paymentStageSuccess.classList.remove('flex');
      }
      if (els.paymentOverlayBadge) {
        els.paymentOverlayBadge.textContent = methodLabel;
      }
      if (els.paymentOverlayTitle) {
        els.paymentOverlayTitle.textContent = 'Memverifikasi Pembayaran...';
      }
      if (els.paymentOverlayDesc) {
        els.paymentOverlayDesc.textContent = `Memeriksa transaksi ${UI.formatRupiah(summary.total)} untuk ${summary.count} e-book pilihan Anda.`;
      }
      if (els.paymentOverlayProgress) {
        els.paymentOverlayProgress.style.width = '18%';
      }

      els.paymentOverlay.classList.add('is-open');
      els.paymentOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      window.requestAnimationFrame(() => {
        if (els.paymentOverlayProgress) {
          els.paymentOverlayProgress.style.width = '58%';
        }
      });
    }

    // Tahap 2 (850ms): Pembayaran terverifikasi -> simpan ke ownedBooks -> tampilkan loading persiapan akses PDF
    window.setTimeout(() => {
      const result = Store.completeCheckout(methodLabel);
      if (!result.ok) {
        state.isProcessing = false;
        if (els.paymentOverlay) {
          els.paymentOverlay.classList.remove('is-open');
          els.paymentOverlay.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
        renderPage();
        return;
      }

      if (els.paymentStageLoading) els.paymentStageLoading.classList.add('hidden');
      if (els.paymentStageSuccess) {
        els.paymentStageSuccess.classList.remove('hidden');
        els.paymentStageSuccess.classList.add('flex');
      }
      if (els.paymentOverlayBadge) {
        els.paymentOverlayBadge.textContent = `Pesanan ${result.orderId}`;
        els.paymentOverlayBadge.className =
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] bg-signature-soft border border-[#9FA5D5]/50 text-[#111827] mb-3';
      }
      if (els.paymentOverlayTitle) {
        els.paymentOverlayTitle.textContent = 'Pembayaran Berhasil!';
      }
      if (els.paymentOverlayDesc) {
        els.paymentOverlayDesc.textContent =
          'Menyiapkan akses unduh PDF & mengalihkan Anda ke halaman Pustaka Saya...';
      }
      if (els.paymentStep1) {
        els.paymentStep1.textContent = '1. Pembayaran Lunas ✓';
      }
      if (els.paymentStep2) {
        els.paymentStep2.className = 'text-[#111827] font-semibold';
      }
      if (els.paymentOverlayProgress) {
        els.paymentOverlayProgress.style.width = '100%';
      }

      // Arahkan mulus ke Pustaka Saya setelah animasi konfirmasi selesai
      window.setTimeout(() => {
        window.location.href = 'koleksi.html?status=berhasil';
      }, 1050);
    }, 850);
  };

  const bindEvents = () => {
    // Hapus item keranjang dengan alert konfirmasi
    if (els.cartItemsList) {
      els.cartItemsList.addEventListener('click', async (event) => {
        const removeBtn = event.target.closest('[data-remove-cart]');
        if (!removeBtn) return;
        const bookId = removeBtn.getAttribute('data-remove-cart');
        const book = Store.getBookById(bookId);

        const confirmed = await UI.confirmDialog({
          title: 'Hapus dari keranjang?',
          message: book
            ? `E-book "${book.title}" akan dihapus dari daftar keranjang belanja Anda.`
            : 'Yakin ingin menghapus item ini dari keranjang?',
          confirmLabel: 'Ya, Hapus',
          cancelLabel: 'Batal',
          tone: 'danger'
        });
        if (!confirmed) return;

        Store.removeFromCart(bookId);
        if (book) {
          UI.showToast(`"${book.title}" dihapus dari keranjang.`);
        }
        renderPage();
      });
    }

    // Tambah item dari rekomendasi Cross-Sell
    if (els.crossSellList) {
      els.crossSellList.addEventListener('click', (event) => {
        const addBtn = event.target.closest('[data-cross-sell-add]');
        if (!addBtn) return;
        const bookId = addBtn.getAttribute('data-cross-sell-add');
        const result = Store.addToCart(bookId);
        if (result.ok) {
          UI.showToast(`"${result.book.title}" ditambahkan ke keranjang.`);
          renderPage();
        }
      });
    }

    // Submit form kode promo
    if (els.promoForm) {
      els.promoForm.addEventListener('submit', (event) => {
        event.preventDefault();
        applyPromoCode(els.promoInput ? els.promoInput.value : '');
      });
    }

    // Klik cepat petunjuk DEMOKAMPUS
    if (els.quickPromoBtn) {
      els.quickPromoBtn.addEventListener('click', () => {
        if (els.promoInput) els.promoInput.value = 'DEMOKAMPUS';
        applyPromoCode('DEMOKAMPUS');
      });
    }

    // Hapus promo aktif (delegasi karena tombol dibuat dinamis)
    document.addEventListener('click', (event) => {
      if (event.target && event.target.id === 'remove-promo-btn') {
        Store.clearPromo();
        state.promoFeedback = null;
        if (els.promoInput) els.promoInput.value = '';
        UI.showToast('Kode promo dilepas.');
        renderPage();
      }
    });

    // Pilihan metode pembayaran
    if (els.methodQrisBtn) {
      els.methodQrisBtn.addEventListener('click', () => {
        state.paymentMethod = 'qris';
        renderPaymentMethod();
      });
    }

    if (els.methodVaBtn) {
      els.methodVaBtn.addEventListener('click', () => {
        state.paymentMethod = 'va';
        renderPaymentMethod();
      });
    }

    if (els.vaBankSelect) {
      els.vaBankSelect.addEventListener('change', (event) => {
        state.selectedBank = event.target.value;
        renderPaymentMethod();
      });
    }

    if (els.copyVaBtn) {
      els.copyVaBtn.addEventListener('click', async () => {
        const bank = VA_BANKS[state.selectedBank] || VA_BANKS.BCA;
        const plainNumber = bank.number.replace(/\s+/g, '');
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(plainNumber);
          }
          UI.showToast(`Nomor ${bank.name} disalin.`);
        } catch {
          UI.showToast(`Nomor VA: ${bank.number}`);
        }
      });
    }

    // Tombol utama Simulasi Pembayaran Berhasil
    if (els.paySimulateBtn) {
      els.paySimulateBtn.addEventListener('click', handleSimulatePayment);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    cacheDOM();
    renderPage();
    bindEvents();
  });
})();
