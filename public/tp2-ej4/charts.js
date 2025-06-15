const windowsTimes = [2.5, 7.1, 5, 8.5, 7, 8.1];
const dosTimes = [2.3, 7.1, 4, 8, 6.6, 5];

function calcularRegresion(xVals, yVals) {
  const n = xVals.length;
  const meanX = xVals.reduce((a, b) => a + b, 0) / n;
  const meanY = yVals.reduce((a, b) => a + b, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xVals[i] - meanX) * (yVals[i] - meanY);
    den += Math.pow(xVals[i] - meanX, 2);
  }

  const beta1 = num / den;
  const beta0 = meanY - beta1 * meanX;

  return { beta0, beta1 };
}

function generarLineaRegresion(xVals, beta0, beta1) {
  return xVals.map((x) => ({ x, y: beta1 * x + beta0 }));
}

function crearScatterChart({
  ctx,
  puntos,
  titulo,
  xLabel,
  yLabel,
  regresiones = [], // ← ahora acepta un array de líneas de regresión
  prediccion = null,
}) {
  const datasets = [
    {
      label: "Datos",
      data: puntos,
      backgroundColor: "blue",
    },
  ];

  regresiones.forEach((reg) => {
    datasets.push({
      label: reg.label,
      data: reg.data,
      borderColor: reg.color,
      borderWidth: 2,
      showLine: true,
      fill: false,
      pointRadius: 0,
      borderDash: reg.dashed ? [5, 5] : [],
    });
  });

  if (prediccion) {
    datasets.push({
      label: prediccion.label,
      data: [prediccion.punto],
      backgroundColor: "green",
      pointRadius: 6,
    });
  }

  new Chart(ctx, {
    type: "scatter",
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: xLabel },
          min: 0,
          max: 10,
        },
        y: {
          title: { display: true, text: yLabel },
          min: 0,
          max: 10,
        },
      },
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: titulo },
      },
    },
  });
}

window.addEventListener("DOMContentLoaded", () => {
  // Gráfico 1: Datos originales
  const ctx1 = document.getElementById("scatterChart").getContext("2d");
  crearScatterChart({
    ctx: ctx1,
    puntos: windowsTimes.map((x, i) => ({ x, y: dosTimes[i] })),
    titulo: "Gráfico de Dispersión - Windows vs. DOS",
    xLabel: "Tiempo en Windows (segundos)",
    yLabel: "Tiempo en DOS (segundos)",
  });

  // Gráfico 2: Regresión lineal
  const { beta0, beta1 } = calcularRegresion(windowsTimes, dosTimes);
  const minX = Math.min(...windowsTimes);
  const maxX = Math.max(...windowsTimes);
  const xLinea = Array.from(
    { length: 101 },
    (_, i) => minX + ((maxX - minX) * i) / 100
  );
  //   const xLinea = Array.from({ length: 101 }, (_, i) => 2 + (7 * i) / 100);
  const datosLinea = generarLineaRegresion(xLinea, beta0, beta1);
  const xPred = 6;
  const yPred = beta1 * xPred + beta0;

  const ctx2 = document.getElementById("regresionChart").getContext("2d");
  crearScatterChart({
    ctx: ctx2,
    puntos: windowsTimes.map((x, i) => ({ x, y: dosTimes[i] })),
    titulo: "Regresión Lineal - Windows vs. DOS",
    regresiones: [
      {
        label: `Regresión lineal: y = ${beta1.toFixed(4)}x + ${beta0.toFixed(
          4
        )}`,
        data: datosLinea,
        color: "red",
      },
    ],
    prediccion: {
      label: `Predicción x=6 → y=${yPred.toFixed(2)}`,
      punto: { x: xPred, y: yPred },
    },
    xLabel: "Tiempo en Windows (segundos)",
    yLabel: "Tiempo en DOS (segundos)",
  });

  // Gráfico 3: Datos con Windows reducido
  const windowsTimesReduced = windowsTimes.map((x) => x * 0.9);
  const { beta0: b0r, beta1: b1r } = calcularRegresion(
    windowsTimesReduced,
    dosTimes
  );
  const minXRed = Math.min(...windowsTimesReduced);
  const maxXRed = Math.max(...windowsTimesReduced);
  const xLineaReduced = Array.from(
    { length: 101 },
    (_, i) => minXRed + ((maxXRed - minXRed) * i) / 100
  );
  const datosLineaRed = generarLineaRegresion(xLineaReduced, b0r, b1r);

  const ctx3 = document.getElementById("adjustedChart").getContext("2d");
  crearScatterChart({
    ctx: ctx3,
    puntos: windowsTimesReduced.map((x, i) => ({ x, y: dosTimes[i] })),
    titulo: "Regresión con mejora del 10% en Windows",
    regresiones: [
      {
        label: `Regresión lineal original: y = ${beta1.toFixed(
          4
        )}x + ${beta0.toFixed(4)}`,
        data: datosLinea,
        color: "gray",
      },
      {
        label: `Nueva regresión: y = ${b1r.toFixed(4)}x + ${b0r.toFixed(4)}`,
        data: datosLineaRed,
        color: "green",
      },
    ],
    xLabel: "Tiempo en Windows reducido (segundos)",
    yLabel: "Tiempo en DOS (segundos)",
  });
});
