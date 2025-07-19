'use client'

import { Button } from "@/components/ui/button";
import { Company } from "@prisma/client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Delete, MoreHorizontal, Pencil } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";

export const columns = (
    setCompanies: React.Dispatch<React.SetStateAction<Company[]>>
): ColumnDef<Company>[] => [
        {
            accessorKey: "profileImage",
            header: "Profile Image",
            cell: ({ row }) => {
                const image = row.getValue("profileImage");

                return (
                    <div className="px-3">
                        <Image src={typeof image === 'string' ? image : "/images/comapny-icon.png"}
                            width={40} height={40} alt="Image" className="h-auto w-auto" />
                    </div>
                )
            }
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Company name
                        <ArrowUpDown className="w-4 h-4 ml-2" />
                    </Button>
                )
            },
        },
        {
            accessorKey: "cif",
            header: "CIF",
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "country",
            header: "Country",
        },
        {
            accessorKey: "website",
            header: "Website",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const { id } = row.original

                const handleDelete = async () => {
                    const confirmed = confirm("¿Estás seguro de que querés eliminar esta compañía?");
                    if (!confirmed) return;

                    try {
                        const res = await fetch(`/api/companies/${id}`, {
                            method: "DELETE",
                        });

                        if (res.ok) {
                            setCompanies((prev) => prev.filter((company) => company.id !== id));
                        } else {
                            alert("Error al eliminar");
                        }
                    } catch (err) {
                        console.error(err);
                        alert("Error inesperado");
                    }
                };
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button variant="ghost" className="w-8 h-4 p-0">
                                <span className="sr-only">Open Menu</span>
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <Link href={`/companies/${id}`}>
                                <DropdownMenuItem>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={handleDelete}>
                                <Delete className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        }
    ]