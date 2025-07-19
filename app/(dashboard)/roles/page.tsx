"use client";

import { useEffect, useState } from "react";
import { Role } from "@prisma/client";
import { RolesHeader } from "./components/RolesHeader";
import { RolesList } from "./components/RolesList";
import axiosInstance from "@/utils/axios";
import { toast } from "sonner";


export default function RolesPage() {
  const [data, setData] = useState<Role[]>([]);

  const fechRoles = async () => {
    try{
      const res = await axiosInstance.get("/api/roles");    
      setData(res.data.roles);
    }
    catch(err)
    {
      toast.error("Algo salió mal.")
    }
  }
  
  useEffect(() => {
    fechRoles();
  }, []);

  return (
    <div>
      <RolesHeader onRoleCreated={fechRoles} />
      <RolesList roles={data} setRoles={setData} /> 
    </div>
  )
}
