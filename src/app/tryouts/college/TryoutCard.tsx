'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Users, Calendar, Clock } from "lucide-react"
import type { Tryout } from "../college/types"
import { gameIcons } from "./GameCarousel"

export default function TryoutCard({ tryout }: { tryout: Tryout }) {
  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-cyan-400/50 transition-all duration-300 min-w-[320px] hover:shadow-lg hover:shadow-cyan-400/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 mr-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
              <Image 
                src={gameIcons[tryout.game]} 
                alt={tryout.title} 
                width={32} 
                height={32} 
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-orbitron font-bold text-white text-sm tracking-wide">{tryout.title}</h3>
              <p className="text-gray-400 text-xs font-rajdhani">{tryout.school}</p>
            </div>
          </div>
          <Badge
            variant={tryout.price === "Free" ? "secondary" : "outline"}
            className={`${tryout.price === "Free" ? "bg-green-600 text-white" : "border-cyan-400 text-cyan-400"} font-orbitron text-xs flex-shrink-0`}
          >
            {tryout.price}
          </Badge>
        </div>

        <p className="text-gray-300 text-sm mb-4 font-rajdhani">{tryout.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">{tryout.type}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">
              {tryout.spots} • {tryout.totalSpots}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-300 font-rajdhani">{tryout.date}</span>
          </div>
          {tryout.time && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300 font-rajdhani">{tryout.time}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-rajdhani">by {tryout.organizer}</span>
          <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-black font-orbitron text-xs tracking-wide">
            REGISTER
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 