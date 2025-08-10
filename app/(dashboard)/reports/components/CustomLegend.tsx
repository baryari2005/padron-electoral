"use client";

interface CustomLegendProps {
  payload?: { value: string; color: string }[];
  label?: string;
}

export const CustomLegend = ({ payload, label }: CustomLegendProps) => {
  if (!payload) return null;

  return (
    <div className="flex justify-center gap-8 mt-4">
      <span className="text-xs font-semibold">{label}</span>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center space-x-4">
          <div
            className="w-2 h-2 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />          
          <span className="text-xs font-medium text-gray-700">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};
