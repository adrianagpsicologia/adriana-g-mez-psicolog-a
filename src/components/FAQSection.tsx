import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Cómo puedo reservar mi cita?",
    answer: "Puedes hacerlo tanto desde este enlace como por correo a adrianagpsicologia@gmail.com o por WhatsApp al +34 722491151",
  },
  {
    question: "¿Cuánto dura el proceso?",
    answer: "Depende de cada persona, lo podremos ver mejor en la entrevista inicial tras ver tu caso y el enfoque que vamos a tener en la terapia",
  },
  {
    question: "¿Puedo dejar el proceso cuando quiera?",
    answer: "¡Por supuesto! Es perfectamente comprensible que en algún momento por diferentes motivos no quieras continuar",
  },
  {
    question: "¿Los bonos tienen fecha de caducidad?",
    answer: "Los bonos no tienen fecha de caducidad",
  },
  {
    question: "¿Con cuánta frecuencia haremos las sesiones?",
    answer: "Esto lo iremos estableciendo a medida que nos vayamos viendo, es posible que empecemos semanal o quincenal, dependiendo de las necesidades de cada persona, y que poco a poco vayamos espaciando las sesiones entre sí",
  },
  {
    question: "¿Puedo utilizar las sesiones restantes de mi bono y dárselo a otra persona?",
    answer: "En caso de querer terminar con tu proceso, si te quedan algunas sesiones disponibles en el bono que adquiriste, puedes transferírselo a otra persona, sólo avísame de ello y haremos el cambio",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="section-padding bg-secondary/30">
      <div className="container-narrow">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Resolvemos tus dudas
          </p>
          <h2 className="heading-section">Preguntas frecuentes</h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-background rounded-2xl px-6 shadow-soft border-none"
            >
              <AccordionTrigger className="hover:no-underline py-6 text-left">
                <span className="font-heading text-lg font-medium pr-4">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-muted-foreground body-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
