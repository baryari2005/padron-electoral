"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";
import { Categoria } from "@prisma/client";
import { CategoryHeader, CategoryList } from "./components";

export default function CategoryPage() {
  const [data, setData] = useState<Categoria[]>([]);

  const fetchCategories = async () => {
    try{
      const res = await axiosInstance.get("/api/categories");    
      setData(res.data.categories);
    }
    catch(err)
    {
      toast.error("Algo salió mal.")
    }
  }
  
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <CategoryHeader onCategoryCreated={fetchCategories} />
      <CategoryList categories={data} setCategories={setData} /> 
    </div>
  )
}
