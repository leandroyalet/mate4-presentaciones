import Reveal from "reveal.js";
import RevealHighlight from "reveal.js/plugin/highlight/highlight.esm.js";
import RevealMarkdown from "reveal.js/plugin/markdown/markdown.esm.js";
import RevealMath from "reveal.js/plugin/math/math.esm.js";
import RevealConfetti from "./RevealConfetti";
import RevealScreenLock from "./RevealScreenLock";
import RevealSegmentedVideo from "./RevealSegmentedVideo";
import toasty from "./toasty";

import "highlight.js/styles/github-dark.css";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/black.css";
import "./style.css";
import "./theme.css";

const deck = new Reveal({
  plugins: [
    RevealMath.KaTeX,
    RevealMarkdown,
    RevealHighlight,
    RevealSegmentedVideo,
    RevealConfetti,
    RevealScreenLock,
    toasty,
  ],
});

deck.initialize({
  controls: true,
  progress: true,
  history: true,
  center: true,
  pdfSeparateFragments: false,
});

if (import.meta.env.DEV) {
  console.log("🟢 Modo presentación");
  import("./remote/remote").then(({ default: remoteInit }) => {
    remoteInit(deck);
  });
}
