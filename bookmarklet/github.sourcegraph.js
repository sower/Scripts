if (window.location.host.includes("github.com")) {
  window.open(window.location.href.replace("github.com", "sourcegraph.com/github.com"));
} else {
  alert("This bookmarklet only works on GitHub URLs.");
}
