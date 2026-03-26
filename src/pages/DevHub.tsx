import { RDMPageShell } from "@/components/rdm/RDMPageShell";

export default function DevHub() {
  return (
    <RDMPageShell
      eyebrow="API Developer Hub"
      title="DevHub DM-X7"
      description="Especificación completa de la API unificada TAMV Gateway con 160 operaciones distribuidas en 13 dominios soberanos."
      bullets={[
        "13 dominios: Auth, Identity, Security, Economy, XR, Quantum, Governance, UTAMV, BookPI, Kernel, Ops, Social, DevTools.",
        "160 operaciones REST documentadas con autenticación, roles y ejemplos cURL.",
        "Interfaz interactiva para explorar, probar y copiar endpoints del Gateway.",
      ]}
    />
  );
}
