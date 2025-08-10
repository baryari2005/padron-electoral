import { AccordionFaqs } from "./components/AccordionFaqs";

export default function PageFaqs() {
  return (
    <div className="max-w-4xl mx-auto bg-background shadow-md rounded-lg p-6">
        <h2 className="mb-8 text-3xl">FAQS</h2>
        <div className="mb-5">
            <p>preguntas</p>
        </div>
        <AccordionFaqs/>
    </div>
  )
}
