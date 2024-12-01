javascript: (function () {
  var host = window.location.host;
  if (host.includes("github.com")) {
    window.open(window.location.href.replace("github.com", "github1s.com"));
  } else {
    alert("This bookmarklet only works on GitHub URLs.");
  }
})();
