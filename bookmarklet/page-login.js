javascript: void (function () {
  function dispatchInputEvent(account) {
    let inputEvent = new Event("input", {
      bubbles: true,
      cancelable: true,
    });
    for (let element of Object.values(account)) {
      element.dispatchEvent(inputEvent);
    }
  }

  let username = document.getElementById("username");
  username.value = "user";
  let password = document.getElementById("password");
  password.value = "******";
  dispatchInputEvent({ username, password });
  document.querySelector(".login").click();
  console.log("login completely");
})();
