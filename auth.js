(function (global) {
  var SUPPORT = 'staffmatch.support@gmail.com';
  var UNREACHABLE =
    "Couldn't reach StaffMatch — try again later or email " + SUPPORT + '.';
  var NOT_CONFIGURED =
    "StaffMatch accounts aren’t connected yet — try again later or email " + SUPPORT + '.';
  var client = null;
  var sessionCache = null;

  function apiBase() {
    return String(global.STAFFMATCH_API || 'https://staffmatch-api.onrender.com').replace(/\/$/, '');
  }

  function appUrl() {
    return String(global.STAFFMATCH_APP_URL || '').trim();
  }

  function redirectToAppIfConfigured() {
    var url = appUrl();
    if (!url) return false;
    var session = getSession();
    if (session && session.access_token) {
      var params = [];
      params.push('access_token=' + encodeURIComponent(session.access_token));
      if (session.refresh_token) {
        params.push('refresh_token=' + encodeURIComponent(session.refresh_token));
      }
      if (session.expires_in != null) {
        params.push('expires_in=' + encodeURIComponent(String(session.expires_in)));
      }
      if (session.expires_at != null) {
        params.push('expires_at=' + encodeURIComponent(String(session.expires_at)));
      }
      params.push('token_type=' + encodeURIComponent(session.token_type || 'bearer'));
      params.push('type=signup');
      url = url + '#' + params.join('&');
    }
    global.location.assign(url);
    return true;
  }

  function trimSlash(url) {
    return String(url || '').trim().replace(/\/$/, '');
  }

  function isConfigured() {
    var url = trimSlash(global.SUPABASE_URL);
    var key = String(global.SUPABASE_ANON_KEY || '').trim();
    if (!url || !key) return false;
    if (!/^https:\/\//i.test(url)) return false;
    if (/YOUR_PROJECT_REF|YOUR_SUPABASE|example\.supabase/i.test(url + key)) return false;
    return true;
  }

  function configuredError() {
    var err = new Error(NOT_CONFIGURED);
    err.code = 'not_configured';
    return err;
  }

  function getClient() {
    if (!isConfigured()) throw configuredError();
    if (client) return client;
    var create = global.supabase && global.supabase.createClient;
    if (typeof create !== 'function') {
      var loadErr = new Error(UNREACHABLE);
      loadErr.code = 'sdk_missing';
      throw loadErr;
    }
    client = create(trimSlash(global.SUPABASE_URL), String(global.SUPABASE_ANON_KEY).trim());
    return client;
  }

  function mapAuthError(error) {
    var msg = (error && (error.message || error.error_description)) || '';
    var status = error && error.status;
    var lower = msg.toLowerCase();
    if (!msg && (status === 0 || error instanceof TypeError)) return UNREACHABLE;
    if (/invalid login|invalid credentials|invalid email or password/i.test(lower)) {
      return 'Email or password is incorrect.';
    }
    if (/already registered|already exists|user already/i.test(lower)) {
      return 'An account with that email already exists. Sign in instead.';
    }
    if (/email not confirmed/i.test(lower)) {
      return 'Check your email to confirm this account, then sign in.';
    }
    if (/failed to fetch|networkerror|load failed/i.test(lower)) return UNREACHABLE;
    return msg || 'Something went wrong. Try again, or email ' + SUPPORT + '.';
  }

  function rememberSession(session) {
    sessionCache = session || null;
    return session;
  }

  function hasSession() {
    return !!(sessionCache && sessionCache.access_token);
  }

  function getSession() {
    return sessionCache;
  }

  function getToken() {
    return (sessionCache && sessionCache.access_token) || null;
  }

  function getUser() {
    return (sessionCache && sessionCache.user) || null;
  }

  function refreshSession() {
    if (!isConfigured()) {
      rememberSession(null);
      return Promise.resolve(null);
    }
    var sb;
    try {
      sb = getClient();
    } catch (_) {
      rememberSession(null);
      return Promise.resolve(null);
    }
    return sb.auth.getSession().then(function (result) {
      if (result.error) {
        rememberSession(null);
        return null;
      }
      rememberSession(result.data && result.data.session);
      return sessionCache;
    }).catch(function () {
      rememberSession(null);
      return null;
    });
  }

  function signUp(payload) {
    var sb;
    try {
      sb = getClient();
    } catch (err) {
      return Promise.reject(err);
    }
    var meta = {};
    if (payload.firstName) meta.first_name = payload.firstName;
    if (payload.lastName) meta.last_name = payload.lastName;
    if (payload.phone) meta.phone = payload.phone;
    return sb.auth
      .signUp({
        email: payload.email,
        password: payload.password,
        options: { data: meta },
      })
      .then(function (result) {
        if (result.error) {
          var err = new Error(mapAuthError(result.error));
          err.status = result.error.status;
          throw err;
        }
        rememberSession(result.data && result.data.session);
        return result.data;
      })
      .catch(function (err) {
        if (err instanceof TypeError) {
          var net = new Error(UNREACHABLE);
          net.code = 'unreachable';
          throw net;
        }
        throw err;
      });
  }

  function signIn(payload) {
    var sb;
    try {
      sb = getClient();
    } catch (err) {
      return Promise.reject(err);
    }
    return sb.auth
      .signInWithPassword({
        email: payload.email,
        password: payload.password,
      })
      .then(function (result) {
        if (result.error) {
          var err = new Error(mapAuthError(result.error));
          err.status = result.error.status;
          throw err;
        }
        if (!result.data || !result.data.session) {
          throw new Error('Unexpected response from StaffMatch. Try again.');
        }
        rememberSession(result.data.session);
        return result.data;
      })
      .catch(function (err) {
        if (err instanceof TypeError) {
          var net = new Error(UNREACHABLE);
          net.code = 'unreachable';
          throw net;
        }
        throw err;
      });
  }

  function clearSession() {
    sessionCache = null;
    if (!isConfigured()) return Promise.resolve();
    try {
      return getClient().auth.signOut().catch(function () {});
    } catch (_) {
      return Promise.resolve();
    }
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
    if (redirectToAppIfConfigured()) return;
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
      '<button type="button" class="btn ghost" id="auth-switch">Use a different account</button>' +
      '</div>';
    var switchBtn = panel.querySelector('#auth-switch');
    if (switchBtn) {
      switchBtn.addEventListener('click', function () {
        clearSession().then(function () {
          global.location.reload();
        });
      });
    }
  }

  function showAlreadySignedInState(panel) {
    if (!panel) return;
    var url = appUrl();
    var hasAppUrl = !!url;
    panel.innerHTML =
      '<p class="eyebrow">Account</p>' +
      '<h1>You\'re already signed in</h1>' +
      '<p class="muted">You have an active session. Open the app or sign in with a different account.</p>' +
      '<div class="form-actions" style="justify-content:flex-start">' +
      (hasAppUrl ? '<button type="button" class="btn primary" id="auth-open-app">Open app</button>' : '') +
      '<button type="button" class="btn ghost" id="auth-switch">Use a different account</button>' +
      '</div>';
    var openBtn = panel.querySelector('#auth-open-app');
    if (openBtn) {
      openBtn.addEventListener('click', function () {
        redirectToAppIfConfigured();
      });
    }
    var switchBtn = panel.querySelector('#auth-switch');
    if (switchBtn) {
      switchBtn.addEventListener('click', function () {
        clearSession().then(function () {
          global.location.reload();
        });
      });
    }
  }

  global.StaffMatchAuth = {
    apiBase: apiBase,
    appUrl: appUrl,
    redirectToAppIfConfigured: redirectToAppIfConfigured,
    isConfigured: isConfigured,
    signUp: signUp,
    signIn: signIn,
    refreshSession: refreshSession,
    hasSession: hasSession,
    getSession: getSession,
    getToken: getToken,
    getUser: getUser,
    clearSession: clearSession,
    bindPasswordToggles: bindPasswordToggles,
    setStatus: setStatus,
    showReadyState: showReadyState,
    showAlreadySignedInState: showAlreadySignedInState,
    NOT_CONFIGURED: NOT_CONFIGURED,
    SUPPORT: SUPPORT,
  };
})(window);
