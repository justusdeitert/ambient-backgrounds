import SimplexNoise from 'simplex-noise';
import { rand, randRange, cos, sin, lerp, fadeInOut, TAU } from '../lib/math';
import { createDualCanvas, resizeCanvas } from '../lib/canvas';

const particleCount = 800;
const particlePropCount = 9;
const particlePropsLength = particleCount * particlePropCount;
const rangeY = 140;
const baseTTL = 60;
const rangeTTL = 180;
const baseSpeed = 0.08;
const rangeSpeed = 1.8;
const baseRadius = 1;
const rangeRadius = 3;
const baseHue = 280;
const rangeHue = 80;
const noiseSteps = 6;
const xOff = 0.0015;
const yOff = 0.001;
const zOff = 0.0004;
const backgroundColor = 'hsla(290,35%,4%,1)';

export function init(selector) {
  const { canvas, ctx } = createDualCanvas(selector);
  let center = resizeCanvas(canvas, ctx);
  let tick = 0;
  const simplex = new SimplexNoise();
  const particleProps = new Float32Array(particlePropsLength);

  function initParticle(i) {
    const x = rand(canvas.a.width);
    const y = center[1] + randRange(rangeY);
    particleProps.set([x, y, 0, 0, 0, baseTTL + rand(rangeTTL), baseSpeed + rand(rangeSpeed), baseRadius + rand(rangeRadius), baseHue + rand(rangeHue)], i);
  }

  for (let i = 0; i < particlePropsLength; i += particlePropCount) {
    initParticle(i);
  }

  function updateParticle(i) {
    const i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i, i9=8+i;

    const x = particleProps[i];
    const y = particleProps[i2];
    const n = simplex.noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;
    const vx = lerp(particleProps[i3], cos(n), 0.5);
    const vy = lerp(particleProps[i4], sin(n), 0.5);
    const life = particleProps[i5];
    const ttl = particleProps[i6];
    const speed = particleProps[i7];
    const x2 = x + vx * speed;
    const y2 = y + vy * speed;
    const radius = particleProps[i8];
    const hue = particleProps[i9];

    ctx.a.save();
    ctx.a.lineCap = 'round';
    ctx.a.lineWidth = radius;
    ctx.a.strokeStyle = `hsla(${hue},85%,65%,${fadeInOut(life, ttl)})`;
    ctx.a.beginPath();
    ctx.a.moveTo(x, y);
    ctx.a.lineTo(x2, y2);
    ctx.a.stroke();
    ctx.a.closePath();
    ctx.a.restore();

    particleProps[i] = x2;
    particleProps[i2] = y2;
    particleProps[i3] = vx;
    particleProps[i4] = vy;
    particleProps[i5] = life + 1;

    if (x > canvas.a.width || x < 0 || y > canvas.a.height || y < 0 || life > ttl) {
      initParticle(i);
    }
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
