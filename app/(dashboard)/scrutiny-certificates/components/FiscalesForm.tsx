// "use client";

// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Control, useFieldArray } from "react-hook-form";
// import {
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { UserPen } from "lucide-react";
// import { useState } from "react";
// import { FiscalesTable } from "./FiscalesTable";
// import { CertificadoFormData, fiscalSchema } from "../utils/schema";
// import { UnderlinedInputWithLabel } from "@/components/ui/underlinedInputWithLabel";
// import { DniInputWithLabel } from "@/components/ui/dniInputWithLabel";
// import { FormFirmaInput, SimpleFirmaInput } from "../../components/FormsCreate";

// interface Props {
//   control: Control<CertificadoFormData>;
//   agrupaciones: { id: string; nombre: string; numero: number }[];
// }

// export function FiscalesForm({ control, agrupaciones }: Props) {
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "firmas.fiscales",
//   });

//   const [tempData, setTempData] = useState({
//     agrupacionId: "",
//     firma: "",
//     aclaracion: "",
//     dni: "",
//   });

//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const handleAgregar = () => {
//     const result = fiscalSchema.safeParse(tempData);

//     if (!result.success) {
//       const formatted = result.error.flatten().fieldErrors;
//       const formattedErrors: Record<string, string> = {};
//       Object.entries(formatted).forEach(([key, value]) => {
//         if (value?.[0]) formattedErrors[key] = value[0];
//       });
//       setErrors(formattedErrors);
//       return;
//     }

//     append(tempData);
//     setTempData({ agrupacionId: "", firma: "", aclaracion: "", dni: "" });
//     setErrors({});
//   };

//   const mappedFiscales = fields.map((fiscal) => {
//     const agrupacion = agrupaciones.find((a) => a.id === fiscal.agrupacionId);
//     return {
//       agrupacionId: agrupacion?.id ?? "0",
//       agrupacionNombre: agrupacion?.nombre ?? "Sin agrupación",
//       firma: fiscal.firma,
//       aclaracion: fiscal.aclaracion,
//       dni: fiscal.dni,
//     };
//   });

//   const onDeleteFiscal = (index: number) => {
//     remove(index);
//   };

//   return (
//     <div className="space-y-6">
//       <h3 className="font-semibold text-lg uppercase">Firmas de Fiscales</h3>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         {/* Agrupación */}
//         <FormField
//           name="agrupacionId"
//           render={() => (
//             <FormItem>
//               <>
//                 <Select
//                   value={tempData.agrupacionId}
//                   onValueChange={(val) =>
//                     setTempData((p) => ({ ...p, agrupacionId: val }))
//                   }
//                 >
//                   <SelectTrigger>
//                     <SelectValue placeholder="Seleccionar agrupación" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {agrupaciones.map((agr) => (
//                       <SelectItem key={agr.id} value={agr.id}>
//                         {agr.nombre}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 <FormLabel className="block text-xs text-center mt-1 uppercase">
//                   Agrupacion Politica
//                 </FormLabel>
//               </>
//               <FormMessage>{errors.agrupacionId}</FormMessage>
//             </FormItem>
//           )}
//         />

//         {/* Firma */}
//         <FormField
//           name="firma"
//           render={() => (
//             <FormItem>
//               <SimpleFirmaInput
//                 value={tempData.firma}
//                 onChange={(e) => setTempData((prev) => ({ ...prev, firma: e.target.value }))}
//                 label="Fiscal"
//               />
//               <FormMessage>{errors.firma}</FormMessage>
//             </FormItem>
//           )}
//         />

//         {/* Aclaración */}
//         <FormField
//           name="aclaracion"
//           render={() => (
//             <FormItem>
//               <UnderlinedInputWithLabel
//                 value={tempData.aclaracion}
//                 onChange={(e) => setTempData((prev) => ({ ...prev, aclaracion: e.target.value.toUpperCase() }))}
//                 label="Aclaracion"
//                 placeholder=""
//               />
//               <FormMessage>{errors.aclaracion}</FormMessage>
//             </FormItem>
//           )}
//         />

//         {/* DNI */}
//         <FormField
//           name="dni"
//           render={() => (
//             <FormItem>
//               <DniInputWithLabel
//                 value={tempData.dni}
//                 onChange={(e) =>
//                   setTempData((prev) => ({
//                     ...prev,
//                     dni: e.target.value,
//                   }))
//                 }
//               />
//               <FormMessage>{errors.dni}</FormMessage>
//             </FormItem>
//           )}
//         />
//       </div>

//       <div className="text-right">
//         <Button type="button" onClick={handleAgregar}>
//           <UserPen className="mr-2 h-4 w-4" />
//           Agregar Fiscal
//         </Button>
//       </div>

//       <FiscalesTable
//         fiscales={mappedFiscales}
//         onDelete={onDeleteFiscal}
//       />
//     </div>
//   );
// }
