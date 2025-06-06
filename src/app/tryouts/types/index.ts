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
} 