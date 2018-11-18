import SimplexNoise from 'simplex-noise';
import { rand, round, cos, fadeInOut } from '../lib/math';
import { createDualCanvas, resizeCanvas } from '../lib/canvas';

const rayCount = 400;
const rayPropCount = 8;
const rayPropsLength = rayCount * rayPropCount;
const baseLength = 250;
const rangeLength = 250;
const baseSpeed = 0.04;
const rangeSpeed = 0.08;
const baseWidth = 12;
const rangeWidth = 18;
const baseHue = 170;
const rangeHue = 50;
const baseTTL = 60;
const rangeTTL = 120;
const noiseStrength = 120;
const xOff = 0.001;
const yOff = 0.001;
const zOff = 0.001;
const backgroundColor = 'hsla(200,50%,3%,1)';

export function init(selector) {
  const { canvas, ctx } = createDualCanvas(selector);
  let center = resizeCanvas(canvas, ctx);
  let tick = 0;
  const simplex = new SimplexNoise();
  const rayProps = new Float32Array(rayPropsLength);

  function initRay(i) {
    const length = baseLength + rand(rangeLength);
    const x = rand(canvas.a.width);
    const n = simplex.noise3D(x * xOff, center[1] * yOff, tick * zOff) * noiseStrength;
    const y1 = center[1] + noiseStrength + n;
    const y2 = center[1] + noiseStrength - length + n;
    const life = 0;
    const ttl = baseTTL + rand(rangeTTL);
    const width = baseWidth + rand(rangeWidth);
    const speed = baseSpeed + rand(rangeSpeed) * (round(rand(1)) ? 1 : -1);
    const hue = baseHue + rand(rangeHue);
    rayProps.set([x, y1, y2, life, ttl, width, speed, hue], i);
  }

  for (let i = 0; i < rayPropsLength; i += rayPropCount) {
    initRay(i);
  }

  function updateRay(i) {
    const i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i;

    let x = rayProps[i];
    const y1 = rayProps[i2];
    const y2 = rayProps[i3];
    let life = rayProps[i4];
    const ttl = rayProps[i5];
    const width = rayProps[i6];
    const speed = rayProps[i7];
    const hue = rayProps[i8];

    const gradient = ctx.a.createLinearGradient(x, y1, x, y2);
    gradient.addColorStop(0, `hsla(${hue},90%,60%,0)`);
    gradient.addColorStop(0.5, `hsla(${hue},90%,60%,${fadeInOut(life, ttl)})`);
    gradient.addColorStop(1, `hsla(${hue},90%,60%,0)`);

    ctx.a.save();
    ctx.a.beginPath();
    ctx.a.strokeStyle = gradient;
    ctx.a.lineWidth = width;
    ctx.a.moveTo(x, y1);
    ctx.a.lineTo(x, y2);
    ctx.a.stroke();
    ctx.a.closePath();
    ctx.a.restore();

    x += speed;
    life++;

    rayProps[i] = x;
    rayProps[i4] = life;

    if (x < 0 || x > canvas.a.width || life > ttl) {
      initRay(i);
    }
  }

  let animId;

  function draw() {
    tick++;
    ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);
    ctx.b.fillStyle = backgroundColor;
    ctx.b.fillRect(0, 0, canvas.b.width, canvas.a.height);

    for (let i = 0; i < rayPropsLength; i += rayPropCount) {
      updateRay(i);
    }

    ctx.b.save();
    ctx.b.filter = 'blur(12px)';
    ctx.a.globalCompositeOperation = 'lighter';
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
