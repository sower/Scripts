if (window.location.host.includes("yuque.com")) {
  window.open(location.href + "/markdown?plain=true&anchor=false&linebreak=false");
} else {
  alert("This bookmarklet only works on YuQue URLs.");
}
