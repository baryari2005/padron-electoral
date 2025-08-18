import { AccordionFaqs } from "./components/AccordionFaqs";

export default function PageFaqs() {
  return (
    <div className="space-y-4">
      <div className="items-center justify-between">
        <h2 className="text-2xl mb-6">Preguntas</h2>
        <div className="rounded-xl border bg-card p-6 shadow space-y-2">
          <AccordionFaqs />
        </div>
      </div>
    </div>
  )
}
