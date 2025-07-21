"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";

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
      "To get noticed by coaches, maintain an active profile with updated stats, upload high-quality gameplay clips, participate in EVAL combines and tournaments, and consider upgrading to EVAL+ or EVAL++ for increased visibility and advanced features.",
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
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    );
  };

  return (
    <div className="bg-black/95">
      <div className="from-eval-cyan/5 via-eval-purple/5 to-eval-orange/5 min-h-screen bg-gradient-to-b">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-r" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_0%,transparent_50%)]" />

          <div className="relative z-10 container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 px-6 py-3">
                <HelpCircle className="h-5 w-5 text-cyan-400" />
                <span className="font-orbitron text-sm tracking-wider text-cyan-400">
                  KNOWLEDGE BASE
                </span>
              </div>

              <h1 className="font-orbitron cyber-text mb-6 text-5xl font-black text-white md:text-7xl">
                FREQUENTLY ASKED{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  QUESTIONS
                </span>
              </h1>

              <p className="font-rajdhani mb-12 text-xl leading-relaxed text-gray-300 md:text-2xl">
                Find answers to common questions about EVAL and our platform
              </p>
            </div>
          </div>
        </section>

        {/* FAQ List */}
        <section className="pb-20">
          <div className="container mx-auto px-6">
            <div className="mx-auto max-w-4xl">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card
                    key={index}
                    className="faq-rainbow-border rounded-xs border-gray-700 bg-gradient-to-br backdrop-blur-sm transition-all duration-300 hover:border-gray-600"
                  >
                    <Collapsible
                      open={openItems.includes(index)}
                      onOpenChange={() => toggleItem(index)}
                    >
                      <CollapsibleTrigger className="w-full">
                        <CardContent className="p-6 transition-colors hover:bg-gray-700/20">
                          <div className="flex items-center justify-between">
                            <h3 className="font-orbitron text-left text-lg font-semibold tracking-wide text-white">
                              {faq.question}
                            </h3>
                            {openItems.includes(index) ? (
                              <ChevronDown className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 flex-shrink-0 text-cyan-400" />
                            )}
                          </div>
                        </CardContent>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="px-6 pt-0 pb-6">
                          <div className="border-t border-gray-700 pt-4">
                            <p className="font-rajdhani text-lg leading-relaxed text-gray-300">
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
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-r" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />

          <div className="relative z-10 container mx-auto px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 px-6 py-3">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
                <span className="font-orbitron text-sm tracking-wider text-cyan-400">
                  NEED MORE HELP?
                </span>
              </div>

              <h2 className="font-orbitron cyber-text mb-8 text-4xl font-black text-white md:text-6xl">
                STILL HAVE{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  QUESTIONS?
                </span>
              </h2>

              <p className="font-rajdhani mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-300 md:text-2xl">
                Can&apos;t find the answer you&apos;re looking for? Our support
                team is here to help.
              </p>

              {/* Contact Options */}
              <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                <Link href="/about/contact" className="group">
                  <Card className="border-gray-700 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-xl">
                    <CardContent className="p-8 text-center">
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-400 p-4 transition-transform duration-300 group-hover:scale-110">
                        <Mail className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-orbitron mb-4 text-xl font-bold text-white transition-colors group-hover:text-cyan-400">
                        Email Support
                      </h3>
                      <p className="font-rajdhani mb-4 text-gray-300">
                        Get detailed answers to your questions
                        <br />
                        support@evalgaming.com
                      </p>
                      <p className="font-orbitron text-sm text-cyan-400">
                        24-hour response time
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/about/contact" className="group">
                  <Card className="border-gray-700 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-purple-400/50 hover:shadow-xl">
                    <CardContent className="p-8 text-center">
                      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 p-4 transition-transform duration-300 group-hover:scale-110">
                        <Phone className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-orbitron mb-4 text-xl font-bold text-white transition-colors group-hover:text-purple-400">
                        Phone Support
                      </h3>
                      <p className="font-rajdhani mb-4 text-gray-300">
                        Speak directly with our team
                        <br />
                        +1 (215) 678-1829
                      </p>
                      <p className="font-orbitron text-sm text-purple-400">
                        Mon-Fri 9AM-6PM EST
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>

              {/* Simple Contact Button */}
              <Link
                href="/about/contact"
                className="font-orbitron inline-block transform rounded-xl bg-gradient-to-r from-cyan-400 to-purple-400 px-8 py-4 font-bold tracking-wider text-black shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-cyan-500 hover:to-purple-500 hover:shadow-xl"
              >
                CONTACT SUPPORT
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
