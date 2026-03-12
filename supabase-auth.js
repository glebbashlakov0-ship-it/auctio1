(function () {
  var SUPABASE_URL = 'https://pwihhhbomwxzznekueok.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aWhoaGJvbXd4enpuZWt1ZW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTgzNjMsImV4cCI6MjA4MTAzNDM2M30.S1aJOnJIdZY8WGVUUAbvMStxR4C5o2-3AkO6GgmkKYY';
  var PROJECT_REF = 'pwihhhbomwxzznekueok';
  var SB_SESSION_KEY = 'sb-' + PROJECT_REF + '-auth-token';
  var AUCTIO_USERS_KEY = 'auctio_users';
  var AUCTIO_SESSION_KEY = 'auctio_session';
  var LEGACY_AUTH_USERS_KEY = 'auctio-auth-users';
  var LEGACY_AUTH_SESSION_KEY = 'auctio-auth-session';

  if (!window.supabase) {
    console.error('[supabase-auth] Supabase SDK not loaded.');
    return;
  }

  var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  var currentUser = null;
  var bootstrapStarted = false;
  window._supabase = supabase;

  function readJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (_error) {}
  }

  function removeStorage(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (_error) {}
  }

  function pruneAuthCache(activeUserId) {
    try {
      removeStorage(LEGACY_AUTH_USERS_KEY);
      removeStorage(LEGACY_AUTH_SESSION_KEY);

      var users = readJSON(AUCTIO_USERS_KEY, []);
      if (Array.isArray(users)) {
        var nextUsers = activeUserId
          ? users.filter(function (entry) { return entry && entry.id === activeUserId; })
          : [];
        writeJSON(AUCTIO_USERS_KEY, nextUsers);
      }
    } catch (_error) {}
  }

  function sanitizeUser(supaUser, profile) {
    if (!supaUser) return null;
    var meta = profile || supaUser.user_metadata || {};
    var firstName = meta.first_name || meta.firstName || '';
    var lastName = meta.last_name || meta.lastName || '';
    return {
      id: supaUser.id,
      firstName: firstName,
      lastName: lastName,
      fullName: (firstName + ' ' + lastName).trim() || supaUser.email || 'Collector',
      email: (profile && profile.email) || supaUser.email || '',
      phone: meta.phone || '',
      createdAt: supaUser.created_at || ''
    };
  }

  function getLegacyCurrentUser() {
    var session = readJSON(AUCTIO_SESSION_KEY, null);
    if (!session || !session.userId) return null;
    var users = readJSON(AUCTIO_USERS_KEY, []);
    if (!Array.isArray(users)) return null;
    for (var i = 0; i < users.length; i += 1) {
      if (users[i] && users[i].id === session.userId) {
        return sanitizeUser(users[i], users[i]);
      }
    }
    return null;
  }

  function writeLegacyUser(user) {
    if (!user) {
      pruneAuthCache(null);
      removeStorage(AUCTIO_SESSION_KEY);
      removeStorage(SB_SESSION_KEY);
      return;
    }

    pruneAuthCache(user.id);
    var users = readJSON(AUCTIO_USERS_KEY, []);
    if (!Array.isArray(users)) users = [];
    var record = {
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '__supabase__',
      createdAt: user.createdAt || ''
    };
    var nextUsers = users.filter(function (entry) { return entry && entry.id !== user.id; });
    nextUsers.push(record);
    writeJSON(AUCTIO_USERS_KEY, nextUsers);
    writeJSON(AUCTIO_SESSION_KEY, {
      userId: user.id,
      createdAt: new Date().toISOString()
    });
  }

  function setCurrentUser(supaUser, profile) {
    currentUser = sanitizeUser(supaUser, profile);
    writeLegacyUser(currentUser);
    return currentUser;
  }

  function clearCurrentUser() {
    currentUser = null;
    pruneAuthCache(null);
    removeStorage(AUCTIO_SESSION_KEY);
    removeStorage(SB_SESSION_KEY);
  }

  function dispatchAuth() {
    var user = currentUser || getLegacyCurrentUser();
    window.__AUCTIO_AUTH_USER = user;
    window.dispatchEvent(new CustomEvent('auctio-auth-change', { detail: { user: user } }));
    window.dispatchEvent(new CustomEvent('auctio:auth', { detail: { user: user } }));
  }

  async function refreshCurrentUserFromSession() {
    try {
      var sessionResult = await supabase.auth.getSession();
      var session = sessionResult.data && sessionResult.data.session;
      if (!session || !session.user) {
        clearCurrentUser();
        dispatchAuth();
        return null;
      }

      setCurrentUser(session.user);
      dispatchAuth();

      return currentUser;
    } catch (_error) {
      clearCurrentUser();
      dispatchAuth();
      return null;
    }
  }

  function normalizeError(error, fallbackMessage) {
    var message = String((error && error.message) || fallbackMessage || 'Authentication failed.');
    if (message === 'Invalid login credentials') {
      return new Error('Incorrect email or password.');
    }
    if (message.indexOf('Gateway Timeout') !== -1 || message.indexOf('504') !== -1) {
      return new Error('Authentication service is temporarily unavailable. Please try again.');
    }
    if (message.indexOf('Failed to fetch') !== -1 || message.indexOf('network') !== -1 || message.indexOf('Load failed') !== -1) {
      return new Error('Network error while contacting authentication service.');
    }
    return new Error(message);
  }

  function shouldRetryAuth(error) {
    var message = String((error && error.message) || '');
    return (
      message.indexOf('Gateway Timeout') !== -1 ||
      message.indexOf('504') !== -1 ||
      message.indexOf('Failed to fetch') !== -1 ||
      message.indexOf('Load failed') !== -1
    );
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  async function retryAuthCall(fn, fallbackMessage) {
    var lastError = null;
    for (var attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await fn();
      } catch (error) {
        lastError = normalizeError(error, fallbackMessage);
        if (attempt === 0 && shouldRetryAuth(lastError)) {
          await wait(1200);
          continue;
        }
        throw lastError;
      }
    }
    throw lastError || new Error(fallbackMessage || 'Authentication failed.');
  }

  function overrideAuth() {
    window.AuctioAuth.getCurrentUser = function () {
      return currentUser || getLegacyCurrentUser();
    };

    window.AuctioAuth.refreshCurrentUser = function () {
      return refreshCurrentUserFromSession();
    };

    window.AuctioAuth.getStoredUsers = function () {
      var users = readJSON(AUCTIO_USERS_KEY, []);
      return Array.isArray(users) ? users : [];
    };

    window.AuctioAuth.register = async function (payload) {
      var email = String(payload.email || '').trim().toLowerCase();
      var password = String(payload.password || '');
      if (!email) throw new Error('Email is required.');
      if (password.length < 8) throw new Error('Password must be at least 8 characters.');

      var result = await retryAuthCall(async function () {
        var signUpResult = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              first_name: String(payload.firstName || '').trim(),
              last_name: String(payload.lastName || '').trim(),
              phone: String(payload.phone || '').trim()
            }
          }
        });
        if (signUpResult.error) throw signUpResult.error;
        return signUpResult;
      }, 'Unable to create account.');

      if (!result.data || !result.data.user) throw new Error('Registration failed. Please try again.');

      var identities = result.data.user.identities;
      if (identities && identities.length === 0) {
        throw new Error('An account with this email already exists.');
      }

      setCurrentUser(result.data.user, {
        first_name: String(payload.firstName || '').trim(),
        last_name: String(payload.lastName || '').trim(),
        phone: String(payload.phone || '').trim(),
        email: email
      });
      dispatchAuth();

      return window.AuctioAuth.getCurrentUser();
    };

    window.AuctioAuth.login = async function (email, password) {
      var result = await retryAuthCall(async function () {
        var signInResult = await supabase.auth.signInWithPassword({
          email: String(email || '').trim().toLowerCase(),
          password: String(password || '')
        });
        if (signInResult.error) throw signInResult.error;
        return signInResult;
      }, 'Unable to log in.');

      if (!result.data || !result.data.user) throw new Error('Unable to log in.');

      setCurrentUser(result.data.user);
      dispatchAuth();

      return window.AuctioAuth.getCurrentUser();
    };

    window.AuctioAuth.logout = async function () {
      clearCurrentUser();
      dispatchAuth();
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (error) {
        console.warn('[supabase-auth] local signOut failed', error);
      }
    };
  }

  function bootstrapAuth() {
    if (bootstrapStarted) return;
    bootstrapStarted = true;
    currentUser = getLegacyCurrentUser();
    overrideAuth();
    refreshCurrentUserFromSession();

    supabase.auth.onAuthStateChange(function (_event, session) {
      if (session && session.user) {
        setCurrentUser(session.user);
        dispatchAuth();
        return;
      }
      clearCurrentUser();
      dispatchAuth();
    });
  }

  if (window.AuctioAuth) {
    bootstrapAuth();
  } else {
    var interval = setInterval(function () {
      if (!window.AuctioAuth) return;
      clearInterval(interval);
      bootstrapAuth();
    }, 10);
  }
})();
