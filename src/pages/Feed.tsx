import { RDMPageShell } from "@/components/rdm/RDMPageShell";

export default function Feed() {
  return (
    <RDMPageShell
      eyebrow="Red Social Territorial"
      title="Feed Comunitario"
      description="Publicaciones, historias y recuerdos compartidos por la comunidad de Real del Monte. Un muro de memoria viva."
      bullets={[
        "Publicaciones con texto, imágenes y multimedia de la comunidad local y visitantes.",
        "Sistema de likes, comentarios y moderación HITL via Guardian.",
        "Integración con el sistema de reputación contextual y Dignity Score.",
      ]}
    />
  );
}
