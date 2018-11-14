export function createDualCanvas(selector) {
  const container = document.querySelector(selector);
  const canvas = {
    a: document.createElement('canvas'),
    b: document.createElement('canvas'),
  };
  canvas.b.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `;
  container.appendChild(canvas.b);
  const ctx = {
    a: canvas.a.getContext('2d'),
    b: canvas.b.getContext('2d'),
  };
  return { canvas, ctx };
}

export function resizeCanvas(canvas, ctx) {
  const { innerWidth, innerHeight } = window;

  canvas.a.width = innerWidth;
  canvas.a.height = innerHeight;
  ctx.a.drawImage(canvas.b, 0, 0);

  canvas.b.width = innerWidth;
  canvas.b.height = innerHeight;
  ctx.b.drawImage(canvas.a, 0, 0);

  return [0.5 * innerWidth, 0.5 * innerHeight];
}
