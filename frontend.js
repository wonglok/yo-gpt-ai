const { io } = require("socket.io-client");

var socket = io();

var messages = document.getElementById("messages");
var form = document.getElementById("form");
var input = document.getElementById("input");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (input.value) {
    let id = "_" + (Math.random() * 10000).toFixed(0);
    socket.emit("prompt", {
      id: id,
      prompt: input.value,
    });
    input.value = "";

    var item = document.createElement("li");
    item.id = id;
    messages.appendChild(item);
  }
});

socket.on("message", (event) => {
  console.log(JSON.stringify(event));
  let domEl = document.getElementById(event.id.replace("#", ""));
  domEl.innerText = event.msg;
});

console.log("yo");
