(function (global) {
  var TOKEN_KEY = 'staffmatch_token';
  var USER_KEY = 'staffmatch_user';
  var SUPPORT = 'staffmatch.support@gmail.com';
  var UNREACHABLE =
    "Couldn't reach StaffMatch — try again later or email " + SUPPORT + '.';

  function apiBase() {
    return String(global.STAFFMATCH_API || 'https://staffmatch-api.onrender.com').replace(/\/$/, '');
  }

  function storeSession(token, user) {
    try {
      global.localStorage.setItem(TOKEN_KEY, token);
      if (user) global.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (_) {
      /* private mode / quota — still return the token to the caller */
    }
  }

  function getToken() {
    try {
      return global.localStorage.getItem(TOKEN_KEY);
    } catch (_) {
      return null;
    }
  }

  function getUser() {
    try {
      var raw = global.localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function readErrorMessage(res, data) {
    if (data && typeof data.error === 'string' && data.error) return data.error;
    if (data && typeof data.message === 'string' && data.message) return data.message;
    if (res.status === 401) return 'Email or password is incorrect.';
    if (res.status === 409) return 'An account with that email already exists.';
    if (res.status === 400) return 'Check your details and try again.';
    return 'Something went wrong. Try again, or email ' + SUPPORT + '.';
  }

  function authRequest(path, body) {
    var url = apiBase() + path;
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })
      .catch(function () {
        var err = new Error(UNREACHABLE);
        err.code = 'unreachable';
        throw err;
      })
      .then(function (res) {
        return res
          .text()
          .then(function (text) {
            var data = {};
            if (text) {
              try {
                data = JSON.parse(text);
              } catch (_) {
                data = {};
              }
            }
            if (!res.ok) {
              var err = new Error(readErrorMessage(res, data));
              err.status = res.status;
              err.data = data;
              throw err;
            }
            if (!data || !data.token) {
              throw new Error('Unexpected response from StaffMatch. Try again.');
            }
            storeSession(data.token, data.user);
            return data;
          });
      });
  }

  function register(payload) {
    return authRequest('/api/auth/register', payload);
  }

  function login(payload) {
    return authRequest('/api/auth/login', payload);
  }

  function bindPasswordToggles(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-toggle-password]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var wrap = btn.closest('.password-wrap');
        var input = wrap && wrap.querySelector('input');
        if (!input) return;
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.textContent = show ? 'Hide' : 'Show';
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        btn.setAttribute('aria-pressed', show ? 'true' : 'false');
      });
    });
  }

  function setStatus(el, type, message) {
    if (!el) return;
    if (!message) {
      el.hidden = true;
      el.textContent = '';
      el.className = 'form-status';
      return;
    }
    el.hidden = false;
    el.className = 'form-status ' + (type || 'error');
    el.textContent = message;
  }

  function showReadyState(panel, opts) {
    if (!panel) return;
    var title = (opts && opts.title) || "You're in";
    var body =
      (opts && opts.body) ||
      "We'll email when your pilot workspace is ready.";
    panel.innerHTML =
      '<p class="eyebrow">Account</p>' +
      '<h1>' +
      title +
      '</h1>' +
      '<p class="muted">' +
      body +
      '</p>' +
      '<div class="form-actions" style="justify-content:flex-start">' +
      '<a class="btn primary" href="index.html">Back to StaffMatch</a>' +
      '<a class="btn ghost" href="mailto:' +
      SUPPORT +
      '?subject=StaffMatch%20pilot">Email support</a>' +
      '</div>';
  }

  global.StaffMatchAuth = {
    apiBase: apiBase,
    register: register,
    login: login,
    getToken: getToken,
    getUser: getUser,
    storeSession: storeSession,
    bindPasswordToggles: bindPasswordToggles,
    setStatus: setStatus,
    showReadyState: showReadyState,
    SUPPORT: SUPPORT,
  };
})(window);
