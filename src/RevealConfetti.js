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
  },
});
