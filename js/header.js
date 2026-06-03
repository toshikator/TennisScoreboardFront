(function(){
  'use strict';

  document.addEventListener('DOMContentLoaded', function(){
    var inHtmlPath = window.location.pathname.indexOf('/html/') !== -1;
    var basePrefix = inHtmlPath ? '../' : '';

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

      Utils.bindClick('action-home', function () {
        window.location.href = homeUrl;
      });
      Utils.bindClick('action-new-match', function () {
        window.location.href = newMatchUrl;
      });
      Utils.bindClick('action-new-player', function () {
        window.location.href = playersUrl;
      });
      Utils.bindClick('action-finished', function () {
        window.location.href = finishedUrl;
      });
      Utils.bindClick('action-scores', function () {
        alert('View match scores (placeholder)');
      });
    }

    var siteHeaderMount = document.getElementById('site-header');
    if (siteHeaderMount) {
      Utils.loadFile(basePrefix + 'html/header.html').then(function(headerHtml){
        if (headerHtml) {
          siteHeaderMount.outerHTML = headerHtml;
          wireHeaderActions();
        } else {
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
      });
    } else {
      wireHeaderActions();
    }
  });
})();