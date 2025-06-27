"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const faqs = [
  {
    question: "What is EVAL?",
    answer:
      "EVAL is the premier platform connecting esports players with college scholarship opportunities through advanced analytics, combines, and recruitment tools.",
  },
  {
    question: "How much does it cost to use EVAL?",
    answer:
      "EVAL offers a free tier with basic features, providing all you need to get recruited. Premium plans start at $30 per year for enhanced visibility and advanced analytics.",
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
]

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <section className="bg-gray-900 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-orbitron text-4xl md:text-5xl font-black text-white mb-4 cyber-text">
            FREQUENTLY ASKED
            <br />
            <span className="text-cyan-400">QUESTIONS</span>
          </h2>
          <p className="text-xl text-gray-300 font-rajdhani">Everything you need to know about EVAL</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-rainbow-border">
              <Collapsible open={openFaq === index} onOpenChange={() => toggleFaq(index)}>
                <CollapsibleTrigger className="w-full cursor-pointer">
                  <div className="flex items-center justify-between p-6 bg-gray-800 hover:bg-gray-700 transition-colors border-b border-gray-600">
                    <h3 className="font-orbitron text-white text-lg font-semibold text-left">{faq.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 text-cyan-400 transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="p-6 bg-gray-800 border-b border-gray-600">
                    <p className="text-gray-300 font-rajdhani leading-relaxed">{faq.answer}</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 