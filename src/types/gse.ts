/**
 * GSE Rocket League Fall 2025 Database Types
 * External database integration for GSE league stats
 */

export interface GSERocketLeagueStats {
  // Core Statistics
  total_games: number;
  total_wins: number;
  total_losses: number;
  win_percentage: number;

  // Performance Metrics (Per Game Averages)
  goals_per_game: number;
  assists_per_game: number;
  saves_per_game: number;
  shots_per_game: number;
  demos_per_game: number;
  mvps_per_game: number;

  // Advanced Analytics
  shooting_percentage: number;
  demo_ratio: number;
  clutch_success_rate: number;
  speed_percentage: number;

  // Positional Distribution
  percent_defense: number;
  percent_neutral: number;
  percent_offense: number;

  // Equipment
  main_car: string;
}

export interface GSERocketLeaguePlayer {
  id: number;
  ign: string;
  player_id: string; // Epic Games ID
  eval_id: number | null;
  eval_score: number;
  total_games: number;
  stats: GSERocketLeagueStats;
  team: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface GSERocketLeagueAggregatePlayer {
  id: number;
  ign: string;
  player_id: string;
  eval_id: number | null;
  eval_score: number;
  stats: GSERocketLeagueStats & {
    wins: number;
    losses: number;
    games_played: number;
  };
  team: string | null;
  created_at: Date;
  updated_at: Date;
}
