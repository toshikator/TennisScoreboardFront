// Players page UI module
(function(){
  'use strict';

  function renderPlayers(listEl, emptyEl) {
    if (!listEl) return;
    var players = PlayersAPI.loadPlayers();
    listEl.innerHTML = '';
    var isLoading = false;
    try { isLoading = !!window.playersLoading; } catch (e) { isLoading = false; }
    if (!players || !players.length) {
      if (emptyEl) {
        emptyEl.style.display = 'block';
        emptyEl.textContent = isLoading ? 'Loading players…' : 'No players yet. Click "Add New Player" to create your first player.';
      }
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    for (var i = 0; i < players.length; i++) {
      var p = players[i];
      var li = document.createElement('li');
      li.className = 'list-item';
      li.textContent = Utils.getFullName(p);
      listEl.appendChild(li);
    }
  }

  function initPlayersPage() {
    var playersListEl = document.getElementById('players-list');
    var playersEmptyEl = document.getElementById('players-empty');
    var addPlayerForm = document.getElementById('btn-add-player');

    if (!playersListEl && !addPlayerForm) return; // not on this page

    // initial load and render
    PlayersAPI.loadPlayers();
    if (playersListEl) renderPlayers(playersListEl, playersEmptyEl);

    // re-render on updates
    document.addEventListener('players:updated', function(){
      if (playersListEl) renderPlayers(playersListEl, playersEmptyEl);
    });

    if (addPlayerForm) {
      addPlayerForm.addEventListener('submit', function (e) {
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

        // Prevent duplicates based on current snapshot
        var players = Array.isArray(window.players) ? window.players : [];
        var exists = false;
        for (var i = 0; i < players.length; i++) {
          var existingFull = Utils.getFullName(players[i]).toLowerCase();
          if (existingFull === full.toLowerCase()) {
            exists = true;
            break;
          }
        }
        if (exists) {
          alert('Player with this name already exists.');
          return;
        }

        var posted = false;
        try {
          var xhr = new XMLHttpRequest();
          xhr.open('POST', 'https://bukhman.pro/tennis-scoreboard-api/players', false);
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.send(JSON.stringify({firstName: firstName, lastName: lastName}));
          if (xhr.status >= 200 && xhr.status < 300) {
            posted = true;
          }
        } catch (postErr) {}

        if (!posted) {
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
                PlayersAPI.triggerAsyncPlayersReload(function(){
                  if (firstEl) firstEl.value = '';
                  if (lastEl) lastEl.value = '';
                });
              } else {
                alert('Failed to add player via backend. Please try again later.');
              }
            });
            return;
          } catch (e) {}
        }

        if (posted) {
          PlayersAPI.loadPlayers();
          if (firstEl) firstEl.value = '';
          if (lastEl) lastEl.value = '';
          if (playersListEl) renderPlayers(playersListEl, playersEmptyEl);
          return;
        }

        alert('Failed to add player via backend. Please try again later.');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initPlayersPage);
})();