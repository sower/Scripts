// 查看当前文件历史修改
if (window.location.host.includes("github.com")) {
  window.open(window.location.href.replace("github.com", "github.githistory.xyz"));
} else {
  alert("This bookmarklet only works on GitHub URLs.");
}
