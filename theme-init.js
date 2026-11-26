(() => {
  let saved;
  try { saved = localStorage.getItem('zunhai-theme'); } catch {}
  const requested = new URLSearchParams(location.search).get('theme');
  const initial = requested === 'dark' || requested === 'light' ? requested : saved;
  document.documentElement.dataset.theme = initial === 'dark' ? 'dark' : 'light';
})();
