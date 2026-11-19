/**
 * library.js — Logika Halaman "Pustaka Saya" (koleksi.html)
 * Menampilkan e-book terbeli, konfirmasi pembayaran berhasil,
 * E-Reader Modal dengan pengatur ukuran teks (Kecil, Normal, Besar),
 * generator unduhan file PDF nyata (.pdf via Pure-JS PDF 1.4 khusus e-book terbayar),
 * opsi unduhan teks (.txt), serta utilitas Reset Data Demo.
 */

(() => {
  'use strict';

  const { Auth, Store, UI } = window.TitikBaca;

  const state = {
    activeReaderBookId: null,
    fontSize: 'md' // 'sm' (Kecil) | 'md' (Normal) | 'lg' (Besar)
  };

  const els = {};

  const cacheDOM = () => {
    els.successBanner = document.getElementById('checkout-success-banner');
    els.ownerLabel = document.getElementById('library-owner-label');
    els.libraryCount = document.getElementById('library-total-count');
    els.authGate = document.getElementById('library-auth-gate');
    els.gateTitle = document.getElementById('library-gate-title');
    els.gateDesc = document.getElementById('library-gate-desc');
    els.gateActions = document.getElementById('library-gate-actions');
    els.emptyState = document.getElementById('library-empty');
    els.libraryGrid = document.getElementById('library-grid');
    els.readerModal = document.getElementById('reader-modal');
    els.readerTitle = document.getElementById('reader-book-title');
    els.readerAuthor = document.getElementById('reader-book-author');
    els.readerBody = document.getElementById('reader-body');
    els.readerCloseBtn = document.getElementById('reader-close-btn');
    els.readerDownloadBtn = document.getElementById('reader-download-btn');
    els.fontSizeControls = document.getElementById('reader-font-controls');
    els.resetDemoBtn = document.getElementById('reset-demo-btn');
    els.resetConfirmModal = document.getElementById('reset-confirm-modal');
    els.resetCancelBtn = document.getElementById('reset-cancel-btn');
    els.resetConfirmBtn = document.getElementById('reset-confirm-btn');
  };

  /* ------------------------------------------------------------------------
     Banner Konfirmasi Pembelian Berhasil
     ------------------------------------------------------------------------ */
  const renderCheckoutBanner = () => {
    if (!els.successBanner) return;
    const flash = Store.consumeCheckoutFlash();
    if (!flash) {
      els.successBanner.classList.add('hidden');
      return;
    }

    const countText =
      flash.count === 1
        ? `1 e-book baru telah dibuka akses baca & unduh PDF-nya di Pustaka Saya.`
        : `${flash.count} e-book baru telah dibuka akses baca & unduh PDF-nya di Pustaka Saya.`;

    els.successBanner.classList.remove('hidden');
    els.successBanner.innerHTML = `
      <div class="bg-signature-soft border border-[#9FA5D5]/50 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
        <div class="flex items-start gap-3.5">
          <div class="w-9 h-9 rounded-xl bg-[#111827] text-white flex items-center justify-center shrink-0 mt-0.5">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div>
            <p class="text-sm sm:text-base font-bold text-[#111827]">Pembayaran Berhasil Diverifikasi</p>
            <p class="text-sm text-[#111827]/85 mt-0.5">
              ${UI.escapeHTML(countText)} Nomor pesanan <strong>${UI.escapeHTML(flash.orderId)}</strong>
              melalui ${UI.escapeHTML(flash.paymentMethod)} (${UI.formatRupiah(flash.totalPaid)}).
            </p>
          </div>
        </div>
        <button
          type="button"
          id="dismiss-success-banner"
          class="self-start sm:self-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/85 hover:bg-white text-[#111827] border border-[#E5E7EB] transition-colors shrink-0"
        >
          Tutup
        </button>
      </div>
    `;

    const dismissBtn = document.getElementById('dismiss-success-banner');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        els.successBanner.classList.add('hidden');
      });
    }
  };

  /* ------------------------------------------------------------------------
     Render Koleksi Pustaka Saya
     ------------------------------------------------------------------------ */
  const renderLibrary = () => {
    const currentUser = Auth.getCurrentUser();

    if (!currentUser || currentUser.role !== 'user') {
      if (els.ownerLabel) {
        els.ownerLabel.textContent = currentUser?.role === 'admin' ? 'Sesi Admin Aktif' : 'Koleksi Digital Pribadi';
      }
      if (els.libraryCount) els.libraryCount.textContent = '0 E-Book Dimiliki';
      if (els.emptyState) els.emptyState.classList.add('hidden');
      if (els.libraryGrid) {
        els.libraryGrid.classList.add('hidden');
        els.libraryGrid.innerHTML = '';
      }
      if (els.authGate) {
        els.authGate.classList.remove('hidden');
        if (currentUser?.role === 'admin') {
          if (els.gateTitle) els.gateTitle.textContent = 'Anda Sedang Masuk sebagai Admin';
          if (els.gateDesc) {
            els.gateDesc.textContent =
              'Pustaka Saya diperuntukkan bagi akun Customer. Kelola pengguna dan permintaan lupa password melalui Panel Admin.';
          }
          if (els.gateActions) {
            els.gateActions.innerHTML = `
              <a href="admin.html" class="btn-accent-gradient inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm">
                Buka Panel Admin
              </a>
              <a href="index.html" class="inline-flex items-center justify-center px-5 py-3 rounded-xl text-sm font-semibold bg-white border border-[#E5E7EB] text-[#111827] hover:bg-gray-50 transition-colors">
                Jelajahi Katalog
              </a>
            `;
          }
        }
      }
      return;
    }

    if (els.authGate) els.authGate.classList.add('hidden');
    if (els.ownerLabel) {
      els.ownerLabel.textContent = `Koleksi Pribadi · ${currentUser.name} (${currentUser.email})`;
    }

    const ownedRecords = Store.getOwnedBooks();
    const ownedItems = ownedRecords
      .map((record) => ({
        record,
        book: Store.getBookById(record.bookId)
      }))
      .filter((entry) => Boolean(entry.book));

    if (els.libraryCount) {
      els.libraryCount.textContent = `${ownedItems.length} E-Book Dimiliki`;
    }

    if (ownedItems.length === 0) {
      if (els.emptyState) els.emptyState.classList.remove('hidden');
      if (els.libraryGrid) {
        els.libraryGrid.classList.add('hidden');
        els.libraryGrid.innerHTML = '';
      }
      return;
    }

    if (els.emptyState) els.emptyState.classList.add('hidden');
    if (els.libraryGrid) els.libraryGrid.classList.remove('hidden');

    els.libraryGrid.innerHTML = ownedItems
      .map(
        ({ book, record }) => `
        <article class="bg-white border border-[#E5E7EB] rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start transition-all hover:border-gray-300 animate-fade-up">
          <!-- Sampul 2:3 -->
          <div class="w-36 sm:w-32 shrink-0 mx-auto sm:mx-0">
            <button
              type="button"
              data-read-book="${UI.escapeHTML(book.id)}"
              class="block w-full text-left focus:outline-none"
              aria-label="Baca ${UI.escapeHTML(book.title)}"
            >
              ${UI.renderBookCover(book, 'compact')}
            </button>
          </div>

          <!-- Detail Kepemilikan & Aksi -->
          <div class="flex-1 min-w-0 flex flex-col justify-between h-full w-full">
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="bg-signature-gradient px-2.5 py-0.5 rounded-md text-[11px] font-semibold">
                  Lunas · PDF Terbuka
                </span>
                <span class="text-xs font-medium text-[#4B5563]">
                  ${UI.escapeHTML(book.category)}
                </span>
              </div>

              <h2 class="font-editorial text-xl font-semibold text-[#111827] leading-snug mb-1">
                ${UI.escapeHTML(book.title)}
              </h2>
              <p class="text-sm text-[#4B5563] mb-3">${UI.escapeHTML(book.author)} · ${book.pages} halaman</p>

              <div class="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 text-xs text-[#4B5563] space-y-1 mb-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span>Tanggal Pembelian</span>
                  <span class="font-semibold text-[#111827]">${UI.escapeHTML(UI.formatDateID(record.purchasedAt))}</span>
                </div>
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span>No. Pesanan</span>
                  <span class="font-medium text-[#111827]">${UI.escapeHTML(record.orderId || 'TB-DEMO')} · ${UI.escapeHTML(record.paymentMethod || 'QRIS Instan')}</span>
                </div>
              </div>
            </div>

            <!-- Aksi Nyata Setelah Pembayaran: Baca Sekarang, Unduh PDF, & Unduh .txt -->
            <div class="flex flex-wrap items-center gap-2 pt-2">
              <button
                type="button"
                data-read-book="${UI.escapeHTML(book.id)}"
                class="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#111827] text-white hover:bg-[#1F2937] transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                <span>Baca Sekarang</span>
              </button>

              <button
                type="button"
                data-download-pdf="${UI.escapeHTML(book.id)}"
                class="btn-accent-gradient flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                <span>Unduh PDF</span>
              </button>

              <button
                type="button"
                data-download-txt="${UI.escapeHTML(book.id)}"
                class="inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:bg-gray-50 transition-colors"
                title="Unduh versi teks polos (.txt)"
              >
                .txt
              </button>
            </div>
          </div>
        </article>
      `
      )
      .join('');
  };

  /* ------------------------------------------------------------------------
     Pure Vanilla JS PDF 1.4 Generator (Multi-Halaman A4 Editorial)
     Menghasilkan file .pdf biner valid tanpa dependensi eksternal.
     ------------------------------------------------------------------------ */
  const sanitizePdfText = (text) =>
    String(text ?? '')
      .replace(/[\u2014\u2013]/g, '-')
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/\u00B7/g, '|')
      .replace(/\u2026/g, '...')
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const escapePdfLiteral = (text) =>
    sanitizePdfText(text)
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');

  const wrapPdfLines = (text, maxChars) => {
    const clean = sanitizePdfText(text);
    if (!clean) return [];
    const words = clean.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= maxChars) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const buildEbookPdfString = (book, record) => {
    const PAGE_W = 595;
    const PAGE_H = 842;
    const MARGIN_X = 52;
    const CONTENT_W = PAGE_W - MARGIN_X * 2;
    const orderId = record?.orderId || 'TB-VERIFIED';
    const paymentMethod = record?.paymentMethod || 'QRIS Instan';
    const purchasedAt = UI.formatDateID(record?.purchasedAt || new Date().toISOString());

    const pages = [];
    let ops = [];
    let cursorY = PAGE_H - 54;

    const pushText = (x, y, fontKey, size, rgb, text) => {
      ops.push('BT');
      ops.push(`/${fontKey} ${size} Tf`);
      ops.push(`${rgb} rg`);
      ops.push(`1 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)} Tm`);
      ops.push(`(${escapePdfLiteral(text)}) Tj`);
      ops.push('ET');
    };

    const pushRect = (x, y, w, h, fillRgb, strokeRgb = null, lineWidth = 0.75) => {
      ops.push('q');
      if (fillRgb) ops.push(`${fillRgb} rg`);
      if (strokeRgb) {
        ops.push(`${strokeRgb} RG`);
        ops.push(`${lineWidth} w`);
      }
      ops.push(`${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re`);
      if (fillRgb && strokeRgb) ops.push('B');
      else if (fillRgb) ops.push('f');
      else if (strokeRgb) ops.push('S');
      ops.push('Q');
    };

    const pushLine = (x1, y1, x2, y2, strokeRgb, lineWidth = 0.75) => {
      ops.push('q');
      ops.push(`${strokeRgb} RG`);
      ops.push(`${lineWidth} w`);
      ops.push(`${x1.toFixed(1)} ${y1.toFixed(1)} m ${x2.toFixed(1)} ${y2.toFixed(1)} l S`);
      ops.push('Q');
    };

    const startNewPage = (withRunningHeader = true) => {
      if (ops.length > 0) {
        pages.push(ops);
      }
      ops = [];
      // Pita aksen atas Periwinkle & Warm Peach
      pushRect(0, PAGE_H - 6, PAGE_W / 2, 6, '0.624 0.647 0.835');
      pushRect(PAGE_W / 2, PAGE_H - 6, PAGE_W / 2, 6, '0.996 0.843 0.722');

      if (withRunningHeader) {
        pushText(MARGIN_X, PAGE_H - 36, 'F2', 8.5, '0.294 0.333 0.388', `TITIKBACA  |  ${book.title.toUpperCase()}`);
        pushLine(MARGIN_X, PAGE_H - 44, PAGE_W - MARGIN_X, PAGE_H - 44, '0.898 0.906 0.922', 0.75);
        cursorY = PAGE_H - 72;
      } else {
        cursorY = PAGE_H - 44;
      }
    };

    const ensureSpace = (neededHeight) => {
      if (cursorY - neededHeight < 68) {
        startNewPage(true);
      }
    };

    /* === HALAMAN 1: Sampul Editorial, Lisensi Terverifikasi, Sinopsis & Pokok Bahasan === */
    startNewPage(false);

    // Header Card Hitam Arang (#111827)
    const titleLines = wrapPdfLines(book.title, 38);
    const subtitleLines = wrapPdfLines(book.subtitle, 66);
    const headerHeight = 96 + titleLines.length * 26 + subtitleLines.length * 16;
    const headerBottomY = cursorY - headerHeight;

    pushRect(MARGIN_X, headerBottomY, CONTENT_W, headerHeight, '0.067 0.094 0.153');
    // Garis aksen kecil di kiri atas kartu header
    pushRect(MARGIN_X + 24, cursorY - 26, 26, 3, '0.624 0.647 0.835');
    pushRect(MARGIN_X + 50, cursorY - 26, 26, 3, '0.996 0.843 0.722');
    pushText(MARGIN_X + 24, cursorY - 44, 'F2', 8.5, '0.773 0.792 0.902', `TITIKBACA EDISI DIGITAL  |  ${book.category.toUpperCase()}`);

    let titleY = cursorY - 72;
    for (const line of titleLines) {
      pushText(MARGIN_X + 24, titleY, 'F4', 21, '0.980 0.980 0.980', line);
      titleY -= 26;
    }

    let subY = titleY - 4;
    for (const line of subtitleLines) {
      pushText(MARGIN_X + 24, subY, 'F5', 11.5, '0.850 0.865 0.920', line);
      subY -= 16;
    }

    pushText(
      MARGIN_X + 24,
      headerBottomY + 20,
      'F1',
      10,
      '0.996 0.843 0.722',
      `Oleh ${book.author}  -  ${book.authorRole}`
    );

    cursorY = headerBottomY - 22;

    // Kotak Verifikasi Pembayaran & Metadata E-Book
    const metaBoxH = 98;
    const metaBottomY = cursorY - metaBoxH;
    pushRect(MARGIN_X, metaBottomY, CONTENT_W, metaBoxH, '0.980 0.980 0.980', '0.898 0.906 0.922', 0.9);
    pushRect(MARGIN_X, metaBottomY, 4, metaBoxH, '0.624 0.647 0.835');

    pushText(MARGIN_X + 18, cursorY - 20, 'F2', 8.5, '0.067 0.094 0.153', 'STATUS LISENSI: PEMBAYARAN LUNAS & TERVERIFIKASI');
    pushLine(MARGIN_X + 18, cursorY - 28, PAGE_W - MARGIN_X - 18, cursorY - 28, '0.898 0.906 0.922', 0.6);

    const colRightX = MARGIN_X + CONTENT_W / 2 + 6;
    pushText(MARGIN_X + 18, cursorY - 46, 'F1', 9.2, '0.294 0.333 0.388', `No. Pesanan : ${orderId}`);
    pushText(MARGIN_X + 18, cursorY - 62, 'F1', 9.2, '0.294 0.333 0.388', `Metode Bayar: ${paymentMethod}`);
    pushText(MARGIN_X + 18, cursorY - 78, 'F1', 9.2, '0.294 0.333 0.388', `Tanggal Beli: ${purchasedAt}`);

    pushText(colRightX, cursorY - 46, 'F1', 9.2, '0.294 0.333 0.388', `ISBN        : ${book.isbn}`);
    pushText(colRightX, cursorY - 62, 'F1', 9.2, '0.294 0.333 0.388', `Edisi       : ${book.year} (${book.pages} halaman)`);
    pushText(colRightX, cursorY - 78, 'F1', 9.2, '0.294 0.333 0.388', `Bahasa      : ${book.language} (Tanpa DRM)`);

    cursorY = metaBottomY - 28;

    // Seksi Sinopsis
    pushText(MARGIN_X, cursorY, 'F2', 9.5, '0.294 0.333 0.388', 'RINGKASAN BUKU');
    pushLine(MARGIN_X, cursorY - 7, PAGE_W - MARGIN_X, cursorY - 7, '0.898 0.906 0.922', 0.7);
    cursorY -= 24;

    for (const para of book.synopsis) {
      const lines = wrapPdfLines(para, 82);
      ensureSpace(lines.length * 16 + 10);
      for (const line of lines) {
        pushText(MARGIN_X, cursorY, 'F3', 11, '0.122 0.161 0.216', line);
        cursorY -= 16;
      }
      cursorY -= 8;
    }

    cursorY -= 8;

    // Seksi Pokok Bahasan Utama
    ensureSpace(50);
    pushText(MARGIN_X, cursorY, 'F2', 9.5, '0.294 0.333 0.388', 'POKOK BAHASAN UTAMA');
    pushLine(MARGIN_X, cursorY - 7, PAGE_W - MARGIN_X, cursorY - 7, '0.898 0.906 0.922', 0.7);
    cursorY -= 24;

    book.highlights.forEach((point, idx) => {
      const lines = wrapPdfLines(`${idx + 1}. ${point}`, 78);
      ensureSpace(lines.length * 15 + 6);
      lines.forEach((line, lineIdx) => {
        pushText(MARGIN_X + (lineIdx === 0 ? 4 : 16), cursorY, 'F1', 10, '0.067 0.094 0.153', line);
        cursorY -= 15;
      });
      cursorY -= 4;
    });

    /* === HALAMAN 2+: BAB 1 === */
    startNewPage(true);

    pushText(MARGIN_X, cursorY, 'F2', 9.5, '0.294 0.333 0.388', book.sampleChapter.number.toUpperCase());
    cursorY -= 26;

    const chapTitleLines = wrapPdfLines(book.sampleChapter.title, 44);
    for (const line of chapTitleLines) {
      pushText(MARGIN_X, cursorY, 'F4', 19, '0.067 0.094 0.153', line);
      cursorY -= 24;
    }

    pushLine(MARGIN_X, cursorY + 6, MARGIN_X + 72, cursorY + 6, '0.624 0.647 0.835', 2);
    cursorY -= 18;

    for (const para of book.sampleChapter.paragraphs) {
      const lines = wrapPdfLines(para, 78);
      ensureSpace(lines.length * 18 + 14);
      for (const line of lines) {
        pushText(MARGIN_X, cursorY, 'F3', 11.5, '0.122 0.161 0.216', line);
        cursorY -= 18;
      }
      cursorY -= 10;
    }

    // Kotak Kolofon Penutup
    ensureSpace(64);
    cursorY -= 10;
    const colophonH = 52;
    const colophonBottomY = cursorY - colophonH;
    pushRect(MARGIN_X, colophonBottomY, CONTENT_W, colophonH, '0.980 0.980 0.980', '0.898 0.906 0.922', 0.8);
    pushText(
      MARGIN_X + 16,
      cursorY - 20,
      'F2',
      9,
      '0.067 0.094 0.153',
      'EDISI DIGITAL RESMI TITIKBACA (LISENSI PERSONAL)'
    );
    pushText(
      MARGIN_X + 16,
      cursorY - 36,
      'F1',
      8.5,
      '0.294 0.333 0.388',
      `Diunduh dari Pustaka Saya setelah pembayaran terverifikasi (${orderId}). Selamat membaca.`
    );

    // Tutup halaman terakhir
    pages.push(ops);

    // Tambahkan footer nomor halaman ke setiap halaman
    const totalPages = pages.length;
    pages.forEach((pageOps, idx) => {
      pageOps.push('q');
      pageOps.push('0.898 0.906 0.922 RG 0.6 w');
      pageOps.push(`${MARGIN_X} 44 m ${PAGE_W - MARGIN_X} 44 l S`);
      pageOps.push('Q');

      pageOps.push('BT');
      pageOps.push('/F1 8.2 Tf 0.420 0.447 0.502 rg');
      pageOps.push(`1 0 0 1 ${MARGIN_X} 30 Tm`);
      pageOps.push(`(${escapePdfLiteral(`TitikBaca Digital Storefront  |  Pesanan ${orderId}`)}) Tj`);
      pageOps.push('ET');

      pageOps.push('BT');
      pageOps.push('/F1 8.2 Tf 0.420 0.447 0.502 rg');
      pageOps.push(`1 0 0 1 ${PAGE_W - MARGIN_X - 72} 30 Tm`);
      pageOps.push(`(${escapePdfLiteral(`Halaman ${idx + 1} dari ${totalPages}`)}) Tj`);
      pageOps.push('ET');
    });

    /* === Rakit Struktur Objek PDF 1.4 ===
       Obj 1: Catalog
       Obj 2: Pages
       Obj 3..7: 5 Standard Type1 Fonts (F1..F5)
       Obj 8..(8 + 2*N - 1): Page Object + Content Stream per halaman
    */
    const objects = [];
    const pageObjIds = [];
    const firstPageObjId = 8;

    for (let i = 0; i < totalPages; i += 1) {
      pageObjIds.push(firstPageObjId + i * 2);
    }

    objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    objects.push(
      `2 0 obj\n<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${totalPages} >>\nendobj\n`
    );
    objects.push('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n');
    objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n');
    objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>\nendobj\n');
    objects.push('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold /Encoding /WinAnsiEncoding >>\nendobj\n');
    objects.push('7 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>\nendobj\n');

    const fontDict = '/Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R /F5 7 0 R >>';

    pages.forEach((pageOps, idx) => {
      const pageId = firstPageObjId + idx * 2;
      const streamId = pageId + 1;
      const streamBody = `${pageOps.join('\n')}\n`;

      objects.push(
        `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << ${fontDict} >> /Contents ${streamId} 0 R >>\nendobj\n`
      );
      objects.push(
        `${streamId} 0 obj\n<< /Length ${streamBody.length} >>\nstream\n${streamBody}endstream\nendobj\n`
      );
    });

    // Susun file PDF lengkap + tabel xref presisi byte
    const header = '%PDF-1.4\n';
    let pdf = header;
    const offsets = [0];

    for (const objStr of objects) {
      offsets.push(pdf.length);
      pdf += objStr;
    }

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i < offsets.length; i += 1) {
      pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
    return pdf;
  };

  /* ------------------------------------------------------------------------
     Aksi Unduh PDF (Wajib Sudah Dibayar / Dimiliki)
     ------------------------------------------------------------------------ */
  const triggerBlobDownload = (blob, fileName) => {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1200);
  };

  const downloadEbookPdf = async (bookId) => {
    // Penegakan aturan: hanya boleh unduh PDF setelah pembayaran lunas
    if (!Store.isOwned(bookId)) {
      UI.showToast('Selesaikan pembayaran terlebih dahulu untuk mengunduh file PDF.', {
        actionLabel: 'Ke Katalog',
        actionHref: 'index.html'
      });
      return;
    }

    const book = Store.getBookById(bookId);
    if (!book) return;
    const record = Store.getOwnedRecord(bookId);
    const safeFileName = `TitikBaca-${book.id}.pdf`;

    await UI.runLoadingFlow({
      badge: 'Edisi PDF Terverifikasi',
      title: 'Menyiapkan File PDF...',
      desc: `Menyusun dokumen "${book.title}" lengkap dengan bukti lisensi Anda.`,
      durationMs: 550,
      onProcess: () => {
        const pdfString = buildEbookPdfString(book, record);
        const bytes = new Uint8Array(pdfString.length);
        for (let i = 0; i < pdfString.length; i += 1) {
          bytes[i] = pdfString.charCodeAt(i) & 0xff;
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        triggerBlobDownload(blob, safeFileName);
        return { ok: true };
      },
      successBadge: 'Unduhan Dimulai',
      successTitle: 'File PDF Siap!',
      successDesc: `Mengunduh "${safeFileName}" ke perangkat Anda.`,
      successDurationMs: 550
    });

    UI.showToast(`File "${safeFileName}" berhasil diunduh.`);
  };

  /* ------------------------------------------------------------------------
     Aksi Unduh Teks Polos (.txt) — Opsional Pendamping
     ------------------------------------------------------------------------ */
  const downloadEbookTxt = (bookId) => {
    if (!Store.isOwned(bookId)) {
      UI.showToast('Selesaikan pembayaran terlebih dahulu untuk mengunduh e-book.');
      return;
    }

    const book = Store.getBookById(bookId);
    if (!book) return;

    const record = Store.getOwnedRecord(bookId);
    const divider = '='.repeat(72);
    const subDivider = '-'.repeat(72);

    const lines = [
      divider,
      'TITIKBACA — EDISI DIGITAL KURASI',
      divider,
      '',
      `Judul           : ${book.title}`,
      `Subjudul        : ${book.subtitle}`,
      `Penulis         : ${book.author} (${book.authorRole})`,
      `Kategori        : ${book.category}`,
      `Tahun Terbit    : ${book.year}`,
      `Jumlah Halaman  : ${book.pages} halaman`,
      `Format Asli     : ${book.format}`,
      `ISBN            : ${book.isbn}`,
      `Nomor Pesanan   : ${record ? record.orderId : 'EDISI-DEMO'}`,
      `Tanggal Beli    : ${record ? UI.formatDateID(record.purchasedAt) : UI.formatDateID(new Date().toISOString())}`,
      '',
      subDivider,
      'RINGKASAN BUKU',
      subDivider,
      '',
      ...book.synopsis.flatMap((paragraph) => [paragraph, '']),
      'POKOK BAHASAN UTAMA:',
      ...book.highlights.map((point, idx) => `  ${idx + 1}. ${point}`),
      '',
      divider,
      `${book.sampleChapter.number.toUpperCase()}: ${book.sampleChapter.title.toUpperCase()}`,
      divider,
      '',
      ...book.sampleChapter.paragraphs.flatMap((paragraph) => [paragraph, '']),
      subDivider,
      'Dokumen ini diunduh secara resmi dari Pustaka Saya di platform TitikBaca.',
      'Lisensi penggunaan personal (tanpa DRM). Selamat membaca.',
      subDivider
    ];

    const fileContent = lines.join('\r\n');
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const safeFileName = `TitikBaca-${book.id}.txt`;
    triggerBlobDownload(blob, safeFileName);
    UI.showToast(`Mengunduh "${safeFileName}"...`);
  };

  /* ------------------------------------------------------------------------
     Modal E-Reader dengan Pengatur Ukuran Teks (Kecil, Normal, Besar)
     ------------------------------------------------------------------------ */
  const updateFontSizeButtons = () => {
    if (!els.fontSizeControls) return;
    const buttons = els.fontSizeControls.querySelectorAll('[data-font-size]');
    buttons.forEach((btn) => {
      const size = btn.getAttribute('data-font-size');
      const isActive = size === state.fontSize;
      btn.setAttribute('aria-pressed', String(isActive));
      btn.className = isActive
        ? 'px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#111827] text-white transition-colors'
        : 'px-3 py-1.5 rounded-lg text-xs font-medium text-[#4B5563] hover:text-[#111827] hover:bg-gray-100 transition-colors';
    });
  };

  const renderReaderContent = () => {
    if (!state.activeReaderBookId || !els.readerBody) return;
    const book = Store.getBookById(state.activeReaderBookId);
    if (!book) return;

    if (els.readerTitle) els.readerTitle.textContent = book.title;
    if (els.readerAuthor) els.readerAuthor.textContent = `${book.author} · ${book.category}`;

    const sizeClass =
      state.fontSize === 'sm'
        ? 'reader-size-sm'
        : state.fontSize === 'lg'
          ? 'reader-size-lg'
          : 'reader-size-md';

    const { sampleChapter } = book;

    els.readerBody.innerHTML = `
      <div class="max-w-2xl mx-auto">
        <div class="mb-8 pb-6 border-b border-[#E5E7EB]">
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="bg-signature-soft px-3 py-1 rounded-full text-xs font-semibold text-[#111827]">
              ${UI.escapeHTML(sampleChapter.number)}
            </span>
            <span class="text-xs text-[#4B5563]">
              ${UI.escapeHTML(sampleChapter.readingTime)} · ${book.pages} halaman edisi lengkap
            </span>
          </div>
          <h2 class="font-editorial text-2xl sm:text-3xl font-semibold text-[#111827] leading-tight">
            ${UI.escapeHTML(sampleChapter.title)}
          </h2>
        </div>

        <div id="reader-prose-container" class="reader-prose ${sizeClass}">
          ${sampleChapter.paragraphs.map((p) => `<p>${UI.escapeHTML(p)}</p>`).join('')}
        </div>

        <div class="mt-12 pt-6 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm text-[#4B5563]">
          <div>
            <p class="font-semibold text-[#111827]">Simpan Salinan Luring (Lisensi Terverifikasi)</p>
            <p class="mt-0.5">Unduh e-book dalam format PDF siap baca atau teks polos.</p>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-download-pdf="${UI.escapeHTML(book.id)}"
              class="btn-accent-gradient inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm"
            >
              <span>Unduh PDF</span>
            </button>
            <button
              type="button"
              data-download-txt="${UI.escapeHTML(book.id)}"
              class="inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-xs font-semibold bg-white border border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:bg-gray-50 transition-colors"
            >
              .txt
            </button>
          </div>
        </div>
      </div>
    `;

    updateFontSizeButtons();
  };

  const openReaderModal = (bookId) => {
    if (!Store.isOwned(bookId)) return;
    const book = Store.getBookById(bookId);
    if (!book || !els.readerModal) return;

    state.activeReaderBookId = bookId;
    renderReaderContent();

    els.readerModal.classList.add('is-open');
    els.readerModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (els.readerBody) els.readerBody.scrollTop = 0;
  };

  const closeReaderModal = () => {
    if (!els.readerModal) return;
    els.readerModal.classList.remove('is-open');
    els.readerModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.activeReaderBookId = null;
  };

  /* ------------------------------------------------------------------------
     Modal Konfirmasi Reset Data Demo
     ------------------------------------------------------------------------ */
  const openResetModal = () => {
    if (!els.resetConfirmModal) return;
    els.resetConfirmModal.classList.add('is-open');
    els.resetConfirmModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeResetModal = () => {
    if (!els.resetConfirmModal) return;
    els.resetConfirmModal.classList.remove('is-open');
    els.resetConfirmModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  /* ------------------------------------------------------------------------
     Event Listeners
     ------------------------------------------------------------------------ */
  const bindEvents = () => {
    // Delegasi tombol Baca Sekarang, Unduh PDF, & Unduh .txt
    document.addEventListener('click', (event) => {
      const readBtn = event.target.closest('[data-read-book]');
      if (readBtn) {
        const bookId = readBtn.getAttribute('data-read-book');
        openReaderModal(bookId);
        return;
      }

      const downloadPdfBtn = event.target.closest('[data-download-pdf]');
      if (downloadPdfBtn) {
        const bookId = downloadPdfBtn.getAttribute('data-download-pdf');
        downloadEbookPdf(bookId);
        return;
      }

      const downloadTxtBtn = event.target.closest('[data-download-txt]');
      if (downloadTxtBtn) {
        const bookId = downloadTxtBtn.getAttribute('data-download-txt');
        downloadEbookTxt(bookId);
      }
    });

    // Pengaturan ukuran teks pada E-Reader
    if (els.fontSizeControls) {
      els.fontSizeControls.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-font-size]');
        if (!btn) return;
        const nextSize = btn.getAttribute('data-font-size');
        if (!nextSize) return;
        state.fontSize = nextSize;

        const proseEl = document.getElementById('reader-prose-container');
        if (proseEl) {
          proseEl.classList.remove('reader-size-sm', 'reader-size-md', 'reader-size-lg');
          proseEl.classList.add(
            nextSize === 'sm'
              ? 'reader-size-sm'
              : nextSize === 'lg'
                ? 'reader-size-lg'
                : 'reader-size-md'
          );
        }
        updateFontSizeButtons();
      });
    }

    // Unduh PDF dari header E-Reader
    if (els.readerDownloadBtn) {
      els.readerDownloadBtn.addEventListener('click', () => {
        if (state.activeReaderBookId) {
          downloadEbookPdf(state.activeReaderBookId);
        }
      });
    }

    if (els.readerCloseBtn) {
      els.readerCloseBtn.addEventListener('click', closeReaderModal);
    }

    if (els.readerModal) {
      els.readerModal.addEventListener('click', (event) => {
        if (event.target === els.readerModal) {
          closeReaderModal();
        }
      });
    }

    // Reset Data Demo
    if (els.resetDemoBtn) {
      els.resetDemoBtn.addEventListener('click', openResetModal);
    }

    if (els.resetCancelBtn) {
      els.resetCancelBtn.addEventListener('click', closeResetModal);
    }

    if (els.resetConfirmModal) {
      els.resetConfirmModal.addEventListener('click', (event) => {
        if (event.target === els.resetConfirmModal) {
          closeResetModal();
        }
      });
    }

    if (els.resetConfirmBtn) {
      els.resetConfirmBtn.addEventListener('click', async () => {
        closeResetModal();

        await UI.runLoadingFlow({
          badge: 'Utilitas Demo',
          title: 'Mereset Data Demo...',
          desc: 'Mengembalikan keranjang, akun demo, dan koleksi ke kondisi awal.',
          durationMs: 650,
          onProcess: () => {
            Store.resetDemoData();
            return { ok: true };
          },
          successBadge: 'Selesai',
          successTitle: 'Data Demo Direset!',
          successDesc: 'Seluruh data kembali ke kondisi awal untuk demonstrasi.',
          successDurationMs: 650
        });

        if (els.successBanner) els.successBanner.classList.add('hidden');
        renderLibrary();
        UI.showToast('Seluruh data demo telah direset ke kondisi awal.');
      });
    }

    // Escape key untuk menutup modal
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (state.activeReaderBookId) closeReaderModal();
        if (els.resetConfirmModal && els.resetConfirmModal.classList.contains('is-open')) {
          closeResetModal();
        }
      }
    });
  };

  /* ------------------------------------------------------------------------
     Deep-link Auto Open Reader (?baca=<bookId>)
     ------------------------------------------------------------------------ */
  const checkAutoOpenReader = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const bookId = params.get('baca');
      if (bookId && Store.isOwned(bookId)) {
        openReaderModal(bookId);
      }
    } catch {
      // Abaikan jika URLSearchParams gagal
    }
  };

  window.TitikBaca = window.TitikBaca || {};
  window.TitikBaca.PDF = { buildEbookPdfString };

  document.addEventListener('DOMContentLoaded', () => {
    cacheDOM();
    renderCheckoutBanner();
    renderLibrary();
    bindEvents();
    checkAutoOpenReader();
  });
})();
