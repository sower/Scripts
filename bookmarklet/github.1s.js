// 在VsCode中查看
if (window.location.host.includes("github.com")) {
  window.open(window.location.href.replace("github.com", "github1s.com"));
} else {
  alert("This bookmarklet only works on GitHub URLs.");
}
