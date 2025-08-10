"use client";

import { StandaloneCombobox } from "../FormsCreate/StandaloneCombobox"; // 👈 usa esta versión fuera del <Form>

interface FilterOption {
  id: string | number;
  nombre?: string;
  [key: string]: any;
}

interface FilterConfig<T = FilterOption> {
  key: string;
  label: string;
  options: T[];
  isNumber?: boolean;
  getOptionLabel?: (opt: T) => string;
  getOptionValue?: (opt: T) => string;
}

interface GenericFiltersGridProps<T = FilterOption> {
  filters: FilterConfig<T>[];
  selected: Record<string, string | number | undefined>;
  onFilterChange: (key: string, value: string | number | undefined) => void;
}

export function GenericFiltersGridWithCombo<T = FilterOption>({
  filters,
  selected,
  onFilterChange,
}: GenericFiltersGridProps<T>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {filters.map(
        ({
          key,
          label,
          options,
          isNumber,
          getOptionLabel,
          getOptionValue,
        }) => (
          <StandaloneCombobox
            key={key}
            label={label}
            value={selected[key]?.toString() ?? ""}
            onChange={(val) => {
              const parsedValue =
                val === ""
                  ? undefined
                  : isNumber
                  ? Number(val)
                  : val;
              onFilterChange(key, parsedValue);
            }}
            options={options}
            getOptionLabel={
              getOptionLabel ?? ((opt: any) => opt.nombre ?? String(opt.id))
            }
            getOptionValue={
              getOptionValue ?? ((opt: any) => String(opt.id))
            }
          />
        )
      )}
    </div>
  );
}
