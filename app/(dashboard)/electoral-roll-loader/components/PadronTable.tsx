"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PadronItem = {
  id: number;
  nombre: string;
  apellido: string;
  numero_matricula: string;
  localidad: string;
  establecimiento: string;
  voto_sino: string;
};

export function PadronTable() {
  const [data, setData] = useState<PadronItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  // filtros
  const [search, setSearch] = useState("");
  const [documento, setDocumento] = useState("");
  const [voto, setVoto] = useState("all");

  const limit = 50;

  const fetchData = async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      documento,
      voto,
    });

    const res = await fetch(`/api/padron?${params.toString()}`);
    const json = await res.json();

    console.log("Datos recibidos:", json);

    setData(json.data);
    setTotalPages(json.totalPages);
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleSearch = () => {
    setPage(1); // reiniciar la página
    fetchData();
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <Label>Buscar por nombre o apellido</Label>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div>
          <Label>Filtrar por documento</Label>
          <Input value={documento} onChange={(e) => setDocumento(e.target.value)} />
        </div>
        <div>
          <Label>Filtrar por voto</Label>
          <Select onValueChange={(value) => setVoto(value)} value={voto}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="SI">SI</SelectItem>
              <SelectItem value="NO">NO</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="col-span-1 md:col-span-3" onClick={handleSearch}>
          Buscar
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Apellido</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Documento</TableCell>
            <TableCell>Localidad</TableCell>
            <TableCell>Establecimiento</TableCell>
            <TableCell>Voto</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id ?? item.numero_matricula}>
              <TableCell>{item.apellido}</TableCell>
              <TableCell>{item.nombre}</TableCell>
              <TableCell>{item.numero_matricula}</TableCell>
              <TableCell>{item.localidad}</TableCell>
              <TableCell>{item.establecimiento}</TableCell>
              <TableCell>{item.voto_sino}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center">
        <Button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}>
          Anterior
        </Button>
        <span>
          Página {page} de {totalPages}
        </span>
        <Button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}
