// Apply the saved language, direction and theme before Angular starts, so the page
// never flashes in the wrong direction or colour. Angular takes over from here.
(function () {
  try {
    var saved = localStorage.getItem('devpath.lang');
    var langs = [].concat(navigator.languages || [], navigator.language || []);
    var lang = saved === 'ar' || saved === 'en' ? saved
      : langs.some(function (t) { return String(t).toLowerCase().indexOf('ar') === 0; }) ? 'ar' : 'en';
    var theme = localStorage.getItem('devpath.theme') || 'system';
    if (theme === 'system') theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    html.dataset.theme = theme;
  } catch (e) { /* storage unavailable: defaults apply */ }
})();
