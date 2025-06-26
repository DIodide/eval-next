import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { staticPageMetadata } from "@/lib/metadata"

export const metadata = staticPageMetadata.aboutTeam;

const founders = [
  {
    name: "Sekou Roland",
    role: "Founder, CEO",
    image: "/team/headshots/sekou-head.png?height=200&width=200",
    quote:
      "It's more than a game. Video games are powerful—they inspire, connect, and bring people together. With Eval, kids are getting an education while doing something they love.",
  },
  {
    name: "Ryan Divan",
    role: "Founder, CTO",
    image: "/team/headshots/ryan-head.jpeg?height=200&width=200",
    quote:
      "Gaming has always been about community. We're building technology that brings players together and creates opportunities for the next generation.",
  },
  {
    name: "Erika Yeung",
    role: "Chief Marketing Officer (CMO)",
    image: "/team/headshots/erica.png?height=200&width=200",
    quote:
      "Marketing is all about storytelling. At Eval, we're creating a narrative where gaming talent meets real-world opportunities.",
  },
  {
    name: "Ibraheem Amin",
    role: "Software Engineer",
    image: "/team/headshots/ibraheem.png?height=200&width=200",
    quote:
      "Data tells the story of performance. At Eval, we're making sure every player's journey is backed by analytics and insight.",
  },
]

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black/60 to-black/80">
      <div className="container mx-auto px-6 py-12">
        {/* Mission Section */}
        <section className="text-center mb-20">
          <h1 className="font-orbitron text-4xl md:text-6xl font-black text-white mb-8 cyber-text glow-text">
            OUR MISSION
          </h1>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-white mb-6 font-orbitron">
              CONNECTING <span className="text-cyan-400">GAMERS</span>
              <br />
              TO <span className="text-cyan-400">COLLEGE</span> SCHOLARSHIPS
            </h2>
            <p className="text-lg text-gray-300 leading-relaxed font-rajdhani">
              Eval bridges the gap between gaming and higher education by evaluating player performance, showcasing
              talent, and connecting gamers with scholarship opportunities. Through curated leaderboards, power
              rankings, and data-driven insights, Eval highlights the best players and helps them get noticed by
              colleges and organizations offering scholarships.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20">
          <div className="lg:w-1/2 text-center lg:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-6 font-orbitron">Our Story</h2>
            <p className="text-lg text-gray-300 leading-relaxed font-rajdhani">
              As current <em>D1 athletes and gamers at Princeton</em>, we understand the challenges of recruitment and
              the dedication it takes to stand out. That&apos;s why we&apos;ve created EvalGaming: a platform where you can
              showcase your skills, achievements, and drive to coaches and recruiters actively searching for players
              like you.
            </p>
          </div>
          <div className="lg:w-1/2">
            <Image
              src="/eval/official_sit.png?height=400&width=600"
              alt="Eval Team"
              width={600}
              height={400}
              className="rounded-lg"
            />
          </div>
        </section>

        {/* Team Section */}
        <section className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-12 font-orbitron">MEET THE TEAM</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {founders.map((founder, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 hover:border-cyan-400/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                    <Image
                      src={founder.image || "/placeholder.svg"}
                      alt={founder.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-1 font-orbitron">{founder.name}</h3>
                  <p className="text-cyan-400 text-sm mb-4 font-orbitron">{founder.role}</p>
                  <p className="text-gray-300 italic font-rajdhani">&quot;{founder.quote}&quot;</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Join Now Section */}
        <section className="text-center py-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-6 font-orbitron">Start Your Journey</h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8 font-rajdhani">
            Creating an Eval profile is <span className="text-cyan-400 font-bold">completely free</span>. Start
            today—chase your dreams, share your talents, and let EvalGaming help you get the{" "}
            <span className="text-cyan-400 font-bold">opportunities you deserve!</span>
          </p>
          <Button className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron font-bold px-8 py-3 text-lg tracking-wider">
            JOIN NOW
          </Button>
        </section>
      </div>

    </div>
  )
}
