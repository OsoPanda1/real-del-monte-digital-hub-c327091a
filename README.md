# Real del Monte Digital Hub

**Plataforma Territorial Inteligente — Gemelo Digital Soberano de Real del Monte, Hidalgo, México**

[www.visitarealdelmonte.online](https://www.visitarealdelmonte.online)

---

## Índice

1. [¿Qué es?](#1-qué-es)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Catálogo de Páginas](#4-catálogo-de-páginas)
5. [Componentes UI](#5-componentes-ui)
6. [Módulos Funcionales](#6-módulos-funcionales)
7. [Supabase: Base de Datos](#7-supabase-base-de-datos)
8. [Supabase: Edge Functions](#8-supabase-edge-functions)
9. [Seguridad](#9-seguridad)
10. [Despliegue en Vercel](#10-despliegue-en-vercel)
11. [Variables de Entorno](#11-variables-de-entorno)
12. [Scripts](#12-scripts)
13. [Roadmap](#13-roadmap)

---

## 1. ¿Qué es?

Real del Monte Digital Hub es un **Sistema Operativo Territorial (LTOS)** de código abierto que unifica el patrimonio cultural, turístico, económico y social de Real del Monte en una plataforma digital viva. Más de **580 archivos TypeScript/TSX** distribuidos en frontend SPA, backend Express, edge functions serverless y orquestación Kubernetes.

### Funcionalidades principales

| Área | Descripción |
|------|-------------|
| **Portal turístico** | Rutas, lugares, gastronomía, mapa interactivo 2D/3D, eventos |
| **Directorio comercial** | Comercios, registro, checkout, membresías, suscripciones premium (Stripe) |
| **Planes Premium** | 4 planes (usuarios $99/$129 MXN, comercios $199/$299 MXN) vía Stripe Checkout |
| **Archivo sonoro** | Música regional con donaciones vía Stripe |
| **Isabella AI** | Concierge digital con Gemini API, TTS por Web Speech API, streaming SSE |
| **Gobernanza digital** | Documentación cívica, wiki semántica, reglamentos, RFC system |
| **Gemelo territorial** | Datos de afluencia, clima, sensores IoT, geocercas |
| **Gamificación** | Trivia, memoria, minería de puntos RDM, leaderboard, catálogo de 18 premios |
| **Dashboard admin + telemetría** | Gestión de contenido, health de 7 federaciones, KPIs 24h, alertas |
| **Conectividad** | Red social interna, comentarios, community posts |
| **E-commerce** | Stripe checkout, membresías premium, donaciones, pagos merchant |
| **Lazy Loading** | LazyImage con IntersectionObserver + skeleton pulse + fade-in |
| **Kubernetes + Docker** | docker-compose.yml + k8s/ manifests para despliegue auto-gestionado |

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 18 + TypeScript, Vite 7, Tailwind CSS 3, shadcn/ui |
| **Animación** | Framer Motion 12, Three.js / React Three Fiber (imports optimizados) |
| **Mapas** | Leaflet + React Leaflet, Supercluster |
| **Estado** | @tanstack/react-query, React Context |
| **Formularios** | react-hook-form + Zod |
| **BaaS / DB** | Supabase (PostgreSQL 15 + PostGIS, Auth, RLS, Edge Functions) |
| **IA** | Google Gemini API 2.0 Flash vía Edge Functions |
| **Pagos** | Stripe (checkout, webhooks, customer portal, idempotencia) |
| **Observabilidad** | Sentry (errores), PostHog (analytics + feature flags) |
| **CD/CI** | GitHub Actions (lint → typecheck → test → build → deploy) |
| **Hosting** | Vercel (Edge Network, CDN, preview deploys, analytics) |
| **Service Worker** | Cache-first assets, network-first API, offline fallback |
| **Orquestación** | Docker Compose + Kubernetes (k8s/ manifests) |

### Dependencias críticas

- **Vercel** — hosting y CDN del frontend SPA (único target; Cloudflare eliminado)
- **Supabase** — PostgreSQL, autenticación, edge functions, storage, RLS
- **Stripe** — pagos online (donaciones música, membresías premium, merchant payments)
- **Gemini API** — backend de Isabella AI (server-side only, secreto GEMINI_API_KEY)
- **Sentry** — error tracking en producción
- **PostHog** — analytics y feature flags

---

## 3. Estructura del Proyecto

```
/
├── src/                         ← Código fuente principal (582 TS/TSX)
│   ├── pages/                   ← 116 páginas (rutas)
│   ├── components/              ← 191 componentes React
│   │   ├── ui/                  ← shadcn/ui primitives (40+)
│   │   ├── layout/              ← Layout, navbar, footer
│   │   ├── map/                 ← Mapas (Leaflet, 3D Twin)
│   │   ├── isabella/            ← Componentes de Isabella AI
│   │   ├── rdm/                 ← Componentes territoriales RDM
│   │   ├── business/            ← Directorio comercial
│   │   ├── music/               ← Reproductor de música
│   │   ├── home/                ← Home page components
│   │   └── ...                  ← atlas, transport, metaverse, admin
│   ├── hooks/                   ← 15+ custom hooks
│   ├── lib/                     ← Utilidades, APIs, kernels
│   ├── modules/                 ← 20 módulos funcionales
│   ├── security/                ← Criptografía PQC, seguridad
│   ├── contexts/                ← React Contexts (Auth, Audio, Visual)
│   ├── integrations/            ← Supabase, Sentry, PostHog
│   ├── types/                   ← TypeScript types
│   └── assets/                  ← Imágenes, audio (MP3)
│
├── supabase/                    ← Configuración Supabase
│   ├── functions/               ← 20 Edge Functions (Deno + Zod + rate-limit)
│   │   └── _shared/             ← Helpers: validation.ts, rate-limit.ts
│   ├── migrations/              ← 15 migraciones SQL (RLS, storage, ontología)
│   ├── config.toml              ← Config Supabase (stripe-webhook verify_jwt=false)
│   └── seed.sql                 ← Datos de semilla
│
├── public/                      ← Archivos estáticos
│   ├── sw.js                    ← Service Worker (PWA)
│   ├── manifest.json            ← PWA manifest
│   ├── sitemap.xml              ← SEO sitemap
│   └── robots.txt               ← Crawling rules
│
├── server/                      ← Backend Express (independiente)
│   └── src/                     ← 72 archivos (rutas, servicios, middleware)
│
├── api/                         ← Vercel Edge Functions
│   └── telemetry.js             ← Endpoint de telemetría con CSP defensivo
│
├── docs/                        ← Documentación
│   ├── patches/                 ← 5 parches de seguridad/infraestructura
│   ├── AI-OPS-MANUAL.md         ← Manual de operaciones IA
│   ├── ARCHITECTURE.md          ← Arquitectura del sistema
│   ├── CHECKLIST.md             ← Checklist de remediación
│   ├── ROADMAP.md               ← Roadmap de tiempos AI-a-AI
│   └── ... (15+ documentos)
│
├── .github/workflows/           ← CI/CD
│   ├── ci.yml                   ← CI principal (lint, typecheck, test, build)
│   └── security.yml             ← Seguridad (Gitleaks, TruffleHog, CodeQL)
│
├── k8s/                         ← Manifiestos Kubernetes
│   ├── deployment.yaml          ← Deployment de la app
│   ├── service.yaml             ← Service
│   ├── ingress.yaml             ← Ingress
│   ├── namespace.yaml           ← Namespace
│   └── kustomization.yaml       ← Kustomize
│
├── e2e/                         ← Tests E2E (Playwright)
├── tests/                       ← Tests de integración
├── tools/                       ← Scripts auxiliares
├── docker-compose.yml           ← Orquestación local (PostgreSQL 15 + app)
└── vitest.config.ts             ← Config Vitest (jsdom, V8 coverage, thresholds)
```

---

## 4. Catálogo de Páginas

### 4.1. Portal Turístico

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/` | Index | Home con CinematicIntro, vitrina territorial |
| `/historia` | Historia | Historia de Real del Monte (timeline, personajes, galería) |
| `/lugares` | Lugares | Directorio de lugares turísticos |
| `/rutas` | Rutas | 6 rutas turísticas detalladas |
| `/mapa` | Mapa | Mapa interactivo con 2D/3D twin |
| `/mapa-vivo` | MapaVivo | Mapa exploración fog-of-war |
| `/gastronomia` | Gastronomia | Guía gastronómica |
| `/eventos` | Eventos | Calendario de eventos culturales |
| `/mina` | Mina | Historia minera interactiva |
| `/ecoturismo` | Ecoturismo | Actividades eco-turísticas |
| `/shuttle` | ShuttleCDMX | Transporte CDMX → Real del Monte |
| `/transporte-local` | TransporteLocal | Transporte interno |
| `/recorridos` | Recorridos | Tours guiados |
| `/ruta-del-paste` | RutaDelPaste | Ruta gastronómica del paste |

### 4.2. Cultura y Patrimonio

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/cultura` | Cultura | Portal cultural |
| `/atlas` | Atlas | Atlas territorial interactivo |
| `/atlas/calles` | AtlasCalles | Calles históricas |
| `/atlas/capitulos` | AtlasCapitulos | Capítulos del atlas |
| `/atlas/cementerio` | AtlasCementerio | Panteón Inglés |
| `/atlas/leyendas` | AtlasLeyendas | Leyendas locales |
| `/atlas/maximus` | AtlasMaximus | Atlas máximo |
| `/atlas/minas` | AtlasMinas | Minas históricas |
| `/atlas/pastes` | AtlasPastes | Historia del paste |
| `/arte` | Arte | Galería de arte local |
| `/dichos` | Dichos | Dichos y refranes populares (41 entradas, segmentación fonética) |
| `/mitos` | Mitos | Mitología local |
| `/relatos` | Relatos | Relatos históricos |
| `/patrimonio` | PatrimonioCultural | Patrimonio cultural |
| `/enciclopedia` | EnciclopediaUniversal | Enciclopedia digital |

### 4.3. Comercio y Economía

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/comercios` | Comercios | Directorio de comercios |
| `/comercios/checkout` | ComerciosCheckout | Checkout de compras |
| `/comercios/panel` | ComerciosPanel | Panel del comerciante |
| `/comercios/registro` | ComerciosRegistro | Registro de comercio |
| `/catalogo` | Catalogo | Catálogo de productos |
| `/membresias` | Membresias | Membresías premium |
| `/membership` | Membership | Detalle de membresía |
| `/economia` | EconomiaFederada | Economía federada |
| `/b2b` | B2BPortal | Portal B2B |
| `/negocios` | NegociosPortal | Portal de negocios |
| `/premium` | PremiumPlans | Planes premium (4 tiers: 99/129/199/299 MXN) |
| `/rewards` | (en GamePortal) | Catálogo de 18 premios canjeables con puntos |

### 4.4. Isabella AI

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/isabella` | IsabellaAI | Chat con Isabella AI |
| `/isabella-ai` | IsabellaAI | Wiki de Isabella AI |
| `/realito` | RealitoAI | Realito AI chat |
| `/ia-agentes` | IAAgentes | Agentes IA |
| `/tamv-hub` | TAMVHub | Hub TAMV |
| `/tamv-thesis` | TAMVThesis | Tesis TAMV |
| `/tamv-status` | TAMVStatus | Estado TAMV |
| `/api-explorer` | TAMVApiExplorer | Explorador de API |

### 4.5. Gobernanza y Documentación

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/documentacion` | Documentacion | Centro de documentación |
| `/gobernanza` | Gobernanza | Portal de gobernanza |
| `/wiki` | Wiki | Wiki semántica |
| `/wiki-tamv` | WikiTAMV | Wiki TAMV |
| `/filosofia` | Filosofia | Filosofía del proyecto |
| `/reglamento` | Reglamento | Reglamento |
| `/casos-de-uso` | CasosDeUso | Casos de uso |
| `/manuales` | Manuales | Manuales técnicos |
| `/despliegue` | Despliegue | Documentación de despliegue |
| `/arquitectura` | Arquitectura | Arquitectura del sistema |
| `/ecosistema` | EcosistemaLTOS | Ecosistema LTOS |
| `/introduccion` | Introduccion | Introducción al proyecto |
| `/rfcs` | RFCList | Sistema RFC modular (7 RFCs en 3 secciones) |
| `/rfc/:id` | RFCDetail | Detalle de RFC individual |

### 4.6. Comunidad y Social

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/comunidad` | Comunidad | Centro comunitario |
| `/feed` | Feed | Red social interna |
| `/perfil` | Perfil | Perfil de usuario |
| `/leaderboard` | Leaderboard | Tabla de líderes |
| `/donar` | Donar | Donaciones |
| `/apoya` | Apoya | Apoyo al proyecto |

### 4.7. Juegos y Gamificación

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/juegos` | Juegos | Portal de juegos |
| `/games` | GamePortal | Portal de juegos (paywall premium) |
| `/trivia` | (en Juegos) | Trivia territorial |
| `/memoria` | (en Juegos) | Memory Game |
| `/blockchain` | BlockchainMSR | Minería blockchain MSR |

### 4.8. Música

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/musica` | Musica | Archivo sonoro |
| `/music` | Music | Portal de música |
| `/archivo-sonoro` | ArchivoSonoro | Archivo sonoro con donaciones |
| `/music-detail` | MusicDetail | Detalle de canción |

### 4.9. Observabilidad

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/telemetry` | TelemetryDashboard | Dashboard de telemetría: health 7 federaciones + KPIs 24h + alertas |
| `/admin` | Admin | Panel de administración |
| `/dashboard` | Dashboard | Dashboard general |
| `/admin/dashboard` | admin/Dashboard | Dashboard admin |
| `/operativo` | Operativo | Panel operativo |
| `/territorial` | TerritorialDashboard | Dashboard territorial |
| `/control` | ControlCenter | Centro de control |
| `/guardian` | Guardian | Panel del guardian |

### 4.10. Autenticación

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/auth` | Auth | Login/Signup con Google OAuth |
| `/login` | Login | Login |
| `/register` | Register | Registro |
| `/*` | NotFound | 404 |

---

## 5. Componentes UI

La carpeta `src/components/` contiene **191 componentes** agrupados en categorías:

| Directorio | Componentes | Propósito |
|-----------|-------------|-----------|
| `ui/` | 40+ (Button, Card, Dialog, Input, Select, etc.) | shadcn/ui primitives |
| `layout/` | Navbar, Footer, Sidebar, MobileNav | Layout base |
| `home/` | CinematicIntro, HeroSection, Features | Home page |
| `map/` | MapView, Map3DTwin, TwinNodeVisualizer (imports THREE optimizados) | Mapas 2D/3D |
| `isabella/` | ChatBubble, IsabellaOrb, ThoughtStream, IsabellaChat | Isabella AI UI |
| `rdm/` | RDMLayout, TerritorialStats, RDMNavbar | Marca RDM |
| `business/` | BusinessCard, CommerceList | Directorio comercial |
| `music/` | Player, Playlist, TrackCard | Reproductor musical |
| `atlas/` | AtlasView, LayerPanel | Atlas territorial |
| `transport/` | ShuttleTimeline, RouteMap | Transporte |
| `community/` | PostCard, CommentSection | Red social |
| `metaverse/` | MetaverseScene, 3DGlobe | Experiencias 3D |
| `admin/` | AdminPanel, MetricsChart | Dashboard admin |
| `modules/` | ModuleCard, FederationStatus | Módulos del sistema |
| `packages/` | PackageCard | Paquetes turísticos |
| `operations/` | HealthMonitor, AlertPanel | Operaciones |
| `territorial/` | GeoFenceView, SensorPanel | Datos territoriales |

### Componentes destacados

| Componente | Archivo | Función |
|-----------|---------|---------|
| LazyImage | `src/components/LazyImage.tsx` | Lazy loading con IntersectionObserver, skeleton pulse, fade-in |
| ImageGallery | `src/components/ImageGallery.tsx` | 20 imágenes históricas con lightbox, categorías, masonry grid |
| VideoGallery | `src/components/VideoGallery.tsx` | Galería de video histórica |
| CinematicIntro | `src/components/CinematicIntro.tsx` | Intro cinemática con audio, user gesture detection, audioBlocked indicator |
| SmartSidebar | `src/components/SmartSidebar.tsx` | Sidebar inteligente con links premium, RFCs, donación |
| SearchOverlay | `src/components/SearchOverlay.tsx` | Búsqueda global |
| RealitoChatLauncher | `src/components/RealitoChatLauncher.tsx` | Launcher de chat Realito |

---

## 6. Módulos Funcionales

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| **Music** | `src/modules/music/` | Reproductor, hooks useMusicPlayer, data/playlist |
| **Map** | `src/modules/map/` | Leaflet integration, markers, clustering |
| **Games** | `src/modules/games/` | Trivia (10 preguntas), Memory Game (cartas) |
| **Dashboard** | `src/modules/dashboard/` | CEO dashboard, telemetry, health, KPI |
| **Core** | `src/modules/core/` | Layout core del sistema |
| **Control** | `src/modules/control/` | Panel de control |
| **Nexo Estelar** | `src/modules/nexoEstelar/` | Navegación celestial |
| **Interfaz Sensorial** | `src/modules/interfazSensorial/` | Efectos sensoriales UI |
| **Constelación** | `src/modules/constelacionInteractiva/` | Navegación constelación |
| **Documentation** | `src/modules/documentation/` | Sistema wiki |
| **Oraculo Tecnologico** | `src/modules/oraculoTecnologico/` | Formularios auth, efectos |
| **Tracking** | `src/modules/tracking/` | Visitor tracking |
| **Paste Route** | `src/modules/paste-route/` | SVG paste route map |

### Custom Hooks

| Hook | Archivo | Función |
|------|---------|---------|
| `useAuth` | `src/hooks/useAuth.tsx` | Autenticación Supabase + Lovable bridge |
| `useIsabella` | `src/hooks/useIsabella.ts` | Chat streaming IA (SSE, protocolos) |
| `useIsabellaVoice` | `src/hooks/useIsabellaVoice.ts` | TTS Web Speech API (voz mexicano-español) |
| `useApi` | `src/hooks/useApi.ts` | Fetch wrapper con errores |
| `useWebSocket` | `src/hooks/useWebSocket.ts` | WebSocket manager |
| `useWeather` | `src/hooks/useWeather.ts` | Clima de Real del Monte |
| `useUserRole` | `src/hooks/useUserRole.ts` | RBAC (admin/operador/lector) |
| `useTimeTheme` | `src/hooks/useTimeTheme.ts` | UI theming por hora |
| `useSystemMode` | `src/hooks/useSystemMode.ts` | Modos NORMAL/SAFE/EMERGENCY |
| `usePaginated` | `src/hooks/usePaginated.ts` | Paginación genérica |
| `useMapSync` | `src/hooks/useMapSync.tsx` | Sincronización 2D/3D mapa |
| `useIsabellaSSE` | `src/hooks/useIsabellaSSE.ts` | Server-Sent Events Isabella |
| `useDemoMode` | `src/hooks/useDemoMode.ts` | Offline/demo fallback |
| `useCivicEvent` | `src/hooks/useCivicEvent.ts` | Gestión de eventos cívicos |
| `useMusicPlayer` | `src/modules/music/hooks/useMusicPlayer.ts` | Reproductor musical |

---

## 7. Supabase: Base de Datos

### Tablas (35+)

| Tabla | Propósito |
|-------|-----------|
| `profiles` | Perfiles de usuario (auth.uid vinculado) |
| `profiles_public` | Vista pública de perfiles (sin email) |
| `user_roles` | Roles RBAC (admin, operator, lector) |
| `businesses` | Directorio de comercios |
| `commerce_subscriptions` | Suscripciones premium de comercios |
| `subscriptions_premium` | Membresías premium de usuarios |
| `events` | Eventos culturales |
| `places` | Puntos de interés turístico |
| `music_tracks` | Canciones del archivo sonoro |
| `music_donations` | Donaciones a artistas |
| `music_donation_intents` | Intenciones de donación (Stripe) |
| `music_plays` | Reproducciones registradas |
| `tour_packages` | Paquetes turísticos |
| `tour_bookings` | Reservas de tours |
| `tour_guides` | Guías turísticos |
| `tour_availability` | Disponibilidad de tours |
| `wiki_articles` | Artículos wiki |
| `community_posts` | Posts de la red social |
| `community_comments` | Comentarios en posts |
| `post_likes` | Likes en posts |
| `trivia_questions` | Preguntas de trivia |
| `mining_nodes` | Nodos de minería blockchain MSR |
| `mining_sessions` | Sesiones de minería |
| `rewards` | Recompensas del sistema |
| `reward_redemptions` | Canjes de recompensas |
| `tracking_events` | Eventos de tracking |
| `foot_traffic` | Datos de afluencia peatonal |
| `paste_pois` | Puntos de interés de paste |
| `paste_ratings` | Calificaciones de paste |
| `federation_health_log` | Health checks federación |
| `federation_thresholds` | Umbrales de federación |
| `system_alerts` | Alertas del sistema |
| `territorial_metrics` | Métricas territoriales |
| `audit_log` | Auditoría de acciones (SHA-256 hash chain) |
| `dt_layers` | Capas del gemelo digital |
| `dt_layer_items` | Items de capas del gemelo |
| `rate_limits` | Rate limiting server-side |
| `stripe_events` | Idempotencia de webhooks Stripe |
| `merchant_registrations` | Registro de comerciantes |
| `merchant_payments` | Pagos de comerciantes |
| `isabella_ontology` | Ontología semántica de Isabella |
| `federations` | 7 federaciones soberanas |
| `themes` | 9 temas ontológicos |

### Storage Buckets

| Bucket | Tipo | Acceso |
|--------|------|--------|
| `media` | Público | Lectura pública, escritura authenticated (carpeta propia) |
| `songs` | Privado | Lectura authenticated, escritura service_role |
| `music-uploads` | Privado | Lectura authenticated, escritura service_role |

### RLS

- 100% de las tablas tienen RLS habilitado con políticas explícitas
- Roles: `anon` (solo lectura pública), `authenticated` (lectura/escritura propios), `service_role` (administración)
- Tablas sensibles (`rate_limits`, `stripe_events`, `audit_log`) sin acceso público

---

## 8. Supabase: Edge Functions

20 funciones serverless en Deno:

| Función | Ruta | Propósito | Rate Limit |
|---------|------|-----------|------------|
| `isabella-ai` | `supabase/functions/isabella-ai/` | Chat con Isabella AI (Gemini 2.0 Flash, streaming SSE) | No |
| `isabella-ontology` | `supabase/functions/isabella-ontology/` | Ontología semántica federada | No |
| `realito-chat` | `supabase/functions/realito-chat/` | Realito AI chat (Gemini) | No |
| `stripe-webhook` | `supabase/functions/stripe-webhook/` | Webhooks de Stripe (verify_jwt=false, idempotencia) | No |
| `create-commerce-checkout` | `supabase/functions/create-commerce-checkout/` | Checkout de comercios (Zod + rate-limit) | 10/min |
| `create-premium-checkout` | `supabase/functions/create-premium-checkout/` | Checkout premium (Zod + rate-limit) | 10/min |
| `create-merchant-payment` | `supabase/functions/create-merchant-payment/` | Pago a comerciantes (Zod + rate-limit) | 5/min |
| `merchant-payment-webhook` | `supabase/functions/merchant-payment-webhook/` | Webhook pagos comerciantes (verify_jwt=false) | No |
| `create-music-donation` | `supabase/functions/create-music-donation/` | Donación música (Stripe) | No |
| `customer-portal` | `supabase/functions/customer-portal/` | Portal de cliente Stripe | No |
| `check-subscription` | `supabase/functions/check-subscription/` | Verificar suscripción | No |
| `rdm-membership-activate` | `supabase/functions/rdm-membership-activate/` | Activar membresía RDM | No |
| `rdm-redeem` | `supabase/functions/rdm-redeem/` | Canje de puntos RDM | No |
| `rdm-mine` | `supabase/functions/rdm-mine/` | Minería de puntos RDM (rate-limit) | 30/min |
| `award-points` | `supabase/functions/award-points/` | Otorgar puntos server-side (6 acciones + cooldowns) | 60/min |
| `metrics-aggregates` | `supabase/functions/metrics-aggregates/` | Agregación de métricas | No |
| `federation-health` | `supabase/functions/federation-health/` | Health check federación (7 nodos) | No |
| `alerts-engine` | `supabase/functions/alerts-engine/` | Motor de alertas | No |
| `ingest-event` | `supabase/functions/ingest-event/` | Ingesta de eventos | No |

### Helpers Compartidos

| Archivo | Función |
|---------|---------|
| `_shared/validation.ts` | Schemas Zod para checkout, merchant, award-points |
| `_shared/rate-limit.ts` | Rate limiter vía tabla `rate_limits` con check-then-update |

### Migraciones (15)

| Archivo | Fecha | Propósito |
|---------|-------|-----------|
| `20260531224129_...` | May 31 | Inicial: forum_posts + forum_comments |
| `20260531224157_...` | May 31 | image_url/video_url + likes |
| `20260531224211_...` | May 31 | search_path en trigger |
| `20260607221114_...` | Jun 7 | Core: profiles, badges, points, auto-profile |
| `20260607221134_...` | Jun 7 | Revoke execute en funciones |
| `20260609003026_...` | Jun 9 | Defense-in-depth, CHECK constraints |
| `20260612141747_...` | Jun 12 | Admin whitelist, songs + RLS |
| `20260612141807_...` | Jun 12 | Revoke execute auto-grant-admin |
| `20260626000000_...` | Jun 26 | RLS HARDENING P0 (4 políticas corregidas) |
| `20260627000000_...` | Jun 27 | Territorial data collection |
| `20260627120000_...` | Jun 28 | Pipeline, alerts, federation health |
| `20260629000000_...` | Jun 29 | Audit log SHA-256 hash chain |
| `20260629000001_...` | Jun 29 | Platform fix + storage policies |
| `20260630000000_...` | Jun 30 | Isabella ontology (7 federations, 9 themes) |
| `20260630000001_...` | Jun 30 | rate_limits table + 3 storage buckets |

---

## 9. Seguridad

| Componente | Archivo | Función |
|-----------|---------|---------|
| Criptografía PQC | `src/security/PostQuantumCrypto.ts` | AES-256-GCM + HMAC SHA-512 |
| Aislamiento de contexto | `src/security/ContextIsolation.ts` | Sandbox seguro para ejecución federada |
| Blockchain connector | `src/security/BlockchainConnector.ts` | Polygon/MSR anchoring |
| Validación de inputs | `src/security/InputValidation.ts` | Zod sanitization |
| Protocolo de apagado | `src/security/ShutdownProtocol.ts` | Graceful shutdown con integrity checkpoints |
| Autenticación | `src/hooks/useAuth.tsx` | Supabase Auth + JWT + Google OAuth |
| RBAC | `src/hooks/useUserRole.ts` | Roles admin/operator/lector + auditoría |
| CSP | `vercel.json` | Content Security Policy estricta (Report-Only + enforcement) |
| HSTS | `vercel.json` | HTTP Strict Transport Security (2 años, preload) |
| Rate limiting | `supabase/functions/_shared/rate-limit.ts` | 5 edge functions con límite por ventana |
| Validación Zod | `supabase/functions/_shared/validation.ts` | Schemas en checkout, merchant, award-points |
| Safe errors | `supabase/functions/_shared/` | Sin stack traces en respuestas HTTP |
| CI/CD Security | `.github/workflows/security.yml` | Gitleaks, TruffleHog, CodeQL, npm audit |
| Auth flexible | Edge functions | Fallback anonymous en isabella-ai/realito-chat si JWT falla |
| Idempotencia | `stripe-webhook` | Deduplicación por event.id (pendiente migración) |

### Parches de Seguridad (docs/patches/)

Los siguientes parches están documentados y listos para aplicar:

| Parche | Riesgo | Módulo |
|--------|--------|--------|
| `01-auth-isabella.patch.md` | Crítico | Auth + IA (bypass anonymous, VITE_GEMINI_API_KEY leak) |
| `02-build-vercel.patch.md` | Crítico | Build (vite ^7, rollupOptions.external, lockfile único) |
| `03-stripe-hardening.patch.md` | Alto | Stripe (constructEventAsync, idempotencia, safeError) |
| `04-rls-ci-gate.patch.md` | Alto | Supabase RLS (audit SQL + GH Action workflow) |
| `05-headers-csp.patch.md` | Alto | CSP y HSTS en Vercel |

---

## 10. Despliegue en Vercel

### 10.1. Pipeline de CI/CD

```
Push a main
  ↓
GitHub Actions: fast-checks (lint + typecheck)
  ↓
GitHub Actions: quality (unit tests + build en Node 20)
  ↓
GitHub Actions: e2e (Playwright, 2 shards)
  ↓
GitHub Actions: deploy-vercel (npm run build + vercel --prod)
  ↓
Vercel Edge Network: CDN + HTTPS + Runtime Node.js 24.x
```

### 10.2. Archivo vercel.json

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install --legacy-peer-deps",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        { "type": "host", "value": "visitarealdelmonte.online" },
        { "type": "header", "key": "x-forwarded-proto", "value": "http" }
      ],
      "destination": "https://www.visitarealdelmonte.online/$1",
      "statusCode": 301
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(self)" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.posthog.com https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' https: blob:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://*.posthog.com https://*.ingest.sentry.io; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 10.3. Orquestación Alternativa

Además de Vercel, el proyecto incluye:

- **Docker Compose:** `docker-compose.yml` con PostgreSQL 15 + app frontend
- **Kubernetes:** `k8s/` con deployment, service, ingress, namespace, secrets template, kustomization

### 10.4. Dominio

- **Producción:** `www.visitarealdelmonte.online` (DNS en Vercel)
- **Preview:** `https://real-del-monte-digital-hub-*.vercel.app` (automático por PR)

### 10.5. Entorno de producción (Vercel)

- Node.js Runtime: 24.x
- Región: `iad1` (us-east-1)

---

## 11. Variables de Entorno

```env
# Supabase
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxx

# Stripe (para Edge Functions)
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx

# Isabella AI (Edge Functions - SERVER-SIDE ONLY, sin prefijo VITE_)
GEMINI_API_KEY=AIzaxxxxxxxxxxxx

# Observabilidad
VITE_SENTRY_DSN=https://xxxxx@xxxxx.ingest.us.sentry.io/xxxxx
VITE_POSTHOG_KEY=phc_xxxxx
VITE_POSTHOG_HOST=https://us.i.posthog.com

# Vercel
VERCEL_TOKEN=  # GitHub Actions secret
VERCEL_ORG_ID=  # GitHub Actions secret
VERCEL_PROJECT_ID=  # GitHub Actions secret
```

> **Nota:** `GEMINI_API_KEY` NO lleva prefijo `VITE_`. El prefijo `VITE_` inyecta la variable al bundle del navegador, exponiendo la clave. Gemini solo se llama desde edge functions (server-side).

---

## 12. Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev server (Vite, port 8080, HMR overlay desactivado) |
| `npm run build` | Build producción (Vite, chunk splitting, CSS minificado) |
| `npm run build:dev` | Build modo development |
| `npm run preview` | Preview del build |
| `npm run lint` | ESLint (flat config, no-console, restricted imports) |
| `npm run typecheck` | TypeScript check (tsc --noEmit) |
| `npm test` | Vitest unit tests (jsdom, V8 coverage) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Vitest con cobertura (threshold 60%) |
| `npm run e2e` | Playwright E2E tests |
| `npm run e2e:ui` | Playwright UI mode |

---

## 13. Roadmap

### ✅ COMPLETADO — Fase 0-4
- [x] Kernel MD-X5 (Receive→Evaluate→Plan→Execute→Commit→Reconcile)
- [x] TIME UP Governance (10 políticas, ledger SHA-256)
- [x] Isabella AI con Gemini API + TTS Web Speech API
- [x] Heptafederación F1-F7 (FederationBus, health checks)
- [x] Pipeline Hexagonal de Conciencia (Double Pipeline)
- [x] Sistema Territorial (DataCollector, Geofencer, 6 zonas)
- [x] Sistema Unificado GEN-8.0 (EventBus, Supervisor, Persistence, SDK)
- [x] Seguridad Post-Cuántica (Web Crypto API: AES-GCM, HMAC SHA-512)
- [x] Supabase: 15 migraciones SQL, 35+ tablas, RLS, PostGIS, storage buckets
- [x] 20 Edge Functions (Stripe, Isabella, métricas, federación, rate-limit)
- [x] 4 Planes Premium (Stripe Checkout, Zod + rate limiting)
- [x] Juegos → Puntos → Premios (Trivia, Memory, 18 premios, cooldowns)
- [x] Lazy Loading (LazyImage con IntersectionObserver)
- [x] RFC System (7 RFCs en 3 secciones, tipos unificados)
- [x] Telemetry Dashboard (health federaciones + KPIs + alertas)
- [x] Isabella Chat con JWT + Voz (Web Speech API, intro MP3)
- [x] Vercel deploy con CSP + HSTS (Report-Only + enforcement)
- [x] Docker Compose + Kubernetes (k8s/ manifests)
- [x] THREE.js imports optimizados (árbol muerto ~250KB eliminado)
- [x] Kernel SSR guard (startKernel/stopKernel con typeof window)
- [x] PWA: Service Worker, manifest, offline fallback
- [x] SEO: sitemap.xml, Open Graph, Schema.org JSON-LD
- [x] CI/CD: GitHub Actions → Vercel
- [x] Cloudflare eliminado (target único Vercel)
- [x] Donación global (SmartSidebar + FooterSection)
- [x] Documentación: docs/patches/ (5 parches de seguridad)

### 🔷 EN PROGRESO
- [ ] Parches docs/patches/ → aplicar en el repo (auth, build, stripe, RLS, CSP)
- [ ] CATTLEYA + Stripe: monetización completa, membresías, economía digital
- [ ] SSI Identity Verification real
- [ ] Cobertura de tests >80%
- [ ] Activar `strict: true` incremental en TypeScript (~2 archivos con @ts-nocheck)
- [ ] Reemplazar fotos mock (picsum.photos) con assets reales del territorio
- [ ] Rate limit por-IP en 19 edge functions

### 🔵 FUTURO
- [ ] Dashboard federado público
- [ ] App móvil nativa (React Native)
- [ ] Mesh networking LoRa/Meshtastic
- [ ] Gemelo digital en tiempo real con datos IoT (MQTT)

---

## Licencia

**© 2024-2026 TAMV Ecosystem · OsoPanda1 · Isabella Villaseñor AI**

Código abierto para usos comunitarios, académicos y de investigación.
Soberanía de datos garantizada por Heptafederación F1-F7 y SSI.
Gobernanza ética por TIME UP con registro inmutable en ledger SHA-256.

**Dominio:** [www.visitarealdelmonte.online](https://www.visitarealdelmonte.online)
**GitHub:** [github.com/OsoPanda1/real-del-monte-digital-hub-c327091a](https://github.com/OsoPanda1/real-del-monte-digital-hub-c327091a)
