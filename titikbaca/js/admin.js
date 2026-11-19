/**
 * admin.js — Logika Panel Admin TitikBaca (admin.html)
 * Hanya dapat diakses oleh role 'admin'. Mengelola permintaan lupa password
 * dan perubahan password akun Customer secara langsung.
 */

(() => {
  'use strict';

  const { Auth, Store, UI } = window.TitikBaca;

  const state = {
    searchQuery: '',
    activeTargetUserId: null
  };

  const els = {};

  const cacheDOM = () => {
    els.adminGuard = document.getElementById('admin-guard');
    els.adminGuardDesc = document.getElementById('admin-guard-desc');
    els.adminDashboard = document.getElementById('admin-dashboard');
    els.adminWelcome = document.getElementById('admin-welcome');
    els.statTotalUsers = document.getElementById('stat-total-users');
    els.statResetCard = document.getElementById('stat-reset-card');
    els.statPendingResets = document.getElementById('stat-pending-resets');
    els.statTotalSales = document.getElementById('stat-total-sales');
    els.pendingResetPill = document.getElementById('pending-reset-pill');
    els.resetRequestsList = document.getElementById('reset-requests-list');
    els.userSearch = document.getElementById('admin-user-search');
    els.usersContainer = document.getElementById('admin-users-container');
    els.cpModal = document.getElementById('change-password-modal');
    els.cpTargetName = document.getElementById('cp-target-name');
    els.cpTargetEmail = document.getElementById('cp-target-email');
    els.cpForm = document.getElementById('change-password-form');
    els.cpNewPassword = document.getElementById('cp-new-password');
    els.cpConfirmPassword = document.getElementById('cp-confirm-password');
    els.cpError = document.getElementById('cp-error');
    els.cpGenerateBtn = document.getElementById('cp-generate-btn');
    els.cpCloseBtn = document.getElementById('cp-close-btn');
    els.cpCancelBtn = document.getElementById('cp-cancel-btn');
  };

  const generateTempPassword = () => {
    const words = ['Baca', 'Pustaka', 'Titik', 'Karya', 'Literasi'];
    const word = words[Math.floor(Math.random() * words.length)];
    const digits = Math.floor(1000 + Math.random() * 9000);
    return `${word}${digits}`;
  };

  /* ------------------------------------------------------------------------
     Render Stats & Pending Forgot Password Requests
     ------------------------------------------------------------------------ */
  const renderStats = () => {
    const customers = Auth.getCustomerUsers();
    const pendingCount = Auth.getPendingResetCount();
    const totalSales = Store.getAllOwnedCount();

    if (els.statTotalUsers) els.statTotalUsers.textContent = String(customers.length);
    if (els.statPendingResets) els.statPendingResets.textContent = String(pendingCount);
    if (els.statTotalSales) els.statTotalSales.textContent = String(totalSales);

    if (els.statResetCard) {
      els.statResetCard.className =
        pendingCount > 0
          ? 'bg-signature-soft border border-[#9FA5D5]/50 rounded-2xl p-5 transition-colors'
          : 'bg-white border border-[#E5E7EB] rounded-2xl p-5 transition-colors';
    }

    if (els.pendingResetPill) {
      els.pendingResetPill.textContent = `${pendingCount} Menunggu`;
      els.pendingResetPill.className =
        pendingCount > 0
          ? 'bg-signature-gradient px-3 py-1 rounded-full text-xs font-bold'
          : 'px-3 py-1 rounded-full text-xs font-semibold bg-[#FAFAFA] border border-[#E5E7EB] text-[#4B5563]';
    }
  };

  const renderResetRequests = () => {
    if (!els.resetRequestsList) return;
    const requests = Auth.getResetRequests();
    const pending = requests.filter((r) => r.status === 'pending');

    if (pending.length === 0) {
      els.resetRequestsList.innerHTML = `
        <div class="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-5 text-sm text-[#4B5563] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Tidak ada permintaan lupa password yang sedang menunggu.</span>
          <span class="text-xs text-[#4B5563]">Anda tetap bisa mengubah password Customer di daftar bawah.</span>
        </div>
      `;
      return;
    }

    els.resetRequestsList.innerHTML = pending
      .map(
        (req) => `
        <article class="bg-signature-subtle border border-[#9FA5D5]/50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="bg-signature-gradient px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                Menunggu Reset
              </span>
              <span class="text-xs text-[#4B5563]">${UI.escapeHTML(UI.formatDateID(req.requestedAt))}</span>
            </div>
            <p class="text-sm sm:text-base font-bold text-[#111827]">
              ${UI.escapeHTML(req.userName)}
              <span class="font-normal text-[#4B5563]">(${UI.escapeHTML(req.email)})</span>
            </p>
            <p class="text-xs sm:text-sm text-[#4B5563] mt-1">
              Catatan: "${UI.escapeHTML(req.note)}"
            </p>
          </div>
          <button
            type="button"
            data-open-cp="${UI.escapeHTML(req.userId)}"
            class="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#111827] text-white hover:bg-[#1F2937] whitespace-nowrap shrink-0 transition-colors"
          >
            Atur Password Baru
          </button>
        </article>
      `
      )
      .join('');
  };

  /* ------------------------------------------------------------------------
     Render Customer List
     ------------------------------------------------------------------------ */
  const renderCustomers = () => {
    if (!els.usersContainer) return;
    const query = state.searchQuery.trim().toLowerCase();
    const pendingUserIds = new Set(
      Auth.getResetRequests()
        .filter((r) => r.status === 'pending')
        .map((r) => r.userId)
    );

    const customers = Auth.getCustomerUsers().filter((user) => {
      if (!query) return true;
      return `${user.name} ${user.email}`.toLowerCase().includes(query);
    });

    if (customers.length === 0) {
      els.usersContainer.innerHTML = `
        <div class="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-8 text-center text-sm text-[#4B5563]">
          Tidak ada akun Customer yang cocok dengan pencarian Anda.
        </div>
      `;
      return;
    }

    els.usersContainer.innerHTML = customers
      .map((user) => {
        const ownedCount = Store.getOwnedBooks(user.id).length;
        const hasPendingReset = pendingUserIds.has(user.id);
        const initial = user.name.trim().charAt(0).toUpperCase();

        const statusBadge = hasPendingReset
          ? `<span class="bg-signature-gradient px-2.5 py-0.5 rounded-md text-[11px] font-bold">Lupa Password</span>`
          : user.passwordUpdatedAt
            ? `<span class="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">PW Diperbarui</span>`
            : `<span class="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#FAFAFA] text-[#4B5563] border border-[#E5E7EB]">Aktif</span>`;

        return `
          <article class="bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-300 transition-colors">
            <div class="flex items-start sm:items-center gap-3.5 min-w-0">
              <div class="w-10 h-10 rounded-full bg-signature-soft border border-[#9FA5D5]/50 flex items-center justify-center font-bold text-sm text-[#111827] shrink-0">
                ${UI.escapeHTML(initial)}
              </div>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="text-sm sm:text-base font-bold text-[#111827] truncate">${UI.escapeHTML(user.name)}</h3>
                  ${statusBadge}
                </div>
                <p class="text-xs sm:text-sm text-[#4B5563] truncate">${UI.escapeHTML(user.email)}</p>
                <p class="text-[11px] text-[#4B5563] mt-1">
                  ${ownedCount} e-book dimiliki${
                    user.passwordUpdatedAt
                      ? ` · Password terakhir diubah ${UI.escapeHTML(UI.formatDateID(user.passwordUpdatedAt))}`
                      : ''
                  }
                </p>
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E5E7EB]">
              <button
                type="button"
                data-open-cp="${UI.escapeHTML(user.id)}"
                class="${
                  hasPendingReset
                    ? 'btn-accent-gradient'
                    : 'bg-[#111827] text-white hover:bg-[#1F2937]'
                } px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors"
              >
                Ubah Password
              </button>
            </div>
          </article>
        `;
      })
      .join('');
  };

  const renderDashboard = () => {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      if (els.adminGuard) els.adminGuard.classList.remove('hidden');
      if (els.adminDashboard) els.adminDashboard.classList.add('hidden');
      if (els.adminGuardDesc && currentUser && currentUser.role === 'user') {
        els.adminGuardDesc.textContent = `Anda sedang masuk sebagai Customer (${currentUser.email}). Silakan keluar dan masuk menggunakan akun Admin TitikBaca.`;
      }
      return;
    }

    if (els.adminGuard) els.adminGuard.classList.add('hidden');
    if (els.adminDashboard) els.adminDashboard.classList.remove('hidden');
    if (els.adminWelcome) {
      els.adminWelcome.textContent = `Masuk sebagai ${currentUser.name} (${currentUser.email}) · Kelola akun Customer dan bantu reset password.`;
    }

    renderStats();
    renderResetRequests();
    renderCustomers();
  };

  /* ------------------------------------------------------------------------
     Modal Ubah Password Customer
     ------------------------------------------------------------------------ */
  const openChangePasswordModal = (userId) => {
    const user = Auth.getUserById(userId);
    if (!user || !els.cpModal) return;

    state.activeTargetUserId = userId;
    if (els.cpTargetName) els.cpTargetName.textContent = user.name;
    if (els.cpTargetEmail) els.cpTargetEmail.textContent = user.email;
    if (els.cpNewPassword) els.cpNewPassword.value = '';
    if (els.cpConfirmPassword) els.cpConfirmPassword.value = '';
    if (els.cpError) {
      els.cpError.textContent = '';
      els.cpError.classList.add('hidden');
    }

    els.cpModal.classList.add('is-open');
    els.cpModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (els.cpNewPassword) els.cpNewPassword.focus();
  };

  const closeChangePasswordModal = () => {
    if (!els.cpModal) return;
    els.cpModal.classList.remove('is-open');
    els.cpModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    state.activeTargetUserId = null;
  };

  const bindEvents = () => {
    if (els.userSearch) {
      els.userSearch.addEventListener('input', (event) => {
        state.searchQuery = event.target.value;
        renderCustomers();
      });
    }

    document.addEventListener('click', (event) => {
      const openBtn = event.target.closest('[data-open-cp]');
      if (!openBtn) return;
      const userId = openBtn.getAttribute('data-open-cp');
      openChangePasswordModal(userId);
    });

    if (els.cpGenerateBtn) {
      els.cpGenerateBtn.addEventListener('click', () => {
        const temp = generateTempPassword();
        if (els.cpNewPassword) els.cpNewPassword.value = temp;
        if (els.cpConfirmPassword) els.cpConfirmPassword.value = temp;
        if (els.cpError) els.cpError.classList.add('hidden');
      });
    }

    if (els.cpForm) {
      els.cpForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!state.activeTargetUserId) return;

        const targetUserId = state.activeTargetUserId;
        const targetUser = Auth.getUserById(targetUserId);
        const newPw = els.cpNewPassword ? els.cpNewPassword.value : '';
        const confirmPw = els.cpConfirmPassword ? els.cpConfirmPassword.value : '';

        if (newPw.length < 6) {
          if (els.cpError) {
            els.cpError.textContent = 'Password baru minimal 6 karakter.';
            els.cpError.classList.remove('hidden');
          }
          return;
        }

        if (newPw !== confirmPw) {
          if (els.cpError) {
            els.cpError.textContent = 'Konfirmasi password tidak cocok.';
            els.cpError.classList.remove('hidden');
          }
          return;
        }

        const confirmed = await UI.confirmDialog({
          title: 'Simpan password baru?',
          message: targetUser
            ? `Password untuk ${targetUser.name} (${targetUser.email}) akan langsung diganti dan password lama tidak dapat dipakai lagi.`
            : 'Password akun ini akan langsung diperbarui.',
          confirmLabel: 'Ya, Ubah Password',
          cancelLabel: 'Batal',
          tone: 'default'
        });
        if (!confirmed) return;

        closeChangePasswordModal();

        const result = await UI.runLoadingFlow({
          badge: 'Aksi Admin',
          title: 'Memperbarui Password...',
          desc: targetUser
            ? `Menyimpan password baru untuk akun ${targetUser.name}.`
            : 'Menyimpan perubahan password pengguna.',
          durationMs: 650,
          onProcess: () => Auth.adminChangeUserPassword(targetUserId, newPw),
          successBadge: 'Password Diperbarui',
          successTitle: 'Password Berhasil Diubah!',
          successDesc: targetUser
            ? `${targetUser.name} kini dapat masuk menggunakan password baru.`
            : 'Password pengguna berhasil diperbarui.',
          successDurationMs: 750
        });

        if (!result.ok) {
          UI.showToast(result.message || 'Gagal mengubah password.');
          return;
        }

        renderDashboard();
        UI.showToast(`Password ${result.user.name} berhasil diubah menjadi "${newPw}".`);
      });
    }

    if (els.cpCloseBtn) els.cpCloseBtn.addEventListener('click', closeChangePasswordModal);
    if (els.cpCancelBtn) els.cpCancelBtn.addEventListener('click', closeChangePasswordModal);
    if (els.cpModal) {
      els.cpModal.addEventListener('click', (event) => {
        if (event.target === els.cpModal) closeChangePasswordModal();
      });
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && state.activeTargetUserId) {
        closeChangePasswordModal();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    cacheDOM();
    renderDashboard();
    bindEvents();
  });
})();
