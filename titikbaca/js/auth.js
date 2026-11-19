/**
 * auth.js — Logika Halaman Masuk, Daftar Customer, & Lupa Password (login.html)
 */

(() => {
  'use strict';

  const { Auth, UI } = window.TitikBaca;

  const els = {};
  let currentMode = 'login'; // 'login' | 'register' | 'forgot'
  let isSubmitting = false;

  const cacheDOM = () => {
    els.authHeaderIcon = document.getElementById('auth-header-icon');
    els.authHeaderTitle = document.getElementById('auth-header-title');
    els.authHeaderSubtitle = document.getElementById('auth-header-subtitle');
    els.authNotice = document.getElementById('auth-notice');
    els.authTabs = document.getElementById('auth-tabs');
    els.tabLogin = document.getElementById('tab-login');
    els.tabRegister = document.getElementById('tab-register');
    els.loginForm = document.getElementById('login-form');
    els.loginEmail = document.getElementById('login-email');
    els.loginPassword = document.getElementById('login-password');
    els.loginError = document.getElementById('login-error');
    els.loginSubmitBtn = document.getElementById('login-submit-btn');
    els.registerForm = document.getElementById('register-form');
    els.registerName = document.getElementById('register-name');
    els.registerEmail = document.getElementById('register-email');
    els.registerPassword = document.getElementById('register-password');
    els.registerError = document.getElementById('register-error');
    els.registerSubmitBtn = document.getElementById('register-submit-btn');
    els.forgotForm = document.getElementById('forgot-form');
    els.forgotEmail = document.getElementById('forgot-email');
    els.forgotNote = document.getElementById('forgot-note');
    els.forgotFeedback = document.getElementById('forgot-feedback');
    els.openForgotBtn = document.getElementById('open-forgot-btn');
    els.backToLoginBtn = document.getElementById('back-to-login-btn');
    els.fillDemoCustomer = document.getElementById('fill-demo-customer');
    els.fillDemoAdmin = document.getElementById('fill-demo-admin');
    els.authOverlay = document.getElementById('auth-loading-overlay');
    els.authStageLoading = document.getElementById('auth-stage-loading');
    els.authStageSuccess = document.getElementById('auth-stage-success');
    els.authOverlayBadge = document.getElementById('auth-overlay-badge');
    els.authOverlayTitle = document.getElementById('auth-overlay-title');
    els.authOverlayDesc = document.getElementById('auth-overlay-desc');
    els.authOverlayProgress = document.getElementById('auth-overlay-progress');
  };

  const getSafeNextUrl = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next');
      const allowed = ['index.html', 'checkout.html', 'koleksi.html', 'admin.html'];
      if (next && allowed.includes(next)) return next;
    } catch {
      // Abaikan
    }
    return null;
  };

  const showNotice = (text, tone = 'info') => {
    if (!els.authNotice) return;
    els.authNotice.classList.remove('hidden');
    els.authNotice.textContent = text;
    if (tone === 'success') {
      els.authNotice.className =
        'mb-5 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium bg-signature-soft border border-[#9FA5D5]/50 text-[#111827]';
    } else {
      els.authNotice.className =
        'mb-5 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium bg-[#FAFAFA] border border-[#E5E7EB] text-[#111827]';
    }
  };

  const AUTH_HEADER_META = {
    login: {
      title: 'Selamat Datang Kembali',
      subtitle: 'Masuk menggunakan akun Customer atau Admin TitikBaca Anda.',
      icon: `
        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      `
    },
    register: {
      title: 'Buat Akun Pembaca Baru',
      subtitle: 'Daftar gratis untuk mulai mengoleksi & mengunduh e-book PDF.',
      icon: `
        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
        </svg>
      `
    },
    forgot: {
      title: 'Lupa Password Akun?',
      subtitle: 'Kirim permintaan reset password Anda agar segera diproses oleh Admin.',
      icon: `
        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
        </svg>
      `
    }
  };

  const setMode = (mode) => {
    currentMode = mode;
    const isLogin = mode === 'login';
    const isRegister = mode === 'register';
    const isForgot = mode === 'forgot';

    const meta = AUTH_HEADER_META[mode] || AUTH_HEADER_META.login;
    if (els.authHeaderIcon) els.authHeaderIcon.innerHTML = meta.icon;
    if (els.authHeaderTitle) els.authHeaderTitle.textContent = meta.title;
    if (els.authHeaderSubtitle) els.authHeaderSubtitle.textContent = meta.subtitle;

    if (els.authTabs) els.authTabs.classList.toggle('hidden', isForgot);
    if (els.loginForm) els.loginForm.classList.toggle('hidden', !isLogin);
    if (els.registerForm) els.registerForm.classList.toggle('hidden', !isRegister);
    if (els.forgotForm) els.forgotForm.classList.toggle('hidden', !isForgot);

    if (els.tabLogin && els.tabRegister) {
      els.tabLogin.className = isLogin
        ? 'py-2.5 rounded-lg text-sm font-semibold bg-[#111827] text-white transition-colors'
        : 'py-2.5 rounded-lg text-sm font-medium text-[#4B5563] hover:text-[#111827] transition-colors';
      els.tabRegister.className = isRegister
        ? 'py-2.5 rounded-lg text-sm font-semibold bg-[#111827] text-white transition-colors'
        : 'py-2.5 rounded-lg text-sm font-medium text-[#4B5563] hover:text-[#111827] transition-colors';
      els.tabLogin.setAttribute('aria-pressed', String(isLogin));
      els.tabRegister.setAttribute('aria-pressed', String(isRegister));
    }

    if (els.loginError) els.loginError.classList.add('hidden');
    if (els.registerError) els.registerError.classList.add('hidden');
    if (els.forgotFeedback) els.forgotFeedback.classList.add('hidden');
  };

  const getDestinationForUser = (user) => {
    const nextUrl = getSafeNextUrl();
    if (user.role === 'admin') {
      const target = nextUrl === 'admin.html' || !nextUrl ? 'admin.html' : nextUrl;
      return { url: target, label: target === 'admin.html' ? 'Panel Admin' : 'Katalog' };
    }
    const target = nextUrl && nextUrl !== 'admin.html' ? nextUrl : 'index.html';
    const labelMap = {
      'index.html': 'Katalog TitikBaca',
      'checkout.html': 'Halaman Checkout',
      'koleksi.html': 'Pustaka Saya'
    };
    return { url: target, label: labelMap[target] || 'TitikBaca' };
  };

  const openAuthLoading = ({ badge, title, desc }) => {
    if (!els.authOverlay) return;
    if (els.authStageLoading) els.authStageLoading.classList.remove('hidden');
    if (els.authStageSuccess) {
      els.authStageSuccess.classList.add('hidden');
      els.authStageSuccess.classList.remove('flex');
    }
    if (els.authOverlayBadge) {
      els.authOverlayBadge.textContent = badge;
      els.authOverlayBadge.className =
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] bg-[#FAFAFA] border border-[#E5E7EB] text-[#4B5563] mb-3';
    }
    if (els.authOverlayTitle) els.authOverlayTitle.textContent = title;
    if (els.authOverlayDesc) els.authOverlayDesc.textContent = desc;
    if (els.authOverlayProgress) els.authOverlayProgress.style.width = '18%';

    els.authOverlay.classList.add('is-open');
    els.authOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    window.requestAnimationFrame(() => {
      if (els.authOverlayProgress) els.authOverlayProgress.style.width = '60%';
    });
  };

  const closeAuthLoading = () => {
    if (!els.authOverlay) return;
    els.authOverlay.classList.remove('is-open');
    els.authOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const showAuthSuccessAndRedirect = (user, kind) => {
    const dest = getDestinationForUser(user);
    const roleBadge = user.role === 'admin' ? 'Role Admin' : 'Role Customer';

    if (els.authStageLoading) els.authStageLoading.classList.add('hidden');
    if (els.authStageSuccess) {
      els.authStageSuccess.classList.remove('hidden');
      els.authStageSuccess.classList.add('flex');
    }
    if (els.authOverlayBadge) {
      els.authOverlayBadge.textContent = roleBadge;
      els.authOverlayBadge.className =
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.14em] bg-signature-soft border border-[#9FA5D5]/50 text-[#111827] mb-3';
    }
    if (els.authOverlayTitle) {
      els.authOverlayTitle.textContent =
        kind === 'register' ? 'Akun Berhasil Dibuat!' : 'Berhasil Masuk!';
    }
    if (els.authOverlayDesc) {
      els.authOverlayDesc.textContent = `Selamat datang, ${user.name}. Mengalihkan ke ${dest.label}...`;
    }
    if (els.authOverlayProgress) els.authOverlayProgress.style.width = '100%';

    // Hindari double loading splash saat berpindah ke beranda
    try {
      window.sessionStorage.setItem('titikbaca_intro_seen', '1');
    } catch {
      // Abaikan
    }

    window.setTimeout(() => {
      window.location.href = dest.url;
    }, 850);
  };

  const checkUrlStatus = () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      const next = params.get('next');
      if (status === 'keluar') {
        showNotice('Anda telah keluar dari sesi akun.');
      } else if (next === 'checkout.html') {
        showNotice('Masuk sebagai Customer untuk melanjutkan pembayaran & membuka unduhan PDF.');
      } else if (next === 'koleksi.html') {
        showNotice('Masuk sebagai Customer untuk membuka Pustaka Saya dan mengunduh e-book PDF.');
      } else if (next === 'admin.html') {
        showNotice('Silakan masuk menggunakan akun Admin untuk membuka Panel Admin.');
      }
    } catch {
      // Abaikan
    }
  };

  const bindEvents = () => {
    if (els.tabLogin) els.tabLogin.addEventListener('click', () => setMode('login'));
    if (els.tabRegister) els.tabRegister.addEventListener('click', () => setMode('register'));

    if (els.openForgotBtn) {
      els.openForgotBtn.addEventListener('click', () => {
        if (els.forgotEmail && els.loginEmail && els.loginEmail.value) {
          els.forgotEmail.value = els.loginEmail.value;
        }
        setMode('forgot');
      });
    }

    if (els.backToLoginBtn) {
      els.backToLoginBtn.addEventListener('click', () => setMode('login'));
    }

    // Tombol isi cepat akun demo
    if (els.fillDemoCustomer) {
      els.fillDemoCustomer.addEventListener('click', () => {
        setMode('login');
        if (els.loginEmail) els.loginEmail.value = 'rina@titikbaca.id';
        if (els.loginPassword) els.loginPassword.value = 'user123';
        UI.showToast('Kredensial Customer Rina terisi (password awal: user123).');
      });
    }

    if (els.fillDemoAdmin) {
      els.fillDemoAdmin.addEventListener('click', () => {
        setMode('login');
        if (els.loginEmail) els.loginEmail.value = 'admin@titikbaca.id';
        if (els.loginPassword) els.loginPassword.value = 'admin123';
        UI.showToast('Kredensial Admin terisi.');
      });
    }

    // Toggle lihat/sembunyikan password
    document.addEventListener('click', (event) => {
      const toggleBtn = event.target.closest('[data-toggle-password]');
      if (!toggleBtn) return;
      const inputId = toggleBtn.getAttribute('data-toggle-password');
      const input = document.getElementById(inputId);
      if (!input) return;
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      toggleBtn.textContent = isHidden ? 'Sembunyi' : 'Lihat';
    });

    // Submit Login dengan animasi loading
    if (els.loginForm) {
      els.loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        const email = els.loginEmail ? els.loginEmail.value : '';
        const password = els.loginPassword ? els.loginPassword.value : '';

        if (els.loginError) els.loginError.classList.add('hidden');
        isSubmitting = true;

        if (els.loginSubmitBtn) {
          els.loginSubmitBtn.disabled = true;
          els.loginSubmitBtn.innerHTML = `<span class="tb-spinner" aria-hidden="true"></span><span>Memverifikasi...</span>`;
        }

        openAuthLoading({
          badge: 'Autentikasi Akun',
          title: 'Memverifikasi Akun...',
          desc: 'Memeriksa kredensial & menyiapkan sesi TitikBaca Anda.'
        });

        window.setTimeout(() => {
          const result = Auth.login(email, password);
          if (!result.ok) {
            isSubmitting = false;
            closeAuthLoading();
            if (els.loginSubmitBtn) {
              els.loginSubmitBtn.disabled = false;
              els.loginSubmitBtn.textContent = 'Masuk ke TitikBaca';
            }
            if (els.loginError) {
              els.loginError.textContent = result.message;
              els.loginError.classList.remove('hidden');
            }
            return;
          }

          showAuthSuccessAndRedirect(result.user, 'login');
        }, 700);
      });
    }

    // Submit Register Customer dengan animasi loading
    if (els.registerForm) {
      els.registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (isSubmitting) return;

        const payload = {
          name: els.registerName ? els.registerName.value : '',
          email: els.registerEmail ? els.registerEmail.value : '',
          password: els.registerPassword ? els.registerPassword.value : ''
        };

        if (els.registerError) els.registerError.classList.add('hidden');
        isSubmitting = true;

        if (els.registerSubmitBtn) {
          els.registerSubmitBtn.disabled = true;
          els.registerSubmitBtn.innerHTML = `<span class="tb-spinner" aria-hidden="true"></span><span>Membuat Akun...</span>`;
        }

        openAuthLoading({
          badge: 'Pendaftaran Customer',
          title: 'Membuat Akun Baru...',
          desc: 'Menyiapkan profil Customer dan Pustaka digital pribadi Anda.'
        });

        window.setTimeout(() => {
          const result = Auth.register(payload);
          if (!result.ok) {
            isSubmitting = false;
            closeAuthLoading();
            if (els.registerSubmitBtn) {
              els.registerSubmitBtn.disabled = false;
              els.registerSubmitBtn.textContent = 'Buat Akun Customer';
            }
            if (els.registerError) {
              els.registerError.textContent = result.message;
              els.registerError.classList.remove('hidden');
            }
            return;
          }

          showAuthSuccessAndRedirect(result.user, 'register');
        }, 750);
      });
    }

    // Submit Permintaan Lupa Password ke Admin dengan loading
    if (els.forgotForm) {
      els.forgotForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (isSubmitting) return;
        isSubmitting = true;

        const email = els.forgotEmail ? els.forgotEmail.value : '';
        const note = els.forgotNote ? els.forgotNote.value : '';

        const result = await UI.runLoadingFlow({
          badge: 'Bantuan Akun',
          title: 'Mengirim Permintaan...',
          desc: 'Meneruskan pengajuan reset password Anda ke Panel Admin.',
          durationMs: 650,
          onProcess: () => Auth.requestPasswordReset(email, note),
          successBadge: 'Terkirim ke Admin',
          successTitle: 'Permintaan Reset Terkirim!',
          successDesc: 'Admin akan segera mengatur ulang password akun Anda melalui Panel Admin.',
          successDurationMs: 750
        });

        isSubmitting = false;

        if (els.forgotFeedback) {
          els.forgotFeedback.textContent = result.message;
          els.forgotFeedback.className = result.ok
            ? 'text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5'
            : 'text-xs font-medium text-red-600';
        }

        if (result.ok) {
          UI.showToast('Permintaan reset password terkirim ke Panel Admin.');
          if (els.forgotNote) els.forgotNote.value = '';
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    cacheDOM();
    checkUrlStatus();
    setMode(currentMode);
    bindEvents();
  });
})();
