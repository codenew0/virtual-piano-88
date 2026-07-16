(() => {
  const stage = document.getElementById("visualizer");
  const canvas = document.getElementById("water-canvas");
  if (!stage || !canvas) return;

  const context = canvas.getContext("2d", { alpha: true });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const bands = [];
  const flecks = [];
  let width = 1;
  let height = 1;
  let pixelRatio = 1;

  const randomBetween = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);
  const positiveModulo = (value, divisor) => ((value % divisor) + divisor) % divisor;

  function createWaterElements() {
    bands.length = 0;
    flecks.length = 0;

    for (let index = 0; index < 22; index += 1) {
      const verticalPosition = randomBetween(.04, .98);
      const nearSurface = verticalPosition < .3;
      bands.push({
        y: verticalPosition,
        amplitude: randomBetween(3, 16),
        frequency: randomBetween(5, 13),
        secondaryFrequency: randomBetween(15, 31),
        speed: randomBetween(.00013, .00036) * (Math.random() > .22 ? 1 : -1),
        phase: randomBetween(0, Math.PI * 2),
        secondaryPhase: randomBetween(0, Math.PI * 2),
        alpha: nearSurface ? randomBetween(.08, .18) : randomBetween(.025, .1),
        width: index % 4 === 0 ? randomBetween(2.4, 4.8) : randomBetween(.65, 2.1),
        color: nearSurface
          ? (Math.random() > .5 ? "0, 82, 120" : "223, 255, 255")
          : (Math.random() > .45 ? "137, 226, 239" : "38, 132, 183"),
        blend: nearSurface && Math.random() > .42 ? "multiply" : "screen",
      });
    }

    for (let index = 0; index < 115; index += 1) {
      flecks.push({
        x: Math.random(),
        y: Math.random(),
        speed: randomBetween(.000012, .000042) * (Math.random() > .18 ? 1 : -1),
        length: randomBetween(5, 30),
        width: randomBetween(.45, 1.05),
        alpha: randomBetween(.025, .16),
        phase: randomBetween(0, Math.PI * 2),
      });
    }
  }

  function resizeCanvas() {
    const bounds = stage.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function drawFlowBands(time) {
    const motionScale = reducedMotion.matches ? .14 : 1;
    context.save();
    context.globalCompositeOperation = "screen";
    context.lineCap = "round";

    bands.forEach((band, index) => {
      context.globalCompositeOperation = band.blend;
      const baseY = height * band.y;
      const timeOffset = time * band.speed * motionScale;
      context.beginPath();

      for (let x = -16; x <= width + 16; x += 7) {
        const normalizedX = x / Math.max(width, 1);
        const primary = Math.sin(normalizedX * band.frequency + timeOffset + band.phase);
        const secondary = Math.sin(
          normalizedX * band.secondaryFrequency - timeOffset * .53 + band.secondaryPhase,
        );
        const crossCurrent = Math.sin(normalizedX * 2.4 + time * .00019 * motionScale + index);
        const y = baseY
          + primary * band.amplitude
          + secondary * band.amplitude * .34
          + crossCurrent * 3.5;

        if (x === -16) context.moveTo(x, y);
        else context.lineTo(x, y);
      }

      context.strokeStyle = `rgba(${band.color}, ${band.alpha})`;
      context.lineWidth = band.width;
      context.shadowColor = `rgba(${band.color}, ${band.alpha * .8})`;
      context.shadowBlur = band.width > 1.2 ? 7 : 2;
      context.stroke();
    });

    context.restore();
  }

  function drawFlowFlecks(time) {
    const motionScale = reducedMotion.matches ? .12 : 1;
    context.save();
    context.globalCompositeOperation = "screen";
    context.lineCap = "round";

    flecks.forEach((fleck) => {
      const normalizedX = positiveModulo(fleck.x + time * fleck.speed * motionScale, 1.12) - .06;
      const x = normalizedX * width;
      const y = fleck.y * height + Math.sin(time * .00045 * motionScale + fleck.phase) * 7;
      const bend = Math.sin(time * .00028 * motionScale + fleck.phase) * 4;

      context.beginPath();
      context.moveTo(x, y);
      context.quadraticCurveTo(x + fleck.length * .5, y + bend, x + fleck.length, y + bend * .25);
      context.strokeStyle = `rgba(181, 239, 244, ${fleck.alpha})`;
      context.lineWidth = fleck.width;
      context.stroke();
    });

    context.restore();
  }

  function render(time) {
    context.clearRect(0, 0, width, height);
    drawFlowBands(time);
    drawFlowFlecks(time);
    window.requestAnimationFrame(render);
  }

  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(stage);
  createWaterElements();
  resizeCanvas();
  window.requestAnimationFrame(render);
})();
