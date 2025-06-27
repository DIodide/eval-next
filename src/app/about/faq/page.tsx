"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

import { ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"

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
    question: "How do I get noticed by college coaches?",
    answer:
      "To get noticed by coaches, maintain an active profile with updated stats, upload high-quality gameplay clips, participate in EVAL combines and tournaments, and consider upgrading to Eval+ or Eval++ for increased visibility and advanced features.",
  },
  {
    question: "Can college students use EVAL?",
    answer:
      "Yes, absolutely! Although EVAL is specifically designed for high school students looking to pursue esports at the collegiate levels, college students are welcome to use EVAL to showcase their skills and use our advanced analytics to improve their game.",
  },
  {
    question: "How do tryouts work on EVAL?",
    answer:
      "Tryouts are organized by college coaches and can be online, in-person, or hybrid. You can browse available tryouts, register for ones that match your game and skill level, and participate to showcase your abilities to college programs.",
  },
  {
    question: "What kind of scholarships are available?",
    answer:
      "EVAL connects players with various scholarship opportunities including full-ride scholarships, partial scholarships, and academic scholarships with esports components. We work with over 500 partner colleges offering more than $50M in available funding.",
  },
  {
    question: "How do I upload gameplay clips and VODs?",
    answer:
      "You can upload gameplay clips and VODs directly to your profile through our web platform, linking to YouTube, Twitch, Medal, and more. Clips should showcase your best plays and game sense.",
  },
  {
    question: "Is my personal information safe on EVAL?",
    answer:
      "Yes, we take privacy and security seriously. We use industry-standard encryption, never sell personal data, and provide privacy controls so you can choose what information to share with coaches and recruiters.",
  },
  {
    question: "How do I contact EVAL support?",
    answer:
      "You can contact our support team through the contact form on our website, email us at support@evalgaming.com, or reach out through our social media channels. We typically respond within 24 hours.",
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black/60 to-black/80">

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4 cyber-text glow-text">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-rajdhani max-w-3xl mx-auto">
            Find answers to common questions about EVAL and our platform
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="rounded-xs faq-rainbow-border bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <Collapsible open={openItems.includes(index)} onOpenChange={() => toggleItem(index)}>
                  <CollapsibleTrigger className="w-full">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-left font-orbitron text-lg text-white font-semibold tracking-wide">
                          {faq.question}
                        </h3>
                        {openItems.includes(index) ? (
                          <ChevronDown className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="px-6 pb-6 pt-0">
                      <div className="border-t border-gray-700 pt-4">
                        <p className="text-gray-300 font-rajdhani leading-relaxed">{faq.answer}</p>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-16 text-center bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8">
            <h2 className="font-orbitron text-2xl text-white mb-4">Still have questions?</h2>
            <p className="text-gray-300 font-rajdhani mb-6">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            <Link
              href="/about/contact"
              className="inline-block bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold px-8 py-3 rounded-lg tracking-wider transition-colors"
            >
              CONTACT SUPPORT
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
