import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { staticPageMetadata } from "@/lib/metadata"
import type { Metadata } from "next"
import { ExternalLink, Handshake, Users, Building, Code, GraduationCap, Sparkles } from "lucide-react"

export const metadata: Metadata = staticPageMetadata.aboutPartners

const partners = [
  {
    name: "Garden State Esports",
    logo: "/partners/gse/GSE_LOGO.png?height=120&width=200",
    description:
      "The official high school esports league for New Jersey, featuring competitive play across multiple titles and fostering the next generation of esports talent.",
    website: "https://gsesports.org/",
    category: "League Partner",
    highlights: ["Official NJ High School League", "Multi-Game Tournaments", "Player Development"],
  },
  {
    name: "Princeton Keller Center",
    logo: "/partners/keller/keller.png?height=120&width=200",
    description: "Princeton University's hub for entrepreneurship, innovation, and impact-driven startups, supporting EVAL's mission to revolutionize esports recruitment.",
    website: "https://kellercenter.princeton.edu/people/startups-teams/eval",
    category: "Innovation Partner",
    highlights: ["Startup Incubation", "Business Development", "Academic Support"],
  },
]

const partnershipTypes = [
  {
    icon: GraduationCap,
    title: "Educational Institutions",
    description: "Connect with talented players for your esports programs and academic initiatives",
    benefits: ["Direct access to verified players", "Custom recruitment tools", "Academic partnership opportunities"]
  },
  {
    icon: Users,
    title: "Gaming Organizations",
    description: "Discover and recruit the next generation of esports talent through our platform",
    benefits: ["Advanced player analytics", "Scouting dashboard", "Tournament integration"]
  },
  {
    icon: Code,
    title: "Technology Partners",
    description: "Integrate your tools and services with our growing platform ecosystem",
    benefits: ["API access", "Co-marketing opportunities", "Technical collaboration"]
  },
  {
    icon: Building,
    title: "Corporate Sponsors",
    description: "Support the future of esports while reaching our engaged community",
    benefits: ["Brand visibility", "Community engagement", "Event sponsorship"]
  }
]

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-orange-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_0%,transparent_50%)]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full px-6 py-3 mb-8 border border-cyan-400/30">
              <Handshake className="w-5 h-5 text-cyan-400" />
              <span className="font-orbitron text-cyan-400 text-sm tracking-wider">BUILDING THE FUTURE TOGETHER</span>
            </div>
            
            <h1 className="font-orbitron text-5xl md:text-7xl font-black text-white mb-6 cyber-text">
              OUR <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">PARTNERS</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 font-rajdhani leading-relaxed">
              We collaborate with industry leaders, educational institutions, and innovative organizations to create 
              <span className="text-cyan-400 font-semibold"> unprecedented opportunities</span> for esports talent worldwide.
            </p>
            

          </div>
        </div>
      </section>

      {/* Current Partners Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-4xl md:text-5xl font-black text-white mb-6 cyber-text">
              FEATURED PARTNERS
            </h2>
            <p className="text-xl text-gray-300 font-rajdhani max-w-3xl mx-auto">
              Meet the organizations helping us shape the future of esports education and recruitment
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {partners.map((partner, index) => (
              <Card 
                key={index}
                className="group bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-cyan-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-400/20 hover:-translate-y-2 overflow-hidden"
              >
                <CardContent className="p-8">
                  {/* Category Badge */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full px-4 py-2 border border-cyan-400/30">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="font-orbitron text-cyan-400 text-xs tracking-wider">{partner.category}</span>
                    </div>
                  </div>
                  
                  {/* Logo */}
                  <div className="mb-8 text-center">
                    <div className="relative inline-block p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-gray-700/50 group-hover:border-cyan-400/30 transition-all duration-300">
                      <Image
                        src={partner.logo || "/placeholder.svg"}
                        alt={partner.name}
                        width={200}
                        height={120}
                        className="max-h-20 w-auto object-contain filter brightness-110"
                      />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4 font-orbitron group-hover:text-cyan-400 transition-colors">
                      {partner.name}
                    </h3>
                    <p className="text-gray-300 font-rajdhani leading-relaxed text-lg mb-6">
                      {partner.description}
                    </p>
                    
                    {/* Highlights */}
                    <div className="space-y-3 mb-8">
                      {partner.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center justify-center gap-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
                          <span className="text-gray-300 font-rajdhani">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="text-center">
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="inline-block group/btn">
                      <Button className="bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-500 hover:to-purple-500 text-black font-orbitron font-bold px-8 py-3 tracking-wider shadow-lg shadow-cyan-400/25 group-hover/btn:shadow-cyan-400/40 transition-all duration-300">
                        <span>VISIT WEBSITE</span>
                        <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
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
      <section className="py-20 bg-gradient-to-b from-gray-900/50 to-black">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-4xl md:text-5xl font-black text-white mb-6 cyber-text">
              PARTNERSHIP OPPORTUNITIES
            </h2>
            <p className="text-xl text-gray-300 font-rajdhani max-w-3xl mx-auto">
              Discover how your organization can join our mission to transform esports education
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-3xl border border-gray-700/50 backdrop-blur-sm p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {partnershipTypes.map((type, index) => (
                <div key={index} className="group">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/5 border border-gray-600/50 p-4 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm">
                      <type.icon className="w-8 h-8 text-gray-300 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-orbitron text-xl text-white font-bold mb-3 group-hover:text-cyan-400 transition-colors">
                        {type.title}
                      </h3>
                      <p className="text-gray-300 font-rajdhani leading-relaxed mb-6">
                        {type.description}
                      </p>
                      
                      <div className="space-y-3">
                        {type.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
                            <span className="text-gray-300 font-rajdhani text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Become a Partner CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-orange-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full px-6 py-3 mb-8 border border-cyan-400/30">
              <Handshake className="w-5 h-5 text-cyan-400" />
              <span className="font-orbitron text-cyan-400 text-sm tracking-wider">JOIN OUR NETWORK</span>
            </div>
            
            <h3 className="text-4xl md:text-6xl text-white font-black mb-8 font-orbitron cyber-text">
              BECOME A <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">PARTNER</span>
            </h3>
            
            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-12 font-rajdhani leading-relaxed">
              Join our mission to revolutionize esports education and create unprecedented opportunities for the next generation. 
              Together, we can build the future of competitive gaming and academic achievement.
            </p>
            
            
            <Link href="/about/contact">
              <Button className="bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 hover:from-cyan-500 hover:via-purple-500 hover:to-orange-500 text-black font-orbitron font-bold px-12 py-4 text-xl tracking-wider shadow-2xl hover:shadow-purple-400/30 hover:scale-105 transition-all duration-300">
                <Handshake className="w-6 h-6 mr-3" />
                BECOME A PARTNER
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}