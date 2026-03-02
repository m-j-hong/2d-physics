const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

/* ---------- parameters ---------- */
const RINGS = 20;
const BASE_RADIUS = 1;
const BASE_GAP = 6;

const BASE_SAT = 80; // max saturation

const SPEED = 0.005;
const ERROR = 10;

let t = 0;

/* ---------- mouse tracking ---------- */
const mouse = { x: canvas.width / 2, y: canvas.height / 2 };

window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

/* ---------- draw ---------- */
function draw() {
  t += 1;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);

  const baseHue = 180 + Math.sin(t * SPEED) * 180;

  // compute distance from center
  const dx = mouse.x - canvas.width / 2;
  const dy = mouse.y - canvas.height / 2;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // map distance to saturation factor (closer = higher)
  const maxDist = Math.min(canvas.width, canvas.height) / 2;
  const satFactor = Math.max(0, 1 - dist / (maxDist * 3)); // 0..1

  // map distance to "breath amplitude" (closer = bigger change)
  const breathFactor = .9 * satFactor + 0.08; // ensures minimal motion even far away

  for (let i = 0; i < RINGS; i++) {
    const delay = i * 800;
    const hue =
      baseHue +
      Math.sin((t - delay) * SPEED) * ERROR;

    // modulate saturation based on mouse distance
    const saturation = Math.max(
      0,
      BASE_SAT * satFactor
    );

    const opacity = 100 - i * (RINGS / 3)

    const radius = BASE_RADIUS + i * i * BASE_GAP;

    // breathing stroke width
    const baseLine = 50 / (i + 1);
    const strokeWidth = baseLine * (1 + Math.sin((t + i * 100) * SPEED * 4) * breathFactor);

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 70%, ${opacity}%)`;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  requestAnimationFrame(draw);
}

draw();
