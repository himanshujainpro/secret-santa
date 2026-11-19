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

  // Authentic Thunderous Crowd Applause & Cheering (Primary High-Volume Inauguration Audio)
  applause(duration = 5.5) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const sampleRate = this.ctx.sampleRate;

      // 1. Crowd Cheering Harmonizer (Exuberant roaring lift)
      const cheerPitches = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      cheerPitches.forEach((pitch, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = i % 2 === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(pitch + (Math.random() * 20 - 10), now);
        osc.frequency.exponentialRampToValueAtTime(pitch * 1.15, now + 1.2);

        filter.type = "bandpass";
        filter.frequency.setValueAtTime(pitch, now);
        filter.Q.setValueAtTime(2.2, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.35);
        gain.gain.setValueAtTime(0.18, now + duration * 0.65);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });

      // 2. High-Density Applause Noise Swell (High-volume stadium clapping)
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const t = i / sampleRate;
        const swell = Math.sin((t / duration) * Math.PI);
        // Dynamic clapping modulation
        const burstMod = 0.55 + 0.45 * Math.sin(t * 42 + Math.sin(t * 12) * 3);
        data[i] = (Math.random() * 2 - 1) * swell * burstMod;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const clapFilter = this.ctx.createBiquadFilter();
      clapFilter.type = "bandpass";
      clapFilter.frequency.setValueAtTime(1400, now);
      clapFilter.Q.setValueAtTime(1.6, now);

      const clapGain = this.ctx.createGain();
      clapGain.gain.setValueAtTime(0.001, now);
      // High volume punch
      clapGain.gain.linearRampToValueAtTime(0.55, now + 0.28);
      clapGain.gain.setValueAtTime(0.55, now + duration * 0.7);
      clapGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(clapFilter);
      clapFilter.connect(clapGain);
      clapGain.connect(this.ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);

      // 3. Foreground Staccato Handclaps (Crisp individual palm impacts across the room)
      const clapCount = Math.max(50, Math.floor(duration * 14));
      for (let c = 0; c < clapCount; c++) {
        const clapTime = now + 0.05 + Math.random() * (duration * 0.88);
        const clapLen = Math.floor(sampleRate * 0.045);
        const clapBuf = this.ctx.createBuffer(1, clapLen, sampleRate);
        const cd = clapBuf.getChannelData(0);
        for (let j = 0; j < clapLen; j++) {
          cd[j] = (Math.random() * 2 - 1) * Math.exp(-j / (clapLen * 0.2));
        }

        const singleSource = this.ctx.createBufferSource();
        singleSource.buffer = clapBuf;

        const singleFilter = this.ctx.createBiquadFilter();
        singleFilter.type = "bandpass";
        singleFilter.frequency.value = 1100 + Math.random() * 950;
        singleFilter.Q.value = 2.2;

        const singleGain = this.ctx.createGain();
        singleGain.gain.setValueAtTime(0.35, clapTime);
        singleGain.gain.exponentialRampToValueAtTime(0.0001, clapTime + 0.042);

        singleSource.connect(singleFilter);
        singleFilter.connect(singleGain);
        singleGain.connect(this.ctx.destination);

        singleSource.start(clapTime);
      }
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

  // Suspense Drumroll for Chief Guest and Mystery Reveal
  drumroll() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const count = 30;
      const totalDuration = 2.0; // 2 seconds drumroll
      for (let i = 0; i < count; i++) {
        // Accelerating and intensifying hits
        const progress = i / count;
        const timeOffset = Math.pow(progress, 1.4) * totalDuration;
        const freq = 110 + progress * 90 + (Math.random() * 20 - 10);
        this.playTone(freq, "triangle", 0.06, timeOffset, 0.1 + progress * 0.15);
      }
      // Climax crash / fanfare at the end
      setTimeout(() => {
        this.playTone(880, "triangle", 0.8, 0, 0.25);
        this.playTone(1760, "sine", 0.6, 0.05, 0.2);
        this.playTone(2640, "sine", 0.4, 0.1, 0.15);
      }, 2050);
    } catch {}
  }

  // Tech Power-Up sound for dev tools shower
  techPowerUp() {
    if (this.muted) return;
    const freqs = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
    freqs.forEach((freq, idx) => {
      this.playTone(freq, "sine", 0.15, idx * 0.04, 0.12);
    });
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

// -----------------------------------------------------------------------------
// 30 Authentic Real Developer Tools (Android Studio, Python, Java, Google, etc.)
// -----------------------------------------------------------------------------
export const DEV_TOOLS = [
  { id: "android", name: "Android Studio", color: "#3DDC84", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#3DDC84" d="M17.5 15.3c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1m-11 0c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1m11.4-6l2-3.5a.4.4 0 00-.2-.6.4.4 0 00-.6.2l-2 3.5C15.6 8.4 13.9 8.1 12 8.1s-3.6.3-5.1.9L4.8 5.4a.4.4 0 00-.6-.2.4.4 0 00-.2.6l2 3.5C2.7 11.2.3 14.7 0 18.8h24c-.3-4.1-2.7-7.6-6.1-9.5z"/></svg>` },
  { id: "python", name: "Python", color: "#FFD438", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#3776AB" d="M11.9 2C7 2 7.3 4.1 7.3 4.1l.01 2.2h4.7v.7H5.3S2 6.6 2 11.6c0 5 2.9 4.8 2.9 4.8h1.7v-2.5c0-2.8 2.4-2.6 2.4-2.6h4.6s2.3 0 2.3-2.3V4.4S16.5 2 11.9 2zm-2.4 1.4a.9.9 0 110 1.8.9.9 0 010-1.8z"/><path fill="#FFD438" d="M12.1 22c4.9 0 4.6-2.1 4.6-2.1l-.01-2.2H12v-.7h6.7s3.3.4 3.3-4.6c0-5-2.9-4.8-2.9-4.8h-1.7v2.5c0 2.8-2.4 2.6-2.4 2.6h-4.6s-2.3 0-2.3 2.3v4.6S7.5 22 12.1 22zm2.4-1.4a.9.9 0 110-1.8.9.9 0 010 1.8z"/></svg>` },
  { id: "java", name: "Java", color: "#F89820", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#5382A1" d="M8.8 16.8c-.9 0-1.6.1-2 .2.3-.5.9-.9 1.6-1.3.6-.3 1.3-.6 2.2-.9-.5.6-.9 1.2-1.1 1.7-.2.2-.5.3-.7.3zm7.3-3.7c-1.3.3-3.1.9-4.7 1.6.4-.6.8-1.2 1.1-1.8 1.1.1 2.4.2 3.6.2z"/><path fill="#E76F00" d="M4.5 19.5c4.8 1.4 11.2 1.4 15.5 0 .7-.2 1.2-.5 1.2-.9 0-.9-2.5-1.7-6.2-2 1.8-.7 3.3-1.6 3.3-2.6 0-1.6-3.8-2.6-9.1-2.6-.9 0-1.7 0-2.5.1 1.6-.7 3.6-1.2 5.9-1.2 1.3 0 2.5.2 3.6.5-.2-.9-.8-1.7-1.7-2.3 2.1.2 3.8 1.2 4.4 2.5.4-.1.7-.1 1.1-.1 1.7 0 2.8.7 2.8 1.7 0 .9-.9 1.6-2.3 1.9 1 .5 1.5 1.1 1.5 1.8 0 1.5-2.2 2.7-5.5 3.1 3.5.5 5.8 1.5 5.8 2.6 0 1.8-6.1 2.8-14.7 1.9-2.5-.3-4.3-.8-4.7-1.4-.4-.5-.1-1.2.9-1.6z"/><path fill="#5382A1" d="M9.1 1.5c1.2 1.4.6 2.8-.7 4.2-1.2 1.3-1 2.4.5 3.6-1.8-1.5-2-3-.7-4.3 1.2-1.3 1.5-2.2.9-3.5zm3.8 1.5c1.2 1.2.6 2.4-.6 3.6-1.1 1.1-.9 2 .5 3-1.6-1.3-1.8-2.6-.6-3.7 1.1-1.1 1.3-1.9.7-2.9z"/></svg>` },
  { id: "google", name: "Google", color: "#4285F4", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#4285F4" d="M23.7 12.3c0-.7-.1-1.4-.2-2.1H12v4.5h6.6c-.3 1.5-1.1 2.8-2.4 3.7v3.1h3.9c2.3-2.1 3.6-5.2 3.6-9.2z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3.1c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.8-2.1-6.7-4.9H1.3v3.2C3.3 21.4 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.3 14.3c-.3-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3V6.6H1.3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l4-3.1z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4C18 1.2 15.2 0 12 0 7.3 0 3.3 2.6 1.3 6.6l4 3.1c1-2.8 3.6-4.9 6.7-4.9z"/></svg>` },
  { id: "gcp", name: "Google Cloud", color: "#4285F4", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#EA4335" d="M19.4 10C18.7 6.6 15.6 4 12 4 9.1 4 6.6 5.6 5.4 8 2.3 8.4 0 10.9 0 14c0 3.3 2.7 6 6 6h13c2.8 0 5-2.2 5-5 0-2.6-2-4.8-4.6-5z"/><path fill="#4285F4" d="M19 18H6c-2.2 0-4-1.8-4-4 0-2.1 1.5-3.8 3.6-4l1.1-.1.5-1C8.1 7.1 9.9 6 12 6c2.6 0 4.9 1.9 5.4 4.4l.3 1.5 1.5.1c1.6.1 2.8 1.4 2.8 3 0 1.7-1.4 3-3 3z"/><circle cx="12" cy="12" r="3" fill="#FBBC05"/></svg>` },
  { id: "antigravity", name: "Antigravity", color: "#818CF8", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#818CF8" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/><circle cx="18" cy="6" r="2" fill="#F43F5E"/><circle cx="6" cy="18" r="1.5" fill="#38BDF8"/></svg>` },
  { id: "vscode", name: "VS Code", color: "#007ACC", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#007ACC" d="M23.2 2.6L18.2.2a1.5 1.5 0 00-1.7.3l-9.5 8.6-4.1-3.1a1 1 0 00-1.3 0L.3 7.3a1 1 0 00-.1 1.5L4.3 12 .3 15.2a1 1 0 00.1 1.5l1.3 1.2a1 1 0 001.3 0l4.1-3.1 9.5 8.6a1.5 1.5 0 001.7.3l4.9-2.4a1.5 1.5 0 00.9-1.4V3.9a1.5 1.5 0 00-.9-1.3zm-5.2 14.9L10.9 12l7.1-5.4v10.9z"/></svg>` },
  { id: "docker", name: "Docker", color: "#2496ED", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#2496ED" d="M14 11.1h2.1v-2H14v2zm-3-5.4h2.1v-2H11v2zm0 2.7h2.1v-2H11v2zm-3 0h2.1v-2H8v2zm-3 0h2.1v-2H5v2zm5.9 2.7h2.1v-2H11v2zm-2.9 0h2.1v-2H8v2zm-3 0h2.1v-2H5v2zm-3 0h2.1v-2H2v2zm21.6 1.2c-.6-.4-1.7-.5-2.6-.2-.2-.8-.7-1.5-1.4-1.9l-.4-.3-.3.4c-.4.5-.7 1.1-.7 1.8 0 .4.1.9.3 1.3-.4.2-.8.3-1.6.3H1.4c-.2 0-.4.1-.5.2-.1.1-.2.3-.1.5.6 3.5 3.5 7 9.1 7 6.6 0 10.9-3.8 12.4-8.9.6.1 1.5-.1 1.9-.7.1-.2.1-.5 0-.7z"/></svg>` },
  { id: "kubernetes", name: "Kubernetes", color: "#326CE5", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#326CE5" d="M11.7 0a1.9 1.9 0 00-.9.3L2.6 5.1a1.9 1.9 0 00-.9 1.6v9.6c0 .7.4 1.3.9 1.6l8.2 4.8c.3.2.6.3.9.3a1.9 1.9 0 00.9-.3l8.2-4.8c.6-.3.9-.9.9-1.6V6.7c0-.7-.4-1.3-.9-1.6l-8.2-4.8a1.9 1.9 0 00-1-.3zm.3 2.1l7.5 4.4v8.7L12 19.6l-7.5-4.4V6.5L12 2.1z"/><circle cx="12" cy="12" r="3.2" fill="#326CE5"/></svg>` },
  { id: "react", name: "React", color: "#61DAFB", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><ellipse cx="12" cy="12" rx="4" ry="11" fill="none" stroke="#61DAFB" stroke-width="1.5" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="4" ry="11" fill="none" stroke="#61DAFB" stroke-width="1.5" transform="rotate(90 12 12)"/><ellipse cx="12" cy="12" rx="4" ry="11" fill="none" stroke="#61DAFB" stroke-width="1.5" transform="rotate(150 12 12)"/><circle cx="12" cy="12" r="2" fill="#61DAFB"/></svg>` },
  { id: "nextjs", name: "Next.js", color: "#FFFFFF", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="11" fill="#000000" stroke="#FFFFFF" stroke-width="1.5"/><path fill="#FFFFFF" d="M14.9 16.5L8.5 8.2v7.5H7V7.5h1.8l6.8 8.7V7.5h1.5v9h-2.2z"/></svg>` },
  { id: "spring", name: "Spring Boot", color: "#6DB33F", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#6DB33F" d="M21.2 5.8C20 4.6 15.6 4 10.4 8.7c-4.4 4-5.3 8.3-5.3 10.8 0 .4.3.7.7.7 2.6 0 6.8-.9 10.8-5.3 4.7-5.1 4.1-9.5 2.9-10.7-.7.9-1.7 1.8-3 2.7-3.2 2.2-6.2 3.6-7.8 4.2 1.3-1.6 3-3.9 5.3-6 1-.9 1.9-1.7 2.9-2.6z"/></svg>` },
  { id: "redis", name: "Redis", color: "#DC382D", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#DC382D" d="M21.8 7.3L12.3 2.5a.7.7 0 00-.6 0L2.2 7.3a.7.7 0 000 1.2l9.5 4.8c.2.1.4.1.6 0l9.5-4.8a.7.7 0 000-1.2zM2.2 12.3l9.5 4.8c.2.1.4.1.6 0l9.5-4.8a.7.7 0 01.7 1.2l-9.5 4.8a.7.7 0 01-.6 0L2.9 13.5a.7.7 0 01-.7-1.2zm0 5l9.5 4.8c.2.1.4.1.6 0l9.5-4.8a.7.7 0 01.7 1.2l-9.5 4.8a.7.7 0 01-.6 0L2.9 18.5a.7.7 0 01-.7-1.2z"/></svg>` },
  { id: "github", name: "GitHub", color: "#F0F6FC", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#F0F6FC" d="M12 .3C5.4.3 0 5.7 0 12.3c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6C20.6 22.1 24 17.6 24 12.3c0-6.6-5.4-12-12-12z"/></svg>` },
  { id: "git", name: "Git", color: "#F05032", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#F05032" d="M23.5 10.9L13.1.5a1.5 1.5 0 00-2.1 0L8.8 2.6l3.2 3.2a1.8 1.8 0 011.8 1.8l3.1 3.1a1.8 1.8 0 11-1.1 1.1l-2.9-2.9v5.5a1.8 1.8 0 11-1.5 0V8.7a1.8 1.8 0 01-1-1L7.4 4.6.5 11.5a1.5 1.5 0 000 2.1l10.5 10.5a1.5 1.5 0 002.1 0l10.5-10.5a1.5 1.5 0 00-.1-2.7z"/></svg>` },
  { id: "typescript", name: "TypeScript", color: "#3178C6", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><rect width="24" height="24" rx="3" fill="#3178C6"/><path fill="#FFFFFF" d="M4 8h8v2H9v7H7v-7H4V8zm9.5 4.5c.8-.8 2-1 3.2-.8 1.2.3 2 1.2 2 2.5 0 2.2-2.3 2.8-3.4 3.3-.8.4-1.2.6-1.2 1.1 0 .6.5.9 1.3.9 1 0 1.8-.4 2.4-1l1.1 1.4c-.9 1-2.1 1.4-3.5 1.4-2.2 0-3.6-1.2-3.6-2.9 0-2.1 2.2-2.7 3.3-3.2.8-.4 1.3-.6 1.3-1.1 0-.5-.4-.8-1.1-.8-.8 0-1.5.3-2.1.8l-.9-1.6z"/></svg>` },
  { id: "nodejs", name: "Node.js", color: "#5FA04E", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#5FA04E" d="M12 1L2 6.8v11.5L12 24l10-5.8V6.8L12 1zm0 2.3l8 4.6v9.2l-8 4.6-8-4.6V7.9l8-4.6zm-1 6.5v6.4h2V12l3.5 4.2h2.5L14.7 11l3.8-4.2h-2.5L13 10V6.8h-2v3z"/></svg>` },
  { id: "postgres", name: "PostgreSQL", color: "#336791", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#336791" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 16.5c-2.5 0-4.5-1.2-5.5-3.2.7-.3 1.5-.5 2.5-.5 1.5 0 2.7.5 3.5 1.2.8-.7 2-1.2 3.5-1.2 1 0 1.8.2 2.5.5-1 2-3 3.2-6.5 3.2zm4-6.5c-.8 0-1.5-.7-1.5-1.5S16.2 9 17 9s1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-8 0c-.8 0-1.5-.7-1.5-1.5S8.2 9 9 9s1.5.7 1.5 1.5-.7 1.5-1.5 1.5z"/></svg>` },
  { id: "mongodb", name: "MongoDB", color: "#47A248", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#47A248" d="M12.6 1.2c-.3-.3-.8-.3-1.1 0C9.7 3 4.5 9 4.5 14.8c0 4.2 3.4 7.7 7.5 7.7 4.1 0 7.5-3.5 7.5-7.7 0-5.8-5.2-11.8-6.9-13.6zM12 20.5c-3.1 0-5.6-2.5-5.6-5.7 0-3.5 2.7-7.6 5.6-10.7 2.9 3.1 5.6 7.2 5.6 10.7 0 3.2-2.5 5.7-5.6 5.7z"/></svg>` },
  { id: "mysql", name: "MySQL", color: "#00758F", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#00758F" d="M12 3C7 3 2.8 6.5 2 11.2c-.3 1.8 0 3.7.8 5.3 1.4 2.8 4.2 4.7 7.4 5.2 3.8.6 7.6-.8 10.1-3.7.6-.7.4-1.8-.4-2.2-.8-.4-1.8-.2-2.3.5-1.8 2.1-4.6 3.1-7.4 2.7-2.3-.3-4.3-1.7-5.3-3.8-.5-1.1-.7-2.4-.5-3.6.6-3.4 3.7-6 7.2-6 3.1 0 5.9 1.9 7 4.8.3.8 1.2 1.3 2 1 .8-.3 1.3-1.2 1-2C20.1 5.5 16.3 3 12 3z"/><circle cx="8" cy="11" r="1.5" fill="#F29111"/></svg>` },
  { id: "aws", name: "AWS", color: "#FF9900", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#FF9900" d="M19.8 16.2c-2.4 1.7-5.5 2.6-8.6 2.6-4.3 0-8.2-1.6-11.2-4.3-.2-.2-.2-.6 0-.8.3-.3.7-.3.9-.1 2.8 2.5 6.4 4 10.3 4 2.8 0 5.6-.8 7.8-2.3.4-.3.9-.1 1.1.3.2.4 0 .9-.3 1.2z"/><path fill="#FF9900" d="M21.5 14.8c-.3-.4-1.8-.2-2.7-.1-.3 0-.4-.2-.3-.5.7-1.3 1.7-2.1 2.1-2 .4.1.6 1.4.1 2.8-.1.2.2.4.4.2.7-.7 1.8-2.2 1.6-2.7-.2-.4-1.3-.2-2.2.1z"/><path fill="#FFFFFF" d="M7 6.5h2l2.5 6.5H10l-.5-1.5H6.5L6 13H4.5L7 6.5zm.7 3.8h1.6L8.5 7.8 7.7 10.3z"/></svg>` },
  { id: "linux", name: "Linux", color: "#FCC624", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#E95420"/><circle cx="12" cy="5" r="2" fill="#FFFFFF"/><circle cx="6" cy="16" r="2" fill="#FFFFFF"/><circle cx="18" cy="16" r="2" fill="#FFFFFF"/></svg>` },
  { id: "tailwind", name: "Tailwind CSS", color: "#38BDF8", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#38BDF8" d="M12 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.6.9 2.3 1.6 1.2 1.2 2.5 2.6 5.5 2.6 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.6-.9-2.3-1.6C16.3 6.2 15 4.8 12 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.9.2 1.6.9 2.3 1.6 1.2 1.2 2.5 2.6 5.5 2.6 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.9-.2-1.6-.9-2.3-1.6C10.3 13.4 9 12 6 12z"/></svg>` },
  { id: "postman", name: "Postman", color: "#FF6C37", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#FF6C37"/><path fill="#FFFFFF" d="M12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm3.5 6.8l-4 2.3c-.3.2-.7 0-.7-.4V10c0-.4.4-.6.7-.4l4 2.3c.3.2.3.7 0 .9z"/></svg>` },
  { id: "figma", name: "Figma", color: "#A259FF", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#0ACF83" d="M8 24a4 4 0 01-4-4 4 4 0 014-4h4v4a4 4 0 01-4 4z"/><path fill="#A259FF" d="M4 12a4 4 0 014-4h4v8H8a4 4 0 01-4-4z"/><path fill="#F24E1E" d="M4 4a4 4 0 014-4h4v8H8a4 4 0 01-4-4z"/><path fill="#FF7262" d="M12 0h4a4 4 0 014 4 4 4 0 01-4 4h-4V0z"/><circle cx="16" cy="12" r="4" fill="#1ABCFE"/></svg>` },
  { id: "graphql", name: "GraphQL", color: "#E10098", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" stroke="#E10098" stroke-width="1.6" d="M12 2l8.7 5v10L12 22l-8.7-5V7L12 2z"/><path fill="none" stroke="#E10098" stroke-width="1.6" d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/><circle cx="12" cy="2" r="2" fill="#E10098"/><circle cx="20.7" cy="7" r="2" fill="#E10098"/><circle cx="20.7" cy="17" r="2" fill="#E10098"/><circle cx="12" cy="22" r="2" fill="#E10098"/><circle cx="3.3" cy="17" r="2" fill="#E10098"/><circle cx="3.3" cy="7" r="2" fill="#E10098"/></svg>` },
  { id: "vercel", name: "Vercel", color: "#FFFFFF", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#FFFFFF" d="M12 2L24 22H0L12 2z"/></svg>` },
  { id: "rust", name: "Rust", color: "#DEA584", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="8" fill="none" stroke="#DEA584" stroke-width="2.5" stroke-dasharray="2 1.5"/><path fill="#DEA584" d="M10 7h3a2.5 2.5 0 012 4c-.5.7-1.3 1-2 1l2.5 5h-2L11.5 12H11v5h-2V7h1zm1 3.5h1.5a1 1 0 000-2H11v2z"/></svg>` },
  { id: "cpp", name: "C++", color: "#00599C", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#00599C" d="M12 2L2 7.8v11.5L12 24l10-4.7V7.8L12 2z"/><path fill="#FFFFFF" d="M11 9c-1.7 0-3 1.3-3 3s1.3 3 3 3c1 0 2-.5 2.5-1.3l-1.3-.8c-.3.4-.7.6-1.2.6-.9 0-1.6-.7-1.6-1.5s.7-1.5 1.6-1.5c.5 0 .9.2 1.2.6l1.3-.8c-.5-.8-1.5-1.3-2.5-1.3zm4 2h1v1h-1v1h-1v-1h-1v-1h1v-1h1v1zm3 0h1v1h-1v1h-1v-1h-1v-1h1v-1h1v1z"/></svg>` },
  { id: "intellij", name: "IntelliJ", color: "#FE315D", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><rect width="24" height="24" rx="4" fill="#000000"/><path fill="#FE315D" d="M3 3h18v18H3z"/><path fill="#FFFFFF" d="M6 6h2.5v12H6V6zm4.5 0h7v2.5h-4.5v2.2h4v2.5h-4v2.3h4.5V18h-7V6z"/></svg>` }
];

// Pre-cached SVG Image map for zero-lag 60fps canvas rendering
const toolImageMap = new Map();
let toolImagesInitialized = false;

function initToolImages() {
  if (typeof window === "undefined" || toolImagesInitialized) return;
  DEV_TOOLS.forEach((tool) => {
    try {
      const img = new Image();
      img.src = `data:image/svg+xml;utf8,${encodeURIComponent(tool.svg)}`;
      toolImageMap.set(tool.id, img);
    } catch {}
  });
  toolImagesInitialized = true;
}

if (typeof window !== "undefined") {
  initToolImages();
}

// Fullscreen Developer Stack & Tools Rain Animation (Extra-Large, Crystal-Clear Dark Badges)
export function triggerDevStackRain(grand = false) {
  if (typeof window === "undefined") return;

  initToolImages();

  const canvas = document.createElement("canvas");
  canvas.id = "devstack-rain-canvas";
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

  const count = grand ? 50 : 25;
  const particles = [];

  for (let i = 0; i < count; i++) {
    const tool = DEV_TOOLS[Math.floor(Math.random() * DEV_TOOLS.length)];
    particles.push({
      x: Math.random() * width,
      y: -90 - Math.random() * (grand ? 700 : 300),
      vx: (Math.random() - 0.5) * 2.2,
      vy: 2.2 + Math.random() * 3.0,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      wobbleOffset: Math.random() * Math.PI * 2,
      rotation: (Math.random() - 0.5) * 20, // subtle natural tilt
      rotationSpeed: (Math.random() - 0.5) * 0.8,
      radius: 44 + Math.random() * 14, // Extra large: 88px to 116px diameter!
      tool,
      opacity: 1,
    });
  }

  let animationFrame;
  const startTime = Date.now();
  const maxDuration = grand ? 5500 : 3800;

  function animate() {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.y += p.vy;
      p.x += p.vx + Math.sin(elapsed * p.wobbleSpeed + p.wobbleOffset) * 1.4;
      p.rotation += p.rotationSpeed;

      if (elapsed > maxDuration - 1100) {
        p.opacity = Math.max(0, p.opacity - 0.02);
      }

      // Gentle floating perspective: ALWAYS forward-facing so logos are crystal clear!
      const scaleX = 0.92 + 0.08 * Math.cos(elapsed * p.wobbleSpeed);
      const scaleY = 0.95 + 0.05 * Math.sin(elapsed * p.wobbleSpeed);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.scale(scaleX, scaleY);
      ctx.globalAlpha = p.opacity;

      const R = p.radius;

      // 1. Sleek Deep Dark Metallic Badge Background (High-contrast obsidian)
      const grad = ctx.createRadialGradient(0, -R * 0.1, 4, 0, 0, R);
      grad.addColorStop(0, "#1E293B"); // metallic highlight
      grad.addColorStop(0.7, "#0F172A"); // rich dark obsidian
      grad.addColorStop(1, "#020617"); // deep black rim
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, R, 0, Math.PI * 2);
      ctx.fill();

      // 2. Bold High-Contrast Glowing Rim in Official Tool Brand Color
      ctx.strokeStyle = p.tool.color;
      ctx.lineWidth = 3.2;
      ctx.shadowColor = p.tool.color;
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Extra-Large Crisp Real Brand SVG Icon (Occupies center prominently)
      const img = toolImageMap.get(p.tool.id);
      const iconSize = R * 1.25; // 55px to 72px massive icon!
      if (img && img.complete && img.naturalWidth !== 0) {
        ctx.drawImage(img, -iconSize / 2, -iconSize / 2 - 8, iconSize, iconSize);
      } else {
        // Monogram fallback
        ctx.fillStyle = p.tool.color;
        ctx.font = `bold ${Math.round(R * 0.7)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.tool.name.slice(0, 2), 0, -6);
      }

      // 4. Prominent Brand Name Pill Banner (High-contrast black & white)
      const pillW = R * 1.62;
      const pillH = R * 0.46;
      const pillY = R * 0.44;

      ctx.fillStyle = "rgba(2, 6, 23, 0.94)";
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(-pillW / 2, pillY, pillW, pillH, 8);
      } else {
        ctx.rect(-pillW / 2, pillY, pillW, pillH);
      }
      ctx.fill();

      ctx.strokeStyle = p.tool.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `800 ${Math.max(10, Math.round(R * 0.28))}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.tool.name, 0, pillY + pillH / 2 + 1);

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

// -----------------------------------------------------------------------------
// Team Member Name Badges (Custom Colorful Obsidian Medallions)
// -----------------------------------------------------------------------------
export const DEFAULT_TEAM_NAMES = [
  "Himanshu", "Saurabh", "Priya", "Rahul", "Ananya",
  "Vikram", "Neha", "Arjun", "Aditi", "Rohan", "Dev", "Sneha",
  "Kavita", "Amit", "Pooja", "Aman", "Ritu", "Deepak"
];

export const NAME_COLORS = [
  "#38BDF8", // Cyan neon
  "#EC4899", // Vibrant Pink
  "#10B981", // Emerald Green
  "#F59E0B", // Amber Gold
  "#8B5CF6", // Electric Purple
  "#F43F5E", // Rose Red
  "#06B6D4", // Sky Blue
  "#84CC16", // Lime
  "#A855F7", // Bright Violet
  "#F97316", // Vibrant Orange
  "#14B8A6", // Teal
  "#E11D48", // Crimson
];

export function getColleagueColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
  }
  return NAME_COLORS[Math.abs(hash) % NAME_COLORS.length];
}

export function extractInitials(name = "") {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "★";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function sanitizeNamesList(players = []) {
  let namesList = [];
  if (Array.isArray(players)) {
    players.forEach((p) => {
      if (typeof p === "string" && p.trim()) namesList.push(p.trim());
      else if (p && typeof p.name === "string" && p.name.trim()) namesList.push(p.name.trim());
    });
  }
  namesList = Array.from(new Set(namesList)).filter(Boolean);

  // STRICT REQUIREMENT: Only joined colleagues. No random mockup names when players have joined!
  if (namesList.length === 0) {
    return ["Join the Room!"];
  }
  return namesList;
}

// Fullscreen Teammates Name Badges Rain Animation (Sleek Compact VIP Capsules, Crystal-Clear 15px Bold Names)
export function triggerNameRain(players = [], grand = false) {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  canvas.id = "name-rain-canvas";
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

  const namesList = sanitizeNamesList(players);
  const count = grand ? 45 : 22;
  const particles = [];

  for (let i = 0; i < count; i++) {
    const rawName = namesList[Math.floor(Math.random() * namesList.length)];
    const color = getColleagueColor(rawName);
    const initials = extractInitials(rawName);

    // Calculate dynamic capsule width based on name length for perfect fit
    const capsuleW = Math.max(126, Math.min(176, 48 + rawName.length * 9.2));
    const capsuleH = 40;

    particles.push({
      x: Math.random() * width,
      y: -70 - Math.random() * (grand ? 600 : 250),
      vx: (Math.random() - 0.5) * 2.0,
      vy: 2.2 + Math.random() * 2.8,
      wobbleSpeed: 0.02 + Math.random() * 0.03,
      wobbleOffset: Math.random() * Math.PI * 2,
      rotation: (Math.random() - 0.5) * 14,
      rotationSpeed: (Math.random() - 0.5) * 0.6,
      width: capsuleW,
      height: capsuleH,
      name: rawName,
      initials,
      color,
      opacity: 1,
    });
  }

  let animationFrame;
  const startTime = Date.now();
  const maxDuration = grand ? 5500 : 3800;

  function animate() {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.y += p.vy;
      p.x += p.vx + Math.sin(elapsed * p.wobbleSpeed + p.wobbleOffset) * 1.3;
      p.rotation += p.rotationSpeed;

      if (elapsed > maxDuration - 1100) {
        p.opacity = Math.max(0, p.opacity - 0.02);
      }

      // Gentle floating perspective: forward-facing and readable at all times
      const scaleX = 0.94 + 0.06 * Math.cos(elapsed * p.wobbleSpeed);
      const scaleY = 0.97 + 0.03 * Math.sin(elapsed * p.wobbleSpeed);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.scale(scaleX, scaleY);
      ctx.globalAlpha = p.opacity;

      const w = p.width;
      const h = p.height;
      const r = h / 2;

      // 1. Sleek Deep Obsidian Metallic Capsule
      const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
      grad.addColorStop(0, "#0F172A");
      grad.addColorStop(0.5, "#1E293B");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") {
        ctx.roundRect(-w / 2, -h / 2, w, h, r);
      } else {
        ctx.rect(-w / 2, -h / 2, w, h);
      }
      ctx.fill();

      // 2. Glowing Neon Rim in the Colleague's vibrant signature color
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // 3. Left Avatar Circle with Initials
      const avatarX = -w / 2 + r;
      const avatarR = r - 4;
      const avGrad = ctx.createRadialGradient(avatarX, -1, 1, avatarX, 0, avatarR);
      avGrad.addColorStop(0, p.color);
      avGrad.addColorStop(1, "#0F172A");
      ctx.fillStyle = avGrad;
      ctx.beginPath();
      ctx.arc(avatarX, 0, avatarR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `900 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(p.initials, avatarX, 1);

      // 4. Large, Bold, Crystal-Clear Teammate Name (15px bold white with high-contrast shadow)
      let displayName = p.name;
      if (displayName.length > 15) {
        displayName = displayName.slice(0, 13) + "…";
      }

      ctx.fillStyle = "#FFFFFF";
      ctx.font = `900 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetY = 1;
      ctx.fillText(displayName, avatarX + avatarR + 8, 1);
      ctx.shadowBlur = 0;

      // 5. Right Festive Sparkle Accent
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✨", w / 2 - 13, 0);

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

// Fullscreen Mixed Celebration Shower (Team Names + Tech Tools + Festive Flowers)
export function triggerComboRain(players = [], grand = false) {
  if (typeof window === "undefined") return;

  initToolImages();

  const canvas = document.createElement("canvas");
  canvas.id = "combo-rain-canvas";
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

  const namesList = sanitizeNamesList(players);
  const PETALS = ["🌸", "🌹", "🌼", "✨", "🌺", "🎁"];
  const count = grand ? 60 : 30;
  const particles = [];

  for (let i = 0; i < count; i++) {
    const roll = Math.random();
    let kind = "name";
    if (roll < 0.4) kind = "name";
    else if (roll < 0.75) kind = "tech";
    else kind = "flower";

    if (kind === "name") {
      const rawName = namesList[Math.floor(Math.random() * namesList.length)];
      const capsuleW = Math.max(126, Math.min(176, 48 + rawName.length * 9.2));
      particles.push({
        kind: "name",
        x: Math.random() * width,
        y: -70 - Math.random() * (grand ? 600 : 250),
        vx: (Math.random() - 0.5) * 2.0,
        vy: 2.2 + Math.random() * 2.8,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        wobbleOffset: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 14,
        rotationSpeed: (Math.random() - 0.5) * 0.6,
        width: capsuleW,
        height: 40,
        name: rawName,
        initials: extractInitials(rawName),
        color: getColleagueColor(rawName),
        opacity: 1,
      });
    } else if (kind === "tech") {
      const tool = DEV_TOOLS[Math.floor(Math.random() * DEV_TOOLS.length)];
      particles.push({
        kind: "tech",
        x: Math.random() * width,
        y: -90 - Math.random() * (grand ? 700 : 300),
        vx: (Math.random() - 0.5) * 2.2,
        vy: 2.2 + Math.random() * 3.0,
        wobbleSpeed: 0.02 + Math.random() * 0.03,
        wobbleOffset: Math.random() * Math.PI * 2,
        rotation: (Math.random() - 0.5) * 20,
        rotationSpeed: (Math.random() - 0.5) * 0.8,
        radius: 44 + Math.random() * 14,
        tool,
        opacity: 1,
      });
    } else {
      particles.push({
        kind: "flower",
        x: Math.random() * width,
        y: -40 - Math.random() * (grand ? 500 : 200),
        vx: (Math.random() - 0.5) * 2.5,
        vy: 2.0 + Math.random() * 3.2,
        wobbleSpeed: 0.03 + Math.random() * 0.05,
        wobbleOffset: Math.random() * Math.PI * 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4,
        size: 26 + Math.random() * 14,
        char: PETALS[Math.floor(Math.random() * PETALS.length)],
        opacity: 1,
      });
    }
  }

  let animationFrame;
  const startTime = Date.now();
  const maxDuration = grand ? 5500 : 3800;

  function animate() {
    const elapsed = Date.now() - startTime;
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.y += p.vy;
      p.x += p.vx + Math.sin(elapsed * p.wobbleSpeed + p.wobbleOffset) * 1.4;
      p.rotation += p.rotationSpeed;

      if (elapsed > maxDuration - 1100) {
        p.opacity = Math.max(0, p.opacity - 0.02);
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;

      if (p.kind === "flower") {
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.char, 0, 0);
      } else if (p.kind === "name") {
        const scaleX = 0.94 + 0.06 * Math.cos(elapsed * p.wobbleSpeed);
        const scaleY = 0.97 + 0.03 * Math.sin(elapsed * p.wobbleSpeed);
        ctx.scale(scaleX, scaleY);

        const w = p.width;
        const h = p.height;
        const r = h / 2;

        const grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
        grad.addColorStop(0, "#0F172A");
        grad.addColorStop(0.5, "#1E293B");
        grad.addColorStop(1, "#020617");
        ctx.fillStyle = grad;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(-w / 2, -h / 2, w, h, r);
        } else {
          ctx.rect(-w / 2, -h / 2, w, h);
        }
        ctx.fill();

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.4;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0;

        const avatarX = -w / 2 + r;
        const avatarR = r - 4;
        const avGrad = ctx.createRadialGradient(avatarX, -1, 1, avatarX, 0, avatarR);
        avGrad.addColorStop(0, p.color);
        avGrad.addColorStop(1, "#0F172A");
        ctx.fillStyle = avGrad;
        ctx.beginPath();
        ctx.arc(avatarX, 0, avatarR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.8;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `900 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.initials, avatarX, 1);

        let displayName = p.name;
        if (displayName.length > 15) {
          displayName = displayName.slice(0, 13) + "…";
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `900 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 1;
        ctx.fillText(displayName, avatarX + avatarR + 8, 1);
        ctx.shadowBlur = 0;

        ctx.font = "12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("✨", w / 2 - 13, 0);
      } else if (p.kind === "tech") {
        const scaleX = 0.92 + 0.08 * Math.cos(elapsed * p.wobbleSpeed);
        const scaleY = 0.95 + 0.05 * Math.sin(elapsed * p.wobbleSpeed);
        ctx.scale(scaleX, scaleY);

        const R = p.radius;
        const grad = ctx.createRadialGradient(0, -R * 0.1, 4, 0, 0, R);
        grad.addColorStop(0, "#1E293B");
        grad.addColorStop(0.7, "#0F172A");
        grad.addColorStop(1, "#020617");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = p.tool.color;
        ctx.lineWidth = 3.2;
        ctx.shadowColor = p.tool.color;
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.shadowBlur = 0;

        const img = toolImageMap.get(p.tool.id);
        const iconSize = R * 1.25;
        if (img && img.complete && img.naturalWidth !== 0) {
          ctx.drawImage(img, -iconSize / 2, -iconSize / 2 - 8, iconSize, iconSize);
        } else {
          ctx.fillStyle = p.tool.color;
          ctx.font = `bold ${Math.round(R * 0.7)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.tool.name.slice(0, 2), 0, -6);
        }

        const pillW = R * 1.62;
        const pillH = R * 0.46;
        const pillY = R * 0.44;

        ctx.fillStyle = "rgba(2, 6, 23, 0.94)";
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(-pillW / 2, pillY, pillW, pillH, 8);
        } else {
          ctx.rect(-pillW / 2, pillY, pillW, pillH);
        }
        ctx.fill();

        ctx.strokeStyle = p.tool.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = `800 ${Math.max(10, Math.round(R * 0.28))}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.tool.name, 0, pillY + pillH / 2 + 1);
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
  triggerComboRain([], true);
}
