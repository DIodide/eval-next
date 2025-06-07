"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"

const faqs = [
  {
    question: "What is EVAL Gaming?",
    answer:
      "EVAL Gaming is a platform that connects esports players with college scholarship opportunities. We provide tools for players to showcase their skills, track their performance, and get discovered by college coaches and recruiters.",
  },
  {
    question: "How much does it cost to use EVAL?",
    answer:
      "EVAL offers a free tier that includes basic profile creation and limited features. We also have Eval+ ($3/month) and Eval++ ($10/month) plans with enhanced features like advanced analytics, unlimited clip uploads, and priority visibility to coaches.",
  },
  {
    question: "What games does EVAL support?",
    answer:
      "EVAL currently supports major esports titles including VALORANT, Overwatch 2, Rocket League, League of Legends, Counter-Strike 2, and Super Smash Bros. Ultimate. We're continuously adding support for more games based on community demand.",
  },
  {
    question: "How do I get noticed by college coaches?",
    answer:
      "To get noticed by coaches, maintain an active profile with updated stats, upload high-quality gameplay clips, participate in EVAL combines and tournaments, and consider upgrading to Eval+ or Eval++ for increased visibility and advanced features.",
  },
  {
    question: "Can high school students use EVAL?",
    answer:
      "Yes! EVAL is specifically designed for high school students looking to pursue esports at the collegiate level. We work with high school leagues and provide age-appropriate features and safety measures.",
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
    question: "How do I upload gameplay clips?",
    answer:
      "You can upload gameplay clips directly to your profile through our web platform. Free users can upload 1 clip, Eval+ users can upload up to 10 clips, and Eval++ users have unlimited uploads. Clips should showcase your best plays and game sense.",
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
    <div className="min-h-screen bg-black">

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4 cyber-text glow-text">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-rajdhani max-w-3xl mx-auto">
            Find answers to common questions about EVAL Gaming and our platform
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <Collapsible open={openItems.includes(index)} onOpenChange={() => toggleItem(index)}>
                  <CollapsibleTrigger className="w-full">
                    <CardContent className="p-6">
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
            <a
              href="/contact"
              className="inline-block bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold px-8 py-3 rounded-lg tracking-wider transition-colors"
            >
              CONTACT SUPPORT
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}
