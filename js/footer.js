// Footer injection and live clock
(function(){
  'use strict';

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

  document.addEventListener('DOMContentLoaded', function(){
    var inHtmlPath = window.location.pathname.indexOf('/html/') !== -1;
    var basePrefix = inHtmlPath ? '../' : '';
    var siteFooterMount = document.getElementById('site-footer');
    if (siteFooterMount) {
      var footerHtml = Utils.loadFileSync(basePrefix + 'html/footer.html');
      if (footerHtml) {
        siteFooterMount.outerHTML = footerHtml;
        startFooterClock();
      } else {
        siteFooterMount.outerHTML = '<footer>© <span id="year"></span> Tennis Scoreboard · <span id="date-time"></span> (<span id="timezone"></span>)</footer>';
        startFooterClock();
      }
    }
  });
})();