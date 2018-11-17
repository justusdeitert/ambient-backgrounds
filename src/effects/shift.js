import SimplexNoise from 'simplex-noise';
import { rand, fadeInOut, TAU } from '../lib/math';
import { createDualCanvas, resizeCanvas } from '../lib/canvas';

const circleCount = 25;
const circlePropCount = 8;
const circlePropsLength = circleCount * circlePropCount;
const baseSpeed = 0.08;
const rangeSpeed = 0.8;
const baseTTL = 350;
const rangeTTL = 600;
const baseRadius = 120;
const rangeRadius = 350;
const rangeHue = 80;
const xOff = 0.0012;
const yOff = 0.0012;
const zOff = 0.001;
const backgroundColor = 'rgba(12, 15, 28, 1)';

export function init(selector) {
  const { canvas, ctx } = createDualCanvas(selector);
  canvas.b.style.transform = 'scale(1.5)';
  resizeCanvas(canvas, ctx);

  const simplex = new SimplexNoise();
  let baseHue = rand(400);
  const circleProps = new Float32Array(circlePropsLength);

  function initCircle(i) {
    const x = rand(canvas.a.width);
    const y = rand(canvas.a.height);
    const n = simplex.noise3D(x * xOff, y * yOff, baseHue * zOff);
    const t = rand(TAU);
    const speed = baseSpeed + rand(rangeSpeed);
    const vx = speed * Math.cos(t);
    const vy = speed * Math.sin(t);
    const life = 0;
    const ttl = baseTTL + rand(rangeTTL);
    const radius = baseRadius + rand(rangeRadius);
    const hue = baseHue + n * rangeHue;
    circleProps.set([x, y, vx, vy, life, ttl, radius, hue], i);
  }

  for (let i = 0; i < circlePropsLength; i += circlePropCount) {
    initCircle(i);
  }

  function updateCircle(i) {
    const i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i;

    const x = circleProps[i];
    const y = circleProps[i2];
    const vx = circleProps[i3];
    const vy = circleProps[i4];
    let life = circleProps[i5];
    const ttl = circleProps[i6];
    const radius = circleProps[i7];
    const hue = circleProps[i8];

    ctx.a.save();
    ctx.a.fillStyle = `hsla(${hue},50%,25%,${fadeInOut(life, ttl)})`;
    ctx.a.beginPath();
    ctx.a.arc(x, y, radius, 0, TAU);
    ctx.a.fill();
    ctx.a.closePath();
    ctx.a.restore();

    life++;

    circleProps[i] = x + vx;
    circleProps[i2] = y + vy;
    circleProps[i5] = life;

    const outOfBounds =
      x < -radius ||
      x > canvas.a.width + radius ||
      y < -radius ||
      y > canvas.a.height + radius;

    if (outOfBounds || life > ttl) initCircle(i);
  }

  let animId;

  function draw() {
    ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);
    ctx.b.fillStyle = backgroundColor;
    ctx.b.fillRect(0, 0, canvas.b.width, canvas.b.height);

    baseHue++;
    for (let i = 0; i < circlePropsLength; i += circlePropCount) {
      updateCircle(i);
    }

    ctx.b.save();
    ctx.b.filter = 'blur(80px) saturate(120%)';
    ctx.b.drawImage(canvas.a, 0, 0);
    ctx.b.restore();

    animId = requestAnimationFrame(draw);
  }

  draw();

  function onResize() {
    resizeCanvas(canvas, ctx);
  }
  window.addEventListener('resize', onResize);

  return function cleanup() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', onResize);
  };
}
