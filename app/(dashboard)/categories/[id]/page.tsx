"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";

import { toast } from "sonner";

import { Separator } from "@/components/ui/separator";
import { ArrowBigLeft, BookUser } from "lucide-react";
import Link from "next/link";
import { FormCategory } from "../components";

export default function CategoryIdPage({ params }: { params: { id: number } }) {
  const router = useRouter();
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchCategory = async () => {
      const id = Number(params.id);
      if (isNaN(id)) return router.push("/");

      try {
        const res = await axiosInstance.get(`/api/categories/${id}`);
        if (res.status !== 200) return router.push("/");
        setCategory(res.data);
      } catch (error) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [params.id, router]);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (!category) return null;

  const handleUpdated = () => {
    toast.success("Categoria actualizada correctamente");
    router.push("/categories");
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-secondary rounded-lg shadow-md">
      {/* Volver */}
      <div className="mb-6">
        <Link
          href="/categories"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowBigLeft className="w-5 h-5 mr-1" />
          Volver
        </Link>
      </div>

      {/* Encabezado */}
      <div className="flex items-center mb-2 space-x-2">
        <BookUser className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Editar Categoria</h2>
      </div>
      <p className="text-muted-foreground mb-6">Modificar una Categoria existente en el sistema</p>

      <Separator className="mb-6" />

      {/* Formulario */}
      <FormCategory category={category} onSuccess={handleUpdated} />
    </div>
  );
}