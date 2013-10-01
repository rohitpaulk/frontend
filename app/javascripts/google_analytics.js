if (Badger.google_analytics) {
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', Badger.google_analytics]);
  _gaq.push(['_setDomainName', '.badger.com']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
}