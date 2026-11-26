(() => {
  const map = document.querySelector('.visitor-map');
  if (!map || !window.worldLand) return;
  const canvas = map.querySelector('canvas');
  const context = canvas.getContext('2d');
  if (!context) return;

  const locations = [
    [114.17, 22.32], [103.82, 1.35], [139.69, 35.69],
    [-122.42, 37.77], [-74.00, 40.71], [-0.13, 51.51],
    [151.21, -33.87]
  ];
  const markers = [...map.querySelectorAll('.map-pick')];
  let selected = -1;

  function redraw() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    const width = bounds.width;
    const height = bounds.height;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const colors = getComputedStyle(map);
    const color = token => colors.getPropertyValue(token).trim();
    const edge = Math.max(12, width * .035);
    const project = ([lon, lat]) => [
      edge + (lon + 180) / 360 * (width - 2 * edge),
      14 + (84 - lat) / 145 * (height - 28)
    ];

    context.strokeStyle = color('--map-grid');
    context.lineWidth = 1;
    context.beginPath();
    for (let lon = -150; lon <= 150; lon += 30) {
      const [x, north] = project([lon, 82]);
      const [, south] = project([lon, -57]);
      context.moveTo(x, north);
      context.lineTo(x, south);
    }
    for (let lat = -45; lat <= 75; lat += 30) {
      const [left, y] = project([-180, lat]);
      const [right] = project([180, lat]);
      context.moveTo(left, y);
      context.lineTo(right, y);
    }
    context.stroke();
    context.fillStyle = color('--map-land');
    context.strokeStyle = color('--map-coast');
    for (const polygon of window.worldLand) {
      context.beginPath();
      for (const [index, point] of polygon.entries()) {
        const [x, y] = project(point);
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
      context.fill();
      context.stroke();
    }

    for (const [index, point] of locations.entries()) {
      const [x, y] = project(point);
      const current = index === selected;
      context.beginPath();
      context.arc(x, y, current ? 11 : 7, 0, Math.PI * 2);
      context.fillStyle = color('--map-halo');
      context.fill();
      context.beginPath();
      context.arc(x, y, current ? 5 : 3.5, 0, Math.PI * 2);
      context.fillStyle = color('--map-pin');
      context.fill();
    }
  }

  markers.forEach((button, index) => {
    button.hidden = false;
    button.addEventListener('click', () => {
      selected = selected === index ? -1 : index;
      markers.forEach((marker, i) => marker.setAttribute('aria-pressed', String(i === selected)));
      redraw();
    });
  });
  window.addEventListener('zunhai-theme-change', redraw);
  new ResizeObserver(redraw).observe(canvas);
  redraw();
})();
