import { RDMLayout } from "@/components/rdm/RDMLayout";
import { RDMHero } from "@/components/rdm/RDMHero";
import { RDMExperienceGrid } from "@/components/rdm/RDMExperienceGrid";
import { RDMInteractiveMap } from "@/components/rdm/RDMInteractiveMap";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Pickaxe, BookOpen, Shield, Code, Users, MapPin } from "lucide-react";
import SEOMeta from "@/components/SEOMeta";

const Index = () => {
  return (
    <RDMLayout hideNav>
      <SEOMeta 
        title="RDM Digital — Sistema Operativo Territorial"
        description="Descubre Real del Monte, Pueblo Mágico de Hidalgo. Guía turística digital con mapa interactivo, rutas, gastronomía y eventos culturales."
      />
      <RDMHero />
      <RDMExperienceGrid />

      {/* History preview */}
      <section className="py-20 px-6 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] mb-4" style={{ fontFamily: "var(--font-body)" }}>Memoria de Alta Fidelidad</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
              500 años de <span className="text-[hsl(var(--rdm-amber))]">historia minera</span>
            </h2>
            <p className="text-[hsl(215_13%_42%)] leading-relaxed mb-6" style={{ fontFamily: "var(--font-body)" }}>
              Real del Monte guarda la memoria de la migración cornish que trajo consigo técnicas mineras,
              el futbol y los pastes. Un legado que vive en cada callejón empedrado y en cada bocado.
            </p>
            <Link to="/historia" className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--rdm-amber))] hover:underline" style={{ fontFamily: "var(--font-body)" }}>
              <Pickaxe className="w-4 h-4" /> Explorar la historia completa
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl overflow-hidden h-[350px]" style={{ background: "linear-gradient(135deg, hsl(24 40% 25%), hsl(218 24% 15%))" }}>
            <div className="w-full h-full flex items-center justify-center">
              <Pickaxe className="w-24 h-24 text-[hsl(var(--rdm-amber)/0.3)]" />
            </div>
          </motion.div>
        </div>
      </section>

      <RDMInteractiveMap />

      {/* RDM-TOS section */}
      <section className="py-20 px-6 md:px-16 lg:px-24 border-t border-[hsl(220_11%_82%)]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] mb-4" style={{ fontFamily: "var(--font-body)" }}>
            RDM-TOS · Sistema Operativo Territorial
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
            Soberanía tecnológica desde la <span className="text-[hsl(var(--rdm-amber))]">montaña</span>
          </h2>
          <p className="text-[hsl(215_13%_42%)] max-w-2xl mx-auto mb-12" style={{ fontFamily: "var(--font-body)" }}>
            RDM Digital fusiona smart-city, gemelo digital 4D, comercio local, IA emocional y economía creativa
            en una infraestructura soberana. Powered by TAMV Online.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: MapPin, title: "Gemelo Territorial", desc: "Mapa inteligente con datos vivos" },
              { icon: Users, title: "Comunidad Soberana", desc: "Gobernanza digital participativa" },
              { icon: Shield, title: "Seguridad TENOCHTITLAN", desc: "Ciberseguridad de grado militar" },
              { icon: BookOpen, title: "Memoria Viva", desc: "Historia verificable y auditada" },
              { icon: Code, title: "API Pública DM-X7", desc: "Integración abierta para aliados" },
              { icon: Pickaxe, title: "Economía Creativa", desc: "RDM Sound System + Fénix 75/25" },
            ].map((item) => (
              <div key={item.title} className="rdm-glass rounded-xl p-5 text-left">
                <item.icon className="w-6 h-6 text-[hsl(var(--rdm-amber))] mb-3" />
                <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: "var(--font-display)" }}>{item.title}</h3>
                <p className="text-xs text-[hsl(215_13%_42%)]" style={{ fontFamily: "var(--font-body)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
          Tu aventura <span className="text-[hsl(var(--rdm-amber))]">comienza aquí</span>
        </h2>
        <p className="text-[hsl(215_13%_42%)] max-w-md mx-auto mb-8" style={{ fontFamily: "var(--font-body)" }}>
          Real del Monte te espera con 500 años de historia, sabores únicos y la magia de la Sierra de Pachuca.
        </p>
        <Link to="/mapa" className="inline-flex items-center gap-3 bg-[hsl(var(--rdm-amber))] text-white px-10 py-4 rounded-full font-semibold text-sm hover:scale-105 transition-transform" style={{ fontFamily: "var(--font-body)" }}>
          Explorar Ahora
        </Link>
      </section>
    </RDMLayout>
  );
};

export default Index;
