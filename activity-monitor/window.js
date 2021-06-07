let chart = null;
const lastMeasureTimes = [];

console.log(sdk.CorsairPerformProtocolHandshake());

const leds = sdk.CorsairGetLedPositions().map(led => ({ ledId: led.ledId, r: 0, g: 0, b: 0 }));

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb(h, s, l) {
  let r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function setLastMeasureTimes(cpus) {
  for (let i = 0; i < cpus.length; i++) {
    lastMeasureTimes[i] = getCpuTimes(cpus[i]);
  }
}

function getDatasets() {
  const datasets = []
  const cpus = os_cpus();

  for (let i = 0; i < cpus.length; i++) {
    const cpu = cpus[i]
    const cpuData = {
      data: getCpuTimes(cpu),
      backgroundColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)'
      ]
    }
    datasets.push(cpuData);
  }

  return datasets;
}

function updateDatasets() {
  const cpus = os_cpus()
  for (let i = 0; i < cpus.length; i++) {
    const cpu = cpus[i];
    chart.data.datasets[i].data = getCpuTimes(cpu);
    chart.data.datasets[i].data[0] -= lastMeasureTimes[i][0];
    chart.data.datasets[i].data[1] -= lastMeasureTimes[i][1];
    chart.data.datasets[i].data[2] -= lastMeasureTimes[i][2];
  }

  const totalIdle = chart.data.datasets.reduce((acc, curr) => acc + curr.data[2], 0);
  const usagePct = Math.min(1, 1.5 - totalIdle / (cpus.length * 1000.0));
  const [r, g, b] = hslToRgb(usagePct, 0.5, 0.5);
  leds.forEach(led => {
    led.r = r;
    led.g = g;
    led.b = b;
  });
  sdk.CorsairSetLedsColors(leds);
  chart.update();
  setLastMeasureTimes(cpus);
}

function getCpuTimes(cpu) {
  return [
    cpu.times.user,
    cpu.times.sys,
    cpu.times.idle,
  ];
}

function drawChart() {
  chart = new Chart($('.chart'), {
    type: 'doughnut',
    data: {
      labels: [
        'User Time (ms)',
        'System Time (ms)',
        'Idle Time (ms)'
      ],
      datasets: getDatasets()
    },
    options: {
      maintainAspectRatio: false,
      title: {
        display: true,
        text: 'CPU Activity',
        fontColor: 'rgb(250, 250, 250)',
        fontSize: 16
      },
      legend: {
        display: true,
        labels: {
          fontColor: 'rgb(250, 250, 250)',
          fontSize: 12
        }
      }
    }
  });

  setInterval(updateDatasets, 1000);
}

$(() => {
  setLastMeasureTimes(os_cpus());
  drawChart();
})