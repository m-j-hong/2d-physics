const { Engine, Render, Runner, Bodies, Composite } = Matter;

/* ---------- engine ---------- */

const engine = Engine.create();
engine.gravity.y = 0; // zero gravity

/* ---------- renderer ---------- */

const render = Render.create({
  canvas: document.getElementById("world"),
  engine,
  options: {
    width: window.innerWidth,
    height: window.innerHeight,
    wireframes: false,
    background: "#111"
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

/* ---------- mouse ---------- */

const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

const MAGNET_STRENGTH = 0.0002; // small on purpose
const MIN_DISTANCE = 50;        // prevents singularity
const MAX_DISTANCE = window.innerWidth + window.innerHeight;       // magnet fades out

Matter.Events.on(engine, "beforeUpdate", () => {
  for (const c of circles) {
    const dx = mouse.x - c.position.x;
    const dy = mouse.y - c.position.y;

    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MAX_DISTANCE) continue;

    const d = Math.max(dist, MIN_DISTANCE);

    const force = MAGNET_STRENGTH / d;

    Matter.Body.applyForce(c, c.position, {
      x: dx * force,
      y: dy * force
    });
  }
});


/* ---------- walls ---------- */

const WALL = 200;
let walls = [];

function createWalls(w, h) {
  const opts = {
    isStatic: true,
    restitution: 1,
    friction: 0,
    frictionAir: 0
  };

  return [
    Bodies.rectangle(w / 2, -WALL / 2, w, WALL, opts),
    Bodies.rectangle(w / 2, h + WALL / 2, w, WALL, opts),
    Bodies.rectangle(-WALL / 2, h / 2, WALL, h, opts),
    Bodies.rectangle(w + WALL / 2, h / 2, WALL, h, opts)
  ];
}

/* ---------- circles ---------- */

const RADIUS = 20;
const circles = [];

for (let i = 0; i < 200; i++) {
  const circle = Bodies.circle(
    window.innerWidth / 2 + Math.random() * 400 - 200,
    window.innerHeight / 2 + Math.random() * 400 - 200,
    RADIUS,
    {
      restitution: .5,
      friction: 0,
      frictionAir: 0,
      render: { fillStyle: "#eee" }
    }
  );

  // tiny initial motion
  Matter.Body.setVelocity(circle, {
    x: (Math.random() - 0.5) * 5,
    y: (Math.random() - 0.5) * 5
  });

  circles.push(circle);
}

Composite.add(engine.world, circles);

/* ---------- resize ---------- */

function resizeWorld() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  render.canvas.width = w;
  render.canvas.height = h;
  render.options.width = w;
  render.options.height = h;

  Composite.remove(engine.world, walls);
  walls = createWalls(w, h);
  Composite.add(engine.world, walls);
}

window.addEventListener("resize", resizeWorld);
resizeWorld();
