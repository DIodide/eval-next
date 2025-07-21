export interface Player {
  rank: number;
  username: string;
  school: string;
  rating: number;
  region: string;
  state: string;
}

export interface League {
  name: string;
  description: string;
  state: string;
  teams: number;
  players: number;
  season: string;
  status: string;
  id: number;
  shortName: string;
  game: string;
  tier: string;
}
