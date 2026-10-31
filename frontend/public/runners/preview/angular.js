// Live preview of an Angular workspace. The editor compiles each TypeScript file to JavaScript and posts
// { type: 'render', modules: [{ path, code }], entry, html, styles }. Here the modules are linked together as
// blob: URLs (bare imports such as '@angular/core' point at the bundled Angular in ../angular/vendor), and the
// app is compiled just in time by @angular/compiler and bootstrapped.
'use strict';
(function () {
  const CHANNEL = 'devpath-preview';
  const vendorBase = new URL('../angular/vendor/', location.href).href;
  const IMPORT = /(\bimport\s*(?:[\w*{}\s,$]+\s*from\s*)?|\bexport\s*(?:\*(?:\s+as\s+\w+)?|\{[^}]*\})\s*from\s*|\bimport\s*\(\s*)(['"])([^'"]+)\2/g;

  function fail(message) { console.error(message); }

  function resolve(from, spec, modules) {
    const parts = from.split('/').slice(0, -1);
    for (const part of spec.split('/')) {
      if (part === '..') parts.pop();
      else if (part && part !== '.') parts.push(part);
    }
    const base = parts.join('/');
    for (const candidate of [base, base + '.ts', base + '.js', base + '/index.ts']) if (modules.has(candidate)) return candidate;
    return null;
  }

  async function render(data) {
    const vendor = await (await fetch(vendorBase + 'manifest.json')).json();
    const modules = new Map(data.modules.map((m) => [m.path, m.code]));
    const urls = new Map();
    const building = new Set();

    function link(path) {
      if (urls.has(path)) return urls.get(path);
      if (building.has(path)) throw new Error('Circular import involving ' + path + '. The preview needs imports without cycles.');
      building.add(path);
      const code = modules.get(path).replace(IMPORT, (match, head, quote, spec) => {
        if (spec.startsWith('.')) {
          const target = resolve(path, spec, modules);
          if (!target) throw new Error(path + ': cannot find the file "' + spec + '".');
          return head + quote + link(target) + quote;
        }
        if (vendor[spec]) return head + quote + vendorBase + vendor[spec] + quote;
        throw new Error(path + ': the package "' + spec + '" is not available in the preview (only @angular/* and rxjs are).');
      });
      building.delete(path);
      const url = URL.createObjectURL(new Blob([code + '\n//# sourceURL=' + path], { type: 'text/javascript' }));
      urls.set(path, url);
      return url;
    }

    const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(data.html || '');
    document.body.innerHTML = (body ? body[1] : '<app-root></app-root>').replace(/<script[\s\S]*?<\/script>/gi, '');
    for (const css of data.styles || []) {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    }

    if (!modules.has(data.entry)) { fail('The workspace has no ' + data.entry + ' to start from.'); return; }
    let entryUrl;
    try { entryUrl = link(data.entry); } catch (e) { fail(e.message); return; }
    try {
      await import(vendorBase + vendor['@angular/compiler']);
      await import(entryUrl);
    } catch (e) {
      fail((e && e.message) || String(e));
    }
  }

  addEventListener('message', (event) => {
    const data = event.data;
    if (event.source !== parent || !data || data.channel !== CHANNEL || data.type !== 'render') return;
    render(data).catch((e) => fail((e && e.message) || String(e)));
  });
  parent.postMessage({ channel: CHANNEL, type: 'ready' }, '*');
})();
