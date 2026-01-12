import type { Decimal } from "@prisma/client/runtime/library";

export interface TryoutRequirements {
  gpa: string;
  location: string;
  classYear: string;
  role: string;
}

export interface Tryout {
  id: string;
  title: string;
  description: string;
  date: Date;
  time_start: string | null;
  time_end: string | null;
  type: "ONLINE" | "IN_PERSON" | "HYBRID";
  price: string;
  max_spots: number;
  registered_spots: number;
  registration_deadline: Date | null;
  min_gpa: Decimal | null;
  class_years: string[];
  required_roles: string[];
  location: string;
  game: {
    id: string;
    name: string;
    short_name: string;
    icon: string | null;
    color: string | null;
  };
  school: {
    id: string;
    name: string;
    location: string;
    state: string | null;
    type: string;
  };
  organizer: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
  _count: {
    registrations: number;
  };
  // UI-specific computed fields
  gameType?: "VALORANT" | "Overwatch 2" | "Smash Ultimate" | "Rocket League";
  formattedDate?: string;
  formattedTime?: string;
  formattedPrice?: string;
  spotsLeft?: string;
  organizerName?: string;
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
