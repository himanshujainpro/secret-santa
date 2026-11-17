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

// Fullscreen Festive Gift & Confetti Rain Animation
export function triggerGiftRain() {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.id = "gift-rain-canvas";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);

  const EMOJIS = ["🎁", "✨", "❄️", "🎉", "⭐", "🎁"];
  const COLORS = ["#4871C5", "#BC0070", "#F59E0B", "#10B981", "#8B5CF6"];

  const particles = [];
  const TOTAL_PARTICLES = 50;

  for (let i = 0; i < TOTAL_PARTICLES; i++) {
    const isEmoji = Math.random() > 0.45;
    particles.push({
      x: Math.random() * width,
      y: -50 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 3,
      vy: 2.5 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 6,
      size: isEmoji ? 24 + Math.random() * 12 : 8 + Math.random() * 6,
      isEmoji,
      char: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 1,
    });
  }

  let animationFrame;
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      if (elapsed > 2500) {
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
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
      }
      ctx.restore();
    });

    if (elapsed < 4000) {
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
