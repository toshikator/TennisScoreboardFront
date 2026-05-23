// Global players array available across the whole app
(function(){
  try {
    if (!window.players) {
      var rawPlayers = localStorage.getItem('players') || '[]';
      window.players = JSON.parse(rawPlayers);
    }
  } catch (e) {
    window.players = window.players || [];
  }
})();

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
      if (Array.isArray(window.players)) return window.players;
    } catch (e) {}
    try {
      var raw = localStorage.getItem('players') || '[]';
      var parsed = JSON.parse(raw);
      window.players = Array.isArray(parsed) ? parsed : [];
      return window.players;
    } catch (e2) {
      window.players = window.players || [];
      return window.players;
    }
  }
  function savePlayers(arr) {
    try {
      window.players = Array.isArray(arr) ? arr : [];
      localStorage.setItem('players', JSON.stringify(window.players));
    } catch (e) {
      window.players = Array.isArray(arr) ? arr : (window.players || []);
    }
  }

  function getFullName(p) {
    if (!p) return '';
    var fn = (p.firstName || '').trim();
    var ln = (p.lastName || '').trim();
    var combined = (fn + ' ' + ln).trim();
    return combined || String(p.name || '').trim();
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
      li.textContent = getFullName(p);
      playersListEl.appendChild(li);
    }
  }

  // Ensure a small set of demo players exist (idempotent seeding)
  function seedPlayersIfEmpty() {
    var players = loadPlayers() || [];
    var names = [
      { firstName: 'Maria', lastName: 'Sharapova' },
      { firstName: 'Serena', lastName: 'Williams' },
      { firstName: 'Roger', lastName: 'Federer' },
      { firstName: 'Novak', lastName: 'Djokovic' }
    ];

    var now = Date.now();
    var added = 0;
    for (var i = 0; i < names.length; i++) {
      var fn = names[i].firstName;
      var ln = names[i].lastName;
      var full = (fn + ' ' + ln).trim();
      var exists = false;
      for (var j = 0; j < players.length; j++) {
        if (getFullName(players[j]).toLowerCase() === full.toLowerCase()) { exists = true; break; }
      }
      if (!exists) {
        players.push({ id: now + i, firstName: fn, lastName: ln, name: full, createdAt: new Date().toISOString() });
        added++;
      }
    }
    if (added > 0) {
      savePlayers(players);
    }
  }

  // If we're on players page (list or form exists), ensure seed and render
  if (playersListEl || addPlayerBtn) {
    seedPlayersIfEmpty();
    if (playersListEl) renderPlayers();
  }

  if (addPlayerBtn) {
    // Switch to form submit instead of prompt
    addPlayerBtn.addEventListener('submit', function (e) {
      if (e && e.preventDefault) e.preventDefault();
      var firstEl = document.getElementById('player-firstname');
      var lastEl = document.getElementById('player-lastname');
      var firstName = firstEl && firstEl.value ? String(firstEl.value).trim() : '';
      var lastName = lastEl && lastEl.value ? String(lastEl.value).trim() : '';
      if (!firstName || !lastName) { alert('Please enter both first and last names.'); return; }
      var full = (firstName + ' ' + lastName).trim();

      var players = loadPlayers();
      var exists = false;
      for (var i = 0; i < players.length; i++) {
        var existingFull = getFullName(players[i]).toLowerCase();
        if (existingFull === full.toLowerCase()) { exists = true; break; }
      }
      if (exists) { alert('Player with this name already exists.'); return; }

      players.push({ id: Date.now(), firstName: firstName, lastName: lastName, name: full, createdAt: new Date().toISOString() });
      savePlayers(players);
      if (firstEl) firstEl.value = '';
      if (lastEl) lastEl.value = '';
      renderPlayers();
    });
  }

  // New Match page logic
  var createMatchForm = document.getElementById('createMatchForm');
  var player1Select = document.getElementById('player1');
  var player2Select = document.getElementById('player2');

  function sortByNameAsc(a, b) {
    var na = getFullName(a).toLowerCase();
    var nb = getFullName(b).toLowerCase();
    if (na < nb) return -1;
    if (na > nb) return 1;
    return 0;
  }

  function clearOptionsExceptPlaceholder(sel) {
    if (!sel) return;
    for (var i = sel.options.length - 1; i >= 0; i--) {
      var opt = sel.options[i];
      if (!opt || opt.value === '') continue;
      sel.remove(i);
    }
  }

  function populatePlayerSelect(selectEl) {
    if (!selectEl) return;
    var players = loadPlayers() || [];
    players.sort(sortByNameAsc);
    clearOptionsExceptPlaceholder(selectEl);
    for (var i = 0; i < players.length; i++) {
      var p = players[i];
      var opt = document.createElement('option');
      opt.value = String(p.id);
      opt.text = getFullName(p);
      selectEl.appendChild(opt);
    }
  }

  function syncDisableSameSelection(sourceSel, targetSel) {
    if (!sourceSel || !targetSel) return;
    var selected = sourceSel.value;
    for (var i = 0; i < targetSel.options.length; i++) {
      var opt = targetSel.options[i];
      if (!opt) continue;
      // Keep placeholder non-selectable if present
      if (opt.value === '') { /* leave disabled as-is */ continue; }
      opt.disabled = (selected && opt.value === selected);
    }
    // If target currently equals source, reset target to placeholder (non-selectable)
    if (selected && targetSel.value === selected) {
      targetSel.value = '';
      // fallback if value assignment didn't switch (some browsers)
      if (targetSel.value === selected) {
        try { targetSel.selectedIndex = 0; } catch (e) {}
      }
    }
  }

  function saveMatches(arr) {
    try {
      localStorage.setItem('matches', JSON.stringify(Array.isArray(arr) ? arr : []));
    } catch (e) {}
  }
  function loadMatches() {
    try {
      var raw = localStorage.getItem('matches') || '[]';
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }

  if (createMatchForm && player1Select && player2Select) {
    // Ensure we have some players
    seedPlayersIfEmpty();
    // Fill both selects
    populatePlayerSelect(player1Select);
    populatePlayerSelect(player2Select);

    // Keep selections distinct
    player1Select.addEventListener('change', function(){ syncDisableSameSelection(player1Select, player2Select); });
    player2Select.addEventListener('change', function(){ syncDisableSameSelection(player2Select, player1Select); });
    // Initial sync just in case of prefilled values
    syncDisableSameSelection(player1Select, player2Select);
    syncDisableSameSelection(player2Select, player1Select);

    createMatchForm.addEventListener('submit', function(e){
      if (e && e.preventDefault) e.preventDefault();
      var p1 = player1Select.value;
      var p2 = player2Select.value;
      if (!p1 || !p2) { alert('Please choose both players.'); return; }
      if (p1 === p2) { alert('Please choose two different players.'); return; }

      var matches = loadMatches();
      var match = {
        id: Date.now(),
        player1Id: Number(p1),
        player2Id: Number(p2),
        createdAt: new Date().toISOString(),
        status: 'scheduled'
      };
      matches.push(match);
      saveMatches(matches);
      alert('Match created!');
      // Optionally redirect to scores or another page later
      try { createMatchForm.reset(); } catch (e2) {}
      // Ensure both selects point to the non-selectable placeholder after reset
      try { player1Select.selectedIndex = 0; } catch (e3) {}
      try { player2Select.selectedIndex = 0; } catch (e4) {}
      // Re-sync disabling after reset
      syncDisableSameSelection(player1Select, player2Select);
      syncDisableSameSelection(player2Select, player1Select);
    });
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
