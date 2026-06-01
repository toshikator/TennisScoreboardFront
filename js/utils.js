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

  function loadFileSync(url) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.send(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        return xhr.responseText;
      }
    } catch (e) {}
    return null;
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
    loadFileSync: loadFileSync,
    getFullName: getFullName,
    sortByNameAsc: sortByNameAsc,
    clearOptionsExceptPlaceholder: clearOptionsExceptPlaceholder
  };
})();