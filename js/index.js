// Global players array available across the whole app
(function () {
    // Stop using localStorage completely; initialize empty in-memory cache
    try {
        if (!Array.isArray(window.players)) {
            window.players = [];
        }
    } catch (e) {
        window.players = [];
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

        bindClick('action-home', function () {
            window.location.href = homeUrl;
        });
        bindClick('action-new-match', function () {
            window.location.href = newMatchUrl;
        });
        bindClick('action-new-player', function () {
            window.location.href = playersUrl;
        });
        bindClick('action-finished', function () {
            window.location.href = finishedUrl;
        });
        bindClick('action-scores', function () {
            alert('View match scores (placeholder)');
        });
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
        } catch (e) {
        }
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

    function normalizePlayersArray(data) {
        var normalized = [];
        for (var i = 0; i < data.length; i++) {
            var it = data[i] || {};
            var idNum = Number(it.id);
            if (!isFinite(idNum)) {
                idNum = Date.now() + i;
            }
            var fn = it.firstName != null ? String(it.firstName) : '';
            var ln = it.lastName != null ? String(it.lastName) : '';
            normalized.push({ id: idNum, firstName: fn, lastName: ln });
        }
        return normalized;
    }

    function triggerAsyncPlayersReload(onDone) {
        try { if (window.playersLoading) { return; } } catch (e) {}
        window.playersLoading = true;
        try {
            fetch('https://bukhman.pro/tennis-scoreboard-api/players', { headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' } })
                .then(function (resp) { return resp.ok ? resp.json() : Promise.reject(new Error('HTTP ' + resp.status)); })
                .then(function (data) {
                    if (Array.isArray(data)) {
                        window.players = normalizePlayersArray(data);
                    } else {
                        window.players = [];
                    }
                })
                .catch(function () { window.players = Array.isArray(window.players) ? window.players : []; })
                .finally(function () {
                    window.playersLoading = false;
                    // Re-render Players page if present
                    if (playersListEl) renderPlayers();
                    // Re-populate selects if present
                    if (player1Select) populatePlayerSelect(player1Select);
                    if (player2Select) populatePlayerSelect(player2Select);
                    if (typeof onDone === 'function') { try { onDone(window.players); } catch (e) {} }
                });
        } catch (e) {
            window.playersLoading = false;
        }
    }

    function loadPlayers() {
        // Try synchronous XHR first to preserve current flow; fall back to async fetch
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://bukhman.pro/tennis-scoreboard-api/players', false); // synchronous GET
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.send(null);
            if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
                var data = JSON.parse(xhr.responseText);
                if (Array.isArray(data)) {
                    window.players = normalizePlayersArray(data);
                    return window.players;
                }
            }
        } catch (eFetch) {
            // ignore and continue to async
        }
        // If we already have players in memory, return them without triggering another request
        try {
            if (Array.isArray(window.players) && window.players.length) {
                return window.players;
            }
        } catch (e) {}
        // Kick off async reload (works under file:// and when sync XHR is blocked)
        triggerAsyncPlayersReload();
        // Return current cache (possibly empty)
        try { return Array.isArray(window.players) ? window.players : []; } catch (e) { return []; }
    }

    function savePlayers(arr) {
        // Stop persisting to localStorage; keep only in-memory state
        try {
            window.players = Array.isArray(arr) ? arr : [];
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
        var isLoading = false;
        try { isLoading = !!window.playersLoading; } catch (e) { isLoading = false; }
        if (!players || !players.length) {
            if (playersEmptyEl) {
                playersEmptyEl.style.display = 'block';
                playersEmptyEl.textContent = isLoading ? 'Loading players…' : 'No players yet. Click "Add New Player" to create your first player.';
            }
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

    // Demo seeding disabled: players must come exclusively from API
    function seedPlayersIfEmpty() {
        loadPlayers();

    }

    // If we're on players page (list or form exists), ensure seed and render
    if (playersListEl || addPlayerBtn) {
        seedPlayersIfEmpty();
        if (playersListEl) renderPlayers();
    }

    if (addPlayerBtn) {
        // Submit new player to backend API; do not modify local cache directly
        addPlayerBtn.addEventListener('submit', function (e) {
            if (e && e.preventDefault) e.preventDefault();
            var firstEl = document.getElementById('player-firstname');
            var lastEl = document.getElementById('player-lastname');
            var firstName = firstEl && firstEl.value ? String(firstEl.value).trim() : '';
            var lastName = lastEl && lastEl.value ? String(lastEl.value).trim() : '';
            if (!firstName || !lastName) {
                alert('Please enter both first and last names.');
                return;
            }
            var full = (firstName + ' ' + lastName).trim();

            // Prevent duplicates based on current backend data snapshot
            var players = loadPlayers();
            var exists = false;
            for (var i = 0; i < players.length; i++) {
                var existingFull = getFullName(players[i]).toLowerCase();
                if (existingFull === full.toLowerCase()) {
                    exists = true;
                    break;
                }
            }
            if (exists) {
                alert('Player with this name already exists.');
                return;
            }

            // Try POST to backend API
            var posted = false;
            try {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'https://bukhman.pro/tennis-scoreboard-api/players', false); // synchronous POST to keep flow
                xhr.setRequestHeader('Accept', 'application/json');
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify({firstName: firstName, lastName: lastName}));
                if (xhr.status >= 200 && xhr.status < 300) {
                    posted = true;
                }
            } catch (postErr) { /* fall through to fetch */ }

            if (!posted) {
                // Fallback to async fetch (works under file:// origins where sync XHR may be blocked)
                try {
                    fetch('https://bukhman.pro/tennis-scoreboard-api/players', {
                        method: 'POST',
                        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                        body: JSON.stringify({ firstName: firstName, lastName: lastName })
                    }).then(function (resp) {
                        if (!resp.ok) throw new Error('HTTP ' + resp.status);
                        posted = true;
                    }).catch(function () {
                        posted = false;
                    }).finally(function () {
                        if (posted) {
                            triggerAsyncPlayersReload(function(){
                                if (firstEl) firstEl.value = '';
                                if (lastEl) lastEl.value = '';
                            });
                        } else {
                            alert('Failed to add player via backend. Please try again later.');
                        }
                    });
                    return; // prevent reaching the alert below synchronously
                } catch (e) { /* ignore */ }
            }

            if (posted) {
                // Refresh from API and re-render synchronously
                loadPlayers();
                if (firstEl) firstEl.value = '';
                if (lastEl) lastEl.value = '';
                renderPlayers();
                return;
            }

            alert('Failed to add player via backend. Please try again later.');
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
            if (opt.value === '') { /* leave disabled as-is */
                continue;
            }
            opt.disabled = (selected && opt.value === selected);
        }
        // If target currently equals source, reset target to placeholder (non-selectable)
        if (selected && targetSel.value === selected) {
            targetSel.value = '';
            // fallback if value assignment didn't switch (some browsers)
            if (targetSel.value === selected) {
                try {
                    targetSel.selectedIndex = 0;
                } catch (e) {
                }
            }
        }
    }

    function saveMatches(arr) {
        try {
            localStorage.setItem('matches', JSON.stringify(Array.isArray(arr) ? arr : []));
        } catch (e) {
        }
    }

    function loadMatches() {
        try {
            var raw = localStorage.getItem('matches') || '[]';
            var parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    if (createMatchForm && player1Select && player2Select) {
        // Ensure we have some players
        seedPlayersIfEmpty();
        // Fill both selects
        populatePlayerSelect(player1Select);
        populatePlayerSelect(player2Select);

        // Keep selections distinct
        player1Select.addEventListener('change', function () {
            syncDisableSameSelection(player1Select, player2Select);
        });
        player2Select.addEventListener('change', function () {
            syncDisableSameSelection(player2Select, player1Select);
        });
        // Initial sync just in case of prefilled values
        syncDisableSameSelection(player1Select, player2Select);
        syncDisableSameSelection(player2Select, player1Select);

        createMatchForm.addEventListener('submit', function (e) {
            if (e && e.preventDefault) e.preventDefault();
            var p1 = player1Select.value;
            var p2 = player2Select.value;
            if (!p1 || !p2) {
                alert('Please choose both players.');
                return;
            }
            if (p1 === p2) {
                alert('Please choose two different players.');
                return;
            }

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
            try {
                createMatchForm.reset();
            } catch (e2) {
            }
            // Ensure both selects point to the non-selectable placeholder after reset
            try {
                player1Select.selectedIndex = 0;
            } catch (e3) {
            }
            try {
                player2Select.selectedIndex = 0;
            } catch (e4) {
            }
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

        function pad2(n) {
            return (n < 10 ? '0' : '') + n;
        }

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
