// "use client";

// import { Control } from "react-hook-form";
// import { CertificadoFormData } from "../utils/schema";
// import {
//     FormField,
//     FormItem,
//     FormLabel,
//     FormControl,
//     FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { FormFirmaInput } from "../../components/FormsCreate";

// interface Props {
//     control: Control<CertificadoFormData>;
// }

// export function CompensacionForm({ control }: Props) {
//     const roles: { key: "presidente" | "vocal"; label: string }[] = [
//         { key: "presidente", label: "Presidente" },
//         { key: "vocal", label: "Vocal/Suplente" },
//     ];

//     return (
//         <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {roles.map(({ key, label }) => (
//                     <div key={key} className="space-y-6">
//                         {/* Firma */}
//                         <FormField
//                             name={`compensacion.${key}.firma`}
//                             control={control}
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormControl>
//                                         <FormFirmaInput
//                                             name={`compensacion.${key}.firma`}
//                                             label={label}
//                                             control={control}
//                                         />
//                                     </FormControl>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />

//                         {/* Agrupamos aclaración y dni en una misma columna */}
//                         <div className="flex flex-row gap-6">
//                             {/* Aclaración */}
//                             <FormField
//                                 name={`compensacion.${key}.aclaracion`}
//                                 control={control}
//                                 render={({ field }) => (
//                                     <FormItem className="flex-1">
//                                         <FormControl>
//                                             <>
//                                                 <Input
//                                                     {...field}
//                                                     className="border-0 border-b border-dashed border-black 
//                                                     rounded-none text-center uppercase"    
//                                                     onChange={(e) => field.onChange(e.target.value.toUpperCase())}                                                
//                                                     placeholder=""
//                                                 />
//                                                 <FormLabel className="block text-xs text-center mt-1 uppercase">
//                                                     Aclaración {label}
//                                                 </FormLabel>
//                                             </>
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />

//                             {/* DNI */}
//                             <FormField
//                                 name={`compensacion.${key}.dni`}
//                                 control={control}
//                                 render={({ field }) => (
//                                     <FormItem className="flex-1">
//                                         <FormControl>
//                                             <>
//                                                 <Input
//                                                     {...field}
//                                                     maxLength={9}
//                                                     inputMode="numeric"
//                                                     placeholder="12345678"
//                                                     className="text-center tracking-[0.5em] px-4 py-2 
//                                                     border border-input rounded-md 
//                                                     shadow-sm caret-transparent
//                                                     "
//                                                 />
//                                                 <FormLabel className="block text-xs text-center mt-1 uppercase">
//                                                     DNI {label}
//                                                 </FormLabel>
//                                             </>
//                                         </FormControl>
//                                         <FormMessage />
//                                     </FormItem>
//                                 )}
//                             />
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// }
