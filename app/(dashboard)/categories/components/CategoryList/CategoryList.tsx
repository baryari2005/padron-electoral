'use client'

import { Categoria } from "@prisma/client";
import { DataTable } from "./data-table";
import { columns } from "./columns";

interface CategoryListProps {
  categories: Categoria[];
  setCategories: React.Dispatch<React.SetStateAction<Categoria[]>>;
}

export function CategoryList({ categories, setCategories }: CategoryListProps) {  
  return (
    <DataTable
      columns={columns(setCategories)}
      data={categories}
    />
  );
}