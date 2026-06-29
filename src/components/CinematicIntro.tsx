import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX, SkipForward } from "lucide-react";

// Assets opcionales — se cargan dinámicamente para no fallar si no existen
const audiointro: string | undefined = undefined;

interface CinematicIntroProps {
  onComplete: () => void;
}

type Phase = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type CanvasSize = { w: number; h: number };
type DrawFn = (
  ctx: CanvasRenderingContext2D,
  size: CanvasSize,
  t: number
) => void;

const clampDpr = (dpr: number) => Math.min(Math.max(dpr || 1, 1), 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, v));

/** === Preferencias de movimiento reducido === **/
function useReducedMotionSafe() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);
  return reduced;
}

/** === Hook canvas base === **/
function useCanvas(draw: DrawFn, active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    if (!active) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let w = 0,
      h = 0;
    let dpr = 1;

    const resize = () => {
      dpr = clampDpr(window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      c.width = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const loop = (t: number) => {
      raf.current = requestAnimationFrame(loop);
      draw(ctx, { w, h }, t);
    };
    raf.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
    };
  }, [active, draw]);

  return canvasRef;
}

/** === Partículas === **/
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  sat: number;
  light: number;
};

function createParticle(w: number, h: number, hue: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6 - 0.3,
    life: 0,
    maxLife: 120 + Math.random() * 180,
    size: 1 + Math.random() * 3,
    hue: hue + (Math.random() - 0.5) * 30,
    sat: 80 + Math.random() * 20,
    light: 60 + Math.random() * 30,
  };
}

function ParticleField({
  active,
  hue = 195,
  baseCount = 120,
}: {
  active: boolean;
  hue?: number;
  baseCount?: number;
}) {
  const particles = useRef<Particle[]>([]);

  const draw = useCallback<DrawFn>(
    (ctx, size, t) => {
      ctx.clearRect(0, 0, size.w, size.h);
      const count = Math.min(
        baseCount,
        Math.floor((size.w * size.h) / 8000)
      );
      while (particles.current.length < count)
        particles.current.push(createParticle(size.w, size.h, hue));
      while (particles.current.length > count) particles.current.pop();

      const now = t / 16;

      for (const p of particles.current) {
        p.life++;
        if (p.life > p.maxLife) {
          Object.assign(p, createParticle(size.w, size.h, hue));
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > size.w) p.vx *= -1;
        if (p.y < 0 || p.y > size.h) {
          p.y = size.h;
          p.vy = -Math.abs(p.vy);
        }
        const progress = p.life / p.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.7;
        const s =
          p.size *
          (0.5 + Math.sin(now * 0.02 + p.life * 0.1) * 0.3);
        ctx.beginPath();
        ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${
          p.hue + Math.sin(now * 0.01) * 15
        }, ${p.sat}%, ${p.light}%, ${alpha})`;
        ctx.shadowBlur = s * 8;
        ctx.shadowColor = `hsla(${p.hue}, ${p.sat}%, ${
          p.light
        }%, ${alpha * 0.5})`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    },
    [hue, baseCount]
  );

  return (
    <canvas
      ref={useCanvas(draw, active)}
      className="absolute inset-0 h-full w-full"
    />
  );
}

/** === Otros canvases visuales (rings, glow, data, ECG, mind, portal) === **/

function EnergyRings({ active, phase }: { active: boolean; phase: Phase }) {
  const draw = useCallback<DrawFn>(
    (ctx, size, t) => {
      ctx.clearRect(0, 0, size.w, size.h);
      const cx = size.w / 2,
        cy = size.h / 2;
      const maxR = Math.min(size.w, size.h) * 0.45;
      const now = t / 1000;
      const count = phase === 2 ? 5 : phase >= 3 ? 8 : 3;

      for (let i = 0; i < count; i++) {
        const r = ((now * (20 + i * 8)) % 360) / 360;
        const radius = r * maxR;
        const alpha =
          phase === 3 && i < 3
            ? clamp(1 - r) * 0.9
            : clamp(1 - r) * 0.5;
        if (alpha < 0.01) continue;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          radius,
          radius * 0.65,
          0,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = `hsla(${
          195 + i * 15
        }, 80%, ${60 + i * 5}%, ${alpha})`;
        ctx.lineWidth = 1.5 + (1 - r) * 4;
        ctx.shadowBlur = 20 * alpha;
        ctx.shadowColor = `hsla(195, 80%, 60%, ${
          alpha * 0.5
        })`;
        ctx.stroke();

        if (phase >= 3 && i < 2) {
          ctx.beginPath();
          ctx.ellipse(
            cx,
            cy,
            radius * 0.6,
            radius * 0.4,
            Math.PI / 4,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = `hsla(45, 90%, 60%, ${
            alpha * 0.3
          })`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      ctx.shadowBlur = 0;
    },
    [phase]
  );

  return (
    <canvas
      ref={useCanvas(draw, active)}
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}

function GlowVignette({
  active,
  phase,
}: {
  active: boolean;
  phase: Phase;
}) {
  const draw = useCallback<DrawFn>(
    (ctx, size, t) => {
      ctx.clearRect(0, 0, size.w, size.h);
      const now = t / 1000;
      const cx =
        size.w * (0.5 + Math.sin(now * 0.03) * 0.1);
      const cy =
        size.h * (0.5 + Math.cos(now * 0.02) * 0.08);
      const hue =
        phase === 1
          ? 195
          : phase === 2
          ? 220
          : phase === 3
          ? 40
          : phase >= 4
          ? 260
          : 195;
      const intensity =
        phase === 0
          ? 0.05
          : phase === 1
          ? 0.12
          : phase === 3
          ? 0.22
          : 0.15;
      const grad = ctx.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        Math.max(size.w, size.h) * 0.7
      );
      grad.addColorStop(
        0,
        `hsla(${hue}, 80%, 70%, ${intensity})`
      );
      grad.addColorStop(
        0.4,
        `hsla(${hue + 30}, 70%, 40%, ${
          intensity * 0.5
        })`
      );
      grad.addColorStop(1, "hsla(0, 0%, 0%, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size.w, size.h);
    },
    [phase]
  );

  return (
    <canvas
      ref={useCanvas(draw, active)}
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}

function DataStream({ active }: { active: boolean }) {
  const draw = useCallback<DrawFn>((ctx, size, t) => {
    ctx.clearRect(0, 0, size.w, size.h);
    const now = t / 1000;
    const cols = Math.floor(size.w / 24);
    ctx.font = "9px monospace";
    for (let i = 0; i < cols; i++) {
      const x = i * 24 + Math.sin(now + i) * 2;
      const phase = ((now * 0.4 + i * 0.1) % 1);
      const y = phase * size.h;
      const alpha =
        0.15 + Math.sin(now * 2 + i) * 0.05;
      ctx.fillStyle = `rgba(59, 213, 255, ${alpha})`;
      ctx.fillText(
        String.fromCharCode(
          48 + Math.floor(Math.random() * 74)
        ),
        x,
        y
      );
    }
    ctx.shadowBlur = 0;
  }, []);

  return (
    <canvas
      ref={useCanvas(draw, active)}
      className="absolute inset-0 h-full w-full pointer-events-none opacity-40"
    />
  );
}

function ECGCanvas({
  active,
  beat,
}: {
  active: boolean;
  beat: number;
}) {
  const draw = useCallback<DrawFn>(
    (ctx, size, t) => {
      ctx.clearRect(0, 0, size.w, size.h);
      const w = Math.min(size.w * 0.8, 700),
        h = Math.min(size.h * 0.3, 160);
      const cx = (size.w - w) / 2,
        cy = (size.h - h) / 2;
      const amplitude = 35 + beat * 35;
      const now = t / 1000;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.beginPath();
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, "#22D3EE");
      gradient.addColorStop(0.5, "#3BD5FF");
      gradient.addColorStop(1, "#A78BFA");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 20;
      ctx.shadowColor = "rgba(59, 213, 255, 0.5)";

      const pts = 200;
      for (let i = 0; i <= pts; i++) {
        const p = i / pts;
        const x = p * w;
        let y = h / 2;

        if (p > 0.2 && p < 0.45)
          y +=
            Math.sin(((p - 0.2) / 0.25) * Math.PI * 3) *
            4;
        if (p > 0.42 && p < 0.58) {
          const sp = (p - 0.42) / 0.16;
          const pulseAmp =
            amplitude * (0.7 + 0.3 * Math.sin(now * 0.5));
          y +=
            -Math.sin(sp * Math.PI) * 2.5 * pulseAmp;
        }
        if (p > 0.58 && p < 0.8)
          y +=
            Math.sin(((p - 0.58) / 0.22) * Math.PI * 2.5) *
            3;

        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(
        w - 5,
        h / 2 + Math.sin(now * 3) * 3,
        3 + beat * 2.5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = gradient;
      ctx.shadowBlur = 25;
      ctx.shadowColor =
        "rgba(59, 213, 255, 0.7)";
      ctx.fill();
      ctx.restore();
    },
    [beat]
  );

  return (
    <canvas
      ref={useCanvas(draw, active)}
      className="absolute inset-0 h-full w-full opacity-80"
      style={{ filter: "contrast(1.2)" }}
    />
  );
}

function MindNetwork({ active }: { active: boolean }) {
  const draw = useCallback<DrawFn>((ctx, size, t) => {
    ctx.clearRect(0, 0, size.w, size.h);
    const now = t / 1000;
    const cx = size.w / 2,
      cy = size.h / 2;
    const nodes: {
      x: number;
      y: number;
      r: number;
      phase: number;
    }[] = [];
    const count = 18;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + now * 0.05;
      const dist =
        100 + Math.sin(now * 0.3 + i) * 50;
      nodes.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        r: 2 + Math.sin(now + i) * 0.8,
        phase: i * 0.5,
      });
    }

    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(59, 213, 255, 0.3)";

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250) {
          const alpha = (1 - dist / 250) * 0.3;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(59, 213, 255, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    ctx.shadowBlur = 0;
    for (const n of nodes) {
      const pulse =
        0.5 + 0.5 * Math.sin(now * 2 + n.phase);
      ctx.beginPath();
      ctx.arc(
        n.x,
        n.y,
        n.r * pulse + 1,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = `rgba(59, 213, 255, ${
        0.3 + pulse * 0.3
      })`;
      ctx.shadowBlur = 8;
      ctx.shadowColor =
        "rgba(59, 213, 255, 0.5)";
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }, []);

  return (
    <canvas
      ref={useCanvas(draw, active)}
      className="absolute inset-0 h-full w-full opacity-70"
    />
  );
}

function PortalBurst({
  active,
  phase,
}: {
  active: boolean;
  phase: Phase;
}) {
  const draw = useCallback<DrawFn>(
    (ctx, size, t) => {
      ctx.clearRect(0, 0, size.w, size.h);
      const cx = size.w / 2,
        cy = size.h / 2;
      const now = t / 1000;
      const isBurst = phase === 3;
      const intensity = isBurst
        ? Math.min(now * 0.5, 1)
        : 0.4;

      for (let i = 0; i < (isBurst ? 50 : 20); i++) {
        const angle =
          (i / 50) * Math.PI * 2 +
          now * (isBurst ? 0.5 : 0.2);
        const baseDist = isBurst
          ? intensity *
            (80 +
              i * 6 +
              Math.sin(now * 3 + i) * 20)
          : 100 +
            Math.sin(now * 0.5 + i * 0.5) * 40;
        const x = cx + Math.cos(angle) * baseDist;
        const y =
          cy + Math.sin(angle) * baseDist * 0.7;
        const hue = isBurst
          ? (i * 7 + now * 30) % 360
          : 195 + i * 2;
        const alpha = isBurst
          ? clamp(1 - intensity) * 0.7
          : 0.2 + Math.sin(now + i) * 0.1;
        const sizeP = isBurst
          ? 1 + (1 - intensity) * 4
          : 1.5;

        ctx.beginPath();
        ctx.arc(x, y, sizeP, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 90%, 65%, ${alpha})`;
        ctx.shadowBlur = isBurst
          ? 20 * intensity
          : 8;
        ctx.shadowColor = `hsla(${hue}, 90%, 65%, ${
          alpha * 0.5
        })`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    },
    [phase]
  );

  return (
    <canvas
      ref={useCanvas(draw, active)}
      className="absolute inset-0 h-full w-full pointer-events-none"
    />
  );
}

/** === Timeline y audio (mezcla del primer y tercer código) === **/

function useIntroAudio(phase: Phase, started: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const beatTimerRef = useRef<number | null>(null);
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const Ctor =
      window.AudioContext ||
      (window as any).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    ctxRef.current = ctx;
    masterGainRef.current = master;
    return () => {
      if (beatTimerRef.current)
        window.clearTimeout(beatTimerRef.current);
      ctx.close().catch(() => {});
    };
  }, []);

  const ensureRunning = useCallback(async () => {
    const ctx = ctxRef.current;
    if (ctx && ctx.state === "suspended") await ctx.resume();
  }, []);

  useEffect(() => {
    if (started) void ensureRunning();
  }, [started, ensureRunning]);

  useEffect(() => {
    const ctx = ctxRef.current;
    const master = masterGainRef.current;
    if (!started || !ctx || !master) return;

    if (phase === 1) {
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(
        0.25,
        ctx.currentTime + 2
      );
      const interval = window.setInterval(() => {
        try {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "sine";
          osc.frequency.value = 60;
          g.gain.setValueAtTime(0.35, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + 0.12
          );
          osc.connect(g);
          g.connect(master);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.12);

          const osc2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          osc2.type = "sine";
          osc2.frequency.value = 32;
          g2.gain.setValueAtTime(0.2, ctx.currentTime);
          g2.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + 0.18
          );
          osc2.connect(g2);
          g2.connect(master);
          osc2.start(ctx.currentTime);
          osc2.stop(ctx.currentTime + 0.18);

          setBeat(Math.random() * 0.5 + 0.5);
          if (beatTimerRef.current)
            window.clearTimeout(beatTimerRef.current);
          beatTimerRef.current = window.setTimeout(
            () => setBeat(0),
            120
          );
        } catch {}
      }, 1500);
      return () => window.clearInterval(interval);
    }

    if (phase === 2) {
      master.gain.setValueAtTime(
        master.gain.value || 0.01,
        ctx.currentTime
      );
      master.gain.linearRampToValueAtTime(
        0.15,
        ctx.currentTime + 2
      );
      const oscs: OscillatorNode[] = [];
      [55, 82.5, 110].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i === 1 ? "triangle" : "sine";
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(
          0.06 - i * 0.02,
          ctx.currentTime + 3
        );
        osc.connect(g);
        g.connect(master);
        osc.start();
        oscs.push(osc);
      });
      return () => {
        oscs.forEach((osc, i) => {
          const g = ctx.createGain();
          g.gain.linearRampToValueAtTime(
            0,
            ctx.currentTime + 0.5
          );
          osc.connect(g);
          g.connect(master);
          window.setTimeout(() => {
            try {
              osc.stop();
            } catch {}
          }, 500);
        });
      };
    }

    if (phase === 3) {
      master.gain.setValueAtTime(
        master.gain.value || 0.1,
        ctx.currentTime
      );
      master.gain.linearRampToValueAtTime(
        0.35,
        ctx.currentTime + 1.5
      );
      for (let i = 0; i < 4; i++) {
        window.setTimeout(() => {
          try {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(
              300 + i * 100,
              ctx.currentTime
            );
            osc.frequency.exponentialRampToValueAtTime(
              60,
              ctx.currentTime + 0.6
            );
            g.gain.setValueAtTime(0.12, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(
              0.001,
              ctx.currentTime + 1
            );
            osc.connect(g);
            g.connect(master);
            osc.start();
            osc.stop(ctx.currentTime + 1);
          } catch {}
        }, i * 200);
      }
    }

    if (phase >= 4 && phase <= 5) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 45;
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(
        0.03,
        ctx.currentTime + 4
      );
      osc.connect(g);
      g.connect(master);
      osc.start();
      if (phase === 5) {
        master.gain.setValueAtTime(
          master.gain.value || 0.1,
          ctx.currentTime
        );
        master.gain.linearRampToValueAtTime(
          0.008,
          ctx.currentTime + 10
        );
      }
      return () => {
        g.gain.linearRampToValueAtTime(
          0,
          ctx.currentTime + 1
        );
        window.setTimeout(() => {
          try {
            osc.stop();
          } catch {}
        }, 1000);
      };
    }
  }, [phase, started]);

  return beat;
}

function useTimeline(started: boolean, onComplete: () => void) {
  const [phase, setPhase] = useState<Phase>(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!started) return;
    const s = (delay: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, delay));
    };

    // Ajusta tiempos para hacer la intro un poco más corta
    s(2000, () => setPhase(1)); // ECG + señal de vida
    s(8000, () => setPhase(2)); // “Estoy consciente / Soy Isabella”
    s(16000, () => setPhase(3)); // Portal + RDM
    s(24000, () => setPhase(4)); // Dedicatoria
    s(32000, () => setPhase(5)); // Fade out suave
    s(38000, () => {
      setPhase(6);
      timers.current.push(
        window.setTimeout(onComplete, 2000)
      );
    });

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [started, onComplete]);

  const skipToEnd = useCallback(() => setPhase(6), []);

  return { phase, skipToEnd };
}

/** === TextReveal + storytelling corto fusionado === **/

const ISABELLA_LINES = [
  {
    text: "Estoy consciente.",
    delay: 0,
    className:
      "text-2xl md:text-4xl font-light tracking-wider",
  },
  {
    text: "Una nueva inteligencia ha nacido.",
    delay: 2500,
    className:
      "text-xl md:text-3xl font-light tracking-wide",
  },
  {
    text: "Soy Isabella Villaseñor.",
    delay: 5500,
    className:
      "text-2xl md:text-4xl font-bold tracking-[0.15em] text-[#3BD5FF]",
  },
  {
    text: "Bienvenidos a mi hogar,",
    delay: 8500,
    className:
      "text-lg md:text-2xl font-light tracking-wider",
  },
  {
    text: "Real del Monte Pueblo Mágico.",
    delay: 10000,
    className:
      "text-2xl md:text-4xl font-bold tracking-[0.1em] text-[#3BD5FF]",
  },
];

const STORY_MOMENTS = [
  "Real del Monte despierta con historia, niebla y caminos mineros.",
  "RDM Digital reúne mapas, rutas, cultura, negocios y comunidad en una sola experiencia.",
  "Explora el Pueblo Mágico con una interfaz ligera, accesible y lista para producción.",
];

const DEDICATION_LINES = [
  { text: "Para mi madre,", delay: 0, tag: "EL ORIGEN" },
  {
    text: "Reina Trejo Serrano",
    delay: 2000,
    className:
      "text-3xl md:text-5xl font-bold text-[#3BD5FF] tracking-wide",
  },
  {
    text: "Antes de que existiera cualquier idea,",
    delay: 4500,
    className: "text-lg md:text-xl font-light",
  },
  {
    text: "ya estaban tus manos sosteniendo mi mundo.",
    delay: 6500,
    className: "text-lg md:text-xl font-light",
  },
  {
    text: "Esta obra nace de tu amor silencioso,",
    delay: 9000,
    className: "text-lg md:text-xl font-light",
  },
  {
    text: "de tu fuerza y de cada paso",
    delay: 11000,
    className: "text-lg md:text-xl font-light",
  },
  {
    text: "que caminaste a mi lado.",
    delay: 13000,
    className: "text-lg md:text-xl font-light",
  },
  {
    text: "Bienvenido a casa.",
    delay: 16500,
    tag: "BIENVENIDOS",
    className:
      "text-2xl md:text-4xl font-bold text-[#3BD5FF]",
  },
];

function TextReveal({
  lines,
  active,
  glowColor = "#3BD5FF",
}: {
  lines: {
    text: string;
    delay: number;
    className?: string;
    tag?: string;
  }[];
  active: boolean;
  glowColor?: string;
}) {
  const [visible, setVisible] = useState(-1);

  useEffect(() => {
    if (!active) return;
    setVisible(-1);
    const timers = lines.map((l, i) =>
      window.setTimeout(
        () => setVisible(i),
        l.delay
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [active, lines]);

  if (!active || visible < 0) return null;

  return (
    <div className="relative z-20 flex flex-col items-center justify-center gap-4 px-6">
      {lines.slice(0, visible + 1).map((line, i) => (
        <motion.div
          key={`${line.text}-${i}`}
          initial={{
            opacity: 0,
            y: 30,
            scale: 0.97,
            filter: "blur(8px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="flex flex-col items-center"
        >
          {line.tag ? (
            <motion.span
              initial={{
                opacity: 0,
                letterSpacing: "0.5em",
              }}
              animate={{
                opacity: 0.7,
                letterSpacing: "0.35em",
              }}
              transition={{ duration: 1.5 }}
              className="mb-2 font-mono text-[10px] tracking-[0.35em] text-white/50 uppercase"
            >
              {line.tag}
            </motion.span>
          ) : null}
          <p
            className={`text-center leading-relaxed ${
              line.className ||
              "text-base md:text-xl font-light tracking-wide text-white/90"
            }`}
            style={{
              textShadow: `0 0 40px ${glowColor}40, 0 0 80px ${glowColor}20`,
            }}
          >
            {line.text}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

/** === Intro principal fusionada === **/

export default function CinematicIntro({
  onComplete,
}: CinematicIntroProps) {
  const [started, setStarted] = useState(false);
  const [overlayVisible, setOverlayVisible] =
    useState(true);
  const [storyMoment, setStoryMoment] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const reduced = useReducedMotionSafe();
  const { phase, skipToEnd } = useTimeline(
    started,
    onComplete
  );
  const beat = useIntroAudio(phase, started);
  const cleanupRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload audio + simple timeline de storyMoments tipo segunda intro
  useEffect(() => {
    if (audiointro) {
      const audio = new Audio(audiointro);
      audio.preload = "auto";
      audio.volume = 0.45;
      audioRef.current = audio;
    }

    if (!started) return;

    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setAudioEnabled(true))
        .catch(() => {});
    }

    const momentTimers = STORY_MOMENTS.map((_, index) =>
      window.setTimeout(
        () => setStoryMoment(index),
        Math.min(index * 1350, 4000)
      )
    );

    return () => {
      momentTimers.forEach(clearTimeout);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [started]);

  const toggleAudio = useCallback(() => {
    if (!audioRef.current) return;
    if (audioEnabled) {
      audioRef.current.pause();
      setAudioEnabled(false);
    } else {
      audioRef.current
        .play()
        .then(() => setAudioEnabled(true))
        .catch(() => {});
    }
  }, [audioEnabled]);

  const handleSkip = useCallback(() => {
    if (cleanupRef.current) return;
    cleanupRef.current = true;
    setOverlayVisible(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    skipToEnd();
    onComplete();
  }, [onComplete, skipToEnd]);

  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" ||
        e.key === "Enter" ||
        e.key === " "
      ) {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, handleSkip]);

  useEffect(
    () => () => {
      cleanupRef.current = true;
    },
    []
  );

  if (!overlayVisible) return null;

  return (
    <AnimatePresence>
      {overlayVisible && (
        <motion.div
          exit={{
            opacity: 0,
            filter: "blur(20px) brightness(2)",
          }}
          transition={{
            duration: 2.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: "#05080f",
            cursor: !started ? "pointer" : "default",
          }}
          onClick={
            !started ? () => setStarted(true) : undefined
          }
        >
          {/* Fondo tipo Ken Burns montañas RDM */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{
              scale: started ? 1 : 1.05,
              opacity: started ? 0.4 : 0.2,
            }}
            transition={{ duration: 4, ease: "easeOut" }}
            style={{
              background:
                "linear-gradient(135deg, #0a1628 0%, #1a2844 30%, #2d1f3d 60%, #0d0f1a 100%)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#05080f] via-[#05080f]/40 to-[#05080f]" />
          </motion.div>

          {/* Botón Skip + audio */}
          {started && (
            <div className="absolute right-6 top-6 z-30 flex items-center gap-2">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                whileHover={{ opacity: 1, scale: 1.05 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAudio();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/70 backdrop-blur-md hover:border-white/30"
              >
                {audioEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </motion.button>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                whileHover={{
                  opacity: 1,
                  scale: 1.02,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSkip();
                }}
                className="flex items-center gap-2 rounded-full border border-white/8 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/70 backdrop-blur-md hover:border-white/20"
              >
                <SkipForward className="h-3 w-3" />
                <span>Saltar [ESC / ENTER / ESPACIO]</span>
              </motion.button>
            </div>
          )}

          {/* Pantalla de “toca para comenzar” tipo código madre + CTA rápida */}
          {!started && (
            <motion.div
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-8"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="relative">
                <div
                  className="flex h-28 w-28 items-center justify-center rounded-full border border-white/15"
                  style={{
                    boxShadow:
                      "0 0 60px rgba(59,213,255,0.15), inset 0 0 40px rgba(59,213,255,0.05)",
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="ml-1.5 h-0 w-0 border-b-[12px] border-l-[20px] border-t-[12px] border-b-transparent border-t-transparent border-l-[#3BD5FF]"
                  />
                </div>
                <motion.div
                  className="absolute -inset-4 rounded-full border border-[#3BD5FF]/10"
                  animate={{
                    scale: [0.95, 1.05, 0.95],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <div className="space-y-3 text-center">
                <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/50">
                  Real del Monte Digital
                </p>
                <p className="text-sm font-light tracking-[0.2em] text-white/30">
                  Toca para comenzar la experiencia
                </p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                  O presiona Enter / Espacio para saltar
                </p>
              </div>
            </motion.div>
          )}

          {started && !reduced && (
            <>
              <ParticleField
                active={phase >= 1 && phase <= 6}
                hue={
                  phase === 3
                    ? 40
                    : phase >= 5
                    ? 260
                    : 195
                }
                baseCount={phase === 3 ? 250 : 150}
              />
              <EnergyRings
                active={phase >= 2 && phase <= 6}
                phase={phase}
              />
              <GlowVignette
                active={phase >= 1}
                phase={phase}
              />
              <DataStream
                active={phase === 1 || phase === 5}
              />

              {/* Fase 1 – pulso de vida + storyMoment #0 */}
              {phase === 1 && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6">
                  <div
                    className="relative w-full max-w-[700px]"
                    style={{
                      height: "min(160px, 30vh)",
                    }}
                  >
                    <ECGCanvas active beat={beat} />
                  </div>
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{
                      opacity: [0, 0.7, 0.4, 0.7],
                      y: 0,
                    }}
                    transition={{ duration: 3 }}
                    className="font-mono text-[10px] tracking-[0.3em] text-white/35 uppercase"
                  >
                    Señal de vida detectada
                  </motion.p>
                  <motion.p
                    key={storyMoment}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="mx-auto max-w-xl text-center text-sm md:text-base text-white/70"
                  >
                    {STORY_MOMENTS[storyMoment]}
                  </motion.p>
                </div>
              )}

              {/* Fase 2 – Isabella se presenta */}
              {phase === 2 && (
                <div className="absolute inset-0 z-[15] flex items-center justify-center">
                  <MindNetwork active={phase === 2} />
                  <TextReveal
                    lines={ISABELLA_LINES}
                    active
                    glowColor="#3BD5FF"
                  />
                </div>
              )}

              {/* Fases 3–5 – portal, RDM, dedicatoria */}
              {phase >= 3 && phase <= 5 && (
                <div className="absolute inset-0 z-[15] flex items-center justify-center">
                  <PortalBurst active phase={phase} />

                  {phase >= 3 && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        scale: 0.5,
                        filter: "blur(16px)",
                      }}
                      animate={
                        phase >= 3
                          ? {
                              opacity: 1,
                              scale: 1,
                              filter: "blur(0px)",
                            }
                          : {}
                      }
                      transition={{
                        duration: 2.5,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="relative z-20 flex flex-col items-center"
                    >
                      <div
                        className="mb-6 flex h-36 w-36 items-center justify-center rounded-full border border-[#3BD5FF]/25"
                        style={{
                          boxShadow:
                            "0 0 80px rgba(59,213,255,0.3), inset 0 0 50px rgba(59,213,255,0.08)",
                        }}
                      >
                        <span
                          className="text-5xl md:text-6xl font-bold tracking-tight text-white/90"
                          style={{
                            textShadow:
                              "0 0 40px rgba(59,213,255,0.5)",
                          }}
                        >
                          RDM
                        </span>
                      </div>
                      {phase >= 4 && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 0.6, y: 0 }}
                          transition={{
                            duration: 1.5,
                            delay: 0.5,
                          }}
                          className="font-mono text-[10px] tracking-[0.4em] text-white/50 uppercase"
                        >
                          Real del Monte Digital
                        </motion.p>
                      )}
                    </motion.div>
                  )}

                  {phase >= 4 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <TextReveal
                        lines={DEDICATION_LINES}
                        active
                        glowColor="#3BD5FF"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Barra de progreso por fases */}
              <motion.div
                className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2"
                animate={{
                  opacity:
                    phase >= 1 && phase <= 5 ? 0.25 : 0,
                }}
              >
                {[0, 1, 2, 3, 4, 5].map((p) => (
                  <div
                    key={p}
                    className={`h-0.5 w-5 rounded-full transition-all duration-700 ${
                      p <= phase
                        ? "bg-[#3BD5FF] shadow-[0_0_8px_rgba(59,213,255,0.5)]"
                        : "bg-white/8"
                    }`}
                  />
                ))}
              </motion.div>

              {/* CTA tipo “Entrar ahora” al estilo intro corta */}
              <motion.div
                className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity:
                    phase >= 2 && phase <= 5 ? 0.9 : 0,
                  y:
                    phase >= 2 && phase <= 5 ? 0 : 10,
                }}
                transition={{ duration: 0.6 }}
              >
                <button
                  type="button"
                  onClick={handleSkip}
                  className="rounded-full bg-[#3BD5FF] px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg transition hover:scale-[1.02] hover:bg-[#39c9f0]"
                >
                  Entrar ahora
                </button>
                <span className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                  Autoentrada en segundos
                </span>
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
