// Loaded first in every preview: forwards console output and uncaught errors to the editor's console panel.
'use strict';
(function () {
  const CHANNEL = 'devpath-preview';
  const send = (level, args) => {
    const text = Array.prototype.map.call(args, (a) => {
      if (typeof a === 'string') return a;
      if (a instanceof Error) return a.name + ': ' + a.message;
      try { return JSON.stringify(a); } catch (e) { return String(a); }
    }).join(' ');
    parent.postMessage({ channel: CHANNEL, type: 'console', level: level, text: text.slice(0, 5000) }, '*');
  };
  ['log', 'info', 'warn', 'error', 'debug'].forEach((level) => {
    const original = console[level].bind(console);
    console[level] = function () { send(level, arguments); original.apply(null, arguments); };
  });
  addEventListener('error', (e) => send('error', [e.error || e.message]));
  addEventListener('unhandledrejection', (e) => send('error', [e.reason]));
  self.__devpathPreview = { send: send, channel: CHANNEL };
})();
