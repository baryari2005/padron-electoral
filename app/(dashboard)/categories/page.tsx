"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { Categoria } from "@prisma/client";
import { CategoryHeader, CategoryList } from "./components";
import { LoadingMessage } from "@/components/ui/loadingMessage";

export default function CategoryPage() {
  const [data, setData] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/categories");
      setData(res.data.categories);
    }
    catch (err) {
      toast.error("Algo salió mal.")
    }
    finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <CategoryHeader onCategoryCreated={fetchCategories} />
      {loading ? (
        <LoadingMessage text="Cargando categorias..." />
      ) : (
        <CategoryList categories={data} setCategories={setData} />
      )}

    </div>
  )
}
