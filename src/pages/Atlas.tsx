import { RDMPageShell } from "@/components/rdm/RDMPageShell";

export default function Atlas() {
  return (
    <RDMPageShell
      eyebrow="Red Federada"
      title="Atlas de Nodos"
      description="Visualización de la topología de nodos federados del ecosistema TAMV: edge, fog, cloud y quantum."
      bullets={[
        "Monitoreo en tiempo real de nodos edge distribuidos en la Sierra de Pachuca.",
        "Latencia, heartbeat y estado AST de cada nodo federado.",
        "Mapa de conexiones con estado de salud y throughput entre nodos.",
      ]}
    />
  );
}
