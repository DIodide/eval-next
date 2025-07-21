"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, Clock } from "lucide-react";
import { gameIcons } from "./GameCarousel";

const gameCardImages = {
  VALORANT: "/eval/tryouts/cards/Valorant_Tryout_Card.png",
  "Overwatch 2": "/eval/tryouts/cards/Overwatch_Tryout_Card.png",
  "Smash Ultimate": "/eval/tryouts/cards/Smash_Tryout_Card.png",
  "Rocket League": "/eval/tryouts/cards/Rocket_Tryout_Card.png",
};

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
    <Card className="relative min-w-[320px] overflow-hidden border-gray-700 bg-gray-800 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-400/20">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={gameCardImages[tryout.game]}
          alt={`${tryout.game} background`}
          fill
          className="object-cover opacity-50"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-slate-900/30"></div>
      </div>

      {/* Content */}
      <CardContent className="relative z-10 p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="mr-4 flex flex-1 items-center space-x-3">
            <div className="flex items-center justify-center rounded-full bg-gray-700/20 backdrop-blur-sm">
              <Image
                src={gameIcons[tryout.game]}
                alt={tryout.title}
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-orbitron text-sm font-bold tracking-wide text-white drop-shadow-lg">
                {tryout.title}
              </h3>
              <p className="font-rajdhani text-xs text-gray-300 drop-shadow">
                {tryout.school}
              </p>
            </div>
          </div>
          <Badge
            variant={tryout.price === "Free" ? "secondary" : "outline"}
            className={`${tryout.price === "Free" ? "bg-green-600 text-white" : "border-cyan-400 text-cyan-400"} font-orbitron flex-shrink-0 text-xs backdrop-blur-sm`}
          >
            {tryout.price}
          </Badge>
        </div>

        <p className="font-rajdhani mb-4 text-sm text-gray-200 drop-shadow">
          {tryout.description}
        </p>

        <div className="mb-4 space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-300" />
            <span className="font-rajdhani text-gray-200 drop-shadow">
              {tryout.type}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4 text-gray-300" />
            <span className="font-rajdhani text-gray-200 drop-shadow">
              {tryout.spots} • {tryout.totalSpots}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-300" />
            <span className="font-rajdhani text-gray-200 drop-shadow">
              {tryout.date}
            </span>
          </div>
          {tryout.time && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="h-4 w-4 text-gray-300" />
              <span className="font-rajdhani text-gray-200 drop-shadow">
                {tryout.time}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="font-rajdhani text-xs text-gray-300 drop-shadow">
            by {tryout.organizer}
          </span>
          <Link href={`/tryouts/college/${tryout.id}`}>
            <Button
              size="sm"
              className="font-orbitron bg-blue-600 text-xs tracking-wide text-white backdrop-blur-sm hover:bg-blue-700"
            >
              VIEW DETAILS
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
