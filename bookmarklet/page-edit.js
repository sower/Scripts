document.body.contentEditable = true;
alert("已开启网页编辑，按 Esc 取消！");
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    document.body.contentEditable = false;
  }
});
