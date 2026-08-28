// ============================================================================
// EMPIRICAL ADVERSARIAL STRESS TEST HARNESS — CHALLENGER 1 (M1 & M2)
// ============================================================================
// Tests:
// 1. Bézier Midpoint Math & C1 Tangent Continuity Oracle
// 2. Synthetic Pressure & Velocity Smoothing Edge Cases (0 dt, negative dt, extreme velocities, NaN/Inf)
// 3. Canvas 2D Particle System Object Pool & Memory Leak Stress (10,000 frames, rapid bursts)
// 4. Web Audio Synthesizer Lifecycle, Node Ramping & Graceful Degradation Simulation
// ============================================================================

import assert from 'node:assert/strict';

console.log('🧪 STARTING EMPIRICAL ADVERSARIAL CHALLENGE SUITE...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    if (err.stack) {
      console.error(`     ${err.stack.split('\n').slice(1, 4).join('\n     ')}`);
    }
  }
}

async function testAsync(name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✅ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

// ============================================================================
// SUITE 1: QUADRATIC BÉZIER MIDPOINT SMOOTHING MATHEMATICAL ORACLES
// ============================================================================
console.log('--- SUITE 1: Quadratic Bézier Midpoint Smoothing & Tangent Continuity ---');

// Simulated Canvas Context Mock to capture Bézier segments
class MockCanvasContext2D {
  constructor() {
    this.ops = [];
    this.lineWidth = 1;
    this.strokeStyle = '#000';
    this.fillStyle = '#000';
  }
  beginPath() { this.ops.push({ type: 'beginPath' }); }
  moveTo(x, y) { this.ops.push({ type: 'moveTo', x, y }); }
  lineTo(x, y) { this.ops.push({ type: 'lineTo', x, y }); }
  quadraticCurveTo(cpx, cpy, x, y) { this.ops.push({ type: 'quadraticCurveTo', cpx, cpy, x, y }); }
  stroke() { this.ops.push({ type: 'stroke' }); }
  fill() { this.ops.push({ type: 'fill' }); }
  arc(x, y, r, sa, ea) { this.ops.push({ type: 'arc', x, y, r, sa, ea }); }
  clearRect(x, y, w, h) { this.ops.push({ type: 'clearRect', x, y, w, h }); }
  save() { this.ops.push({ type: 'save' }); }
  restore() { this.ops.push({ type: 'restore' }); }
  translate(x, y) { this.ops.push({ type: 'translate', x, y }); }
  rotate(a) { this.ops.push({ type: 'rotate', a }); }
}

// Engine matching ZentryFreeCanvasScreen.tsx logic
class DrawingEngine {
  constructor(ctx, brushSize = 16, toolMode = 'brush', selectedColor = '#EC4899', bg = '#FFFFFF') {
    this.ctx = ctx;
    this.brushSize = brushSize;
    this.toolMode = toolMode;
    this.selectedColor = selectedColor;
    this.bg = bg;
    this.isDrawing = false;
    this.lastPoint = null;
    this.lastMidPoint = null;
    this.rainbowHue = 0;
    this.strokeSegments = [];
  }

  pointerDown(x, y, time = 1000) {
    this.isDrawing = true;
    this.lastPoint = { x, y, time };
    this.lastMidPoint = { x, y };

    const initialRadius = (this.toolMode === 'eraser' ? this.brushSize * 1.8 : this.brushSize) / 2;
    this.ctx.beginPath();
    this.ctx.arc(x, y, initialRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.selectedColor;
    this.ctx.fill();
  }

  pointerMove(x, y, time = 1016) {
    if (!this.isDrawing || !this.lastPoint || !this.lastMidPoint || this.toolMode === 'stamp') {
      return null;
    }

    const prev = this.lastPoint;
    const dx = x - prev.x;
    const dy = y - prev.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dt = Math.max(1, time - prev.time);
    const speed = dist / dt;

    const midX = (prev.x + x) / 2;
    const midY = (prev.y + y) / 2;

    const synthPressure = Math.max(0.4, Math.min(1.2, 1.1 - speed * 0.15));
    const effectiveLineWidth = this.toolMode === 'eraser' ? this.brushSize * 1.8 : this.brushSize * synthPressure;

    const strokeStyle = this.selectedColor;

    this.ctx.lineWidth = effectiveLineWidth;
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastMidPoint.x, this.lastMidPoint.y);
    this.ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    this.ctx.stroke();

    const segment = {
      startMid: { ...this.lastMidPoint },
      control: { x: prev.x, y: prev.y },
      endMid: { x: midX, y: midY },
      speed,
      synthPressure,
      effectiveLineWidth
    };
    this.strokeSegments.push(segment);

    this.lastMidPoint = { x: midX, y: midY };
    this.lastPoint = { x, y, time };

    return segment;
  }

  pointerUp() {
    if (this.isDrawing) {
      if (this.lastPoint && this.lastMidPoint) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastMidPoint.x, this.lastMidPoint.y);
        this.ctx.lineTo(this.lastPoint.x, this.lastPoint.y);
        this.ctx.stroke();
      }
      this.isDrawing = false;
      this.lastPoint = null;
      this.lastMidPoint = null;
    }
  }
}

test('Bézier midpoints exactly equal (P_prev + P_curr) / 2 for arbitrary points', () => {
  const ctx = new MockCanvasContext2D();
  const engine = new DrawingEngine(ctx);

  const points = [
    { x: 100, y: 150, t: 1000 },
    { x: 120, y: 180, t: 1016 },
    { x: 150, y: 220, t: 1032 },
    { x: 200, y: 300, t: 1048 },
    { x: 270, y: 410, t: 1064 }
  ];

  engine.pointerDown(points[0].x, points[0].y, points[0].t);

  for (let i = 1; i < points.length; i++) {
    const seg = engine.pointerMove(points[i].x, points[i].y, points[i].t);
    const expectedMidX = (points[i-1].x + points[i].x) / 2;
    const expectedMidY = (points[i-1].y + points[i].y) / 2;
    assert.equal(seg.endMid.x, expectedMidX, `midX mismatch at step ${i}`);
    assert.equal(seg.endMid.y, expectedMidY, `midY mismatch at step ${i}`);
    assert.equal(seg.control.x, points[i-1].x, `control.x mismatch at step ${i}`);
    assert.equal(seg.control.y, points[i-1].y, `control.y mismatch at step ${i}`);
  }

  engine.pointerUp();
  assert.equal(engine.strokeSegments.length, 4);
});

test('Mathematical C1 Tangent Continuity Oracle across consecutive Bézier segments', () => {
  // For a quadratic Bézier with Start S, Control C, End E:
  // Position B(t) = (1-t)^2 S + 2(1-t)t C + t^2 E
  // Tangent B'(t) = 2(1-t)(C - S) + 2t(E - C)
  // At t=1: Incoming tangent B_k'(1) = 2(E_k - C_k) = 2(M_k - P_{k-1}) = 2(((P_{k-1} + P_k)/2) - P_{k-1}) = P_k - P_{k-1}
  // At t=0: Outgoing tangent B_{k+1}'(0) = 2(C_{k+1} - S_{k+1}) = 2(P_k - M_k) = 2(P_k - ((P_{k-1} + P_k)/2)) = P_k - P_{k-1}
  // Let's verify this numerically across 1,000 random spline trajectories!

  const ctx = new MockCanvasContext2D();
  const engine = new DrawingEngine(ctx);

  engine.pointerDown(50, 50, 0);

  let curX = 50;
  let curY = 50;
  let curT = 0;

  for (let i = 0; i < 1000; i++) {
    curX += (Math.random() - 0.5) * 40;
    curY += (Math.random() - 0.5) * 40;
    curT += 16 + Math.random() * 10;
    engine.pointerMove(curX, curY, curT);
  }

  engine.pointerUp();

  for (let i = 0; i < engine.strokeSegments.length - 1; i++) {
    const segA = engine.strokeSegments[i];
    const segB = engine.strokeSegments[i + 1];

    // Check boundary position matching (S_{k+1} == E_k)
    assert.equal(segA.endMid.x, segB.startMid.x);
    assert.equal(segA.endMid.y, segB.startMid.y);

    // Tangent incoming at t=1: 2 * (E_A - C_A)
    const tanIncomingX = 2 * (segA.endMid.x - segA.control.x);
    const tanIncomingY = 2 * (segA.endMid.y - segA.control.y);

    // Tangent outgoing at t=0: 2 * (C_B - S_B)
    const tanOutgoingX = 2 * (segB.control.x - segB.startMid.x);
    const tanOutgoingY = 2 * (segB.control.y - segB.startMid.y);

    assert.ok(Math.abs(tanIncomingX - tanOutgoingX) < 1e-9, `C1 tangent X discontinuity between seg ${i} and ${i+1}`);
    assert.ok(Math.abs(tanIncomingY - tanOutgoingY) < 1e-9, `C1 tangent Y discontinuity between seg ${i} and ${i+1}`);
  }
});

// ============================================================================
// SUITE 2: SYNTHETIC PRESSURE & VELOCITY SMOOTHING EDGE CASES
// ============================================================================
console.log('\n--- SUITE 2: Synthetic Pressure & Velocity Edge Cases ---');

test('Edge Case: Zero delta time (dt = 0) avoids division by zero and NaN', () => {
  const ctx = new MockCanvasContext2D();
  const engine = new DrawingEngine(ctx, 20);

  engine.pointerDown(100, 100, 5000);
  // PointerMove occurs at the exact same millisecond timestamp: time = 5000
  const seg = engine.pointerMove(150, 150, 5000);

  assert.ok(Number.isFinite(seg.speed), `speed should be finite, got ${seg.speed}`);
  assert.ok(Number.isFinite(seg.synthPressure), `synthPressure should be finite, got ${seg.synthPressure}`);
  assert.ok(Number.isFinite(seg.effectiveLineWidth), `effectiveLineWidth should be finite, got ${seg.effectiveLineWidth}`);
  assert.ok(seg.effectiveLineWidth >= 8 && seg.effectiveLineWidth <= 24, `effectiveLineWidth out of bounds: ${seg.effectiveLineWidth}`);
  engine.pointerUp();
});

test('Edge Case: Negative delta time (clock glitch / non-monotonic timestamp)', () => {
  const ctx = new MockCanvasContext2D();
  const engine = new DrawingEngine(ctx, 20);

  engine.pointerDown(100, 100, 5000);
  // PointerMove time goes backwards to 4900 (clock step)
  const seg = engine.pointerMove(110, 110, 4900);

  assert.ok(Number.isFinite(seg.speed));
  assert.ok(seg.speed >= 0);
  assert.ok(seg.synthPressure >= 0.4 && seg.synthPressure <= 1.2);
  engine.pointerUp();
});

test('Edge Case: Extreme velocity (teleport / touch jump across screen)', () => {
  const ctx = new MockCanvasContext2D();
  const engine = new DrawingEngine(ctx, 16);

  engine.pointerDown(0, 0, 1000);
  // Pointer jumps 50,000 pixels in 1 ms
  const seg = engine.pointerMove(50000, 50000, 1001);

  assert.equal(seg.synthPressure, 0.4, 'synthPressure should be strictly clamped to min 0.4 under ultra-high velocity');
  assert.equal(seg.effectiveLineWidth, 16 * 0.4, 'effectiveLineWidth must be brushSize * 0.4');
  engine.pointerUp();
});

test('Edge Case: Zero movement (co-located pointer move)', () => {
  const ctx = new MockCanvasContext2D();
  const engine = new DrawingEngine(ctx, 16);

  engine.pointerDown(200, 200, 1000);
  const seg = engine.pointerMove(200, 200, 1050);

  assert.equal(seg.speed, 0);
  assert.equal(seg.synthPressure, 1.1, 'synthPressure at 0 velocity should be exactly 1.1');
  assert.equal(seg.effectiveLineWidth, 16 * 1.1);
  engine.pointerUp();
});

test('Edge Case: Single-point tap without move (Down -> Up immediately)', () => {
  const ctx = new MockCanvasContext2D();
  const engine = new DrawingEngine(ctx, 14);

  engine.pointerDown(300, 300, 1000);
  assert.equal(engine.isDrawing, true);
  engine.pointerUp();
  assert.equal(engine.isDrawing, false);
  assert.equal(engine.lastPoint, null);
  assert.equal(engine.lastMidPoint, null);

  // Check that initial arc dot was drawn
  const arcs = ctx.ops.filter(op => op.type === 'arc');
  assert.equal(arcs.length, 1);
  assert.equal(arcs[0].x, 300);
  assert.equal(arcs[0].y, 300);
  assert.equal(arcs[0].r, 7);
});

// ============================================================================
// SUITE 3: CANVAS 2D PARTICLE ENGINE OBJECT POOL & LEAK HARNESS
// ============================================================================
console.log('\n--- SUITE 3: Canvas 2D Particle System Object Pool & Leak Stress ---');

// Particle system matching ZentryFreeCanvasScreen.tsx
class CanvasParticleSystem {
  constructor() {
    this.particles = [];
    this.pool = [];
  }

  emit(x, y, baseHue, count = 3, shape = 'star', speedMultiplier = 1.0) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.6 + Math.random() * 2.8) * speedMultiplier;
      const p = this.pool.pop() || {
        x: 0, y: 0, vx: 0, vy: 0, size: 0, rotation: 0, vRot: 0,
        hue: 0, alpha: 1, decayRate: 0.03, life: 0, maxLife: 40, shape: 'star'
      };

      p.x = x + (Math.random() - 0.5) * 12;
      p.y = y + (Math.random() - 0.5) * 12;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed - 0.5;
      p.size = 8 + Math.random() * 12;
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 0.2;
      p.hue = (baseHue + Math.random() * 40 - 20 + 360) % 360;
      p.alpha = 1.0;
      p.life = 0;
      p.maxLife = 25 + Math.random() * 25;
      p.decayRate = 1.0 / p.maxLife;
      p.shape = shape;

      this.particles.push(p);
    }
  }

  emitBurst(x, y, baseHue, count = 24) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 2.0 + Math.random() * 4.5;
      const p = this.pool.pop() || {
        x: 0, y: 0, vx: 0, vy: 0, size: 0, rotation: 0, vRot: 0,
        hue: 0, alpha: 1, decayRate: 0.02, life: 0, maxLife: 50, shape: 'star'
      };

      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.size = 10 + Math.random() * 14;
      p.rotation = Math.random() * Math.PI * 2;
      p.vRot = (Math.random() - 0.5) * 0.3;
      p.hue = (baseHue + (i * 360) / count) % 360;
      p.alpha = 1.0;
      p.life = 0;
      p.maxLife = 35 + Math.random() * 25;
      p.decayRate = 1.0 / p.maxLife;
      p.shape = Math.random() > 0.4 ? 'star' : 'sparkle';

      this.particles.push(p);
    }
  }

  emitClearDissolve(width, height) {
    const total = 50;
    for (let i = 0; i < total; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      this.emit(px, py, Math.random() * 360, 2, 'sparkle', 1.5);
    }
  }

  updateAndRender(ctx, width, height) {
    ctx.clearRect(0, 0, width, height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.rotation += p.vRot;
      p.life++;
      p.alpha = Math.max(0, 1.0 - p.life * p.decayRate);

      if (p.alpha <= 0 || p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        this.pool.push(p);
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.restore();
    }
  }

  getTotalAllocated() {
    return this.particles.length + this.pool.length;
  }
}

test('Particle pool recycles instances and caps total allocation over 10,000 continuous frames', () => {
  const ps = new CanvasParticleSystem();
  const ctx = new MockCanvasContext2D();

  // Simulate 10,000 frames (~166 seconds of continuous drawing and bursting at 60fps)
  for (let frame = 0; frame < 10000; frame++) {
    // Regular drawing stardust emission: 3 particles every 2 frames
    if (frame % 2 === 0) {
      ps.emit(100 + (frame % 500), 200 + (frame % 300), (frame * 5) % 360, 3, 'star');
    }

    // Occasional burst stamp: 24 particles every 60 frames (1 per sec)
    if (frame % 60 === 0) {
      ps.emitBurst(250, 250, (frame * 17) % 360, 24);
    }

    // Periodic clear dissolve: 100 particles every 300 frames
    if (frame % 300 === 0) {
      ps.emitClearDissolve(800, 600);
    }

    ps.updateAndRender(ctx, 800, 600);
  }

  const totalAllocated = ps.getTotalAllocated();
  const activeParticles = ps.particles.length;

  console.log(`     Particle metrics after 10,000 frames: Active = ${activeParticles}, Pool = ${ps.pool.length}, Total Memory Allocated Objects = ${totalAllocated}`);

  // Total allocated particle objects must be strictly bounded in steady state (< 350 objects)
  assert.ok(totalAllocated < 350, `Memory runaway! Total particles reached ${totalAllocated}`);
  assert.ok(totalAllocated > 50, `Pool should have recycled at least 50 objects, got ${totalAllocated}`);

  // Idle for 100 frames to verify all particles return to pool
  for (let frame = 0; frame < 100; frame++) {
    ps.updateAndRender(ctx, 800, 600);
  }

  assert.equal(ps.particles.length, 0, 'All particles must fully decay and return to pool when idle');
  assert.equal(ps.pool.length, totalAllocated, 'Pool size must equal total allocated objects when idle');
});

// ============================================================================
// SUITE 4: WEB AUDIO PROCEDURAL SYNTHESIZER NODES LIFECYCLE & DEGRADATION
// ============================================================================
console.log('\n--- SUITE 4: Web Audio Procedural Synthesizer Lifecycle & Degradation ---');

class MockAudioParam {
  constructor(defaultValue = 0) {
    this.value = defaultValue;
    this.events = [];
  }
  setValueAtTime(val, time) {
    this.events.push({ type: 'setValueAtTime', val, time });
    this.value = val;
  }
  exponentialRampToValueAtTime(val, time) {
    this.events.push({ type: 'exponentialRampToValueAtTime', val, time });
    this.value = val;
  }
  linearRampToValueAtTime(val, time) {
    this.events.push({ type: 'linearRampToValueAtTime', val, time });
    this.value = val;
  }
}

class MockAudioNode {
  constructor(ctx) {
    this.ctx = ctx;
    this.connectedTo = [];
  }
  connect(dest) {
    this.connectedTo.push(dest);
  }
  disconnect() {
    this.connectedTo = [];
  }
}

class MockOscillatorNode extends MockAudioNode {
  constructor(ctx) {
    super(ctx);
    this.type = 'sine';
    this.frequency = new MockAudioParam(440);
    this.started = false;
    this.stopped = false;
    this.startTime = null;
    this.stopTime = null;
  }
  start(time) {
    this.started = true;
    this.startTime = time;
  }
  stop(time) {
    this.stopped = true;
    this.stopTime = time;
  }
}

class MockGainNode extends MockAudioNode {
  constructor(ctx) {
    super(ctx);
    this.gain = new MockAudioParam(1.0);
  }
}

class MockBiquadFilterNode extends MockAudioNode {
  constructor(ctx) {
    super(ctx);
    this.type = 'lowpass';
    this.frequency = new MockAudioParam(1000);
    this.Q = new MockAudioParam(1.0);
  }
}

class MockAudioBufferSourceNode extends MockAudioNode {
  constructor(ctx) {
    super(ctx);
    this.buffer = null;
    this.started = false;
    this.stopped = false;
    this.startTime = null;
    this.stopTime = null;
  }
  start(time) {
    this.started = true;
    this.startTime = time;
  }
  stop(time) {
    this.stopped = true;
    this.stopTime = time;
  }
}

class MockAudioContext {
  constructor(initialState = 'running') {
    this.state = initialState;
    this.currentTime = 100.0;
    this.sampleRate = 44100;
    this.destination = new MockAudioNode(this);
    this.createdNodes = [];
  }

  createOscillator() {
    const osc = new MockOscillatorNode(this);
    this.createdNodes.push(osc);
    return osc;
  }

  createGain() {
    const gain = new MockGainNode(this);
    this.createdNodes.push(gain);
    return gain;
  }

  createBiquadFilter() {
    const filter = new MockBiquadFilterNode(this);
    this.createdNodes.push(filter);
    return filter;
  }

  createBuffer(channels, length, sampleRate) {
    const channelData = new Float32Array(length);
    return {
      numberOfChannels: channels,
      length,
      sampleRate,
      getChannelData: () => channelData
    };
  }

  createBufferSource() {
    const src = new MockAudioBufferSourceNode(this);
    this.createdNodes.push(src);
    return src;
  }

  async resume() {
    this.state = 'running';
  }

  advanceTime(seconds) {
    this.currentTime += seconds;
  }
}

// Load and instantiate SoundEffectsServiceImpl
import { SoundEffectsServiceImpl } from '../src/services/soundEffects.ts';

test('Web Audio: Graceful degradation when window.AudioContext is undefined (SSR or unsupported)', () => {
  // Test with undefined window/audioContext
  const service = new SoundEffectsServiceImpl();
  // Should not throw on any method call
  assert.doesNotThrow(() => service.playAppOpen());
  assert.doesNotThrow(() => service.playTap());
  assert.doesNotThrow(() => service.playSuccess());
  assert.doesNotThrow(() => service.playInterventionShield());
  assert.doesNotThrow(() => service.playBrushStroke(1.2));
  assert.doesNotThrow(() => service.playSparkle(1.5));
  assert.doesNotThrow(() => service.playStarBurst());
  assert.doesNotThrow(() => service.playTimerTick(true));
  assert.doesNotThrow(() => service.playVictoryFanfare());
  assert.doesNotThrow(() => service.vibrate([10, 20]));
});

test('Web Audio: Synthetic Nodes Lifecycle & Exponential Decay verification', () => {
  const mockCtx = new MockAudioContext('running');
  // Inject mock window and AudioContext
  Object.defineProperty(globalThis, 'window', {
    value: { AudioContext: function() { return mockCtx; } },
    configurable: true,
    writable: true
  });
  try {
    Object.defineProperty(globalThis.navigator, 'vibrate', {
      value: () => true,
      configurable: true,
      writable: true
    });
  } catch {
    // navigator.vibrate already mocked or not configurable
  }

  const service = new SoundEffectsServiceImpl();

  // Test 1: playAppOpen
  service.playAppOpen();
  const oscAppOpen = mockCtx.createdNodes.find(n => n instanceof MockOscillatorNode);
  const gainAppOpen = mockCtx.createdNodes.find(n => n instanceof MockGainNode);
  assert.ok(oscAppOpen && oscAppOpen.started && oscAppOpen.stopped);
  assert.equal(oscAppOpen.type, 'sine');
  assert.ok(gainAppOpen.gain.events.some(e => e.type === 'exponentialRampToValueAtTime' && e.val === 0.0001));

  // Test 2: playVictoryFanfare (Polyphonic 5-voice chord)
  mockCtx.createdNodes = [];
  service.playVictoryFanfare();
  const fanfareOscs = mockCtx.createdNodes.filter(n => n instanceof MockOscillatorNode);
  assert.equal(fanfareOscs.length, 5, 'Victory fanfare must generate exactly 5 polyphonic voices');
  fanfareOscs.forEach(osc => {
    assert.ok(osc.started && osc.stopped);
    assert.ok(osc.stopTime > osc.startTime);
  });

  // Test 3: playBrushStroke (Rate limiting and noise buffer reuse)
  mockCtx.createdNodes = [];
  service.playBrushStroke(0.8);
  const brushNoiseSources = mockCtx.createdNodes.filter(n => n instanceof MockAudioBufferSourceNode);
  assert.equal(brushNoiseSources.length, 1, 'Brush stroke should produce 1 filtered noise source');
  assert.ok(brushNoiseSources[0].started && brushNoiseSources[0].stopped);

  // Immediate second call within 40ms should be rate-limited
  mockCtx.createdNodes = [];
  service.playBrushStroke(1.0);
  assert.equal(mockCtx.createdNodes.length, 0, 'Brush stroke within 40ms must be throttled');

  // Test 4: playSparkle (FM Synthesizer carrier & modulator connection)
  mockCtx.createdNodes = [];
  service.playSparkle(1.2);
  const sparkleOscs = mockCtx.createdNodes.filter(n => n instanceof MockOscillatorNode);
  assert.equal(sparkleOscs.length, 2, 'Sparkle must generate 2 oscillators (carrier + modulator)');
  const modulator = sparkleOscs[1];
  const modGain = mockCtx.createdNodes.find(n => n instanceof MockGainNode && n.connectedTo[0] instanceof MockAudioParam);
  assert.ok(modGain, 'Modulator gain must connect to Carrier frequency audio param for FM synthesis');

  // Test 5: playStarBurst (Dual oscillator surge)
  mockCtx.createdNodes = [];
  service.playStarBurst();
  const starOscs = mockCtx.createdNodes.filter(n => n instanceof MockOscillatorNode);
  assert.equal(starOscs.length, 2, 'StarBurst must generate 2 oscillators (surge voice + high shimmer)');

  // Clean up global
  delete globalThis.window;
});

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n================================================================');
console.log(`TOTAL TESTS: ${totalTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
