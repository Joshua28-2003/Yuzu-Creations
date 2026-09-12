const API = {
  get token() {
    return localStorage.getItem('yuzu_token');
  },

  get user() {
    try {
      return JSON.parse(localStorage.getItem('yuzu_user') || 'null');
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('yuzu_token', token);
    localStorage.setItem('yuzu_user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('yuzu_token');
    localStorage.removeItem('yuzu_user');
  },

  async request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const isForm = options.body instanceof FormData;

    if (options.body && !isForm) {
      headers['Content-Type'] = 'application/json';
    }

    if (API.token) {
      headers['Authorization'] = `Bearer ${API.token}`;
    }

    let res;
    try {
      res = await fetch(`/api${path}`, { ...options, headers });
    } catch {
      throw new Error('Network error - is the server running?');
    }

    let data = null;
    try {
      data = await res.json();
    } catch {
      return null;
    }

    if (!res.ok) {
      const message =
        (data && (data.error || (Array.isArray(data.errors) ? data.errors.join(', ') : ''))) ||
        `Request failed (${res.status})`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  get(path) {
    return API.request(path);
  },

  post(path, body) {
    return API.request(path, { method: 'POST', body: JSON.stringify(body || {}) });
  },

  patch(path, body) {
    return API.request(path, { method: 'PATCH', body: JSON.stringify(body || {}) });
  },

  del(path) {
    return API.request(path, { method: 'DELETE' });
  },
};

window.API = API;