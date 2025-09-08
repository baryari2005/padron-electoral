// 🧩 Archivo: components/helpers/buildResultadosPresidenciales.ts
export function buildResultadosPresidenciales(
  agrupaciones: {
    id: number;
    nombre: string;
    numero: number;
    profileImage?: string | null;
    userId: string;   
  }[],


  categorias: { id: string }[]
) {
  return agrupaciones.map((a) => {
    const base: any = {
      id: a.id,
      nombre: a.nombre,
      numero: a.numero,
      profileImage: a.profileImage ?? "",
    };
    categorias.forEach((cat) => {
      base[cat.id] = 0;
    });
    return base;
  });
}