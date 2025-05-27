import { io } from "socket.io-client";

const remoteInit = Reveal => {
  var socket = io();

  socket.on("connect", () => {
    console.log("Connected with ID:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected with ID:", socket.id);
  });

  var users = [];

  var medida = window.innerWidth / 45;
  var centroX = window.innerWidth / 2;
  var centroY = window.innerHeight / 2;

  window.addEventListener(
    "resize",
    function () {
      medida = window.innerWidth / 45;
      centroX = window.innerWidth / 2;
      centroY = window.innerHeight / 2;
    },
    false
  );

  socket.on("access", function (obj) {
    users[obj.id] = {
      touch: false,
      coord: false
    };
  });

  socket.on("exit", function (user) {
    if (users[user] && users[user].elem) {
      document.body.removeChild(users[user].elem);
    }
  });

  socket.on("move", function (obj) {
    if (users[obj.user] && users[obj.user].elem) {
      if (users[obj.user].elem.classList.contains("hidden")) {
        users[obj.user].elem.classList.remove("hidden");
      }
      const { x, y } = obj;
      const absoluteX = Math.round(x * window.innerWidth);
      const absoluteY = Math.round(y * window.innerHeight);
      //console.log({ absoluteX, absoluteY });
      // var x = Math.round(centroX + obj.x);
      // var y = Math.round(centroY + obj.y);

      var elem = users[obj.user].elem;
      elem.style.left = absoluteX + "px";
      elem.style.top = absoluteY + "px";
    }
  });
  socket.on("touch", function (obj) {
    if (obj.type) {
      // create and display
      if (!users[obj.user].elem) {
        var elem = document.createElement("div");
        elem.className = "cursor-dot";
        elem.style.left = centroX + "px";
        elem.style.top = centroY + "px";
        elem.classList.add("hidden");
        document.body.appendChild(elem);
        users[obj.user].elem = elem;
      }
    } else {
      // hide
      if (!users[obj.user].elem.classList.contains("hidden")) {
        users[obj.user].elem.classList.add("hidden");
      }
      //document.body.removeChild(users[obj.user].elem);
      //users[obj.user].elem = undefined;
    }
  });
  socket.on("slide", function (obj) {
    switch (obj.type) {
      case 1:
        Reveal.left();
        break;
      case 2:
        Reveal.right();
        break;
      case 3:
        Reveal.up();
        break;
      case 4:
        Reveal.down();
        break;
    }
  });
  socket.on("zoom", function (obj) {
    if (obj.type) {
      zoom.to({
        scale: 1.5,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
    } else zoom.out();
  });

  socket.on("view", function (obj) {
    Reveal.toggleOverview();
  });

  socket.emit("host", true);
};

export default remoteInit;
