const RevealSegmentedVideo = () => ({
  id: "RevealSegmentedVideo",
  init: (deck) => {
    let currentVideo = null;
    let segments = [];
    let currentSegment = 0;
    let interval = null;

    const computeSegmentsFromCuts = (cuts, duration) => {
      const result = [];
      let start = 0;
      for (let cut of cuts) {
        result.push({ start: start / 1000, end: cut / 1000 });
        start = cut;
      }
      result.push({ start: start / 1000, end: duration });
      return result;
    };

    const playSegment = (index) => {
      if (!currentVideo || index < 0) return;

      if (index >= segments.length) {
        deck.next();
        return;
      }

      currentSegment = index;
      const seg = segments[index];
      currentVideo.currentTime = seg.start;
      currentVideo.play();

      clearInterval(interval);
      interval = setInterval(() => {
        if (currentVideo.currentTime >= seg.end) {
          currentVideo.pause();
          clearInterval(interval);
        }
      }, 50);
    };

    const setupVideoFromSlide = (slide) => {
      const video = slide.querySelector("video[data-cuts]");
      if (!video || !video.dataset.cuts) {
        clearInterval(interval);
        if (currentVideo) currentVideo.pause();
        currentVideo = null;
        return;
      }

      let cuts = [];
      try {
        cuts = JSON.parse(video.dataset.cuts || "[]");
      } catch (e) {
        console.warn("Cuts mal definidos en video:", e);
        return;
      }

      if (!cuts.length) return;

      clearInterval(interval);
      if (currentVideo) currentVideo.pause();

      currentVideo = video;
      currentSegment = 0;

      const loadAndPlay = () => {
        segments = computeSegmentsFromCuts(cuts, video.duration);
        playSegment(0);
      };

      if (video.readyState < 1) {
        video.addEventListener("loadedmetadata", loadAndPlay, { once: true });
      } else {
        loadAndPlay();
      }
    };

    const injectFragmentsForAllVideos = () => {
      document.querySelectorAll("section video[data-cuts]").forEach((video) => {
        let cuts = [];
        try {
          cuts = JSON.parse(video.dataset.cuts || "[]");
        } catch {
          return;
        }
        if (!cuts.length) return;

        const segmentCount = cuts.length + 1;
        const parentSection = video.closest("section");

        if (parentSection.querySelector(".fragment")) return;

        for (let i = 0; i < segmentCount - 1; i++) {
          const frag = document.createElement("div");
          frag.classList.add("fragment");
          frag.dataset.fragmentIndex = i;
          parentSection.appendChild(frag);
        }
      });
    };

    injectFragmentsForAllVideos();

    deck.on("ready", (e) => {
      setupVideoFromSlide(e.currentSlide);
      playSegment(0);
    });

    deck.on("slidechanged", (e) => {
      setupVideoFromSlide(e.currentSlide);
      playSegment(0);
    });

    deck.on("fragmentshown", () => {
      playSegment(deck.getIndices().f + 1);
    });

    deck.on("fragmenthidden", () => {
      const index = deck.getIndices().f || 0;
      playSegment(index);
    });
  },
});

export default RevealSegmentedVideo;
