import Image from "next/image";

interface CertificadoHeaderProps {
  seccion: string;
  circuito: string | number;
  mesa: string | number;
  modo: "editar" | "crear";
}

export default function CertificadoHeader({
  seccion,
  circuito,
  mesa,
  modo,
}: CertificadoHeaderProps) {
  return (
    <div className="p-4 flex justify-between items-start">
      {/* Columna izquierda */}
      <div className="flex gap-4 items-start">
        <div className="w-16 h-16 relative">
          <Image src="/escudo-argentina.png" alt="Escudo" width={100}
            height={100}
            className="object-contain" />
        </div>
        <div className="text-sm leading-tight">
          <p className="uppercase font-semibold">Junta Electoral Nacional</p>
          <p className="uppercase font-semibold">Distrito Buenos Aires</p>
          <div className="border border-black px-2 py-0.5 mt-1 inline-block text-xs font-bold">
            Certificado de Escrutinio
          </div>
          <p className="text-xs mt-1">Elecciones Generales - {new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}</p>
        </div>
      </div>

      {/* Columna derecha */}
      <div className="text-right text-sm leading-tight p-2">
        <p className="uppercase">Sección Electoral</p>
        <p className="font-bold">{seccion}</p>
        <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
          <div className="text-right">
            <p className="uppercase">Circuito</p>
            <p className="font-bold">{circuito}</p>
          </div>
          <div>
            <p className="uppercase">Mesa</p>
            <p className="font-bold">{mesa}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
