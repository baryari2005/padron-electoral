"use client";

import * as React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FAQS } from "./AccordionFaqs.data";

export default function FAQAccordion() {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      ({ q: question, a }) =>
        question.toLowerCase().includes(q) ||
        (typeof a === "string" ? a.toLowerCase().includes(q) : false)
    );
  }, [query]);

  return (
    <Card className="border rounded-xl shadow-sm">
      <CardHeader className="gap-2">
        <CardTitle className="text-xl">Preguntas Frecuentes</CardTitle>
        <Input
          placeholder="Buscar en las FAQs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-9"
        />
      </CardHeader>

      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No encontramos resultados para “{query}”.</p>
        ) : (
          <Accordion type="multiple" className="w-full">
            {filtered.map(({ q, a }, idx) => {
              const id = `faq-${idx}`;
              return (
                <AccordionItem key={id} value={id}>
                  <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                  <AccordionContent className="text-sm leading-6 text-muted-foreground">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
