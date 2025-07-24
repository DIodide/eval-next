import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { staticPageMetadata } from "@/lib/server/metadata";
import type { Metadata } from "next";
import {
  ExternalLink,
  Handshake,
  Users,
  Building,
  Code,
  GraduationCap,
} from "lucide-react";

export const metadata: Metadata = staticPageMetadata.aboutPartners;

const partners = [
  {
    name: "Garden State Esports",
    logo: "/partners/gse/GSE_LOGO.png?height=120&width=200",
    description:
      "The official high school esports league for New Jersey, featuring competitive play across multiple titles and fostering the next generation of esports talent.",
    website: "https://gsesports.org/",
    category: "League Partner",
  },
  {
    name: "Princeton Keller Center",
    logo: "/partners/keller/keller.png?height=120&width=200",
    description:
      "Princeton University's hub for entrepreneurship, innovation, and impact-driven startups, supporting EVAL's mission to revolutionize esports recruitment.",
    website: "https://kellercenter.princeton.edu/people/startups-teams/eval",
    category: "Innovation Partner",
  },
];

const partnershipTypes = [
  {
    icon: GraduationCap,
    title: "Educational Institutions",
    description:
      "Connect with talented players for your esports programs and academic initiatives through our comprehensive recruitment platform.",
  },
  {
    icon: Users,
    title: "Gaming Organizations",
    description:
      "Discover and recruit the next generation of esports talent with advanced analytics and scouting tools.",
  },
  {
    icon: Code,
    title: "Technology Partners",
    description:
      "Integrate your tools and services with our growing platform ecosystem through API access and technical collaboration.",
  },
  {
    icon: Building,
    title: "Corporate Sponsors",
    description:
      "Support the future of esports while reaching our engaged community through brand visibility and event partnerships.",
  },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-orange-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_0%,transparent_50%)]" />

        <div className="relative z-10 container mx-auto px-6">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-orbitron cyber-text mb-6 text-5xl font-black text-white md:text-7xl">
              OUR{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                PARTNERS
              </span>
            </h1>

            <p className="font-rajdhani mb-12 text-xl leading-relaxed text-gray-300 md:text-2xl">
              We collaborate with industry leaders, educational institutions,
              and innovative organizations to create
              <span className="font-semibold text-cyan-400">
                {" "}
                unprecedented opportunities
              </span>{" "}
              for esports talent worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Current Partners Section */}
      <section className="bg-gradient-to-b from-transparent to-gray-900/50 py-20">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="font-orbitron cyber-text mb-6 text-4xl font-black text-white md:text-5xl">
              FEATURED PARTNERS
            </h2>
            <p className="font-rajdhani mx-auto max-w-3xl text-xl text-gray-300">
              Meet the organizations helping us shape the future of esports
              education and recruitment
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-2">
            {partners.map((partner, index) => (
              <Card
                key={index}
                className="group overflow-hidden border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-cyan-400/20"
              >
                <CardContent className="p-8">
                  {/* Logo */}
                  <div className="mb-8 text-center">
                    <div className="relative inline-block rounded-2xl border border-gray-700/50 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 group-hover:border-cyan-400/30">
                      <Image
                        src={partner.logo || "/placeholder.svg"}
                        alt={partner.name}
                        width={200}
                        height={120}
                        className="max-h-20 w-auto object-contain brightness-110 filter"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mb-8 text-center">
                    <h3 className="font-orbitron mb-4 text-2xl font-bold text-white transition-colors group-hover:text-cyan-400">
                      {partner.name}
                    </h3>
                    <p className="font-rajdhani mb-6 text-lg leading-relaxed text-gray-300">
                      {partner.description}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="text-center">
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn inline-block cursor-pointer"
                    >
                      <Button className="font-orbitron bg-gradient-to-r from-cyan-400 to-purple-400 px-8 py-3 font-bold tracking-wider text-black shadow-lg shadow-cyan-400/25 transition-all duration-300 group-hover/btn:shadow-cyan-400/40 hover:from-cyan-500 hover:to-purple-500">
                        <span>VISIT WEBSITE</span>
                        <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Types Section */}
      <section className="bg-gradient-to-b from-gray-900/50 to-black py-20">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="font-orbitron cyber-text mb-6 text-4xl font-black text-white md:text-5xl">
              PARTNERSHIP OPPORTUNITIES
            </h2>
            <p className="font-rajdhani mx-auto max-w-3xl text-xl text-gray-300">
              Discover how your organization can join our mission to transform
              esports education
            </p>
          </div>

          <div className="mx-auto max-w-6xl rounded-3xl border border-gray-700/50 bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-12 backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
              {partnershipTypes.map((type, index) => (
                <div key={index} className="group">
                  <div className="flex items-start gap-6">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-gray-600/50 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-cyan-400/50">
                      <type.icon className="h-8 w-8 text-gray-300 transition-colors group-hover:text-cyan-400" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-orbitron mb-3 text-xl font-bold text-white transition-colors group-hover:text-cyan-400">
                        {type.title}
                      </h3>
                      <p className="font-rajdhani leading-relaxed text-gray-300">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Become a Partner CTA Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-orange-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />

        <div className="relative z-10 container mx-auto px-6">
          <div className="mx-auto max-w-5xl text-center">
            <h3 className="font-orbitron cyber-text mb-8 text-4xl font-black text-white md:text-6xl">
              BECOME A{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                PARTNER
              </span>
            </h3>

            <p className="font-rajdhani mx-auto mb-12 max-w-4xl text-xl leading-relaxed text-gray-300">
              Join our mission to revolutionize esports education and create
              unprecedented opportunities for the next generation. Together, we
              can build the future of competitive gaming and academic
              achievement.
            </p>

            <Link href="/about/contact" className="cursor-pointer">
              <Button className="font-orbitron bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 px-12 py-4 text-xl font-bold tracking-wider text-black shadow-2xl transition-all duration-300 hover:scale-105 hover:from-cyan-500 hover:via-purple-500 hover:to-orange-500 hover:shadow-purple-400/30">
                <Handshake className="mr-3 h-6 w-6" />
                BECOME A PARTNER
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
