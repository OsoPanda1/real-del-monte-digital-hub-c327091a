import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Compass, MapPin, BookOpen, Users, Building2, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SidebarLink {
  to: string;
  label: string;
}
interface SidebarSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  links: SidebarLink[];
}

/**
 * Mapa contextual: según la ruta actual, mostramos solo las secciones que aportan.
 * Las claves coinciden con la base del pathname (ej. "/mapa", "/capitulos").
 */
const CONTEXT_MAP: Record<string, string[]> = {
  "/": ["explora", "guia"],
  "/mapa": ["explora", "guia", "comercio"],
  "/lugares": ["explora", "guia"],
  "/rutas": ["explora", "guia"],
  "/capitulos": ["guia", "comunidad"],
  "/comercios": ["comercio"],
  "/comunidad": ["comunidad"],
  "/perfil": ["comunidad"],
  "/admin": ["admin"],
};

const SECTIONS: SidebarSection[] = [
  {
    id: "explora",
    label: "Explorar territorio",
    icon: Compass,
    links: [
      { to: "/mapa", label: "Mapa soberano" },
      { to: "/lugares", label: "Lugares" },
      { to: "/rutas", label: "Rutas" },
      { to: "/ecoturismo", label: "Ecoturismo" },
    ],
  },
  {
    id: "guia",
    label: "Guía narrativa",
    icon: BookOpen,
    links: [
      { to: "/capitulos", label: "Capítulos" },
      { to: "/capitulos/minas", label: "Minas" },
      { to: "/capitulos/pastes", label: "Pastes" },
      { to: "/capitulos/leyendas", label: "Leyendas" },
    ],
  },
  {
    id: "comercio",
    label: "Comercio local",
    icon: Building2,
    links: [
      { to: "/comercios", label: "Catálogo" },
      { to: "/registro-comercio", label: "Registro" },
      { to: "/negocios", label: "Portal negocios" },
    ],
  },
  {
    id: "comunidad",
    label: "Comunidad",
    icon: Users,
    links: [
      { to: "/comunidad", label: "Foro" },
      { to: "/leaderboard", label: "Ranking" },
      { to: "/perfil", label: "Mi perfil" },
    ],
  },
  {
    id: "admin",
    label: "Administración",
    icon: Sparkles,
    links: [{ to: "/admin", label: "Panel admin" }],
  },
];

const ICON_FOR_SECTION: Record<string, React.ComponentType<{ className?: string }>> = {
  explora: MapPin,
  guia: BookOpen,
  comercio: Building2,
  comunidad: Users,
  admin: Sparkles,
};

function matchContext(pathname: string): string[] {
  const base = "/" + pathname.split("/")[1];
  return CONTEXT_MAP[base] ?? CONTEXT_MAP[pathname] ?? ["explora", "guia"];
}

/**
 * SmartSidebar — Barra lateral inteligente en acordeón.
 * - Replegable (icon-only) con `collapsed`.
 * - Acordeón con secciones contextuales según ruta.
 * - Persiste estado en localStorage.
 * - Oculta en rutas de auth/admin embebido si así se desea.
 */
export default function SmartSidebar() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("rdm.sidebar.collapsed") === "1";
  });
  const [openSection, setOpenSection] = useState<string>("");

  useEffect(() => {
    localStorage.setItem("rdm.sidebar.collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const visible = useMemo(() => {
    const ids = new Set(matchContext(pathname));
    return SECTIONS.filter((s) => ids.has(s.id));
  }, [pathname]);

  // Auto-abrir la primera sección contextual al cambiar de ruta
  useEffect(() => {
    if (visible.length && !collapsed) setOpenSection(visible[0].id);
  }, [pathname, visible, collapsed]);

  // Ocultar en intro / auth completo
  if (pathname === "/auth" || pathname === "/login" || pathname === "/register") return null;

  return (
    <aside
      aria-label="Barra de herramientas contextual"
      className={`hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-2 transition-all duration-300 ${
        collapsed ? "w-12" : "w-64"
      }`}
    >
      <div className="rounded-r-2xl glass-card border border-l-0 border-[hsl(var(--gold)/0.2)] shadow-premium p-2">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expandir barra de herramientas" : "Replegar barra de herramientas"}
          className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-lg hover:bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--foreground))] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--electric))]"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="text-[10px] uppercase tracking-[0.22em]">Herramientas</span>}
        </button>

        {collapsed ? (
          <nav aria-label="Atajos contextuales" className="mt-2 flex flex-col gap-1">
            {visible.map((s) => {
              const Icon = ICON_FOR_SECTION[s.id] ?? Compass;
              return (
                <Link
                  key={s.id}
                  to={s.links[0]?.to ?? "/"}
                  aria-label={s.label}
                  title={s.label}
                  className="flex items-center justify-center p-2 rounded-lg hover:bg-[hsl(var(--muted)/0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--electric))]"
                >
                  <Icon className="h-4 w-4 text-[hsl(var(--electric))]" />
                </Link>
              );
            })}
          </nav>
        ) : (
          <Accordion
            type="single"
            collapsible
            value={openSection}
            onValueChange={setOpenSection}
            className="mt-2"
          >
            {visible.map((s) => {
              const Icon = s.icon;
              return (
                <AccordionItem key={s.id} value={s.id} className="border-[hsl(var(--border))]">
                  <AccordionTrigger className="px-2 py-2 text-sm hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[hsl(var(--electric))]" />
                      {s.label}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1">
                    <ul className="flex flex-col gap-0.5 pl-6">
                      {s.links.map((l) => (
                        <li key={l.to}>
                          <Link
                            to={l.to}
                            className={`block px-2 py-1.5 text-xs rounded-md hover:bg-[hsl(var(--muted)/0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--electric))] ${
                              pathname === l.to
                                ? "text-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.08)]"
                                : "text-[hsl(var(--foreground)/0.8)]"
                            }`}
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </aside>
  );
}
