import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

const partners = [
  {
    name: "Garden State Esports",
    logo: "/partners/gse/GSE_LOGO.png?height=120&width=200",
    description:
      "The official high school esports league for New Jersey, featuring competitive play across multiple titles.",
    website: "https://gsesports.org/",
  },
  {
    name: "Princeton Keller Center",
    logo: "/partners/keller/keller.png?height=120&width=200",
    description: "Princeton University's hub for entrepreneurship, innovation, and impact-driven startups.",
    website: "https://kellercenter.princeton.edu/people/startups-teams/eval",
  },
  {
    name: "Princeton Student Ventures",
    logo: "/partners/psv/psv.png?height=120&width=200",
    description: "Supporting Princeton student founders through funding, mentorship, and startup incubation.",
    website: "https://www.psv.vc/",
  },
]

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-black">
  

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-4 cyber-text glow-text">
            OUR PARTNERS
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-rajdhani max-w-3xl mx-auto">
            We&apos;re proud to work with leading organizations in esports, education, and entrepreneurship
          </p>
        </div>

        {/* Current Partners Section */}
        <section className="mb-20">
          <h2 className="font-orbitron text-3xl text-cyan-400 mb-12 text-center">Our Current Partners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partners.map((partner, index) => (
              <Card
                key={index}
                className="bg-gray-800 border-gray-700 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20 flex flex-col"
              >
                <CardContent className="p-8 text-center flex flex-col flex-1">
                  <div className="mb-6">
                    <Image
                      src={partner.logo || "/placeholder.svg"}
                      alt={partner.name}
                      width={200}
                      height={120}
                      className="mx-auto"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 font-orbitron">{partner.name}</h3>
                  <p className="text-gray-300 mb-6 font-rajdhani flex-1">{partner.description}</p>
                  <div className="mt-auto">
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold px-6 py-2 tracking-wider">
                        VISIT WEBSITE
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Become a Partner Section */}
        <section className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 rounded-2xl p-8 md:p-12 text-center">
          <h3 className="text-3xl md:text-4xl text-white font-bold mb-6 font-orbitron">Become a Partner</h3>
          <p className="text-gray-300 text-lg max-w-4xl mx-auto mb-8 font-rajdhani">
            Are you an organization interested in working with EVAL Gaming? Partner with us to expand opportunities for
            high school esports players nationwide. Together, we can build the future of competitive gaming and
            education.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-orbitron text-white mb-2">Educational Institutions</h4>
              <p className="text-gray-300 font-rajdhani text-sm">
                Connect with talented players for your esports programs
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-orbitron text-white mb-2">Gaming Organizations</h4>
              <p className="text-gray-300 font-rajdhani text-sm">
                Discover and recruit the next generation of esports talent
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-orbitron text-white mb-2">Technology Partners</h4>
              <p className="text-gray-300 font-rajdhani text-sm">Integrate your tools with our platform ecosystem</p>
            </div>
          </div>
          <Link href="/contact">
            <Button className="bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-500 hover:to-purple-500 text-black font-orbitron font-bold px-8 py-3 text-lg tracking-wider">
              BECOME A PARTNER
            </Button>
          </Link>
        </section>
      </div>

    </div>
  )
}