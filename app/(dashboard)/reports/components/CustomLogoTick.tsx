"use client";

interface CustomLogoTickProps {
  x: number;
  y: number;
  payload: { value: string };
}

export const createCustomLogoTick = (
  data: { agrupacion: string; logo?: string | null }[]
) => {
  return function CustomLogoTick({ x, y, payload }: CustomLogoTickProps): React.ReactElement<SVGElement> {
    const agrupacion = payload.value;
    const logo = data.find((d) => d.agrupacion === agrupacion)?.logo;
    // const abreviado = agrupacion.length > 8
    //   ? agrupacion.slice(0, 7) + "…"
    //   : agrupacion;

    if (!logo) {
      return (
        <text
          x={x}
          y={y + 35}
          textAnchor="middle"
          fontSize="12"
          fill="#666"
           pointerEvents="none"
        >
          {agrupacion}
        </text>
      ) as React.ReactElement<SVGElement>;
    }

    return (
      <g transform={`translate(${x},${y + 10})`}>
        <image
          href={logo}
          x={-12}
          y={0}
          width={24}
          height={24}
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
    ) as React.ReactElement<SVGElement>;
  };
};
