const PLATFORM_META = {
  facebook:   { name: 'Facebook',  color: '#1877f2', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' },
  tiktok:     { name: 'TikTok',    color: '#ffffff', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>' },
  twitch:     { name: 'Twitch',    color: '#9146ff', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>' },
  instagram:  { name: 'Instagram', color: '#e4405f', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>' },
  youtube:    { name: 'YouTube',   color: '#ff0000', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>' },
  github:     { name: 'GitHub',    color: '#f0f6fc', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>' },
  website:    { name: 'Website',   color: '#ffb347', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm10 12c0 .685-.068 1.354-.195 2H14.2a19.337 19.337 0 0 0 0-4h7.605c.127.646.195 1.315.195 2zM12 22c-1.416 0-2.91-.902-3.926-3h7.852C14.91 21.098 13.416 22 12 22zM7.6 17c-.391-1.547-.6-3.234-.6-5s.209-3.453.6-5h8.8c.391 1.547.6 3.234.6 5s-.209 3.453-.6 5H7.6zM17.926 3c1.016 2.098 1.726 4.035 2.048 6H15a21.466 21.466 0 0 0-.874-4.977C15.58 3.694 16.753 3 17.926 3zM12 2c1.416 0 2.91.902 3.926 3H8.074C9.09 2.902 10.584 2 12 2zM6.074 3c1.173 0 2.346.694 3.874 1.023A21.466 21.466 0 0 0 9 9H4.026c.322-1.965 1.032-3.902 2.048-6zM4 12c0 .685.068 1.354.195 2H9a17.34 17.34 0 0 0 0-4H4.195c-.127.646-.195 1.315-.195 2zm.026 6c-1.016-2.098-1.726-4.035-2.048-6H9c0 1.766.209 3.453.6 5H6.074c-1.173 0-2.346-.694-3.874-1.023C4.974 19.374 4.799 20.691 4.026 18zm14.948 0c-.775 1.691-1.55 2.008-1.55 2.008-.9.391-2.06.992-3.422.992 1.774-1.534 3.002-3.141 3.552-1 1.099-1.227 2.026-2.353 3.05-3.2C17.394 17.297 17.526 17.688 17.926 18z"/></svg>' },
};

function metaFor(platform) {
  return PLATFORM_META[platform];
}

function toast(message) {
  let el = document.getElementById('duoToast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'duo-toast';
    el.id = 'duoToast';
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function escapeHTML(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeUrl(url) {
  if (!url) return '';
  const value = String(url).trim();
  if (!value) return '';
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return value;
  return 'https://' + value;
}

function initials(name) {
  return String(name || '?').trim().slice(0, 2).toUpperCase();
}

function renderNavAuth() {
  const host = document.getElementById('navAuth');
  if (!host) return;

  const user = API.user;
  const loggedIn = !!API.token && !!user;

  if (loggedIn) {
    const badge = user.role === 'admin'
      ? '<span class="role-badge">Admin</span>'
      : '<span class="role-badge viewer">Viewer</span>';
    host.innerHTML = `
      <li><a href="dashboard.html">Dashboard</a></li>
      <li class="nav-user">
        <span class="avatar">${escapeHTML(initials(user.name))}</span>
        <span class="muted" style="font-size:.85rem">${escapeHTML(user.name)} ${badge}</span>
        <a href="#" id="logoutBtn" class="btn btn-ghost btn-sm">Logout</a>
      </li>`;
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
      e.preventDefault();
      API.clearSession();
      window.location.href = 'index.html';
    });
  } else {
    host.innerHTML = `
      <li><a href="login.html">Login</a></li>
      <li class="nav-cta"><a href="register.html" class="btn btn-primary btn-sm">Join</a></li>`;
  }
}

function showFormError(message) {
  const box = document.getElementById('formAlert');
  if (!box) return;
  box.textContent = message;
  box.classList.remove('hidden');
}

function hideFormError() {
  const box = document.getElementById('formAlert');
  if (box) box.classList.add('hidden');
}

function setupAuthForms() {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideFormError();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      if (!email || !password) return showFormError('Please fill in all fields.');

      const btn = loginForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        const data = await API.post('/auth/login', { email, password });
        API.setSession(data.token, data.user);
        window.location.href = 'dashboard.html';
      } catch (err) {
        if (err.data && err.data.error === 'ACCOUNT_BANNED') {
          const em = encodeURIComponent(err.data.email || email);
          const alertBox = document.getElementById('formAlert');
          if (alertBox) {
            const reason = err.data.banReason ? escapeHTML(err.data.banReason) : '';
            const until = err.data.banUntil ? new Date(err.data.banUntil).toLocaleDateString() : '';
            const head = until
              ? 'This account is <strong>banned until ' + escapeHTML(until) + '</strong>.'
              : 'This account has been <strong>permanently banned</strong>.';
            alertBox.innerHTML =
              head +
              (reason ? ' Reason: <em>"' + reason + '"</em>.' : '') +
              ' <a href="feedback.html?kind=appeal&amp;email=' + em + '">Send an appeal</a>';
            alertBox.classList.remove('hidden');
          }
        } else if (err.data && err.data.error === 'ACCOUNT_NOT_VERIFIED') {
          const em = encodeURIComponent(err.data.email || email);
          const alertBox = document.getElementById('formAlert');
          if (alertBox) {
            alertBox.innerHTML =
              'Your email is <strong>not verified</strong>. Enter the 6-digit code we emailed you. <a href="verify.html?email=' +
              em +
              '">Verify now</a>';
            alertBox.classList.remove('hidden');
          }
        } else {
          showFormError(err.message);
        }
        btn.disabled = false;
      }
    });
  }

  const regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideFormError();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirm').value;

      if (!name || !email || !password || !confirm) return showFormError('Please fill in all fields.');
      if (password !== confirm) return showFormError('Passwords do not match.');

      const btn = regForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      try {
        const data = await API.post('/auth/register', { name, email, password });
        if (data && data.pendingVerify) {
          window.location.href = 'verify.html?email=' + encodeURIComponent(email.trim());
          return;
        }
        API.setSession(data.token, data.user);
        window.location.href = 'dashboard.html';
      } catch (err) {
        showFormError(err.message);
        btn.disabled = false;
      }
    });
  }
}

function setupVerifyForm() {
  const form = document.getElementById('verifyForm');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const prefilled = params.get('email');
  const emailInput = document.getElementById('email');
  const verifyEmailLabel = document.getElementById('verifyEmail');
  const btn = form.querySelector('button[type="submit"]');

  if (prefilled && emailInput) {
    emailInput.value = prefilled;
    if (verifyEmailLabel) verifyEmailLabel.textContent = prefilled;
  }

  function showSuccess(message) {
    const box = document.getElementById('successBox');
    if (!box) return;
    box.textContent = message;
    box.classList.remove('hidden');
    const alert = document.getElementById('formAlert');
    if (alert) alert.classList.add('hidden');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();
    const email = emailInput ? emailInput.value.trim() : '';
    const code = document.getElementById('code').value.trim();
    if (!email) return showFormError('Enter your email.');
    if (!/^\d{6}$/.test(code)) return showFormError('Enter the 6-digit code from your email.');
    btn.disabled = true;
    try {
      await API.post('/auth/verify', { email, code });
      showSuccess('Email verified! Taking you to login...');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
    } catch (err) {
      showFormError(err.message);
      btn.disabled = false;
    }
  });

  const resend = document.getElementById('resendLink');
  if (resend && emailInput) {
    resend.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email) return showFormError('Enter your email first.');
      resend.textContent = 'Sending...';
      try {
        await API.post('/auth/resend-code', { email });
        showSuccess('A new code has been sent. Check your email.');
      } catch (err) {
        showFormError(err.message);
      } finally {
        setTimeout(() => { resend.textContent = "Didn't get the code? Resend it"; }, 1500);
      }
    });
  }
}

function setupFeedbackForm() {
  const form = document.getElementById('feedbackForm');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const kindSelect = document.getElementById('kind');
  const successBox = document.getElementById('successBox');
  const btn = form.querySelector('button[type="submit"]');

  const kindParam = params.get('kind');
  if (kindParam && kindSelect && ['report', 'appeal', 'feedback'].includes(kindParam)) {
    kindSelect.value = kindParam;
  }
  const emailParam = params.get('email');
  if (emailParam && emailInput) emailInput.value = decodeURIComponent(emailParam);
  if (API.user && emailInput && !emailInput.value) emailInput.value = API.user.email;
  if (API.user && nameInput && !nameInput.value) nameInput.value = API.user.name;

  function showSuccess(message) {
    if (!successBox) return;
    successBox.textContent = message;
    successBox.classList.remove('hidden');
    const alert = document.getElementById('formAlert');
    if (alert) alert.classList.add('hidden');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();
    if (successBox) successBox.classList.add('hidden');
    const payload = {
      kind: kindSelect ? kindSelect.value : 'feedback',
      name: nameInput ? nameInput.value.trim() : '',
      email: emailInput ? emailInput.value.trim() : '',
      subject: (document.getElementById('subject') || {}).value || '',
      text: (document.getElementById('message') || {}).value.trim(),
    };
    if (!payload.name) return showFormError('Please enter your name.');
    if (!payload.email) return showFormError('Please enter your email so we can reply.');
    if (!payload.text) return showFormError('Please write a message.');

    btn.disabled = true;
    try {
      await API.post('/feedback', payload);
      showSuccess('Message sent. The admin will review it.');
      form.reset();
      if (emailInput) emailInput.value = payload.email;
      if (nameInput) nameInput.value = payload.name;
    } catch (err) {
      showFormError(err.message);
    } finally {
      btn.disabled = false;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavAuth();
  setupAuthForms();
  setupVerifyForm();
  setupFeedbackForm();
});