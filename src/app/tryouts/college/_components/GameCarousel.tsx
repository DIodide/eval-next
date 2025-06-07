'use client'

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import type { Tryout } from "../types"
import TryoutCard from "./TryoutCard"

const gameColors = {
  VALORANT: "from-red-500 to-red-700",
  "Overwatch 2": "from-orange-500 to-orange-700",
  "Smash Ultimate": "from-yellow-500 to-yellow-700",
  "Rocket League": "from-blue-500 to-blue-700",
}

export const gameIcons = {
  "VALORANT": "/valorant/logos/V_Lockup_Vertical Black.png",
  "Overwatch 2": "/overwatch/logos/Overwatch 2 Secondary Black.png",
  "Smash Ultimate": "/smash/logos/smash-logo.png",
  "Rocket League": "/rocket-league/logos/rl-logo.png",
} as const

export type GameType = keyof typeof gameIcons;

export default function GameCarousel({ game, tryouts }: { game: GameType; tryouts: Tryout[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardWidth, setCardWidth] = useState(320)
  const cardRef = useRef<HTMLDivElement>(null)
  const itemsPerView = 3 // experiment with this, consider mobile view
  const maxIndex = Math.max(0, tryouts.length - itemsPerView)

  useEffect(() => {
    const updateCardWidth = () => {
      if (cardRef.current) {
        const width = cardRef.current.offsetWidth
        const gap = 24 // space-x-6 = 1.5rem = 24px
        setCardWidth(width + gap)
      }
    }

    updateCardWidth()
    window.addEventListener('resize', updateCardWidth)
    return () => window.removeEventListener('resize', updateCardWidth)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div
            className={`w-16 h-16 bg-gradient-to-br ${gameColors[game]} rounded-lg flex items-center justify-center text-2xl`}
          >
            <Image 
              src={gameIcons[game]} 
              alt={game} 
              width={48} 
              height={48} 
              className="object-contain" 
            />
          </div>
          <h2 className="font-orbitron text-2xl font-bold text-white tracking-wide">{game}</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className="border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex space-x-6 transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * cardWidth}px)` }}
        >
          {tryouts.map((tryout, index) => (
            <div 
              key={tryout.id} 
              ref={index === 0 ? cardRef : null}
              className="w-[320px] shrink-0"
            >
              <TryoutCard tryout={tryout} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 