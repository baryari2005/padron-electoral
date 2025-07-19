"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

type Company = {
  id: string;
  name: string;
  createAt: string;
};

type Event = {
  id: string;
  title: string;
  start: string;
  companyId: string;
};

export function CompaniesChart() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/analytics")
      .then(res => {
        setCompanies(res.data.companies);
        setEvents(res.data.events);
      })
      .catch(err => {
        console.error("Error fetching analytics data", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando gráfico...</p>;

  // Crear los datos para el gráfico: eventos por empresa
  const data = companies.map(company => {
    const eventCount = events.filter(event => event.companyId === company.id).length;
    return {
      name: company.name,
      events: eventCount,
    };
  });

  return (
    <div className="h-[400px] w-full">
      <h3 className="mb-4 font-bold">Eventos por empresa</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="events" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
