import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import introAudioSrc = "@/assets/tumirada.mp3"

interface CinematicIntroProps {
  onComplete: () => void
}

/**
 * AudioEqualizer — Barras espectrales que reaccionan de forma cálida y orgánica
 */
const AudioEqualizer = ({ analyser }: { analyser: AnalyserNode | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (!analyser || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = 530 * dpr
    canvas.height = 80 * dpr
    ctx.scale(dpr, dpr)

    const BAR_COUNT = 52
    const dataArr = new Uint8Array(analyser.frequencyBinCount)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArr)

      const w = 530
      const h = 80
      ctx.clearRect(0, 0, w, h)

      const barW = (w / BAR_COUNT) * 0.6
      const gap = (w / BAR_COUNT) * 0.4

      for (let i = 0; i < BAR_COUNT; i++) {
        const binIndex = Math.floor((i / BAR_COUNT) * (analyser.frequencyBinCount * 0.6))
        const rawVal = dataArr[binIndex] / 255
        const barH = Math.max(4, rawVal * h * 0.9)

        const x = i * (barW + gap)
        const y = h - barH

        const grad = ctx.createLinearGradient(x, h, x, y)
        // Oro viejo artesanal, bronce de campana y destellos ámbar de hogar
        grad.addColorStop(0, `hsla(36, 75%, 45%, ${0.3 + rawVal * 1.0})`)
        grad.addColorStop(0.6, `hsla(43, 90%, 55%, ${0.5 + rawVal * 0.5})`)
        grad.addColorStop(1, `hsla(24, 85%, 60%, ${0.2 + rawVal * 1.2})`)

        ctx.fillStyle = grad
        ctx.shadowBlur = rawVal > 0.6 ? 12 : 0
        ctx.shadowColor = `hsla(43, 90%, 55%, ${rawVal * 0.6})`

        const radius = Math.min(barW / 2, 3)
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + barW - radius, y)
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + radius)
        ctx.lineTo(x + barW, h)
        ctx.lineTo(x, h)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.fill()
      }
    }

    draw()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [analyser])

  return (
    <canvas
      ref={canvasRef}
      className="h-[60px] w-[280px] md:h-[80px] md:w-[530px]"
    />
  )
}

/**
 * AudioWaveform — Línea de pulso y latido del corazón del proyecto
 */
const AudioWaveform = ({ analyser }: { analyser: AnalyserNode | null }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (!analyser || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = 520 * dpr
    canvas.height = 40 * dpr
    ctx.scale(dpr, dpr)

    const dataArr = new Uint8Array(analyser.fftSize)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArr)

      const w = 520
      const h = 40
      ctx.clearRect(0, 0, w, h)

      ctx.lineWidth = 2
      ctx.strokeStyle = "hsla(43, 85%, 65%, 0.75)"
      ctx.shadowBlur = 6
      ctx.shadowColor = "hsla(43, 85%, 55%, 0.5)"

      ctx.beginPath()
      const sliceWidth = w / dataArr.length
      let x = 0

      for (let i = 0; i < dataArr.length; i++) {
        const v = dataArr[i] / 128.0
        const y = (v * h) / 2
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        x += sliceWidth
      }

      ctx.lineTo(w, h / 2)
      ctx.stroke()
    }

    draw()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [analyser])

  return (
    <canvas
      ref={canvasRef}
      className="h-[24px] w-[280px] opacity-50 md:h-[40px] md:w-[520px]"
    />
  )
}

type Particle = {
  id: number
  size: number
  baseX: number
  baseY: number
  opacity: number
  driftY: number
  duration: number
  delay: number
}

// Emulación visual de la neblina suspendida característica de la montaña
const createMistField = (count: number): Particle[] => {
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      size: 1 + Math.random() * 3,
      baseX: Math.random() * 100,
      baseY: Math.random() * 100,
      opacity: 0.15 + Math.random() * 0.45,
      driftY: -30 - Math.random() * 60,
      duration: 8 + Math.random() * 6,
      delay: Math.random() * 4,
    })
  }
  return particles
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [phase, setPhase] = useState(0)
  const [started, setStarted] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [mistParticles] = useState<Particle[]>(() => createMistField(120))

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const fadeIntervalRef = useRef<number | null>(null)
  const fadeInIntervalRef = useRef<number | null>(null)
  const cleanupCalledRef = useRef(false)

  const stopAudio = useCallback(() => {
    if (fadeIntervalRef.current !== null) {
      clearInterval(fadeIntervalRef.current)
      fadeIntervalRef.current = null
    }
    if (fadeInIntervalRef.current !== null) {
      clearInterval(fadeInIntervalRef.current)
      fadeInIntervalRef.current = null
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      } catch {}
      audioRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    sourceRef.current = null
    setAnalyser(null)
  }, [])

  const handleSkip = useCallback(() => {
    if (cleanupCalledRef.current) return
    cleanupCalledRef.current = true
    setOverlayVisible(false)
    stopAudio()
    onComplete()
  }, [onComplete, stopAudio])

  useEffect(() => {
    if (!started) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSkip()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [started, handleSkip])

  const startIntro = async () => {
    if (started) return
    setStarted(true)

    try {
      const Ctor = window.AudioContext || (window as any).webkitAudioContext
      const ctx = new Ctor()
      if (ctx.state === "suspended") {
        await ctx.resume()
      }
      audioCtxRef.current = ctx

      const audio = new Audio(introAudioSrc)
      audio.crossOrigin = "anonymous"
      audio.preload = "auto"
      audioRef.current = audio

      const source = ctx.createMediaElementSource(audio)
      sourceRef.current = source

      const anal = ctx.createAnalyser()
      anal.fftSize = 256
      anal.smoothingTimeConstant = 0.85
      setAnalyser(anal)

      // Ecualización enfocada en la calidez emocional y la fuerza acústica
      const bass = ctx.createBiquadFilter()
      bass.type = "lowshelf"
      bass.frequency.value = 180
      bass.gain.value = 6 // Latido profundo de la tierra

      const presence = ctx.createBiquadFilter()
      presence.type = "peaking"
      presence.frequency.value = 3200
      presence.gain.value = 2.5 // Claridad en los matices de las cuerdas

      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -20
      compressor.knee.value = 25
      compressor.ratio.value = 3.5
      compressor.attack.value = 0.015
      compressor.release.value = 0.25

      source.connect(bass)
      bass.connect(presence)
      presence.connect(compressor)
      compressor.connect(anal)
      anal.connect(ctx.destination)

      audio.volume = 0
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        await playPromise
      }

      fadeInIntervalRef.current = window.setInterval(() => {
        if (!audioRef.current) return
        const nextVol = Math.min(audioRef.current.volume + 0.05, 0.85)
        audioRef.current.volume = nextVol
        if (nextVol >= 0.85 && fadeInIntervalRef.current) {
          clearInterval(fadeInIntervalRef.current)
        }
      }, 120)

      setTimeout(() => {
        if (!audioRef.current) return
        fadeIntervalRef.current = window.setInterval(() => {
          if (!audioRef.current) return
          const nextVol = Math.max(audioRef.current.volume - 0.05, 0)
          audioRef.current.volume = nextVol
          if (nextVol <= 0 && fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
            stopAudio()
          }
        }, 120)
      }, 74000)

      audio.addEventListener("ended", () => {
        setOverlayVisible(false)
        onComplete()
      })
    } catch (e) {
      console.error("Audio initialization failed:", e)
    }
  }

  // Cronograma de Sentimiento, Orgullo y Legado Familiar
  useEffect(() => {
    if (!started) return

    const timers = [
      setTimeout(() => setPhase(1), 600),   // Identidad y Raíces de la Montaña
      setTimeout(() => setPhase(2), 9000),  // Raíz y Cimientos: Reina Trejo Serrano
      setTimeout(() => setPhase(3), 19500), // El peso del desvelo y el amor silencioso
      setTimeout(() => setPhase(4), 31500), // Rendición de cuentas y victoria compartida
      setTimeout(() => setPhase(5), 42500), // El arraigo a Real del Monte
      setTimeout(() => setPhase(6), 53500), // Herencia de paciencia y trabajo artesanal
      setTimeout(() => setPhase(7), 64500), // Las 7 Federaciones construidas a pulso
      setTimeout(() => setPhase(8), 73000), // El Horizonte final: Bienvenidos al Legado
      setTimeout(() => {
        setOverlayVisible(false)
        onComplete()
      }, 79000),
    ]

    return () => timers.forEach(clearTimeout)
  }, [started, onComplete])

  useEffect(() => {
    return () => {
      if (cleanupCalledRef.current) return
      cleanupCalledRef.current = true
      stopAudio()
    }
  }, [stopAudio])

  const scene = (() => {
    switch (phase) {
      case 0:
      case 1:
        return {
          tag: "TAMV ONLINE NETWORK · NUESTRAS RAÍCES",
          title: "Orgullo que nace en la montaña",
          body: "Más que tecnología, esta es nuestra historia. Una red construida entre el frío, la piedra y la neblina de Real del Monte, forjada con el carácter indomable de quienes pertenecemos a la tierra alta.",
        }
      case 2:
        return {
          tag: "EL ORIGEN DE TODO",
          title: "Para mi madre, Reina Trejo Serrano",
          body: "Porque antes de que se escribiera una sola línea de código, existieron tus manos, tu resguardo y tu guía incondicional, sosteniendo mi vida desde el cimiento más profundo y honesto.",
        }
      case 3:
        return {
          tag: "EL VALOR DEL DESVELO",
          title: "Por cada noche que cuidaste mi camino",
          body: "A ti, que enfrentaste el cansancio y los momentos más duros en absoluto silencio para que a mí jamás me faltaran alas. Este logro es el vivo reflejo de tu fe ciega y de tu amor inquebrantable.",
        }
      case 4:
        return {
          tag: "HONRA Y SANGRE",
          title: "Mamá, lo hemos logrado",
          body: "Mírame con orgullo y levanta la frente: tu oveja negra cambió el destino familiar para siempre. Cada hora invertida en esta obra es para devolverte un poco de lo infinito que me diste. Te amo.",
        }
      case 5:
        return {
          tag: "NUESTRO HOGAR",
          title: "Donde la neblina abraza la historia",
          body: "Real del Monte no es solo nuestro lugar de origen; es el latido de nuestras venas. Entre callejones empedrados y el eco del viento en los tejados, habita el alma de un pueblo que sabe resistir.",
        }
      case 6:
        return {
          tag: "HERENCIA DE ESFUERZO",
          title: "Manos que moldean la vida con paciencia",
          body: "Crecimos aprendiendo el valor del trabajo real, dándole forma al porvenir con la constancia del artesano que esculpe el pino y respeta la piedra. Llevamos la memoria de nuestra gente grabada en el pecho.",
        }
      case 7:
        return {
          tag: "EL LEGADO DE NUESTRO TRABAJO",
          title: "Siete federaciones unidas a pulso",
          body: "Un ecosistema coordinado por pura voluntad, constancia y más de 23,000 horas de dedicación absoluta y solitaria. Un testimonio de que cuando el esfuerzo es puro, el legado trasciende las fronteras.",
        }
      case 8:
      default:
        return {
          tag: "BIENVENIDO A CASA",
          title: "Real del Monte Digital",
          body: "Bienvenidos a una herramienta creada desde el corazón de la montaña, con respeto infinito por el pasado y la mirada firme en el mañana. El fruto del esfuerzo está listo.",
        }
    }
  })()

  const heroImages = [
    "/images/rdm-hero.png",
    "/images/realito-pasterias.png",
    "/images/realito-platerias.png",
    "/images/realito-sanitarios.png",
  ]

  const heroIndex =
    phase <= 2 ? 0 : phase === 3 ? 1 : phase === 4 ? 2 : phase === 5 ? 3 : 0

  return (
    <AnimatePresence>
      {overlayVisible && (
        <motion.div
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: "radial-gradient(circle at center, hsl(223, 40%, 7%) 0%, hsl(224, 45%, 4%) 60%, hsl(225, 60%, 2%) 100%)",
            cursor: !started ? "pointer" : "default",
          }}
          onClick={!started ? startIntro : undefined}
        >
          {/* BOTÓN OMITIR INTRO */}
          {started && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              whileHover={{ opacity: 0.9, scale: 1.02 }}
              onClick={(e) => {
                e.stopPropagation()
                handleSkip()
              }}
              className="absolute right-6 top-6 z-[60] font-mono text-[10px] tracking-[0.3em] text-amber-100/80 uppercase border border-amber-500/20 px-4 py-2 rounded-full backdrop-blur-md transition-all"
            >
              Entrar directamente [ESC]
            </motion.button>
          )}

          {/* Interfaz de entrada: Invitación de Inicio */}
          {!started && (
            <motion.div
              className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative">
                <img
                  src="/images/rdm-hero.png"
                  alt="RDM Digital"
                  className="relative h-40 w-40 rounded-full object-cover md:h-52 md:w-52"
                  style={{
                    filter: "drop-shadow(0 0 40px hsla(36,80%,50%,0.3)) saturate(1.1)",
                    border: "2px solid hsla(43, 70%, 55%, 0.3)"
                  }}
                />
              </div>
              <div className="text-center space-y-1 px-4">
                <p className="text-[11px] tracking-[0.35em] uppercase text-amber-200/90 font-mono">
                  TAMV Online Network
                </p>
                <p className="text-xs tracking-[0.2em] text-slate-300/70">
                  Haz clic para escuchar y conocer nuestra historia
                </p>
              </div>
              <motion.div
                className="flex h-14 w-14 items-center justify-center rounded-full border"
                style={{ borderColor: "hsla(43, 70%, 55%, 0.4)" }}
                animate={{
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 0px hsla(43,70%,55%,0)",
                    "0 0 25px hsla(43,80%,55%,0.3)",
                    "0 0 0px hsla(43,70%,55%,0)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div
                  className="ml-1 h-0 w-0 border-b-[6px] border-t-[6px] border-l-[12px] border-b-transparent border-t-transparent"
                  style={{ borderLeftColor: "hsl(43, 85%, 60%)" }}
                />
              </motion.div>
            </motion.div>
          )}

          {started && (
            <>
              {/* Paisajes de Fondo Reales */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroIndex}
                  className="absolute inset-0 z-0"
                  initial={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
                  animate={{ opacity: 0.45, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.02, filter: "blur(6px)" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                >
                  <img
                    src={heroImages[heroIndex]}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{
                      filter: "saturate(0.65) contrast(1.15) brightness(0.35)",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(224,50%,4%)] via-[hsla(224,30%,3%,0.8)] to-[hsl(225,40%,4%)]" />
                </motion.div>
              </AnimatePresence>

              {/* Foco íntimo para transiciones emotivas dedicadas a la familia */}
              <motion.div
                className="absolute inset-0 z-[1]"
                animate={{
                  backgroundColor:
                    phase >= 2 && phase <= 4
                      ? "rgba(0, 0, 0, 0.8)"
                      : "rgba(0, 0, 0, 0.4)",
                }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />

              {/* Partículas de neblina suspendida de la montaña */}
              <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
                {mistParticles.map((pt) => (
                  <motion.div
                    key={pt.id}
                    className="absolute rounded-full bg-slate-200/20"
                    style={{
                      width: `${pt.size}px`,
                      height: `${pt.size}px`,
                      left: `${pt.baseX}%`,
                      top: `${pt.baseY}%`,
                    }}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{
                      opacity: [0, pt.opacity, pt.opacity * 0.5, 0],
                      y: [0, pt.driftY],
                    }}
                    transition={{
                      duration: pt.duration,
                      repeat: Infinity,
                      delay: pt.delay,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>

              {/* Centro de Identidad Territorial */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.8, ease: "easeOut" }}
                className="relative z-[4] mb-6 flex items-center justify-center"
              >
                <div
                  className="relative flex h-36 w-36 flex-col items-center justify-center rounded-full md:h-44 md:w-44"
                  style={{
                    background: "linear-gradient(135deg, hsl(224,30%,10%), hsl(225,45%,5%))",
                    border: "1px solid hsla(43,70%,55%,0.4)",
                    boxShadow: "0 15px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,215,0,0.05)",
                  }}
                >
                  <div className="text-center px-3 space-y-0.5">
                    <p className="font-mono text-[9px] tracking-[0.3em] text-amber-200/70 uppercase">
                      RDM DIGITAL
                    </p>
                    <h2
                      className="font-serif text-xl font-bold tracking-wide md:text-2xl"
                      style={{
                        background: "linear-gradient(135deg, #fff, hsl(43, 70%, 65%))",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      REAL DEL
                    </h2>
                    <h2
                      className="font-serif text-xl font-bold tracking-wide md:text-2xl"
                      style={{
                        background: "linear-gradient(135deg, #ddd, #94a3b8)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      MONTE
                    </h2>
                  </div>
                </div>
              </motion.div>

              {/* Bloque Central de Narrativa */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 25, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="relative z-[5] mb-6 flex max-w-3xl flex-col items-center px-6 text-center"
                >
                  <p className="mb-3 font-mono text-[10px] tracking-[0.4em] text-amber-400/80 uppercase md:text-xs">
                    {scene.tag}
                  </p>

                  <h1 className="font-serif text-2xl font-bold leading-tight tracking-normal text-white md:text-4xl lg:text-5xl">
                    {scene.title}
                  </h1>

                  <motion.div
                    className="mx-auto my-4 h-[1px]"
                    style={{
                      background: "linear-gradient(90deg, transparent, hsl(43,70%,55%), transparent)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: "12rem" }}
                    transition={{ duration: 1 }}
                  />

                  <p className="mx-auto max-w-xl text-sm leading-relaxed tracking-wide text-slate-300 font-light md:text-base">
                    {scene.body}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Armonización de Audio */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={phase >= 1 ? { opacity: 1 } : {}}
                transition={{ duration: 1 }}
                className="relative z-[5] mb-8 flex flex-col items-center gap-1"
              >
                <AudioEqualizer analyser={analyser} />
                <AudioWaveform analyser={analyser} />
                <p className="mt-2 font-mono text-[8px] tracking-[0.3em] text-slate-500 uppercase">
                  Sindicación Territorial · Orgullo Realmontense
                </p>
              </motion.div>

              {/* Carrusel Tradición Realmontense Inferior */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={phase >= 5 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1.5 }}
                className="absolute bottom-10 z-[5] flex w-full justify-center gap-5 px-4"
              >
                {[
                  { src: "/images/realito-pasterias.png", label: "Gastronomía" },
                  { src: "/images/realito-platerias.png", label: "Artesanías" },
                  { src: "/images/realito-sanitarios.png", label: "Servicios" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={phase >= 5 ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 1, delay: i * 0.15 }}
                    className="group relative"
                  >
                    <div
                      className="h-16 w-16 overflow-hidden rounded-xl md:h-20 md:w-20 transition-all duration-300 border"
                      style={{
                        borderColor: "hsla(43,50%,50%,0.25)",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
                      }}
                    >
                      <img
                        src={item.src}
                        alt={item.label}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 font-mono text-[8px] tracking-widest text-slate-400 uppercase opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
