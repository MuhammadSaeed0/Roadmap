// Live preview of an HTML/CSS/JavaScript workspace. The editor posts { type: 'render', files, entry };
// local stylesheets, scripts and images are turned into blob: URLs and the page is written into this frame.
'use strict';
(function () {
  const CHANNEL = 'devpath-preview';
  const types = { css: 'text/css', js: 'text/javascript', mjs: 'text/javascript', json: 'application/json', svg: 'image/svg+xml', html: 'text/html', txt: 'text/plain' };

  function resolvePath(from, ref) {
    if (/^([a-z]+:|\/\/|#|data:|blob:)/i.test(ref)) return null;
    const parts = from.split('/').slice(0, -1);
    for (const part of ref.split(/[?#]/)[0].split('/')) {
      if (part === '..') parts.pop();
      else if (part && part !== '.') parts.push(part);
    }
    return parts.join('/');
  }

  function render(files, entry) {
    const byPath = new Map(files.map((f) => [f.path, f.content]));
    const urls = new Map();
    for (const [path, content] of byPath) {
      if (path.endsWith('.html')) continue;
      const ext = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
      urls.set(path, URL.createObjectURL(new Blob([content], { type: types[ext] || 'text/plain' })));
    }
    const html = byPath.get(entry);
    if (html === undefined) { console.error('The workspace has no ' + entry + ' to show.'); return; }
    const rewritten = html.replace(/(\s(?:src|href)\s*=\s*)(["'])([^"']+)\2/gi, (match, attr, quote, ref) => {
      const path = resolvePath(entry, ref);
      return path && urls.has(path) ? attr + quote + urls.get(path) + quote : match;
    });
    const bridge = '<script src="' + new URL('bridge.js', location.href).href + '"></' + 'script>';
    const withBridge = /<head[^>]*>/i.test(rewritten)
      ? rewritten.replace(/<head[^>]*>/i, (m) => m + bridge)
      : bridge + rewritten;
    document.open();
    document.write(withBridge);
    document.close();
  }

  addEventListener('message', (event) => {
    const data = event.data;
    if (event.source !== parent || !data || data.channel !== CHANNEL || data.type !== 'render') return;
    render(data.files || [], data.entry || 'index.html');
  });
  parent.postMessage({ channel: CHANNEL, type: 'ready' }, '*');
})();
