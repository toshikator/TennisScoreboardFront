// Common utilities shared across pages
(function(){
  'use strict';

  function bindClick(id, handler) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function (e) {
      if (e && e.preventDefault) e.preventDefault();
      handler();
    });
  }

  // Async file loader replacing deprecated synchronous XHR
  function loadFile(url) {
    try {
      return fetch(url, { cache: 'no-store' })
        .then(function (resp) { return resp.ok ? resp.text() : null; })
        .catch(function(){ return null; });
    } catch (e) {
      return Promise.resolve(null);
    }
  }

  function getFullName(p) {
    if (!p) return '';
    var fn = (p.firstName || '').trim();
    var ln = (p.lastName || '').trim();
    var combined = (fn + ' ' + ln).trim();
    return combined || String(p.name || '').trim();
  }

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

  // Expose to global namespace for simplicity
  window.Utils = {
    bindClick: bindClick,
    loadFile: loadFile,
    getFullName: getFullName,
    sortByNameAsc: sortByNameAsc,
    clearOptionsExceptPlaceholder: clearOptionsExceptPlaceholder
  };
})();