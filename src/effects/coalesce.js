import { rand, cos, sin, angle, lerp, fadeInOut, HALF_PI, TAU } from '../lib/math';
import { createDualCanvas, resizeCanvas } from '../lib/canvas';

const particleCount = 600;
const particlePropCount = 9;
const particlePropsLength = particleCount * particlePropCount;
const baseTTL = 120;
const rangeTTL = 450;
const baseSpeed = 0.12;
const rangeSpeed = 0.9;
const baseSize = 3;
const rangeSize = 8;
const baseHue = 160;
const rangeHue = 70;
const backgroundColor = 'hsla(180,40%,3%,1)';

export function init(selector) {
  const { canvas, ctx } = createDualCanvas(selector);
  let center = resizeCanvas(canvas, ctx);
  let tick = 0;
  const particleProps = new Float32Array(particlePropsLength);

  function initParticle(i) {
    const x = rand(canvas.a.width);
    const y = rand(canvas.a.height);
    const theta = angle(x, y, center[0], center[1]);
    const vx = cos(theta) * 6;
    const vy = sin(theta) * 6;
    particleProps.set([x, y, vx, vy, 0, baseTTL + rand(rangeTTL), baseSpeed + rand(rangeSpeed), baseSize + rand(rangeSize), baseHue + rand(rangeHue)], i);
  }

  for (let i = 0; i < particlePropsLength; i += particlePropCount) {
    initParticle(i);
  }

  function updateParticle(i) {
    const i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i, i9=8+i;

    const x = particleProps[i];
    const y = particleProps[i2];
    const theta = angle(x, y, center[0], center[1]) + 0.75 * HALF_PI;
    const vx = lerp(particleProps[i3], 2 * cos(theta), 0.05);
    const vy = lerp(particleProps[i4], 2 * sin(theta), 0.05);
    const life = particleProps[i5];
    const ttl = particleProps[i6];
    const speed = particleProps[i7];
    const x2 = x + vx * speed;
    const y2 = y + vy * speed;
    const size = particleProps[i8];
    const hue = particleProps[i9];

    const xRel = x - 0.5 * size;
    const yRel = y - 0.5 * size;

    ctx.a.save();
    ctx.a.lineCap = 'round';
    ctx.a.lineWidth = 1;
    ctx.a.strokeStyle = `hsla(${hue},80%,55%,${fadeInOut(life, ttl)})`;
    ctx.a.beginPath();
    ctx.a.translate(xRel, yRel);
    ctx.a.rotate(theta);
    ctx.a.translate(-xRel, -yRel);
    ctx.a.strokeRect(xRel, yRel, size, size);
    ctx.a.closePath();
    ctx.a.restore();

    particleProps[i] = x2;
    particleProps[i2] = y2;
    particleProps[i3] = vx;
    particleProps[i4] = vy;
    particleProps[i5] = life + 1;

    if (life > ttl) initParticle(i);
  }

  let animId;

  function draw() {
    tick++;
    ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);
    ctx.b.fillStyle = backgroundColor;
    ctx.b.fillRect(0, 0, canvas.a.width, canvas.a.height);

    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      updateParticle(i);
    }

    ctx.b.save();
    ctx.b.filter = 'blur(8px) brightness(200%)';
    ctx.b.globalCompositeOperation = 'lighter';
    ctx.b.drawImage(canvas.a, 0, 0);
    ctx.b.restore();

    ctx.b.save();
    ctx.b.filter = 'blur(4px) brightness(200%)';
    ctx.b.globalCompositeOperation = 'lighter';
    ctx.b.drawImage(canvas.a, 0, 0);
    ctx.b.restore();

    ctx.b.save();
    ctx.b.globalCompositeOperation = 'lighter';
    ctx.b.drawImage(canvas.a, 0, 0);
    ctx.b.restore();

    animId = requestAnimationFrame(draw);
  }

  draw();

  function onResize() {
    center = resizeCanvas(canvas, ctx);
  }
  window.addEventListener('resize', onResize);

  return function cleanup() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', onResize);
  };
}
