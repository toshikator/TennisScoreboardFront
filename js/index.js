document.addEventListener('DOMContentLoaded', function () {
  // Footer year (if a footer is already on the page)
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Simple click binder
  function bindClick(id, handler) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function (e) {
      if (e && e.preventDefault) e.preventDefault();
      handler();
    });
  }

  function wireHeaderActions() {
    var inHtml = window.location.pathname.indexOf('/html/') !== -1;
    var homeUrl = inHtml ? '../index.html' : 'index.html';
    var newMatchUrl = inHtml ? 'new-match.html' : 'html/new-match.html';
    var playersUrl = inHtml ? 'players.html' : 'html/players.html';
    var finishedUrl = inHtml ? 'finishedMatches.html' : 'html/finishedMatches.html';
    var assetPrefix = inHtml ? '../' : '';

    function setHref(id, url) {
      var a = document.getElementById(id);
      if (a) a.setAttribute('href', url);
    }

    setHref('action-home', homeUrl);
    setHref('action-new-match', newMatchUrl);
    setHref('action-new-player', playersUrl);
    setHref('action-finished', finishedUrl);

    var logo = document.querySelector('header .logo');
    if (logo) logo.setAttribute('src', assetPrefix + 'images/logo.png');

    bindClick('action-home', function () { window.location.href = homeUrl; });
    bindClick('action-new-match', function () { window.location.href = newMatchUrl; });
    bindClick('action-new-player', function () { window.location.href = playersUrl; });
    bindClick('action-finished', function () { window.location.href = finishedUrl; });
    bindClick('action-scores', function () { alert('View match scores (placeholder)'); });
  }

  // Load a file (synchronously) and return its text or null
  function loadFileSync(url) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false); // synchronous
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        return xhr.responseText;
      }
    } catch (e) {}
    return null;
  }

  // Inject shared header
  var siteHeaderMount = document.getElementById('site-header');
  var inHtmlPath = window.location.pathname.indexOf('/html/') !== -1;
  var basePrefix = inHtmlPath ? '../' : '';
  if (siteHeaderMount) {
    var headerHtml = loadFileSync(basePrefix + 'html/header.html');
    if (headerHtml) {
      siteHeaderMount.outerHTML = headerHtml;
      wireHeaderActions();
    } else {
      // Fallback header (links and logo will be normalized by wireHeaderActions)
      siteHeaderMount.outerHTML = '<header>' +
        '<div class="brand">' +
          '<img class="logo" src="' + (basePrefix + 'images/logo.png') + '" alt="Tennis Scoreboard logo" width="108" height="108" decoding="async">' +
          '<div>Tennis Scoreboard</div>' +
        '</div>' +
        '<div class="actions">' +
          '<a href="#" class="btn primary" id="action-new-match">New Match</a>' +
          '<a href="#" class="btn" id="action-new-player">Players</a>' +
          '<a href="#" class="btn" id="action-finished">Finished Matches</a>' +
          '<a href="#" class="btn" id="action-scores">Match Scores</a>' +
        '</div>' +
      '</header>';
      wireHeaderActions();
    }
  } else {
    // If there is no mount, still try to wire actions on existing header
    wireHeaderActions();
  }

  // Players page logic (only runs when elements exist)
  var playersListEl = document.getElementById('players-list');
  var playersEmptyEl = document.getElementById('players-empty');
  var addPlayerBtn = document.getElementById('btn-add-player');

  function loadPlayers() {
    try {
      var raw = localStorage.getItem('players') || '[]';
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }
  function savePlayers(arr) {
    try {
      localStorage.setItem('players', JSON.stringify(arr));
    } catch (e) {}
  }

  function renderPlayers() {
    if (!playersListEl) return;
    var players = loadPlayers();
    playersListEl.innerHTML = '';
    if (!players || !players.length) {
      if (playersEmptyEl) playersEmptyEl.style.display = 'block';
      return;
    }
    if (playersEmptyEl) playersEmptyEl.style.display = 'none';
    for (var i = 0; i < players.length; i++) {
      var p = players[i];
      var li = document.createElement('li');
      li.className = 'list-item';
      li.textContent = p && p.name ? p.name : '';
      playersListEl.appendChild(li);
    }
  }

  if (addPlayerBtn) {
    bindClick('btn-add-player', function () {
      var name = prompt('Enter player name:');
      if (name) name = String(name).trim();
      if (!name) return;

      var players = loadPlayers();
      var exists = false;
      for (var i = 0; i < players.length; i++) {
        var n = (players[i].name || '').toLowerCase();
        if (n === name.toLowerCase()) { exists = true; break; }
      }
      if (exists) { alert('Player with this name already exists.'); return; }

      players.push({ id: Date.now(), name: name, createdAt: new Date().toISOString() });
      savePlayers(players);
      renderPlayers();
    });
    renderPlayers();
  }

  // Footer clock
  function startFooterClock() {
    var tzEl = document.getElementById('timezone');
    var dtEl = document.getElementById('date-time');
    var yearEl2 = document.getElementById('year');

    if (yearEl2) yearEl2.textContent = String(new Date().getFullYear());

    if (tzEl) {
      try {
        var tz = (Intl && Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions) ? Intl.DateTimeFormat().resolvedOptions().timeZone : null;
        tzEl.textContent = tz || 'Local Time';
      } catch (e) {
        tzEl.textContent = 'Local Time';
      }
    }

    function pad2(n) { return (n < 10 ? '0' : '') + n; }

    function updateClock() {
      if (!dtEl) return;
      try {
        var now = new Date();
        var formatted = now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate()) +
          ' ' + pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
        dtEl.textContent = formatted;
      } catch (e) {
        dtEl.textContent = new Date().toLocaleString();
      }
    }

    updateClock();
    setInterval(updateClock, 1000);
  }

  // Inject shared footer
  var siteFooterMount = document.getElementById('site-footer');
  if (siteFooterMount) {
    var footerHtml = loadFileSync(basePrefix + 'html/footer.html');
    if (footerHtml) {
      siteFooterMount.outerHTML = footerHtml;
      startFooterClock();
    } else {
      siteFooterMount.outerHTML = '<footer>© <span id="year"></span> Tennis Scoreboard · <span id="date-time"></span> (<span id="timezone"></span>)</footer>';
      startFooterClock();
    }
  }
});
