// @ts-nocheck
/**
 * Navigation Bar - Barra de navegación inmersiva inteligente
 * Flotante, translúcida, adaptativa al contexto, estilo Constelación TAMV
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Sparkles,
  GraduationCap,
  Music,
  Ticket,
  ShoppingBag,
  Shield,
  MessageCircle,
  Settings,
  Bell,
  Wallet,
  User,
  Menu,
  X,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
  highlight?: boolean;
}

const NavigationBar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const mainItems: NavItem[] = [
    { id: "home", icon: Home, label: "Inicio", path: "/" },
    { id: "community", icon: Users, label: "Comunidad", path: "/community" },
    { id: "dreamspaces", icon: Sparkles, label: "XR", path: "/dreamspaces", highlight: true },
    { id: "university", icon: GraduationCap, label: "Universidad", path: "/university" },
    { id: "music", icon: Music, label: "Música", path: "/music" },
    { id: "lottery", icon: Ticket, label: "Lotería", path: "/lottery" },
    { id: "marketplace", icon: ShoppingBag, label: "Marketplace", path: "/marketplace" },
    { id: "governance", icon: Shield, label: "Governance", path: "/governance" },
  ];

  const quickActions: NavItem[] = [
    { id: "notifications", icon: Bell, label: "Notificaciones", path: "/notifications", badge: 5 },
    { id: "wallet", icon: Wallet, label: "Wallet", path: "/wallet" },
    { id: "chat", icon: MessageCircle, label: "Chat", path: "/chat" },
    { id: "profile", icon: User, label: "Perfil", path: "/profile" },
    { id: "settings", icon: Settings, label: "Ajustes", path: "/settings" },
  ];

  // Control de visibilidad con scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsExpanded(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsExpanded(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="relative">
            {/* Barra principal: anillo cristal TAMV */}
            <motion.div
              layout
              className="tamv-nav-immersive flex items-center gap-1 px-2 py-1"
            >
              {/* halo interno leve (conic) */}
              <div className="pointer-events-none absolute inset-[1px] rounded-[999px] border border-transparent bg-[conic-gradient(from_160deg,rgba(59,245,255,0.2),rgba(192,132,252,0.24),rgba(59,245,255,0.2))] opacity-40 mix-blend-soft-light" />

              {/* Items principales */}
              <div className="relative z-10 flex items-center gap-1">
                {mainItems.map((item) => {
                  const isActive = location.pathname === item.path;

                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ y: -1, scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleNavigation(item.path)}
                      className={cnNavItem(isActive, item.highlight)}
                    >
                      <span className="relative flex items-center justify-center">
                        <item.icon className="w-4 h-4 md:w-5 md:h-5 drop-shadow-[0_0_8px_rgba(59,245,255,0.5)]" />
                        {/* Glow XR dedicado para DreamSpaces */}
                        {item.highlight && (
                          <span className="pointer-events-none absolute inset-0 rounded-xl bg-cyan-400/15 blur-sm animate-pulse" />
                        )}
                      </span>
                      <span className="relative mt-1 text-[10px] font-medium tracking-[0.16em] uppercase">
                        {item.label}
                      </span>

                      {/* Indicador activo como “estrella” en la órbita */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="pointer-events-none absolute -bottom-[6px] h-[6px] w-[18px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.8)]"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Separador */}
              <div className="relative z-10 mx-1 h-8 w-px bg-gradient-to-b from-cyan-400/40 via-slate-500/40 to-blue-500/40" />

              {/* Botón de expandir HUD */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative z-10 h-10 w-10 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-cyan-300/40 text-slate-100 shadow-[0_0_18px_rgba(15,23,42,0.9)]"
              >
                {isExpanded ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </motion.div>

            {/* Panel expandido: HUD superior */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2"
                >
                  <div className="relative rounded-2xl border border-slate-500/60 bg-slate-950/90 backdrop-blur-2xl px-3 py-2 shadow-[0_18px_40px_rgba(15,23,42,0.98),0_0_45px_rgba(56,189,248,0.35)]">
                    {/* halo interno */}
                    <div className="pointer-events-none absolute inset-[1px] rounded-[1rem] border border-transparent bg-[conic-gradient(from_140deg,rgba(59,245,255,0.25),rgba(192,132,252,0.25),rgba(59,245,255,0.25))] opacity-40 mix-blend-soft-light" />

                    {/* ruido sutil */}
                    <div className="pointer-events-none absolute inset-0 opacity-35 mix-blend-soft-light bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%220%200%20160%20160%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter%20id=%22n%22%3E%3CfeTurbulence%20type=%22fractalNoise%22%20baseFrequency=%221.6%22%20numOctaves=%223%22%20stitchTiles=%22noStitch%22/%3E%3C/filter%3E%3Crect%20width=%22100%25%22%20height=%22100%25%22%20filter=%22url(%23n)%22%20opacity=%220.28%22/%3E%3C/svg%3E')]" />

                    <div className="relative z-10 flex items-center gap-2">
                      {quickActions.map((item) => (
                        <motion.button
                          key={item.id}
                          whileHover={{ y: -1, scale: 1.05 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleNavigation(item.path)}
                          className="relative flex flex-col items-center justify-center rounded-xl px-3 py-2 text-[11px] text-slate-300 hover:text-slate-50 hover:bg-slate-800/60 transition-colors"
                        >
                          <span className="relative flex items-center justify-center">
                            <item.icon className="w-4 h-4 md:w-5 md:h-5 drop-shadow-[0_0_8px_rgba(59,245,255,0.5)]" />
                          </span>
                          <span className="mt-1 text-[10px] tracking-[0.14em] uppercase">
                            {item.label}
                          </span>

                          {item.badge && item.badge > 0 && (
                            <Badge
                              variant="destructive"
                              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </motion.button>
                      ))}
                    </div>

                    {/* Flecha HUD */}
                    <div className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 h-4 w-4 rotate-45 border-r border-b border-slate-500/60 bg-slate-950/90" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Indicador de "subir" cuando hay mucho scroll */}
            {lastScrollY > 500 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="absolute -top-12 left-1/2 -translate-x-1/2 p-2 rounded-full border border-slate-500/60 bg-slate-950/85 text-slate-300 hover:text-slate-50 hover:bg-slate-900/90 backdrop-blur-md shadow-[0_0_24px_rgba(15,23,42,0.95)] transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

function cnNavItem(isActive: boolean, highlight?: boolean): string {
  const base =
    "relative flex flex-col items-center justify-center px-2 py-1.5 rounded-2xl min-w-[3.1rem] text-[10px] transition-all duration-200";
  if (isActive) {
    return [
      base,
      "bg-slate-900/80 text-cyan-300",
      "shadow-[0_0_22px_rgba(34,211,238,0.7)] border border-cyan-300/50",
    ].join(" ");
  }
  if (highlight) {
    return [
      base,
      "text-slate-200 border border-cyan-300/40 bg-slate-900/70 hover:bg-slate-900/90",
    ].join(" ");
  }
  return [
    base,
    "text-slate-400 border border-transparent hover:text-slate-50 hover:bg-slate-900/60",
  ].join(" ");
}

export default NavigationBar;
