(() => {
  const languageOptions = document.querySelectorAll('.language-option');
  const languageMenu = document.querySelector('.language-menu');
  const search = document.getElementById('paper-search');
  const paperType = document.getElementById('paper-type');
  const root = document.documentElement;
  const chinese = root.lang.startsWith('zh');
  const theme = document.querySelector('.theme-toggle');

  for (const trigger of document.querySelectorAll('[data-contact-dialog]')) {
    const dialog = document.getElementById(trigger.dataset.contactDialog);
    if (typeof dialog?.showModal !== 'function') continue;
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', dialog.id);
    trigger.addEventListener('click', event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || dialog.open) return;
      event.preventDefault();
      dialog.showModal();
    });
  }
  for (const dialog of document.querySelectorAll('.contact-dialog')) {
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
  }

  if (languageMenu) {
    document.addEventListener('pointerdown', event => {
      if (!languageMenu.contains(event.target)) languageMenu.open = false;
    });
    languageMenu.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !languageMenu.open) return;
      languageMenu.open = false;
      languageMenu.querySelector('summary').focus();
    });
  }

  function syncTheme() {
    const dark = root.dataset.theme === 'dark';
    const label = dark ? theme.dataset.dayLabel : theme.dataset.nightLabel;
    theme.setAttribute('aria-label', label);
    theme.title = label;
    theme.querySelector('span').textContent = dark ? '☀️' : '🌙';
    if (location.protocol === 'file:') {
      document.querySelectorAll('a[href$=".html"], a[href*=".html?"], a[href*=".html#"]').forEach(link => {
        const url = new URL(link.href);
        if (url.protocol !== 'file:') return;
        url.searchParams.set('theme', root.dataset.theme);
        link.href = url.href;
      });
    }
    window.dispatchEvent(new Event('zunhai-theme-change'));
  }

  if (theme) {
    theme.hidden = false;
    theme.addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('zunhai-theme', root.dataset.theme); } catch {}
      syncTheme();
    });
    syncTheme();
  }
  function updateLanguageLinks() {
    for (const option of languageOptions) {
      const alternate = new URL(option.href);
      alternate.hash = location.hash;
      if (search && search.value.trim()) alternate.searchParams.set('q', search.value.trim());
      else alternate.searchParams.delete('q');
      if (paperType && paperType.value !== 'all') alternate.searchParams.set('type', paperType.value);
      else alternate.searchParams.delete('type');
      option.href = alternate.href;
    }
  }
  window.addEventListener('hashchange', updateLanguageLinks);
  updateLanguageLinks();
  if (!search) return;
  const groups = [...document.querySelectorAll('.pub-group')];
  const rows = [...document.querySelectorAll('.pub-row')];
  const count = document.getElementById('paper-count');
  const empty = document.getElementById('paper-empty');
  search.closest('.paper-tools').hidden = false;
  const params = new URLSearchParams(location.search);
  search.value = params.get('q') || '';
  const initialType = params.get('type');
  if ([...paperType.options].some(option => option.value === initialType)) paperType.value = initialType;

  function applySearch() {
    const tokens = search.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    const works = new Set();
    for (const row of rows) {
      const haystack = row.dataset.paper.toLocaleLowerCase();
      const kindMatches = ['all', row.dataset.kind, row.dataset.category].includes(paperType.value);
      row.hidden = !kindMatches || !tokens.every(token => haystack.includes(token));
      if (!row.hidden) works.add(row.dataset.work);
    }
    for (const group of groups) {
      group.hidden = !group.querySelector('.pub-row:not([hidden])');
    }
    const visible = works.size;
    const englishCount = `${visible} ${visible === 1 ? 'work' : 'works'}`;
    const chineseCount = `${visible} ${root.lang === 'zh-HK' ? '項成果' : '项成果'}`;
    count.textContent = chinese ? chineseCount : englishCount;
    empty.hidden = visible > 0;
    updateLanguageLinks();
  }
  search.addEventListener('input', applySearch);
  paperType.addEventListener('change', applySearch);
  applySearch();
})();
