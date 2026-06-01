// New Match page logic
(function(){
  'use strict';

  function populatePlayerSelect(selectEl) {
    if (!selectEl) return;
    var players = PlayersAPI.loadPlayers() || [];
    players.sort(Utils.sortByNameAsc);
    Utils.clearOptionsExceptPlaceholder(selectEl);
    for (var i = 0; i < players.length; i++) {
      var p = players[i];
      var opt = document.createElement('option');
      opt.value = String(p.id);
      opt.text = Utils.getFullName(p);
      selectEl.appendChild(opt);
    }
  }

  function syncDisableSameSelection(sourceSel, targetSel) {
    if (!sourceSel || !targetSel) return;
    var selected = sourceSel.value;
    for (var i = 0; i < targetSel.options.length; i++) {
      var opt = targetSel.options[i];
      if (!opt) continue;
      if (opt.value === '') { continue; }
      opt.disabled = (selected && opt.value === selected);
    }
    if (selected && targetSel.value === selected) {
      targetSel.value = '';
      if (targetSel.value === selected) {
        try { targetSel.selectedIndex = 0; } catch (e) {}
      }
    }
  }

  function saveMatches(arr) {
    try { localStorage.setItem('matches', JSON.stringify(Array.isArray(arr) ? arr : [])); } catch (e) {}
  }
  function loadMatches() {
    try {
      var raw = localStorage.getItem('matches') || '[]';
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  }

  function initNewMatchPage(){
    var createMatchForm = document.getElementById('createMatchForm');
    var player1Select = document.getElementById('player1');
    var player2Select = document.getElementById('player2');
    if (!createMatchForm || !player1Select || !player2Select) return; // not on this page

    // Ensure we have players and populate
    PlayersAPI.loadPlayers();
    populatePlayerSelect(player1Select);
    populatePlayerSelect(player2Select);

    // Keep selections distinct
    player1Select.addEventListener('change', function(){ syncDisableSameSelection(player1Select, player2Select); });
    player2Select.addEventListener('change', function(){ syncDisableSameSelection(player2Select, player1Select); });
    syncDisableSameSelection(player1Select, player2Select);
    syncDisableSameSelection(player2Select, player1Select);

    // Re-populate when players list updates (e.g., added a new player)
    document.addEventListener('players:updated', function(){
      populatePlayerSelect(player1Select);
      populatePlayerSelect(player2Select);
      syncDisableSameSelection(player1Select, player2Select);
      syncDisableSameSelection(player2Select, player1Select);
    });

    createMatchForm.addEventListener('submit', function (e) {
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
      try { createMatchForm.reset(); } catch (e2) {}
      try { player1Select.selectedIndex = 0; } catch (e3) {}
      try { player2Select.selectedIndex = 0; } catch (e4) {}
      syncDisableSameSelection(player1Select, player2Select);
      syncDisableSameSelection(player2Select, player1Select);
    });
  }

  document.addEventListener('DOMContentLoaded', initNewMatchPage);
})();