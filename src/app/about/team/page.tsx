import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { staticPageMetadata } from "@/lib/server/metadata";
import {
  Target,
  Users,
  Heart,
  Rocket,
  Quote,
  Star,
  Trophy,
  Gamepad2,
  GraduationCap,
} from "lucide-react";

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
    color: "from-cyan-400 to-blue-500",
  },
  {
    name: "Ryan Divan",
    role: "Founder & COO",
    image: "/team/headshots/ryan-head.jpeg?height=200&width=200",
    quote:
      "I've been an esports athlete throughout high school and I know how hard it is to get noticed. Through EVAL, I want to help high schoolers get recruited and get the opportunities they deserve.",
    background: "High School Esports Veteran",
    expertise: ["Operations", "Player Experience", "Recruitment"],
    color: "from-purple-400 to-pink-500",
  },
  {
    name: "Ibraheem Amin",
    role: "Lead Full Stack Engineer",
    image: "/team/headshots/ibraheem.png?height=200&width=200",
    quote:
      "Data tells the story of performance and opens opportunity for students. At EVAL, we're making sure every player's journey is backed by analytics and insight.",
    background: "Full-Stack Development & Analytics",
    expertise: ["Engineering", "Analytics", "Platform Development"],
    color: "from-green-400 to-teal-500",
  },
  {
    name: "Erika Yeung",
    role: "Marketing & Operations",
    image: "/team/headshots/erica.png?height=200&width=200",
    quote:
      "Marketing is all about storytelling. At EVAL, we're creating a narrative where gaming talent meets real-world opportunities.",
    background: "Brand Strategy & Digital Marketing",
    expertise: ["Marketing", "Brand Strategy", "Content Creation"],
    color: "from-orange-400 to-red-500",
  },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        {/* Color Splotches */}
        <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-[#06b6d4] opacity-[0.15] blur-3xl"></div>
        <div className="absolute top-20 right-20 h-40 w-40 rounded-full bg-[#8b5cf6] opacity-[0.12] blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 h-28 w-28 rounded-full bg-[#f59e0b] opacity-[0.18] blur-3xl"></div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="mx-auto max-w-6xl text-center">
            <h1 className="font-orbitron cyber-text mb-8 text-5xl font-black text-white md:text-7xl">
              OUR{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                MISSION
              </span>
            </h1>

            <div className="mx-auto max-w-5xl">
              <h2 className="font-orbitron mb-8 text-3xl leading-tight font-black text-white md:text-5xl">
                CONNECTING <span className="text-cyan-400">GAMERS</span> TO{" "}
                <span className="text-cyan-400">COLLEGE</span> SCHOLARSHIPS
              </h2>
              <p className="font-rajdhani mb-12 text-xl leading-relaxed text-gray-300 md:text-2xl">
                EVAL bridges the gap between gaming excellence and higher
                education by evaluating player performance, showcasing talent,
                and connecting gamers with life-changing scholarship
                opportunities through data-driven insights and innovative
                recruitment tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="relative pt-10 pb-20">
        {/* Color Splotches */}
        <div className="absolute top-10 left-10 h-40 w-40 rounded-full bg-[#f59e0b] opacity-[0.12] blur-3xl"></div>
        <div className="absolute top-1/3 right-12 h-28 w-28 rounded-full bg-[#06b6d4] opacity-[0.15] blur-2xl"></div>
        <div className="absolute bottom-16 left-1/3 h-36 w-36 rounded-full bg-[#8b5cf6] opacity-[0.13] blur-3xl"></div>
        <div className="absolute right-1/4 bottom-10 h-24 w-24 rounded-full bg-[#06b6d4] opacity-[0.11] blur-2xl"></div>
        <div className="relative container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="font-orbitron cyber-text mb-6 text-4xl font-black text-white md:text-5xl">
              MEET THE <span className="text-purple-400">TEAM</span>
            </h2>
            <p className="font-rajdhani mx-auto max-w-3xl text-xl text-gray-300">
              The passionate individuals behind EVAL&apos;s mission to
              revolutionize esports recruitment
            </p>
          </div>

          {/* Founding Team */}
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-2">
            {founders.map((founder, index) => (
              <div
                key={index}
                className="group text-center transition-all duration-300 hover:-translate-y-1"
              >
                {/* Photo */}
                <div className="relative mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full border-2 border-gray-700 transition-all duration-300 group-hover:border-cyan-400/50">
                  <Image
                    src={founder.image || "/placeholder.svg"}
                    alt={founder.name}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Name & Role */}
                <div className="mb-6">
                  <h3 className="font-orbitron mb-2 text-2xl font-bold text-white transition-colors group-hover:text-cyan-400">
                    {founder.name}
                  </h3>
                  <p className="font-rajdhani text-lg text-gray-400">
                    {founder.role}
                  </p>
                </div>

                {/* Quote */}
                <div className="mx-auto max-w-md">
                  <blockquote className="font-rajdhani text-lg leading-relaxed text-gray-300 italic">
                    &ldquo;{founder.quote}&rdquo;
                  </blockquote>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="relative py-20">
        {/* Color Splotches */}
        <div className="absolute top-16 right-16 h-36 w-36 rounded-full bg-[#8b5cf6] opacity-[0.14] blur-3xl"></div>
        <div className="absolute bottom-20 left-20 h-32 w-32 rounded-full bg-[#f59e0b] opacity-[0.16] blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 h-24 w-24 rounded-full bg-[#06b6d4] opacity-[0.10] blur-2xl"></div>
        <div className="relative container mx-auto px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 px-6 py-3">
                  <Heart className="h-5 w-5 text-cyan-400" />
                  <span className="font-orbitron text-sm tracking-wider text-cyan-400">
                    OUR STORY
                  </span>
                </div>

                <h2 className="font-orbitron cyber-text mb-8 text-4xl font-black text-white md:text-5xl">
                  FROM <span className="text-cyan-400">PLAYERS</span> TO{" "}
                  <span className="text-purple-400">PLATFORM</span>
                </h2>

                <div className="font-rajdhani space-y-6 text-lg leading-relaxed text-gray-300">
                  <p>
                    As{" "}
                    <em className="font-semibold text-cyan-400">
                      current D1 athletes and passionate gamers at Princeton
                    </em>
                    , we intimately understand the challenges of recruitment and
                    the dedication required to stand out in today&apos;s
                    competitive landscape.
                  </p>
                  <p>
                    We&apos;ve experienced firsthand the frustration of having
                    exceptional skills but lacking visibility. The traditional
                    recruitment process often overlooks talented players who
                    simply don&apos;t have the right connections or exposure.
                  </p>
                  <p>
                    That&apos;s why we created{" "}
                    <span className="font-semibold text-purple-400">
                      EVAL Gaming
                    </span>
                    : a revolutionary platform where you can showcase your
                    skills, achievements, and drive to coaches and recruiters
                    who are actively searching for players exactly like you.
                  </p>
                </div>

                <div className="mt-12 grid grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/10 to-cyan-600/10 p-6 text-center">
                    <Trophy className="mx-auto mb-3 h-8 w-8 text-cyan-400" />
                    <div className="font-orbitron mb-1 text-2xl font-black text-cyan-400">
                      D1
                    </div>
                    <div className="font-rajdhani text-sm text-gray-300">
                      Athlete Founders
                    </div>
                  </div>
                  <div className="rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-400/10 to-purple-600/10 p-6 text-center">
                    <Gamepad2 className="mx-auto mb-3 h-8 w-8 text-purple-400" />
                    <div className="font-orbitron mb-1 text-2xl font-black text-purple-400">
                      10+
                    </div>
                    <div className="font-rajdhani text-sm text-gray-300">
                      Years Gaming
                    </div>
                  </div>
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/20 to-purple-400/20 blur-3xl"></div>
                  <div className="relative rounded-3xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 p-8 backdrop-blur-sm">
                    <Image
                      src="/eval/official_sit.png?height=400&width=600"
                      alt="EVAL Team at Princeton"
                      width={600}
                      height={400}
                      className="w-full rounded-2xl object-cover"
                    />
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 px-4 py-2">
                        <GraduationCap className="h-4 w-4 text-cyan-400" />
                        <span className="font-orbitron text-xs tracking-wider text-cyan-400">
                          PRINCETON UNIVERSITY
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join Now CTA Section */}
      <section className="relative overflow-hidden py-20">
        {/* Color Splotches */}
        <div className="absolute top-12 left-16 h-44 w-44 rounded-full bg-[#8b5cf6] opacity-[0.14] blur-3xl"></div>
        <div className="absolute top-1/4 right-10 h-32 w-32 rounded-full bg-[#06b6d4] opacity-[0.18] blur-2xl"></div>
        <div className="absolute right-1/3 bottom-12 h-36 w-36 rounded-full bg-[#f59e0b] opacity-[0.16] blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 h-28 w-28 rounded-full bg-[#06b6d4] opacity-[0.12] blur-2xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1)_0%,transparent_70%)]" />

        <div className="relative z-10 container mx-auto px-6">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="font-orbitron cyber-text mb-8 text-4xl font-black text-white md:text-6xl">
              BEGIN YOUR{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                ESPORTS JOURNEY
              </span>
            </h2>

            <p className="font-rajdhani mx-auto mb-12 max-w-4xl text-xl leading-relaxed text-gray-300 md:text-2xl">
              Creating an EVAL profile is{" "}
              <span className="font-bold text-cyan-400">completely free</span>.
              Start today&mdash;showcase your talents, connect with coaches, and
              let EVAL help you secure the
              <span className="font-bold text-purple-400">
                {" "}
                scholarship opportunities you deserve!
              </span>
            </p>

            <Link href="/dashboard">
              <Button className="font-orbitron bg-gradient-to-r from-cyan-400 via-purple-400 to-orange-400 px-12 py-4 text-xl font-bold tracking-wider text-black shadow-2xl transition-all duration-300 hover:scale-105 hover:from-cyan-500 hover:via-purple-500 hover:to-orange-500 hover:shadow-purple-400/30">
                <Rocket className="mr-3 h-6 w-6" />
                JOIN EVAL TODAY
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
