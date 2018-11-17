import { rand, round, cos, sin, fadeInOut, TAU, HALF_PI, TO_RAD } from '../lib/math';
import { createDualCanvas, resizeCanvas } from '../lib/canvas';

const pipeCount = 40;
const pipePropCount = 8;
const pipePropsLength = pipeCount * pipePropCount;
const turnCount = 6;
const turnAmount = (360 / turnCount) * TO_RAD;
const turnChanceRange = 45;
const baseSpeed = 0.4;
const rangeSpeed = 1.2;
const baseTTL = 120;
const rangeTTL = 350;
const baseWidth = 2;
const rangeWidth = 5;
const baseHue = 220;
const rangeHue = 80;
const backgroundColor = 'hsla(230,60%,2%,1)';

export function init(selector) {
  const { canvas, ctx } = createDualCanvas(selector);
  let center = resizeCanvas(canvas, ctx);
  let tick = 0;
  const pipeProps = new Float32Array(pipePropsLength);

  function initPipe(i) {
    const x = rand(canvas.a.width);
    const y = center[1];
    const direction = round(rand(1)) ? HALF_PI : TAU - HALF_PI;
    const speed = baseSpeed + rand(rangeSpeed);
    const life = 0;
    const ttl = baseTTL + rand(rangeTTL);
    const width = baseWidth + rand(rangeWidth);
    const hue = baseHue + rand(rangeHue);
    pipeProps.set([x, y, direction, speed, life, ttl, width, hue], i);
  }

  for (let i = 0; i < pipePropsLength; i += pipePropCount) {
    initPipe(i);
  }

  function updatePipe(i) {
    const i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i;

    let x = pipeProps[i];
    let y = pipeProps[i2];
    let direction = pipeProps[i3];
    const speed = pipeProps[i4];
    let life = pipeProps[i5];
    const ttl = pipeProps[i6];
    const width = pipeProps[i7];
    const hue = pipeProps[i8];

    ctx.a.save();
    ctx.a.strokeStyle = `hsla(${hue},70%,55%,${fadeInOut(life, ttl) * 0.15})`;
    ctx.a.beginPath();
    ctx.a.arc(x, y, width, 0, TAU);
    ctx.a.stroke();
    ctx.a.closePath();
    ctx.a.restore();

    life++;
    x += cos(direction) * speed;
    y += sin(direction) * speed;

    const turnChance = !(tick % round(rand(turnChanceRange))) && (!(round(x) % 6) || !(round(y) % 6));
    const turnBias = round(rand(1)) ? -1 : 1;
    direction += turnChance ? turnAmount * turnBias : 0;

    pipeProps[i] = x;
    pipeProps[i2] = y;
    pipeProps[i3] = direction;
    pipeProps[i5] = life;

    if (x > canvas.a.width) pipeProps[i] = 0;
    if (x < 0) pipeProps[i] = canvas.a.width;
    if (y > canvas.a.height) pipeProps[i2] = 0;
    if (y < 0) pipeProps[i2] = canvas.a.height;

    if (life > ttl) initPipe(i);
  }

  let animId;

  function draw() {
    tick++;

    for (let i = 0; i < pipePropsLength; i += pipePropCount) {
      updatePipe(i);
    }

    ctx.b.save();
    ctx.b.fillStyle = backgroundColor;
    ctx.b.fillRect(0, 0, canvas.b.width, canvas.b.height);
    ctx.b.restore();

    ctx.b.save();
    ctx.b.filter = 'blur(12px)';
    ctx.b.drawImage(canvas.a, 0, 0);
    ctx.b.restore();

    ctx.b.save();
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
