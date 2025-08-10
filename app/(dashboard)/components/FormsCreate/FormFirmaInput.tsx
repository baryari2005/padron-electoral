import { FormField, FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface FirmaInputProps {
  name: string;
  label?: string;
  control: Control<any>;
}

export const FormFirmaInput = ({ name, label = "", control }: FirmaInputProps) => {
  return (
    <FormField
      name={name}
      control={control}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <>
              <Input
                {...field}
                className="border-0 border-b border-dashed border-black rounded-none text-center italic tracking-wider"
                style={{
                  fontFamily: "var(--font-firma)",
                  fontSize: "1.3rem"                  
                }}
                placeholder=""
              />
              <FormLabel className="block text-xs text-center mt-1 uppercase">
                Firma {label}
              </FormLabel>
            </>
          </FormControl>
        </FormItem>
      )}
    />
  );
};
