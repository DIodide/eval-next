'use client'

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Calendar, Clock } from "lucide-react"
import { gameIcons } from "./GameCarousel"

const gameCardImages = {
  VALORANT: "/eval/tryouts/cards/Valorant_Tryout_Card.png",
  "Overwatch 2": "/eval/tryouts/cards/Overwatch_Tryout_Card.png",
  "Smash Ultimate": "/eval/tryouts/cards/Smash_Tryout_Card.png",
  "Rocket League": "/eval/tryouts/cards/Rocket_Tryout_Card.png",
}

// Interface for the card display (simplified from the API response)
export interface CardTryout {
  id: string;
  game: "VALORANT" | "Overwatch 2" | "Smash Ultimate" | "Rocket League";
  title: string;
  school: string;
  price: string;
  type: string;
  spots: string;
  totalSpots: string;
  time?: string;
  date: string;
  organizer: string;
  description: string;
}

export default function TryoutCard({ tryout }: { tryout: CardTryout }) {
  return (
    <Card className="relative bg-gray-800 border-gray-700 hover:border-cyan-400/50 transition-all duration-300 min-w-[320px] hover:shadow-lg hover:shadow-cyan-400/20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={gameCardImages[tryout.game]} 
          alt={`${tryout.game} background`} 
          fill
          className="object-cover opacity-80" 
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-slate-900/30"></div>
      </div>
      
      {/* Content */}
      <CardContent className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 mr-4">
            <div className="w-12 h-12 bg-gray-700/80 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Image 
                src={gameIcons[tryout.game]} 
                alt={tryout.title} 
                width={32} 
                height={32} 
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-orbitron font-bold text-white text-sm tracking-wide drop-shadow-lg">{tryout.title}</h3>
              <p className="text-gray-300 text-xs font-rajdhani drop-shadow">{tryout.school}</p>
            </div>
          </div>
          <Badge
            variant={tryout.price === "Free" ? "secondary" : "outline"}
            className={`${tryout.price === "Free" ? "bg-green-600 text-white" : "border-cyan-400 text-cyan-400"} font-orbitron text-xs flex-shrink-0 backdrop-blur-sm`}
          >
            {tryout.price}
          </Badge>
        </div>

        <p className="text-gray-200 text-sm mb-4 font-rajdhani drop-shadow">{tryout.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-300" />
            <span className="text-gray-200 font-rajdhani drop-shadow">{tryout.type}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="w-4 h-4 text-gray-300" />
            <span className="text-gray-200 font-rajdhani drop-shadow">
              {tryout.spots} • {tryout.totalSpots}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-300" />
            <span className="text-gray-200 font-rajdhani drop-shadow">{tryout.date}</span>
          </div>
          {tryout.time && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-gray-300" />
              <span className="text-gray-200 font-rajdhani drop-shadow">{tryout.time}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300 font-rajdhani drop-shadow">by {tryout.organizer}</span>
          <Link href={`/tryouts/college/${tryout.id}`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-orbitron text-xs tracking-wide backdrop-blur-sm">
              VIEW DETAILS
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
} 