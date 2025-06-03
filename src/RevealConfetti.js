import JSConfetti from "js-confetti";

export default () => ({
  id: "reveal-confetti",
  init: (deck) => {
    const jsConfetti = new JSConfetti();
    deck.addKeyBinding({ keyCode: 67, key: "C" }, () => {
      jsConfetti.addConfetti({
        emojis: ["🌈", "🦄", "💥", "✨", "💫", "🎈", "🎁", "🎉", "🎊", "💩"],
      });
    });

    deck.on("slidechanged", (event) => {
      const currentSlide = event.currentSlide;
      if (currentSlide.classList.contains("confetti")) {
        jsConfetti.addConfetti({
          emojis: ["🌈", "🦄", "💥", "✨", "💫", "🎈", "🎁", "🎉", "🎊", "💩"],
        });
      }
    });

    //confetti pero de futbol
    deck.on("slidechanged", (event) => {
      const currentSlide = event.currentSlide;
      if (currentSlide.classList.contains("confetti-fulbo")) {
      jsConfetti.addConfetti({
        emojis: ["⚽️","🥈","🧊","🥶"],
        confettiColors: ["#ff0000", "#00ff00", "#0000ff"],
        confettiNumber: 100,
      });
      }
    });
  },
});
