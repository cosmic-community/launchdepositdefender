(function () {
  if (window.self === window.top) return;

  const logs = [];
  const MAX_LOGS = 500;

  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug
  };

  function captureLog(level, args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg, (key, value) => {
            if (typeof value === 'function') return '[Function]';
            if (value instanceof Error) return value.toString();
            return value;
          }, 2);
        } catch (e) {
          return '[Object]';
        }
      }
      return String(arg);
    }).join(' ');

    const logEntry = {
      timestamp,
      level,
      message,
      url: window.location.href
    };

    logs.push(logEntry);
    if (logs.length > MAX_LOGS) {
      logs.shift();
    }

    try {
      window.parent.postMessage({
        type: 'console-log',
        log: logEntry
      }, '*');
    } catch (e) {}
  }

  ['log', 'warn', 'error', 'info', 'debug'].forEach(level => {
    console[level] = function(...args) {
      originalConsole[level].apply(console, args);
      captureLog(level, args);
    };
  });

  window.addEventListener('error', (event) => {
    captureLog('error', [event.message, event.filename, event.lineno, event.colno]);
  });

  window.addEventListener('unhandledrejection', (event) => {
    captureLog('error', ['Unhandled Promise Rejection:', event.reason]);
  });

  function sendReady() {
    try {
      window.parent.postMessage({
        type: 'console-capture-ready',
        url: window.location.href,
        timestamp: new Date().toISOString()
      }, '*');
    } catch (e) {}
  }

  function sendRouteChange() {
    try {
      window.parent.postMessage({
        type: 'route-change',
        route: {
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash,
          href: window.location.href
        },
        timestamp: new Date().toISOString()
      }, '*');
    } catch (e) {}
  }

  if (document.readyState === 'complete') {
    sendReady();
    sendRouteChange();
  } else {
    window.addEventListener('load', () => {
      sendReady();
      sendRouteChange();
    });
  }

  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      sendRouteChange();
    }
  }).observe(document, { subtree: true, childList: true });

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    setTimeout(sendRouteChange, 0);
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    setTimeout(sendRouteChange, 0);
  };

  window.addEventListener('popstate', sendRouteChange);
  window.addEventListener('hashchange', sendRouteChange);
})();