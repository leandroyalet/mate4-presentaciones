export default () => ({
  id: "reveal-wakeLock",

  init: (reveal) => {
    if (!("wakeLock" in navigator)) {
      console.warn("⚠️ Wake Lock API no está disponible en este navegador.");
      return;
    }

    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        if (wakeLock !== null) return;

        wakeLock = await navigator.wakeLock.request("screen");
        console.log("🔒 Wake Lock activado");

        wakeLock.addEventListener("release", () => {
          console.log("🔓 Wake Lock liberado");
          wakeLock = null;
        });
      } catch (err) {
        console.error("Error solicitando Wake Lock:", err);
        wakeLock = null;
      }
    };

    // Re-solicitar Wake Lock si la página vuelve a estar visible
    document.addEventListener("visibilitychange", async () => {
      if (document.visibilityState === "visible") {
        await requestWakeLock();
      }
    });

    // Pedir Wake Lock cuando Reveal.js esté listo
    reveal.on("ready", () => {
      requestWakeLock();
    });

    // En cada cambio de diapositiva, comprobamos si el lock sigue activo
    reveal.on("slidechanged", () => {
      if (wakeLock === null) {
        requestWakeLock();
      }
    });
  },
});
