"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  ChevronDown, 
  ChevronRight, 
  HelpCircle, 
  MessageSquare,
  Mail,
  Phone,
  Clock
} from "lucide-react"
import Link from "next/link"

const faqs = [
  {
    question: "What is EVAL?",
    answer: "EVAL is the premier platform connecting esports players with college scholarship opportunities through advanced analytics, combines, and recruitment tools.",
  },
  {
    question: "How much does it cost to use EVAL?",
    answer: "EVAL offers a free tier with basic features, providing all you need to get recruited. Premium plans start at $30 per year for enhanced visibility and advanced analytics.",
  },
  {
    question: "What games does EVAL support?",
    answer: "EVAL currently supports VALORANT, Rocket League, Overwatch 2, and Super Smash Bros. Ultimate, with more games being added regularly.",
  },
  {
    question: "How do I get invited to EVAL Combines?",
    answer: "EVAL Combines are free to enter for all high school players, no invitation necessary. Maintain high rankings, demonstrate exceptional gameplay, and build community recognition to earn invitations to our EVAL Invitationals!",
  },
  {
    question: "How do I get noticed by college coaches?",
    answer: "To get noticed by coaches, maintain an active profile with updated stats, upload high-quality gameplay clips, participate in EVAL combines and tournaments, and consider upgrading to EVAL+ or EVAL++ for increased visibility and advanced features.",
  },
  {
    question: "Can college students use EVAL?",
    answer: "Yes, absolutely! Although EVAL is specifically designed for high school students looking to pursue esports at the collegiate levels, college students are welcome to use EVAL to showcase their skills and use our advanced analytics to improve their game.",
  },
  {
    question: "How do tryouts work on EVAL?",
    answer: "Tryouts are organized by college coaches and can be online, in-person, or hybrid. You can browse available tryouts, register for ones that match your game and skill level, and participate to showcase your abilities to college programs.",
  },
  {
    question: "What kind of scholarships are available?",
    answer: "EVAL connects players with various scholarship opportunities including full-ride scholarships, partial scholarships, and academic scholarships with esports components. We work with over 500 partner colleges offering more than $50M in available funding.",
  },
  {
    question: "How do I upload gameplay clips and VODs?",
    answer: "You can upload gameplay clips and VODs directly to your profile through our web platform, linking to YouTube, Twitch, Medal, and more. Clips should showcase your best plays and game sense.",
  },
  {
    question: "Is my personal information safe on EVAL?",
    answer: "Yes, we take privacy and security seriously. We use industry-standard encryption, never sell personal data, and provide privacy controls so you can choose what information to share with coaches and recruiters.",
  },
  {
    question: "How do I contact EVAL support?",
    answer: "You can contact our support team through the contact form on our website, email us at support@evalgaming.com, or reach out through our social media channels. We typically respond within 24 hours.",
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems((prev) => (prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]))
  }

  return (
    <div className="bg-black/95">
    <div className="min-h-screen bg-gradient-to-b from-eval-cyan/5 via-eval-purple/5 to-eval-orange/5">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r " />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_0%,transparent_50%)]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full px-6 py-3 mb-8 border border-cyan-400/30">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              <span className="font-orbitron text-cyan-400 text-sm tracking-wider">KNOWLEDGE BASE</span>
            </div>
            
            <h1 className="font-orbitron text-5xl md:text-7xl font-black text-white mb-6 cyber-text">
              FREQUENTLY ASKED <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">QUESTIONS</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 font-rajdhani leading-relaxed">
              Find answers to common questions about EVAL and our platform
            </p>
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card 
                  key={index} 
                  className="rounded-xs faq-rainbow-border bg-gradient-to-br  border-gray-700 hover:border-gray-600 transition-all duration-300 backdrop-blur-sm"
                >
                  <Collapsible open={openItems.includes(index)} onOpenChange={() => toggleItem(index)}>
                    <CollapsibleTrigger className="w-full">
                      <CardContent className="p-6 hover:bg-gray-700/20 transition-colors">
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
                          <p className="text-gray-300 font-rajdhani leading-relaxed text-lg">
                            {faq.answer}
                          </p>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r " />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full px-6 py-3 mb-8 border border-cyan-400/30">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <span className="font-orbitron text-cyan-400 text-sm tracking-wider">NEED MORE HELP?</span>
            </div>
            
            <h2 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-8 cyber-text">
              STILL HAVE <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">QUESTIONS?</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 font-rajdhani leading-relaxed">
              Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
            </p>
            
            {/* Contact Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <Link href="/about/contact" className="group">
                <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-400 p-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-orbitron text-xl text-white font-bold mb-4 group-hover:text-cyan-400 transition-colors">
                      Email Support
                    </h3>
                    <p className="text-gray-300 font-rajdhani mb-4">
                      Get detailed answers to your questions<br/>support@evalgaming.com
                    </p>
                    <p className="text-cyan-400 font-orbitron text-sm">
                      24-hour response time
                    </p>
                  </CardContent>
                </Card>
              </Link>
              
              <Link href="/about/contact" className="group">
                <Card className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700 hover:border-purple-400/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 p-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Phone className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-orbitron text-xl text-white font-bold mb-4 group-hover:text-purple-400 transition-colors">
                      Phone Support
                    </h3>
                    <p className="text-gray-300 font-rajdhani mb-4">
                      Speak directly with our team<br/>+1 (215) 678-1829
                    </p>
                    <p className="text-purple-400 font-orbitron text-sm">
                      Mon-Fri 9AM-6PM EST
                    </p>
                  </CardContent>
                </Card>
              </Link>
              
            </div>
            
            {/* Simple Contact Button */}
            <Link
              href="/about/contact"
              className="inline-block bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-500 hover:to-purple-500 text-black font-orbitron font-bold px-8 py-4 rounded-xl tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              CONTACT SUPPORT
            </Link>
          </div>
        </div>
      </section>
    </div>
    </div>
  )
}
