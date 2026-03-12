// app/(dashboard)/types.ts
export type TopItem = {
    establecimientoId?: number; circuitoId?: number; establecimiento?: string; circuito?: string; votos: number
};
export type ProgresoItem = {
    establecimientoId?: number;
    circuitoId?: number;
    referenteId?: number;
    establecimiento?: string;
    circuito?: string;
    referente?: string;
    mesasEscrutadas: number;
    mesasTotales: number; 
    porcentaje: number; 
    faltan: number
};
export type ParticipacionItem = { establecimientoId?: number; circuitoId?: number; establecimiento?: string; circuito?: string; votantes: number; padron: number; participacion: number };
export type LiderCategoria = { categoriaId: number; categoria: string; agrupacionId: number; agrupacion: string; votos: number; color: string; logo: string | null; orden?: number };
export type TotalCategoria = { categoriaId: number; categoria: string; votos: number; orden?: number };
export type ResultadoCategoriaAgrupacion = { categoriaId: number; categoria: string; agrupacionId: number; agrupacion: string; votos: number; logo?: string | null; color?: string | null; };
export type SummaryResponse = {
    ok: boolean;
    municipio: {
        padronTotal: number;
        mesasTotales: number;
        mesasEscrutadas: number;
        porcentajeEscrutado: number;
        votantesRegistrados: number;
        participacionMunicipal: number;
        faltanMesas: number;
    };
    top: {
        establecimientos: TopItem[];
        circuitos: TopItem[];
    };
    progreso: {
        porEscuela: ProgresoItem[];
        porCircuito: ProgresoItem[];
        porReferente?: ProgresoItem[];
    };
    participacion: {
        porEscuela: ParticipacionItem[];
        porCircuito: ParticipacionItem[];
    };
    especiales: {
        nulos: number;
        blancos: number;
        recurridos: number;
        impugnados: number;
        // comando: number;
        total: number;
        pctSobreVotantes: number;
    };
    lideresPorCategoria: LiderCategoria[];
    totalesPorCategoria: TotalCategoria[];
    resultadosCategoriaAgrupacion: ResultadoCategoriaAgrupacion[];
};