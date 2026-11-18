// Pure client-side Web Audio API Sound Effects (no external files needed)
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playTone(freq, type = "sine", duration = 0.2, delay = 0, volume = 0.15) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  // Celebratory holiday fanfare / harp arpeggio
  fanfare() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      this.playTone(freq, "triangle", 0.4, idx * 0.1, 0.2);
    });
  }

  // Grand Inauguration / Shehnai royal fanfare
  shehnaiInauguration() {
    if (this.muted) return;
    // Festive Indian wedding / shop opening celebration melody (Raag Bilawal / Shankara triumphant notes)
    const melody = [
      { f: 523.25, d: 0.15, t: 0 },       // Sa (C5)
      { f: 587.33, d: 0.15, t: 0.12 },    // Re (D5)
      { f: 659.25, d: 0.2, t: 0.24 },     // Ga (E5)
      { f: 783.99, d: 0.25, t: 0.38 },    // Pa (G5)
      { f: 880.00, d: 0.25, t: 0.52 },    // Dha (A5)
      { f: 1046.50, d: 0.45, t: 0.68 },   // Sa' (C6)
      { f: 1174.66, d: 0.25, t: 1.0 },    // Re' (D6)
      { f: 1318.51, d: 0.35, t: 1.18 },   // Ga' (E6)
      { f: 1567.98, d: 0.7, t: 1.4 },     // Pa' (G6)
      { f: 2093.00, d: 1.0, t: 1.8 }      // High Sa'' (C7)
    ];

    melody.forEach((note) => {
      this.playTone(note.f, "triangle", note.d, note.t, 0.22);
      // Harmonics for brass/shehnai richness
      this.playTone(note.f * 1.5, "sine", note.d * 0.8, note.t, 0.08);
    });
  }

  // Scissor Snip Sound
  snip() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      // High metallic snip sound
      this.playTone(2400, "square", 0.04, 0, 0.25);
      this.playTone(1800, "sawtooth", 0.06, 0.02, 0.2);
      this.playTone(800, "triangle", 0.1, 0.05, 0.15);
    } catch {}
  }

  // Flower throw wind chime
  flowerChime() {
    if (this.muted) return;
    const chimeFrequencies = [1046.5, 1318.5, 1567.98, 1760.0, 2093.0];
    chimeFrequencies.forEach((freq, idx) => {
      this.playTone(freq, "sine", 0.35, idx * 0.04, 0.08);
    });
  }

  // Cheerful soft pop for reveals
  pop() {
    if (this.muted) return;
    this.playTone(587.33, "sine", 0.15, 0, 0.2); // D5
    this.playTone(880, "triangle", 0.2, 0.05, 0.25); // A5
  }

  // Fast playful tick for roulette / rolling
  roulette() {
    if (this.muted) return;
    [0, 0.06, 0.12, 0.18, 0.24].forEach((delay) => {
      this.playTone(400 + Math.random() * 300, "sine", 0.05, delay, 0.1);
    });
  }

  // Timer finish chime
  ding() {
    if (this.muted) return;
    this.playTone(880, "sine", 0.6, 0, 0.2);
    this.playTone(1760, "triangle", 0.8, 0.05, 0.1);
  }
}

export const sounds = new SoundManager();

// Fullscreen Festive Flower & Rose Petals Rain Animation (Shubh Inauguration)
export function triggerFlowerRain(grand = false) {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.id = "flower-rain-canvas";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const PETALS = ["🌸", "🌹", "🌼", "🌺", "✨", "🏵️", "💐", "🎁", "✨"];
  const PETAL_COLORS = ["#E11D48", "#FB7185", "#FBBF24", "#F43F5E", "#F59E0B", "#FDA4AF"];

  const count = grand ? 85 : 35;
  const particles = [];

  for (let i = 0; i < count; i++) {
    const isEmoji = Math.random() > 0.4;
    particles.push({
      x: Math.random() * width,
      y: -40 - Math.random() * (grand ? 400 : 150),
      vx: (Math.random() - 0.5) * 2.5,
      vy: 2.0 + Math.random() * 3.5,
      wobbleSpeed: 0.03 + Math.random() * 0.05,
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleRadius: 15 + Math.random() * 25,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 4,
      size: isEmoji ? 24 + Math.random() * 14 : 10 + Math.random() * 8,
      isEmoji,
      char: PETALS[Math.floor(Math.random() * PETALS.length)],
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      opacity: 1,
    });
  }

  let animationFrame;
  const startTime = Date.now();
  const maxDuration = grand ? 5000 : 3000;

  function animate() {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      // Natural floating fluttering physics like real falling rose petals
      p.y += p.vy;
      p.x += p.vx + Math.sin(elapsed * p.wobbleSpeed + p.wobbleOffset) * 1.5;
      p.rotation += p.rotationSpeed;

      if (elapsed > maxDuration - 1200) {
        p.opacity = Math.max(0, p.opacity - 0.02);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;

      if (p.isEmoji) {
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.char, 0, 0);
      } else {
        // Draw realistic petal oval
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.8, p.size * 0.5, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.restore();
    });

    if (elapsed < maxDuration) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(animationFrame);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  animationFrame = requestAnimationFrame(animate);
}

// Fullscreen Festive Gift & Confetti Rain Animation
export function triggerGiftRain() {
  triggerFlowerRain(true);
}
