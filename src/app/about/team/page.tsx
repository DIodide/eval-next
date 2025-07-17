import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { staticPageMetadata } from "@/lib/metadata"
import { Target, Users, Heart, Rocket, Quote, Star, Trophy, Gamepad2, GraduationCap } from "lucide-react"

export const metadata = staticPageMetadata.aboutTeam;

const founders = [
  {
    name: "Sekou Roland",
    role: "Founder & CEO",
    image: "/team/headshots/sekou-head.png?height=200&width=200",
    quote:
      "It's more than a game. Video games are powerful—they inspire, connect, and bring people together. With EVAL, kids are getting an education while doing something they love.",
    background: "D1 Athlete & Gaming Enthusiast",
    expertise: ["Leadership", "Strategy", "Business Development"],
    color: "from-cyan-400 to-blue-500"
  },
  {
    name: "Ryan Divan",
    role: "Founder & COO",
    image: "/team/headshots/ryan-head.jpeg?height=200&width=200",
    quote:
      "I've been an esports athlete throughout high school and I know how hard it is to get noticed. Through EVAL, I want to help high schoolers get recruited and get the opportunities they deserve.",
    background: "High School Esports Veteran",
    expertise: ["Operations", "Player Experience", "Recruitment"],
    color: "from-purple-400 to-pink-500"
  },
  {
    name: "Erika Yeung",
    role: "Marketing & Operations",
    image: "/team/headshots/erica.png?height=200&width=200",
    quote:
      "Marketing is all about storytelling. At EVAL, we're creating a narrative where gaming talent meets real-world opportunities.",
    background: "Brand Strategy & Digital Marketing",
    expertise: ["Marketing", "Brand Strategy", "Content Creation"],
    color: "from-orange-400 to-red-500"
  },
  {
    name: "Ibraheem Amin",
    role: "Lead Full-StackEngineer",
    image: "/team/headshots/ibraheem.png?height=200&width=200",
    quote:
      "Data tells the story of performance and opens opportunity for students. At EVAL, we're making sure every player's journey is backed by analytics and insight.",
    background: "Full-Stack Development & Analytics",
    expertise: ["Engineering", "Analytics", "Platform Development"],
    color: "from-green-400 to-teal-500"
  },
]

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "We strive for excellence in everything we do, from our platform to our partnerships.",
    color: "from-cyan-400 to-blue-500"
  },
  {
    icon: Users,
    title: "Community",
    description: "Building a supportive community where every gamer can thrive and succeed.",
    color: "from-purple-400 to-pink-500"
  },
  {
    icon: Heart,
    title: "Passion",
    description: "Fueled by our love for gaming and dedication to student success.",
    color: "from-orange-400 to-red-500"
  },
  {
    icon: Rocket,
    title: "Innovation",
    description: "Continuously pushing boundaries to create better opportunities for players.",
    color: "from-green-400 to-teal-500"
  }
]

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-orange-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_0%,transparent_50%)]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full px-6 py-3 mb-8 border border-cyan-400/30">
              <Users className="w-5 h-5 text-cyan-400" />
              <span className="font-orbitron text-cyan-400 text-sm tracking-wider">BY GAMERS, FOR GAMERS</span>
            </div>
            
            <h1 className="font-orbitron text-5xl md:text-7xl font-black text-white mb-8 cyber-text">
              OUR <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">MISSION</span>
            </h1>
            
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black leading-tight text-white mb-8 font-orbitron">
                CONNECTING <span className="text-cyan-400">GAMERS</span> TO <span className="text-cyan-400">COLLEGE</span> SCHOLARSHIPS
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-rajdhani mb-12">
                EVAL bridges the gap between gaming excellence and higher education by evaluating player performance, 
                showcasing talent, and connecting gamers with life-changing scholarship opportunities through 
                data-driven insights and innovative recruitment tools.
              </p>
            </div>
            

          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full px-6 py-3 mb-8 border border-cyan-400/30">
                  <Heart className="w-5 h-5 text-cyan-400" />
                  <span className="font-orbitron text-cyan-400 text-sm tracking-wider">OUR STORY</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-black text-white mb-8 font-orbitron cyber-text">
                  FROM <span className="text-cyan-400">PLAYERS</span> TO <span className="text-purple-400">PLATFORM</span>
                </h2>
                
                <div className="space-y-6 text-lg text-gray-300 font-rajdhani leading-relaxed">
                  <p>
                    As <em className="text-cyan-400 font-semibold">current D1 athletes and passionate gamers at Princeton</em>, 
                    we intimately understand the challenges of recruitment and the dedication required to stand out in today&apos;s 
                    competitive landscape.
                  </p>
                  <p>
                    We&apos;ve experienced firsthand the frustration of having exceptional skills but lacking visibility. 
                    The traditional recruitment process often overlooks talented players who simply don&apos;t have the right 
                    connections or exposure.
                  </p>
                  <p>
                    That&apos;s why we created <span className="text-purple-400 font-semibold">EVAL Gaming</span>: 
                    a revolutionary platform where you can showcase your skills, achievements, and drive to coaches 
                    and recruiters who are actively searching for players exactly like you.
                  </p>
                </div>
                
                <div className="mt-12 grid grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-cyan-400/10 to-cyan-600/10 border border-cyan-400/30 rounded-2xl p-6 text-center">
                    <Trophy className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                    <div className="text-2xl font-orbitron font-black text-cyan-400 mb-1">D1</div>
                    <div className="text-gray-300 font-rajdhani text-sm">Athlete Founders</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-400/10 to-purple-600/10 border border-purple-400/30 rounded-2xl p-6 text-center">
                    <Gamepad2 className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <div className="text-2xl font-orbitron font-black text-purple-400 mb-1">10+</div>
                    <div className="text-gray-300 font-rajdhani text-sm">Years Gaming</div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-3xl blur-3xl"></div>
                  <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700/50 backdrop-blur-sm">
                    <Image
                      src="/eval/official_sit.png?height=400&width=600"
                      alt="EVAL Team at Princeton"
                      width={600}
                      height={400}
                      className="rounded-2xl w-full object-cover"
                    />
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full px-4 py-2 border border-cyan-400/30">
                        <GraduationCap className="w-4 h-4 text-cyan-400" />
                        <span className="font-orbitron text-cyan-400 text-xs tracking-wider">PRINCETON UNIVERSITY</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-orbitron text-4xl md:text-5xl font-black text-white mb-6 cyber-text">
              MEET THE <span className="text-purple-400">TEAM</span>
            </h2>
            <p className="text-xl text-gray-300 font-rajdhani max-w-3xl mx-auto">
              The passionate individuals behind EVAL&apos;s mission to revolutionize esports recruitment
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {founders.map((founder, index) => (
              <Card 
                key={index} 
                className="group bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-cyan-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-400/20 hover:-translate-y-2 overflow-hidden"
              >
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="flex items-start gap-6 mb-8">
                    <div className="relative flex-shrink-0">
                      <div className={`absolute inset-0 bg-gradient-to-r ${founder.color} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-gray-700 group-hover:border-cyan-400/50 transition-colors duration-300">
                        <Image
                          src={founder.image || "/placeholder.svg"}
                          alt={founder.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2 font-orbitron group-hover:text-cyan-400 transition-colors">
                        {founder.name}
                      </h3>
                      <p className={`text-lg font-orbitron mb-3 bg-gradient-to-r ${founder.color} bg-clip-text text-transparent font-semibold`}>
                        {founder.role}
                      </p>
                      <p className="text-gray-400 font-rajdhani text-sm mb-4">
                        {founder.background}
                      </p>
                      
                      {/* Expertise Tags */}
                      <div className="flex flex-wrap gap-2">
                        {founder.expertise.map((skill, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center gap-1 bg-gray-700/50 rounded-full px-3 py-1 text-xs font-rajdhani text-gray-300 border border-gray-600/50"
                          >
                            <Star className="w-3 h-3" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Quote */}
                  <div className="relative">
                    <Quote className="w-8 h-8 text-cyan-400/50 mb-4" />
                    <blockquote className="text-gray-300 font-rajdhani italic leading-relaxed text-lg pl-4 border-l-2 border-cyan-400/30">
                      &ldquo;{founder.quote}&rdquo;
                    </blockquote>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join Now CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-orange-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full px-6 py-3 mb-8 border border-cyan-400/30">
              <Rocket className="w-5 h-5 text-cyan-400" />
              <Link href="/recruiting" className="font-orbitron text-cyan-400 text-sm tracking-wider">START YOUR JOURNEY</Link>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 font-orbitron cyber-text">
              BEGIN YOUR <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">ESPORTS JOURNEY</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 font-rajdhani leading-relaxed">
              Creating an EVAL profile is <span className="text-cyan-400 font-bold">completely free</span>. 
              Start today&mdash;showcase your talents, connect with coaches, and let EVAL help you secure the 
              <span className="text-purple-400 font-bold"> scholarship opportunities you deserve!</span>
            </p>
            
            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-cyan-400/30 transition-all duration-300">
                <div className="text-2xl font-orbitron font-black text-cyan-400 mb-2">FREE</div>
                <div className="text-gray-300 font-rajdhani text-sm">Always Free to Start</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-purple-400/30 transition-all duration-300">
                <div className="text-2xl font-orbitron font-black text-purple-400 mb-2">24/7</div>
                <div className="text-gray-300 font-rajdhani text-sm">Platform Access</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-orange-400/30 transition-all duration-300">
                <div className="text-2xl font-orbitron font-black text-orange-400 mb-2">∞</div>
                <div className="text-gray-300 font-rajdhani text-sm">Unlimited Opportunities</div>
              </div>
            </div>
            
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 hover:from-cyan-500 hover:via-purple-500 hover:to-orange-500 text-black font-orbitron font-bold px-12 py-4 text-xl tracking-wider shadow-2xl hover:shadow-purple-400/30 hover:scale-105 transition-all duration-300">
                <Rocket className="w-6 h-6 mr-3" />
                JOIN EVAL TODAY
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
