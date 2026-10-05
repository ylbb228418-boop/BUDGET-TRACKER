document.addEventListener('DOMContentLoaded', () => {
  const source = document.querySelector('.jar');
  const wrap = document.querySelector('.jar-wrap');
  if (!source || !wrap) return;
  const bottle = source.cloneNode(true);
  source.replaceWith(bottle);
  bottle.classList.add('physics');
  let x = 0, y = 0, vx = 0, vy = 0, angle = 0, angularVelocity = 0;
  let dragging = false, lastX = 0, lastY = 0, lastTime = 0, raf = 0, puddle = null, holdX = 0, holdY = 0;
  const gravity = 1450; // px/s²
  const restitution = 0.28;
  const floorGap = 28;
  const liquid = bottle.querySelector('.jar-fill');
  const scoop = () => {
    if (puddle) puddle.remove();
    puddle = null; x = y = vx = vy = angularVelocity = angle = 0;
    bottle.style.transform = '';
    if (liquid) liquid.style.transform = '';
  };
  const draw = () => {
    bottle.style.transform = `translate(${x}px,${y}px) rotate(${angle}deg)`;
    if (liquid) liquid.style.transform = `skewX(${Math.max(-12, Math.min(12, angularVelocity * 0.08))}deg)`;
  };
  const step = (time) => {
    const dt = Math.min(0.032, Math.max(0.001, (time - lastTime) / 1000));
    lastTime = time;
    vy += gravity * dt;
    x += vx * dt; y += vy * dt;
    angle += angularVelocity * dt;
    vx *= Math.pow(0.985, dt * 60);
    angularVelocity *= Math.pow(0.96, dt * 60);
    const maxX = Math.max(0, wrap.clientWidth - bottle.offsetWidth - 8);
    const floor = Math.max(0, wrap.clientHeight - bottle.offsetHeight - floorGap);
    if (x < -maxX) { x = -maxX; vx = Math.abs(vx) * restitution; angularVelocity *= .7; }
    if (x > maxX) { x = maxX; vx = -Math.abs(vx) * restitution; angularVelocity *= .7; }
    if (y >= floor) {
      y = floor;
      if (Math.abs(vy) > 55) { vy = -Math.abs(vy) * restitution; angularVelocity += vx * .04; }
      else { vy = 0; vx *= .84; angularVelocity *= .82; }
    }
    draw();
    if (dragging || Math.abs(vx) > 4 || Math.abs(vy) > 4 || Math.abs(angularVelocity) > 4) raf = requestAnimationFrame(step);
    else land();
  };
  const land = () => {
    const floor = Math.max(0, wrap.clientHeight - bottle.offsetHeight - floorGap);
    y = floor; draw();
    if (!puddle) {
      puddle = document.createElement('div'); puddle.className = 'coke-puddle';
      puddle.style.left = `${Math.max(8, Math.min(wrap.clientWidth - 120, wrap.clientWidth / 2 + x))}px`;
      puddle.style.top = `${wrap.clientHeight - 24}px`; wrap.appendChild(puddle);
    }
  };
  bottle.addEventListener('pointerdown', (e) => {
    e.preventDefault(); dragging = true; bottle.setPointerCapture?.(e.pointerId);
    lastX = e.clientX; lastY = e.clientY; lastTime = performance.now(); cancelAnimationFrame(raf);
    const r = bottle.getBoundingClientRect(); holdX = (e.clientX - r.left) / r.width - .5; holdY = (e.clientY - r.top) / r.height - .5;
  });
  bottle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const now = performance.now(), dt = Math.max(.008, (now - lastTime) / 1000);
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    vx = Math.max(-1100, Math.min(1100, dx / dt)); vy = Math.max(-1100, Math.min(1100, dy / dt));
    angularVelocity = Math.max(-720, Math.min(720, dx * 5)); x += dx; y += dy; angle += dx * .25;
    lastX = e.clientX; lastY = e.clientY; lastTime = now; draw();
    if (puddle && Math.abs(wrap.clientWidth / 2 + x - parseFloat(puddle.style.left)) < 100 && y > 45) scoop();
  });
  bottle.addEventListener('pointerup', () => { if (!dragging) return; dragging = false; vx += holdX * 260; vy += holdY * 180; angularVelocity += holdX * 420 - holdY * 180; lastTime = performance.now(); raf = requestAnimationFrame(step); });
});
