// Players data/API module
(function(){
  'use strict';

  // Global players array available across the whole app (in-memory only)
  if (!Array.isArray(window.players)) {
    window.players = [];
  }
  window.playersLoading = false;

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

  function dispatchUpdated() {
    try {
      var evt;
      if (typeof Event === 'function') {
        evt = new Event('players:updated');
      } else {
        evt = document.createEvent('Event');
        evt.initEvent('players:updated', true, true);
      }
      document.dispatchEvent(evt);
    } catch (e) {}
  }

  function triggerAsyncPlayersReload(onDone) {
    if (window.playersLoading) return;
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
            dispatchUpdated();
            if (typeof onDone === 'function') { try { onDone(window.players); } catch (e) {} }
          });
    } catch (e) {
      window.playersLoading = false;
    }
  }

  function loadPlayers() {
    // Try synchronous XHR first; fall back to async fetch
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://bukhman.pro/tennis-scoreboard-api/players', false);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300 && xhr.responseText) {
        var data = JSON.parse(xhr.responseText);
        if (Array.isArray(data)) {
          window.players = normalizePlayersArray(data);
          dispatchUpdated();
          return window.players;
        }
      }
    } catch (eFetch) { /* ignore */ }

    if (Array.isArray(window.players) && window.players.length) {
      return window.players;
    }

    triggerAsyncPlayersReload();
    return Array.isArray(window.players) ? window.players : [];
  }

  // public API
  window.PlayersAPI = {
    loadPlayers: loadPlayers,
    triggerAsyncPlayersReload: triggerAsyncPlayersReload,
    normalizePlayersArray: normalizePlayersArray
  };
})();