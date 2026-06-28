import { useState } from "react"
import { RDMLayout } from "@/components/rdm/RDMLayout"
import { SEOMeta } from "@/components/SEOMeta"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  Download,
  Heart,
  Clock,
  Headphones,
  Disc3,
  Sparkles,
  Award,
  BookOpen,
  ExternalLink,
  ChevronDown,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useAudioPlayer, type Track } from "@/contexts/AudioPlayerContext"
import playlistMd from "@/assets/musica/playlist.md?raw"

// Ajusta esto a tus URLs R2 normalizadas
const R2_BASE = "https://media.visitarealdelmonte.online"

const PLAYLIST: Track[] = [
  {
    id: "a_mimadre",
    title: "El Real (Legend)",
    artist: "Edwin Castillo",
    description: "Tema principal del intro de la plataforma.",
    src: `${R2_BASE}/a_mimadre.mp3`,
    duration: 210,
    bpm: 70,
    mood: "Emotivo",
  },
  {
    id: "reina_trejo",
    title: "A Mi Madre",
    artist: "RDM Digital",
    description: "Homenaje musical a mi madre, al amor incondicional y al sacrificio silencioso.",
    src: `${R2_BASE}/reina_trejo.mp3`,
    duration: 275,
    bpm: 70,
    mood: "Emotivo",
  },
  {
    id: "tumirada",
    title: "Tu Mirada",
    artist: "RDM Digital",
    description: "Melodía íntima que captura la esencia de una mirada que lo dice todo.",
    src: `${R2_BASE}/tumirada.mp3`,
    duration: 240,
    bpm: 72,
    mood: "Melancólico",
  },
  {
    id: "adicted_toyou",
    title: "Adicted to You",
    artist: "Edwin Castillo",
    description:
      "Canción que explora la adicción emocional que nace del corazón y se niega a soltar los recuerdos del ayer.",
    src: `${R2_BASE}/adicted_toyou.mp3`,
    duration: 220,
    bpm: 85,
    mood: "Pasional",
  },
  {
    id: "cada_noche",
    title: "Cada Noche",
    artist: "Edwin Castillo",
    description: "Ritmo nocturno que evoca las madrugadas de insomnio y reflexión.",
    src: `${R2_BASE}/cada_noche.mp3`,
    duration: 230,
    bpm: 78,
    mood: "Nocturno",
  },
  {
    id: "el_senalado",
    title: "El Señalado",
    artist: "Edwin Castillo",
    description: "Narrativa musical sobre llevar una marca distinta y encontrar fuerza en la propia identidad.",
    src: `${R2_BASE}/el_señalado.mp3`,
    duration: 240,
    bpm: 82,
    mood: "Intenso",
  },
  {
    id: "legado_1",
    title: "Legado (Versión Extendida)",
    artist: "RDM Digital",
    description:
      "Como deseo ser recordado, que dejo como legado, una pregunta que vive a diario en mi mente.",
    src: `${R2_BASE}/legado_1.mp3`,
    duration: 260,
    bpm: 80,
    mood: "Épico",
  },
  {
    id: "patio_detierra",
    title: "Patio de Tierra",
    artist: "Edwin Castillo",
    description: "Melodía que evoca los patios de las casas antiguas y las memorias que ahí habitan.",
    src: `${R2_BASE}/patio_detierra.mp3`,
    duration: 200,
    bpm: 65,
    mood: "Nostálgico",
  },
  {
    id: "puro_dolor",
    title: "Puro Dolor",
    artist: "Edwin Castillo",
    description: "Balada que transforma el dolor en arte y catarsis musical.",
    src: `${R2_BASE}/puro_dolor.mp3`,
    duration: 250,
    bpm: 68,
    mood: "Triste",
  },
  {
    id: "shooting_star",
    title: "Shooting Star",
    artist: "Edwin Castillo",
    description:
      "Inspirado en la estrella fugaz que iluminó mi andar y cruza el cielo de Real del Monte.",
    src: `${R2_BASE}/shooting_star.mp3`,
    duration: 225,
    bpm: 88,
    mood: "Inspirador",
  },
  {
    id: "tumirada_musica",
    title: "Tu Mirada (Estudio)",
    artist: "Edwin Castillo",
    description: "Versión de estudio con arreglos acústicos.",
    src: `${R2_BASE}/tumirada_musica.mp3`,
    duration: 235,
    bpm: 72,
    mood: "Melancólico",
  },
  // añade el resto de tus pistas R2 aquí…
]

const DONATION_AMOUNTS = [50, 100, 200, 500, 1000]

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

/* ------------------------------------------------------------------ */
/*  TRACK ROW ESTILO SPOTIFY / APPLE                                  */
/* ------------------------------------------------------------------ */

function TrackRow({
  track,
  index,
  isActive,
  isPlaying,
  onPlay,
}: {
  track: Track
  index: number
  isActive: boolean
  isPlaying: boolean
  onPlay: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const open = expanded || (isActive && isPlaying)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`group rounded-xl border transition-all duration-200 will-change-transform will-change-opacity ${
        isActive
          ? "border-[#00D4FF]/40 bg-[#020617]/70 shadow-[0_19px_40px_rgba(0,212,255,0.25)]"
          : "border-white/5 bg-[#020617]/50 hover:border-[#00D4FF]/30 hover:bg-[#020617]/80 hover:shadow-[0_19px_28px_rgba(10,22,40,0.35)]"
      }`}
    >
      <button
        onClick={() => {
          onPlay()
          if (!isActive) setExpanded(true)
        }}
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left"
      >
        {/* index / playing */}
        <div className="relative shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-[#0b1220]/80">
          {isActive && isPlaying ? (
            <span className="flex gap-px items-end h-3.5">
              {[1, 2, 3].map((b) => (
                <span
                  key={b}
                  className="w-[3px] bg-gradient-to-t from-[#00D4FF] to-cyan-300 rounded-full animate-bounce"
                  style={{
                    height: `${5 + b * 3}px`,
                    animationDelay: `${b * 0.42}s`,
                  }}
                />
              ))}
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-gray-500 group-hover:opacity-0 transition-opacity">
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
          {!isActive && (
            <Play className="absolute w-3.5 h-3.5 text-[#00D4FF] opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        {/* Title + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold truncate ${
                isActive ? "text-[#E5F4FF]" : "text-gray-100"
              }`}
            >
              {track.title}
            </span>
            {track.mood && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF]/80 uppercase tracking-[0.18em] shrink-0 hidden sm:inline">
                {track.mood}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400">{track.artist}</p>
        </div>

        {/* Duration + controls */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-dark-navyblue-400 tabular-nums">
            {formatDuration(track.duration)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPlay()
            }}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all will-change-transform will-change-opacity ${
              isActive
                ? "bg-[#00D4FF]/18 text-[#00D4FF]"
                : "text-gray-400 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10"
            }`}
          >
            {isActive && isPlaying ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className={`p-1 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            } text-gray-500 hover:text-gray-300`}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </button>

      {/* Expanded details estilo Apple Music */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 pt-0 border-t border-white/5 mt-1">
              <p className="text-[12px] text-gray-300 leading-relaxed mb-2 mt-2">
                {track.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(track.duration)}
                </span>
                {track.bpm && (
                  <span className="flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    {track.bpm} BPM
                  </span>
                )}
                {track.mood && (
                  <span className="flex items-center gap-1">
                    <Disc3 className="w-3 h-3" />
                    {track.mood}
                  </span>
                )}
              </div>
              {isActive && <ActiveProgressBar />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  PROGRESS BAR / NOW PLAYING                                         */
/* ------------------------------------------------------------------ */

function ActiveProgressBar() {
  const { progress } = useAudioPlayer()
  return (
    <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-[#00D4FF] via-[#0088FF] to-[#00D4FF] rounded-full transition-[width] duration-250"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  )
}

function NowPlayingBadge() {
  const { currentTrack, isPlaying } = useAudioPlayer()
  if (!currentTrack) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 flex items-center gap-3"
    >
      <div className="h-8 w-8 rounded-full bg-[#00D4FF]/15 flex items-center justify-center">
        <Disc3 className="w-4 h-4 text-[#00D4FF]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">
          {isPlaying ? "Reproduciendo ahora" : "Paused"}
        </p>
        <p className="text-[12px] text-gray-100 truncate">
          {currentTrack.title} • {currentTrack.artist}
        </p>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  PAGE: Música streaming híbrido                                     */
/* ------------------------------------------------------------------ */

export default function Musica() {
  const { currentTrack, isPlaying, play, togglePlay } = useAudioPlayer()
  const [donationAmount, setDonationAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [donating, setDonating] = useState(false)

  const handleDonation = async () => {
    const amount = donationAmount ?? (customAmount ? parseInt(customAmount) : null)
    if (!amount || amount <= 0) return
    setDonating(true)
    try {
      const res = await fetch("/api/donations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })
      if (!res.ok) {
        setDonating(false)
        return
      }
      const { url } = await res.json()
      if (url) window.location.href = url
    } catch {
      setDonating(false)
    }
  }

  const totalDuration = PLAYLIST.reduce((a: number, t: Track) => a + t.duration, 0)

  return (
    <RDMLayout>
      <SEOMeta
        title="Archivo Histórico Musical — RDM Digital"
        description="Archivo histórico musical del Pueblo Mágico. Melodías que capturan el espíritu de Real del Monte. Apoya con una donación."
      />

      <section className="relative pt-24 pb-12 px-6 md:px-16 overflow-hidden">
        {/* Fondo tipo app de música */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#020617] via-[#0b1020] to-[#1a0f0a]" />
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 0%, rgba(0,212,255,0.35) 0%, transparent 55%), " +
              "radial-gradient(circle at 80% 30%, rgba(252,165,165,0.18) 0%, transparent 50%), " +
              "radial-gradient(circle at 50% 80%, rgba(0,100,200,0.12) 0%, transparent 45%)",
          }}
        />

        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Header tipo playlist Apple/Spotify */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <div className="flex items-start gap-6">
                {/* Cover card */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-[#00D4FF]/25 via-[#0f172a] to-[#111827] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(0,212,255,0.35)_0%,transparent_55%)] opacity-70" />
                  <Disc3 className="w-14 h-14 md:w-16 md:h-16 text-[#E5F4FF]" />
                </div>

                {/* Playlist info */}
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/8 px-4 py-1.5 text-[9px] uppercase tracking-[0.25em] text-gray-400 mb-3">
                    <Sparkles className="h-3 w-3 text-[#00D4FF]" />
                    <span>Archivo Histórico Musical</span>
                  </div>
                  <h1
                    className="text-[1.9rem] md:text-[2.7rem] font-bold text-gray-100 tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Música de Real del Monte
                  </h1>
                  <p className="mt-2 text-[13px] text-gray-300 max-w-md">
                    Una colección viva de canciones que narran la historia, el amor y la memoria del
                    Pueblo Mágico. Diseñado como un archivo sonoro, disponible siempre para todos.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-[#00D4FF]/60" />
                      {PLAYLIST.length} pistas
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#00D4FF]/25" />
                    <span className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#00D4FF]/60" />
                      {formatDuration(totalDuration)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[#00D4FF]/25" />
                    <span className="flex items-center gap-2">
                      <Download className="w-3.5 h-3.5 text-[#00D4FF]/60" />
                      Descarga libre
                    </span>
                  </div>

                  <NowPlayingBadge />
                </div>
              </div>

              {/* Manifiesto markdown */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md"
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-[#00D4FF]" />
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-200 text-[13px]">
                    <ReactMarkdown>{playlistMd}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Lista de tracks + donaciones en columna derecha */}
            <div className="flex-1 flex flex-col gap-8">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-gray-500">
                    Catálogo sonoro
                  </span>
                </div>

                <div className="space-y-1.5">
                  {PLAYLIST.map((track, idx) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={idx}
                      isActive={currentTrack?.id === track.id}
                      isPlaying={isPlaying && currentTrack?.id === track.id}
                      onPlay={() => {
                        if (currentTrack?.id === track.id) {
                          togglePlay()
                        } else {
                          play(track, PLAYLIST)
                        }
                      }}
                    />
                  ))}
                </div>

                {/* Download all (usa una pista representativa o zip cuando lo tengas) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 flex justify-end"
                >
                  <a
                    href={`${R2_BASE}/legado_1.mp3`}
                    download="Legado_de_Real_del_Monte.mp3"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] text-gray-300 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar todo (.zip próximamente)
                  </a>
                </motion.div>
              </div>

              {/* Donaciones estilo card premium */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl overflow-hidden border border-[#00D4FF]/25 bg-gradient-to-br from-[#020617] via-[#0b1020] to-[#1a0f0a] shadow-[0_22px_60px_rgba(0,212,255,0.35)] backdrop-blur-xl"
              >
                <div className="relative h-28 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/20 via-transparent to-[#fb7185]/15" />
                  <div
                    className="absolute inset-0 opacity-25"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 35% 40%, rgba(0,212,255,0.4) 0%, transparent 60%), " +
                        "radial-gradient(circle at 72% 60%, rgba(248,113,113,0.4) 0%, transparent 55%)",
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#020617] to-transparent" />
                  <div className="absolute bottom-4 left-6 flex items-center gap-3">
                    <Heart className="w-7 h-7 text-[#E5F4FF]" />
                    <div>
                      <h3 className="text-sm font-bold text-gray-100">Apoya esta música</h3>
                      <p className="text-[11px] text-gray-300">
                        Tu donación mantiene vivo este archivo sonoro.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4">
                  <p className="text-[13px] text-gray-300 leading-relaxed mb-5">
                    Esta música es y será siempre gratuita. Pero mantener servidores, dominio y el
                    desarrollo de RDM Digital requiere inversión constante. Si este proyecto resuena
                    contigo, considera hacer una contribución.
                  </p>

                  <DonationControls
                    donationAmount={donationAmount}
                    setDonationAmount={setDonationAmount}
                    customAmount={customAmount}
                    setCustomAmount={setCustomAmount}
                    donating={donating}
                    onDonate={handleDonation}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </RDMLayout>
  )
}

/* ------------------------------------------------------------------ */
/*  DONATION CONTROLS                                                  */
/* ------------------------------------------------------------------ */

function DonationControls({
  donationAmount,
  setDonationAmount,
  customAmount,
  setCustomAmount,
  donating,
  onDonate,
}: {
  donationAmount: number | null
  setDonationAmount: (v: number | null) => void
  customAmount: string
  setCustomAmount: (v: string) => void
  donating: boolean
  onDonate: () => void
}) {
  const currentAmount =
    donationAmount ?? (customAmount ? parseInt(customAmount) || 0 : 0)

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-5">
        {DONATION_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => {
              setDonationAmount(amount)
              setCustomAmount("")
            }}
            className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all will-change-transform will-change-opacity ${
              donationAmount === amount
                ? "bg-gradient-to-br from-[#00D4FF] to-[#0088FF] text-white shadow-lg shadow-[#00D4FF]/35 scale-105"
                : "bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 hover:text-[#00D4FF]"
            }`}
          >
            ${amount.toLocaleString()}
            {amount === 500 && (
              <span className="block text-[9px] font-normal opacity-70">
                Más apoyado
              </span>
            )}
            {amount === 1000 && (
              <span className="block text-[9px] font-normal opacity-70">
                ⭐ Patrocinador
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-[11px] text-gray-400 shrink-0">Otra cantidad:</span>
        <div className="relative flex-1 max-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">
            $
          </span>
          <input
            type="number"
            min={1}
            placeholder="0"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value)
              setDonationAmount(null)
            }}
            className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-100 text-sm focus:outline-none focus:border-[#00D4FF]/60 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <span className="text-[11px] text-gray-500">MXN</span>
      </div>

      <button
        onClick={onDonate}
        disabled={donating || (!donationAmount && !customAmount)}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-3.5 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#0088FF] text-white font-bold text-sm hover:opacity-90 hover:scale-[1.02] disabled:opacity-40 disabled:scale-100 transition-all shadow-xl shadow-[#00D4FF]/25 will-change-transform will-change-opacity"
      >
        {donating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Procesando…
          </>
        ) : (
          <>
            <Heart className="w-4 h-4" />
            Donar $
            {currentAmount.toLocaleString() || "…"}
          </>
        )}
      </button>

      <p className="mt-3 text-[9px] text-gray-500 leading-relaxed">
        <ExternalLink className="w-3 h-3 inline mr-1" />
        Pago procesado vía Stripe. No almacenamos datos bancarios.
      </p>
    </>
  )
}
