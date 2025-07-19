"use client"

import { useEffect, useState } from "react";
import { HeaderCompanies } from "./components/HeaderCompanies";
import { ListCompanies } from "./components/ListCompanies";
import { Company } from "@prisma/client";

export default function CompaniesPage() {
   const [companies, setCompanies] = useState<Company[]>([]);

  const fetchCompanies = async () => {
    const res = await fetch("/api/companies");
    const data = await res.json();
    setCompanies(data);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <div>
      <HeaderCompanies onCompanyCreated={fetchCompanies} />
      <ListCompanies companies={companies} setCompanies={setCompanies} />
    </div>
  )
}
