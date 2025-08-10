import { CertificadoFormData } from "../../utils/schema";

export function buildDefaultVotosEspeciales(
  categorias: { id: string }[]
): CertificadoFormData["votosEspeciales"] {
  return categorias.reduce((acc, cat) => {
    acc[cat.id] = {
      nulos: 0,
      blancos: 0,
      recurridos: 0,
      impugnados: 0,
      comandoElectoral: 0,
    };
    return acc;
  }, {} as CertificadoFormData["votosEspeciales"]);
}