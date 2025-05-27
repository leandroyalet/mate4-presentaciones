import "./style.css";
import { io } from "socket.io-client";

const socket = io();

const circle = document.getElementById("circle");

socket.on("connect", () => {
  console.log("Connected with ID:", socket.id);
  document.getElementById("status").innerHTML = "CONNECTED";
});

socket.on("disconnect", () => {
  document.getElementById("status").innerHTML = "DISCONNECTED";
});

const touchArea = document.getElementById("dados");
let isTouching = false;
let touchStartTime = 0;

// Cuando toca la pantalla
touchArea.addEventListener("touchstart", (e) => {
  isTouching = true;
  touchStartTime = Date.now();
  document.getElementById("event").innerHTML = "touchstart";
  socket.emit("touch", { type: isTouching });
});

// Mientras mueve el dedo
touchArea.addEventListener("touchmove", (e) => {
  if (isTouching) {
    const now = Date.now();
    const elapsed = now - touchStartTime;

    if (elapsed >= 500) {
      document.getElementById("event").innerHTML = "touchmove";
      const touch = e.touches[0];

      circle.style.display = "block";
      circle.style.left = `${touch.clientX}px`;
      circle.style.top = `${touch.clientY}px`;

      const x = touch.clientX / window.innerWidth;
      const y = touch.clientY / window.innerHeight;

      socket.emit("move", { x, y });
    }
  }
});

// Cuando levanta el dedo
touchArea.addEventListener("touchend", () => {
  isTouching = false;
  circle.style.display = "none";
  document.getElementById("event").innerHTML = "touchend";
  socket.emit("touch", { type: isTouching });
});

// Si cancela (por ejemplo, el sistema interrumpe el toque)
touchArea.addEventListener("touchcancel", () => {
  isTouching = false;
  circle.style.display = "none";
  document.getElementById("event").innerHTML = "touchcancel";
  socket.emit("touch", { type: isTouching });
});

new Hammer.Manager(document.getElementById("dados"), {
  recognizers: [
    [Hammer.Tap, { taps: 2, posThreshold: 20 }],
    //[Hammer.Press, { threshold: 50, time: 200 }],
    [Hammer.Pinch],
    [Hammer.Swipe],
  ],
})
  .on("tap", function (e) {
    document.getElementById("event").innerHTML = "tap";
    socket.emit("view", {});
    e.preventDefault();
  })
  .on("swipeleft", function (e) {
    socket.emit("slide", { type: 2 });
    e.preventDefault();
  })
  .on("swiperight", function (e) {
    socket.emit("slide", { type: 1 });
    e.preventDefault();
  })
  .on("swipeup", function (e) {
    socket.emit("slide", { type: 4 });
    e.preventDefault();
  })
  .on("swipedown", function (e) {
    socket.emit("slide", { type: 3 });
    e.preventDefault();
  })
  .on("pinchin", function (e) {
    zoom = false;
  })
  .on("pinchout", function (e) {
    zoom = true;
  })
  .on("pinchend", function (e) {
    socket.emit("zoom", { type: zoom });
  });
