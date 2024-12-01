// ==UserScript==
// @name         快捷隐私保存
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  点击想看、看过等按钮，弹出的窗口禁止发布广播并自动保存
// @author       Ylem
// @match        https://*.douban.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  "use strict";

  // 创建MutationObserver实例
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        // 检查是否有'dlg-opt-share'的元素被插入
        let checkbox = node.querySelector("#dlg-opt-share");
        if (checkbox) {
          console.log("Cancelled " + checkbox.tagName);
          if (checkbox.tagName.toLowerCase() === "input") {
            // 如果是输入类型为checkbox的元素则取消选中
            checkbox.checked = false;
            checkbox.value = 0;
            // 自动点击保存
            let submit = node.querySelector(
              "form > div.submit-item > span > input[type=submit]"
            );
            submit?.click();
          }
          observer.disconnect();
        }
      });
    });
  });

  // 监听DOM变化
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
