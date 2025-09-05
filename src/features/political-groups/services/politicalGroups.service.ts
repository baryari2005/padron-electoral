"use client";


import axiosInstance from "@/utils/axios";


export type Cargo = { id: number; nombre: string };


export async function fetchCargos(): Promise<Cargo[]> {
    const { data } = await axiosInstance.get("/api/categories?all=true");
    const itemsRaw = (data?.items ?? []) as Array<{ id: number | string; nombre: string }>;
    return itemsRaw.map((it) => ({ id: Number(it.id), nombre: it.nombre }));
}


export async function fetchPoliticalGroupCargoIds(groupId: number): Promise<number[]> {
    const { data } = await axiosInstance.get(`/api/political-groups/${groupId}`);
    return Array.isArray(data?.cargoIds) ? data.cargoIds.map((x: any) => Number(x)) : [];
}


export async function createPoliticalGroup(values: any) {
    return axiosInstance.post("/api/political-groups", values);
}


export async function updatePoliticalGroup(id: number, values: any) {
    return axiosInstance.put(`/api/political-groups/${id}`, values);
}