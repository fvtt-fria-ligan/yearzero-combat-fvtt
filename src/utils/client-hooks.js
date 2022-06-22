export function getCanvas() {
  if (canvas instanceof Canvas && canvas.ready) {
    return canvas;
  }
  throw new Error('No Canvas available');
}
