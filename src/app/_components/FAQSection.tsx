"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is EVAL?",
    answer:
      "EVAL is the premier platform connecting esports players with college scholarship opportunities through advanced analytics, combines, and recruitment tools.",
  },
  {
    question: "How much does it cost to use EVAL?",
    answer:
      "EVAL is committed to providing a free and accessible platform for all players. We believe that every student should have the opportunity to get recruited for e-sports and gain a college scholarship.",
  },
  {
    question: "What games does EVAL support?",
    answer:
      "EVAL currently supports VALORANT, Rocket League, Overwatch 2, and Super Smash Bros. Ultimate, with more games being added regularly.",
  },
  {
    question: "How do I get invited to EVAL Combines?",
    answer:
      "EVAL Combines are free to enter for all high school players, no invitation necessary. Maintain high rankings, demonstrate exceptional gameplay, and build community recognition to earn invitations to our EVAL Invitationals!",
  },
  {
    question: "Can college students use EVAL?",
    answer:
      "Yes! Although EVAL is specifically designed for high school students looking to pursue esports at the collegiate levels, college students are welcome to use EVAL to showcase their skills and use our advanced analytics to improve their game.",
  },
];

export default function FAQSection(props: { className: string }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <section className={cn("bg-gray-900 py-20", props.className)}>
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="font-orbitron cyber-text mb-4 text-4xl font-black text-white md:text-5xl">
            FREQUENTLY ASKED
            <br />
            <span className="text-cyan-400">QUESTIONS</span>
          </h2>
          <p className="font-rajdhani text-xl text-gray-300">
            Everything you need to know about EVAL
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-rainbow-border">
              <Collapsible
                open={openFaq === index}
                onOpenChange={() => toggleFaq(index)}
              >
                <CollapsibleTrigger className="w-full cursor-pointer">
                  <div className="flex items-center justify-between border-b border-gray-600 bg-gray-800 p-6 transition-colors hover:bg-gray-700">
                    <h3 className="font-orbitron text-left text-lg font-semibold text-white">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`h-5 w-5 text-cyan-400 transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="border-b border-gray-600 bg-gray-800 p-6">
                    <p className="font-rajdhani leading-relaxed text-gray-300">
                      {faq.answer}
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
