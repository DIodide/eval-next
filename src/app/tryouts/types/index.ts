export interface TryoutRequirements {
  gpa: string;
  location: string;
  classYear: string;
  role: string;
}

export interface Tryout {
  id: number;
  game: "VALORANT" | "Overwatch 2" | "Smash Ultimate" | "Rocket League";
  title: string;
  school: string;
  price: string;
  type: "Online" | "In-Person" | "Hybrid";
  spots: string;
  totalSpots: string;
  time: string;
  date: string;
  organizer: string;
  description: string;
  requirements: TryoutRequirements;
  longDescription?: string;
} 

export interface Combine {
  id: number;
  title: string;
  year: string;
  date: string;
  location: string;
  spots: string;
  prize: string;
  status: string;
  qualified: boolean;
  description: string;
  requirements: string;
  game: string;
  gameIcon: string;
  gameColor: string;
  bgColor: string;
  image: string;
  // UI-specific fields
  time?: string;
  type?: "Online" | "In-Person" | "Hybrid";
  spotsRemaining?: number;
  organizer?: string;
  longDescription?: string;
  prizePool?: string;
  format?: string;
}