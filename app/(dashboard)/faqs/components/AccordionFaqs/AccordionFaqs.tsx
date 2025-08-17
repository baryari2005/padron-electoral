"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { faqs } from "./AccordionFaqs.data";

export function AccordionFaqs() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((f) => (
        <AccordionItem key={f.id} value={`faq-${f.id}`} className="w-full">
          {/* Trigger: SOLO texto, nada de markdown acá */}
          <AccordionTrigger className="text-left hover:no-underline">
            {f.question}
          </AccordionTrigger>

          {/* Content: Markdown envuelto en un contenedor full width */}
          <AccordionContent>
            <div className="prose prose-sm dark:prose-invert max-w-none
                            prose-p:my-2 prose-li:my-1 prose-ul:my-2 prose-ol:my-2
                            prose-headings:mt-0 prose-headings:mb-2 prose-strong:font-semibold">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {f.answer}
              </ReactMarkdown>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
