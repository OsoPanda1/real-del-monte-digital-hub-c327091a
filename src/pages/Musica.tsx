import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta } from "@/components/SEOMeta";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music2,
  Play,
  Pause,
  Download,
  Heart,
  Clock,
  ChevronRight,
  Volume2,
  SkipBack,
  SkipForward,
} from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string | null;
  description: string | null;
  storage_path: string;
  mime_type: string;
  duration_seconds: number | null;
  size_bytes: number | null;
  created_at: string;
}

const MOCK_SONGS: Song[] = [
  { id: "mock-1", title: "Legado de Real del Monte", artist: "RDM Digital", description: "Tema principal del proyecto", storage_path: "legado.mp3", mime_type: "audio/mpeg", duration_seconds: 180, size_bytes: 4800000, created_at: "2025-01-01" },
  { id: "mock-2", title: "Mirada de Plata", artist: "RDM Digital", description: "Melodía inspirada en la minería", storage_path: "tumirada.mp3", mime_type: "audio/mpeg", duration_seconds: 240, size_bytes: 5800000, created_at: "2025-01-02" },
  { id: "mock-3", title: "Neblina en el Monte", artist: "Isabella Villaseñor", description: "Paisaje sonoro del pueblo mágico", storage_path: "neblina.mp3", mime_type: "audio/mpeg", duration_seconds: 200, size_bytes: 5200000, created_at: "2025-01-03" },
  { id: "mock-4", title: "Paste y Tradición", artist: "RDM Digital", description: "Ritmos de la cocina tradicional", storage_path: "paste.mp3", mime_type: "audio/mpeg", duration_seconds: 160, size_bytes: 4100000, created_at: "2025-01-04" },
  { id: "mock-5", title: "Canto de las Antiguas", artist: "Coro Comunitario", description: "Canto tradicional de las minas", storage_path: "canto.mp3", mime_type: "audio/mpeg", duration_seconds: 300, size_bytes: 7200000, created_at: "2025-01-05" },
];

function formatDuration(secs: number | null): string {
  if (!secs) return "--:--";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Player bar ──────────────────────────────────────────────────────────────
interface PlayerBarProps {
  song: Song | null;
  audioUrl: string | null;
  playing: boolean;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

function PlayerBar({ song, audioUrl, playing, onToggle, onPrev, onNext, hasPrev, hasNext }: PlayerBarProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;
    audioRef.current.src = audioUrl;
    if (playing) audioRef.current.play().catch(() => {});
  }, [audioUrl]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [playing]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setProgress(el.duration ? el.currentTime / el.duration : 0);
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, []);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * audioRef.current.duration;
  };

  if (!song) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(218_24%_14%/0.97)] backdrop-blur-xl border-t border-[hsl(var(--rdm-amber)/0.2)] px-4 py-3"
    >
      <audio ref={audioRef} onEnded={onNext} />

      {/* Progress bar */}
      <div
        className="h-1 w-full bg-white/10 rounded-full mb-3 cursor-pointer"
        onClick={seek}
      >
        <div
          className="h-full bg-[hsl(var(--rdm-amber))] rounded-full transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between max-w-5xl mx-auto gap-4">
        {/* Song info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "var(--font-display)" }}>
            {song.title}
          </p>
          <p className="text-xs text-white/50 truncate">{song.artist ?? "Real del Monte"}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="text-white/60 hover:text-white disabled:opacity-30 transition-colors"
            aria-label="Anterior"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          <button
            onClick={onToggle}
            className="w-10 h-10 rounded-full bg-[hsl(var(--rdm-amber))] text-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
            aria-label={playing ? "Pausar" : "Reproducir"}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="text-white/60 hover:text-white disabled:opacity-30 transition-colors"
            aria-label="Siguiente"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Volume */}
        <div className="hidden sm:flex items-center gap-2 flex-1 justify-end">
          <Volume2 className="w-4 h-4 text-white/40" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (audioRef.current) audioRef.current.volume = v;
            }}
            className="w-20 accent-[hsl(var(--rdm-amber))]"
            aria-label="Volumen"
          />
        </div>
      </div>
    </motion.div>
  );
}

// ── Song card ─────────────────────────────────────────────────────────────────
interface SongCardProps {
  song: Song;
  index: number;
  isPlaying: boolean;
  isActive: boolean;
  onPlay: () => void;
  onDownload: () => void;
}

function SongCard({ song, index, isPlaying, isActive, onPlay, onDownload }: SongCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`group flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 cursor-pointer border ${
        isActive
          ? "bg-[hsl(var(--rdm-amber)/0.12)] border-[hsl(var(--rdm-amber)/0.35)] shadow-sm"
          : "bg-white/60 hover:bg-white/90 border-transparent hover:border-[hsl(var(--rdm-amber)/0.2)] hover:shadow-sm"
      }`}
      onClick={onPlay}
    >
      {/* Index / play indicator */}
      <div className="w-8 text-center shrink-0">
        {isActive && isPlaying ? (
          <span className="inline-flex gap-px items-end h-4">
            {[1, 2, 3].map((b) => (
              <span
                key={b}
                className="w-1 bg-[hsl(var(--rdm-amber))] rounded-full animate-bounce"
                style={{ height: `${8 + b * 4}px`, animationDelay: `${b * 0.1}s` }}
              />
            ))}
          </span>
        ) : (
          <span className="text-xs text-[hsl(var(--muted-foreground))] group-hover:hidden">
            {index + 1}
          </span>
        )}
        {!isActive && (
          <Play className="w-4 h-4 text-[hsl(var(--rdm-amber))] hidden group-hover:block mx-auto" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate ${isActive ? "text-[hsl(var(--rdm-amber))]" : "text-[hsl(var(--foreground))]"}`}
          style={{ fontFamily: "var(--font-display)" }}
        >
          {song.title}
        </p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
          {song.artist ?? "Real del Monte"}{song.description ? ` · ${song.description}` : ""}
        </p>
      </div>

      {/* Meta */}
      <div className="hidden sm:flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
        {song.duration_seconds && (
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(song.duration_seconds)}
          </span>
        )}
        {song.size_bytes && <span>{formatSize(song.size_bytes)}</span>}
      </div>

      {/* Download */}
      <button
        onClick={(e) => { e.stopPropagation(); onDownload(); }}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl hover:bg-[hsl(var(--rdm-amber)/0.1)] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--rdm-amber))]"
        aria-label={`Descargar ${song.title}`}
        title="Descargar"
      >
        <Download className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Musica() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("songs")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setSongs(MOCK_SONGS);
        } else if (data && data.length > 0) {
          setSongs(data as Song[]);
        } else {
          setSongs(MOCK_SONGS);
        }
        setLoading(false);
      })
      .catch(() => {
        setSongs(MOCK_SONGS);
        setLoading(false);
      });
  }, []);

  const getUrl = async (path: string): Promise<string | null> => {
    const { data } = supabase.storage.from("songs").getPublicUrl(path);
    return data?.publicUrl ?? null;
  };

  const playSong = async (idx: number) => {
    const song = songs[idx];
    if (!song) return;

    if (activeIdx === idx) {
      setPlaying((p) => !p);
      return;
    }

    setActiveIdx(idx);
    setPlaying(false);
    const url = await getUrl(song.storage_path);
    if (url) {
      setAudioUrl(url);
      setPlaying(true);
    }
  };

  const downloadSong = async (song: Song) => {
    const url = await getUrl(song.storage_path);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${song.title}.${song.mime_type.split("/")[1] ?? "mp3"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const activeSong = activeIdx !== null ? songs[activeIdx] : null;

  return (
    <RDMLayout>
      <SEOMeta
        title="Música de Real del Monte — RDM Digital"
        description="Escucha y descarga música inspirada en Real del Monte. Melodías del Pueblo Mágico de Hidalgo. Apoya la plataforma con una donación."
      />

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-6 md:px-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[hsl(218_25%_14%)] via-[hsl(218_24%_18%)] to-[hsl(24_40%_20%)]" />
        <div className="absolute inset-0 -z-10 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, hsl(24 72% 50% / 0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(212 36% 45% / 0.3) 0%, transparent 50%)"
          }}
        />

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 rounded-3xl bg-[hsl(var(--rdm-amber)/0.15)] border border-[hsl(var(--rdm-amber)/0.3)] flex items-center justify-center mx-auto mb-6"
          >
            <Music2 className="w-10 h-10 text-[hsl(var(--rdm-amber))]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Música de Real del Monte
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed mb-6"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Melodías producidas para despertar el amor por nuestro Pueblo Mágico. Escúchalas libremente y, si te llegan al alma, apoya la plataforma con una donación.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/donar"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[hsl(var(--rdm-amber))] text-white text-sm font-semibold shadow-lg hover:opacity-90 hover:scale-105 transition-all"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Heart className="w-4 h-4" />
              Apoya la plataforma
            </Link>
            <span className="text-white/30 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              Gratis · Sin registro · Descarga libre
            </span>
          </motion.div>
        </div>
      </section>

      {/* Track list */}
      <section className="py-12 px-6 md:px-16 pb-32">
        <div className="max-w-3xl mx-auto">

          {/* How it works notice */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl bg-[hsl(var(--rdm-amber)/0.07)] border border-[hsl(var(--rdm-amber)/0.2)] flex gap-3 items-start"
          >
            <Music2 className="w-5 h-5 text-[hsl(var(--rdm-amber))] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[hsl(var(--foreground))]" style={{ fontFamily: "var(--font-body)" }}>
                Biblioteca curada por el equipo RDM Digital
              </p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
                Toda la música que encuentras aquí ha sido seleccionada y subida por los administradores de la plataforma con el objetivo de promover la identidad cultural de Real del Monte.
                Haz clic en cualquier canción para escucharla; puedes descargarla de forma gratuita.
                Si la música te gusta,{" "}
                <Link to="/donar" className="text-[hsl(var(--rdm-amber))] hover:underline font-semibold">
                  considera hacer una donación
                </Link>{" "}
                para sostener la infraestructura.
              </p>
            </div>
          </motion.div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-2 border-[hsl(var(--rdm-amber))] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>
                Cargando biblioteca musical…
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-sm text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>
                No se pudo cargar la música en este momento.
              </p>
            </div>
          )}

          {!loading && !error && songs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Music2 className="w-14 h-14 text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[hsl(var(--foreground))] mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Próximamente
              </h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                El equipo de RDM Digital está preparando la primera selección musical. Vuelve pronto.
              </p>
            </motion.div>
          )}

          {!loading && songs.length > 0 && (
            <div className="space-y-2">
              {songs.map((song, idx) => (
                <SongCard
                  key={song.id}
                  song={song}
                  index={idx}
                  isActive={activeIdx === idx}
                  isPlaying={playing && activeIdx === idx}
                  onPlay={() => playSong(idx)}
                  onDownload={() => downloadSong(song)}
                />
              ))}
            </div>
          )}

          {/* Donation block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-14 rounded-3xl overflow-hidden border border-[hsl(var(--rdm-amber)/0.25)] bg-gradient-to-br from-[hsl(218_25%_14%)] to-[hsl(24_40%_20%)] p-8 text-center"
          >
            <Heart className="w-10 h-10 text-[hsl(var(--rdm-amber))] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Esta música es libre. La plataforma no lo es.
            </h3>
            <p className="text-white/60 text-sm max-w-md mx-auto mb-6 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Mantener la infraestructura de RDM Digital — el mapa, la historia, el directorio y esta biblioteca musical — tiene un costo real. Con tu donación, lo hacemos posible.
            </p>
            <Link
              to="/donar"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[hsl(var(--rdm-amber))] text-white font-semibold text-sm hover:opacity-90 hover:scale-105 transition-all shadow-xl shadow-[hsl(var(--rdm-amber)/0.3)]"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Donar ahora <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Sticky player */}
      <AnimatePresence>
        {activeSong && (
          <PlayerBar
            song={activeSong}
            audioUrl={audioUrl}
            playing={playing}
            onToggle={() => setPlaying((p) => !p)}
            onPrev={() => {
              if (activeIdx !== null && activeIdx > 0) playSong(activeIdx - 1);
            }}
            onNext={() => {
              if (activeIdx !== null && activeIdx < songs.length - 1) playSong(activeIdx + 1);
              else setPlaying(false);
            }}
            hasPrev={activeIdx !== null && activeIdx > 0}
            hasNext={activeIdx !== null && activeIdx < songs.length - 1}
          />
        )}
      </AnimatePresence>
    </RDMLayout>
  );
}
