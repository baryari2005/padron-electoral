import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SimpleFirmaInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
}

export const SimpleFirmaInput = ({
  value,
  onChange,
  label = "",
  placeholder = "",
}: SimpleFirmaInputProps) => {
  return (
    <div className="w-full">
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border-0 border-b border-dashed border-black rounded-none text-center italic tracking-wider"
        style={{
          fontFamily: "var(--font-firma)",
          fontSize: "1.3rem",
        }}
      />
      <Label className="block text-xs text-center mt-1 uppercase">
        Firma {label}
      </Label>
    </div>
  );
};
