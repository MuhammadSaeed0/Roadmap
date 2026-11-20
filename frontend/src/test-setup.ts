// Runs before every spec file. Tests that switch to Arabic save the choice in localStorage, and spec files can share
// one browser environment, so start every test from the default language.
beforeEach(() => {
  try { localStorage.removeItem('devpath.lang'); } catch { /* no storage: nothing to reset */ }
});
