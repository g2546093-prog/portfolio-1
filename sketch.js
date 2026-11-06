// ======================================
// NEON ENERGY - ORIGINAL INTERACTIVE ART
// ======================================

let particles = [];
let sparks = [];
let shockwaves = [];

let theme = 0;
let colors = [];

const themes = [
  [[255, 215, 0], [255, 245, 65]],   // BATMAN
  [[35, 255, 105], [0, 215, 145]],   // MARVEL
  [[255, 45, 70], [255, 45, 145]],   // RED
  [[35, 150, 255], [110, 80, 255]]  // BLUE
];

function setup() {
  createCanvas(600, 450);

  colors = themes[theme];

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      vx: random(-0.6, 0.6),
      vy: random(-0.6, 0.6),
      size: random(2, 5),
      colorIndex: floor(random(2))
    });
  }
}

function draw() {
  background(5, 7, 15, 70);

  blendMode(ADD);

  // 背景の粒子
  for (let p of particles) {

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;

    let c = colors[p.colorIndex];

    noStroke();

    fill(c[0], c[1], c[2], 25);
    circle(p.x, p.y, p.size * 5);

    fill(c[0], c[1], c[2], 220);
    circle(p.x, p.y, p.size);
  }

  // 粒子同士をつなぐ
  strokeWeight(1);

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {

      let a = particles[i];
      let b = particles[j];

      let d = dist(a.x, a.y, b.x, b.y);

      if (d < 100) {
        let c = colors[a.colorIndex];

        stroke(c[0], c[1], c[2], map(d, 0, 100, 70, 0));
        line(a.x, a.y, b.x, b.y);
      }
    }
  }

  // マウスのネオンリング
  if (
    mouseX >= 0 && mouseX <= width &&
    mouseY >= 0 && mouseY <= height
  ) {

    let c = colors[0];
    let pulse = sin(frameCount * 0.1) * 10;

    noFill();
    strokeWeight(3);

    stroke(c[0], c[1], c[2], 220);
    circle(mouseX, mouseY, 80 + pulse);

    let c2 = colors[1];

    stroke(c2[0], c2[1], c2[2], 140);
    circle(mouseX, mouseY, 130 + pulse);

    noStroke();

    fill(c[0], c[1], c[2], 35);
    circle(mouseX, mouseY, 170);

    fill(255);
    circle(mouseX, mouseY, 7);
  }

  // 火花
  for (let i = sparks.length - 1; i >= 0; i--) {

    let s = sparks[i];

    s.x += s.vx;
    s.y += s.vy;

    s.vx *= 0.97;
    s.vy *= 0.97;

    s.life -= 5;

    let c = colors[s.colorIndex];

    noStroke();

    fill(c[0], c[1], c[2], s.life);
    circle(s.x, s.y, s.size);

    fill(c[0], c[1], c[2], s.life * 0.2);
    circle(s.x, s.y, s.size * 4);

    if (s.life <= 0) {
      sparks.splice(i, 1);
    }
  }

  // 衝撃波
  for (let i = shockwaves.length - 1; i >= 0; i--) {

    let w = shockwaves[i];

    w.radius += 8;
    w.life -= 5;

    let c = colors[w.colorIndex];

    noFill();
    strokeWeight(4);

    stroke(c[0], c[1], c[2], w.life);
    circle(w.x, w.y, w.radius * 2);

    if (w.life <= 0) {
      shockwaves.splice(i, 1);
    }
  }

  blendMode(BLEND);

  // 画面にテーマ名を表示
  noStroke();
  fill(255, 190);
  textSize(13);
  textAlign(LEFT);

  let names = [
    "BATMAN - YELLOW",
    "MARVEL - GREEN",
    "ORIGINAL - RED",
    "WORKS - BLUE"
  ];

  text(names[theme], 20, 28);
  text("1: Batman  2: Marvel  3: Red  4: Blue", 20, height - 20);
}

// マウスを動かすと火花が出る
function mouseMoved() {

  if (
    mouseX < 0 || mouseX > width ||
    mouseY < 0 || mouseY > height
  ) return;

  for (let i = 0; i < 8; i++) {
    createSpark(mouseX, mouseY, 7);
  }

  return false;
}

// クリックすると爆発
function mousePressed() {

  if (
    mouseX < 0 || mouseX > width ||
    mouseY < 0 || mouseY > height
  ) return;

  for (let i = 0; i < 65; i++) {
    createSpark(mouseX, mouseY, 12);
  }

  shockwaves.push({
    x: mouseX,
    y: mouseY,
    radius: 10,
    life: 255,
    colorIndex: floor(random(2))
  });
}

// 火花を作る
function createSpark(x, y, power) {

  let angle = random(TWO_PI);
  let speed = random(1, power);

  sparks.push({
    x: x,
    y: y,
    vx: cos(angle) * speed,
    vy: sin(angle) * speed,
    size: random(3, 9),
    life: 255,
    colorIndex: floor(random(2))
  });

  if (sparks.length > 500) {
    sparks.splice(0, sparks.length - 500);
  }
}

// キーボードでテーマ変更
function keyPressed() {

  if (key === "1") theme = 0;
  if (key === "2") theme = 1;
  if (key === "3") theme = 2;
  if (key === "4") theme = 3;

  colors = themes[theme];
}