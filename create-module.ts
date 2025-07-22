// create-module.ts
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const entity = args[0];

if (!entity) {
  console.error("❌ Debes ingresar un nombre de módulo. Ej: `npx ts-node create-module usuarios`");
  process.exit(1);
}

const pascalCase = (str: string) =>
  str.replace(/(^\w|-\w)/g, (m) => m.replace("-", "").toUpperCase());

const Entity = pascalCase(entity);
const singular = Entity.slice(0, -1); // Ej: Usuario

const basePath = path.join("app", "(dashboard)", entity);
const componentsPath = path.join(basePath, "components");
const sectionsPath = path.join(componentsPath, "sections");

fs.mkdirSync(sectionsPath, { recursive: true });

function write(file: string, content: string) {
  const fullPath = path.join(basePath, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

// === page.tsx ===
write("page.tsx", `\
"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { DialogCrudEntity } from "@/components/DialogCrudEntity";
import { FormCreateOrUpdate${singular} } from "./components/FormCreateOrUpdate";
import { ${Entity}Header } from "./components/Header";
import { ${Entity}List } from "./components/List";

export default function ${Entity}Page() {
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [open, setOpen] = useState(false);

  const handleRefresh = () => setRefresh((prev) => !prev);
  const handleSuccess = () => {
    handleRefresh();
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Listado de ${Entity}</h2>

        <DialogCrudEntity
          open={open}
          setOpen={setOpen}
          iconButton={<PlusCircle className="w-5 h-5 text-white" />}
          iconModal={<PlusCircle className="w-5 h-5 text-muted-foreground" />}
          titleCreate="Crear ${singular}"
          titleUpdate="Editar ${singular}"
          description="Registrar un nuevo ${singular}"
          mode="create"
          buttonTextCreate="Nuevo ${singular}"
          buttonTextUpdate="Editar ${singular}"
        >
          <FormCreateOrUpdate${singular} onSuccess={handleSuccess} onClose={() => setOpen(false)} />
        </DialogCrudEntity>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow space-y-2">
        <${Entity}Header onSearchChange={setSearch} />
        <${Entity}List search={search} refresh={refresh} onDeleted={handleRefresh} />
      </div>
    </div>
  );
}
`);

// === components/Header.tsx ===
write("components/Header.tsx", `\
"use client";

interface Props {
  onSearchChange: (query: string) => void;
}

export function ${Entity}Header({ onSearchChange }: Props) {
  return (
    <div className="flex justify-between mb-4">
      <input
        type="text"
        placeholder="Buscar..."
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full border px-3 py-2 rounded"
      />
    </div>
  );
}
`);

// === components/List.tsx ===
write("components/List.tsx", `\
"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { columns } from "./columns";
import { ${Entity}DataTable } from "./data-table";
import { ${singular} } from "@prisma/client";

interface Props {
  search: string;
  refresh?: boolean;
  onDeleted?: () => void;
}

export function ${Entity}List({ search, refresh, onDeleted }: Props) {
  const [data, setData] = useState<${singular}[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await axiosInstance.get("/api/${entity}", {
        params: { search, page, limit },
      });
      setData(res.data.items ?? []);
      setTotalPages(Math.ceil(res.data.total / limit));
      setLoading(false);
    };
    fetchData();
  }, [search, page, refresh]);

  return (
    <${Entity}DataTable
      columns={columns({ onDeleted })}
      data={data}
      loading={loading}
      page={page}
      totalPages={totalPages}
      onPageChange={setPage}
      onSearchChange={() => {}}
    />
  );
}
`);

// === components/data-table.tsx ===
write("components/data-table.tsx", `\
import { GenericDataTable } from "@/components/GenericDataTable";
import { ColumnDef } from "@tanstack/react-table";
import { ${singular} } from "@prisma/client";

interface Props {
  columns: ColumnDef<${singular}, any>[];
  data: ${singular}[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSearchChange: (query: string) => void;
}

export function ${Entity}DataTable(props: Props) {
  return (
    <GenericDataTable
      {...props}
      searchPlaceholder="Buscar por nombre o email..."
    />
  );
}
`);

// === components/columns.ts ===
write("components/columns.ts", `\
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { TableActions } from "@/components/ui/tableActions";
import { ${singular} } from "@prisma/client";

interface ColumnsProps {
  onDeleted?: () => void;
}

export const columns = ({ onDeleted }: ColumnsProps): ColumnDef<${singular}>[] => [
  {
    accessorKey: "nombre",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Nombre <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const { id } = row.original;
      return (
        <TableActions
          id={id.toString()}
          editUrl={"/${entity}/" + id}
          deleteUrl={"/api/${entity}/" + id}
          resourceName="${singular}"
          confirmTitle="¿Eliminar este ${singular}?"
          confirmDescription="Esta acción eliminará permanentemente el ${singular}."
          confirmActionLabel="Eliminar"
          onDeleted={onDeleted}
        />
      );
    },
  },
];
`);

// === components/FormCreateOrUpdate.tsx ===
write("components/FormCreateOrUpdate.tsx", `\
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";
import { Form } from "@/components/ui/form";
import { SubmitButton } from "@/app/(dashboard)/components/FormsCreate";
import { FormTabsWrapper } from "@/components/FormTabsWrapper";
import { TabsContent } from "@/components/ui/tabs";

import { SeccionA } from "./sections/SeccionA";
import { SeccionB } from "./sections/SeccionB";
import { SeccionC } from "./sections/SeccionC";

interface ${singular}FormValues {
  nombre: string;
  email: string;
}

interface Props {
  ${entity.slice(0, -1)}?: Partial<${singular}FormValues>;
  onSuccess: () => void;
  onClose?: () => void;
}

export function FormCreateOrUpdate${singular}({ ${entity.slice(0, -1)}, onSuccess, onClose }: Props) {
  const form = useForm<${singular}FormValues>({
    resolver: zodResolver(z => z),
    defaultValues: ${entity.slice(0, -1)} ?? { nombre: "", email: "" },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: ${singular}FormValues) => {
    try {
      if (${entity.slice(0, -1)}?.id) {
        await axiosInstance.put("/api/${entity}/" + ${entity.slice(0, -1)}.id, values);
        toast.success("Actualizado correctamente");
      } else {
        await axiosInstance.post("/api/${entity}", values);
        toast.success("Creado correctamente");
      }
      onSuccess();
      onClose?.();
    } catch (error) {
      toast.error("Error al guardar");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormTabsWrapper
          tabs={[
            { value: "a", label: "Sección A", content: <SeccionA control={form.control} /> },
            { value: "b", label: "Sección B", content: <SeccionB control={form.control} /> },
            { value: "c", label: "Sección C", content: <SeccionC control={form.control} /> },
          ]}
        />
        <SubmitButton loading={isSubmitting} label="Guardar" icon="save" />
      </form>
    </Form>
  );
}
`);

// === 3 secciones básicas ===
["A", "B", "C"].forEach((letter) => {
  const fileName = `components/sections/Seccion${letter}.tsx`;
  write(fileName, `\
export function Seccion${letter}({ control }: { control: any }) {
  return <div>Sección ${letter}</div>;
}
`);
});

console.log(`✅ Módulo "${entity}" generado exitosamente con page.tsx, columnas, formulario y secciones.`);
