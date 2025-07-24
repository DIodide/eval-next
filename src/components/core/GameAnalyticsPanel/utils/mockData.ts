import type {
  ValorantStats,
  RocketLeagueStats,
  SmashStats,
  GameStats,
} from "../types";

// Mock Valorant stats for demo purposes
export const mockValorantStats: ValorantStats = {
  gameName: "DemoPlayer",
  tagLine: "EVAL",
  stats: {
    evalScore: 78,
    rank: "Diamond 2",
    gameWinRate: "67%",
    roundWinRate: "58%",
    kda: "1.34",
    acs: "245",
    kastPercent: "78%",
    clutchFactor: "42%",
  },
  role: "Duelist",
  mainAgent: {
    name: "Jett",
    image: "/ValAssets/Characters/add6443a-41bd-e414-f6ad-e58d267f4e95.png",
  },
  mainGun: {
    name: "Vandal",
    image: "/ValAssets/Weapons/9c82e19d-4575-0200-1a81-3eacf00cf872.png",
  },
  bestMap: {
    name: "Ascent",
    image: "/ValAssets/Maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319.png",
  },
  worstMap: {
    name: "Icebox",
    image: "/ValAssets/Maps/e2ad5c54-4114-a870-9641-8ea21279579a.png",
  },
};

// Mock Rocket League stats for demo purposes
export const mockRocketLeagueStats: RocketLeagueStats = {
  username: "DemoPlayer",
  duels: {
    rank: "Champion I",
    eval_score: 72,
    win_percentage: 0.64,
    count: 156,
    goals: 2.3,
    saves: 1.8,
    assists: 0.4,
    shots: 4.7,
    mvps_per_game: 0.42,
    shooting_percentage: 0.49,
    speed: 78.7,
    clutch: 0.31,
    boost_empty: 12,
    boost_full: 18,
    boost_0_25: 25,
    boost_25_50: 20,
    boost_50_75: 15,
    boost_75_100: 10,
  },
  doubles: {
    rank: "Champion II",
    eval_score: 75,
    win_percentage: 0.68,
    count: 234,
    goals: 1.9,
    saves: 2.1,
    assists: 1.2,
    shots: 3.8,
    mvps_per_game: 0.38,
    shooting_percentage: 52,
    speed: 82.1,
    clutch: 0.35,
    boost_empty: 10,
    boost_full: 22,
    boost_0_25: 23,
    boost_25_50: 18,
    boost_50_75: 17,
    boost_75_100: 10,
  },
  standard: {
    rank: "Diamond III",
    eval_score: 68,
    win_percentage: 0.61,
    count: 189,
    goals: 1.4,
    saves: 1.9,
    assists: 1.8,
    shots: 2.9,
    mvps_per_game: 0.29,
    shooting_percentage: 48,
    speed: 72,
    clutch: 0.28,
    boost_empty: 15,
    boost_full: 16,
    boost_0_25: 28,
    boost_25_50: 19,
    boost_50_75: 14,
    boost_75_100: 8,
  },
};

// Mock Smash stats for demo purposes
export const mockSmashStats: SmashStats = {
  playerInfo: {
    gamerTag: "DemoPlayer",
    prefix: "EVAL",
    mainCharacter: "Joker",
    evalScore: 81.25,
  },
  stats: {
    set_win_rate: 0.73,
    game_win_rate: 0.68,
    clutch_factor: 0.45,
    events: 24,
    mains: {
      Joker: {
        games: 45,
        winrate: 0.78,
        image_path: "/SSBUAssets/Joker1.png",
      },
      "Pyra/Mythra": {
        games: 32,
        winrate: 0.69,
        image_path: "/SSBUAssets/Pyra1.png",
      },
      Wolf: {
        games: 28,
        winrate: 0.65,
        image_path: "/SSBUAssets/Wolf1.png",
      },
    },
    best_matchups: {
      Joker: {
        Ganondorf: {
          wins: 8,
          games: 9,
          winrate: 0.89,
          player_character_image: "/SSBUAssets/Joker1.png",
          opponent_character_image: "/SSBUAssets/Ganondorf1.png",
        },
        "King Dedede": {
          wins: 11,
          games: 13,
          winrate: 0.85,
          player_character_image: "/SSBUAssets/Joker1.png",
          opponent_character_image: "/SSBUAssets/KingDedede1.png",
        },
      },
    },
    worst_matchups: {
      Joker: {
        Pikachu: {
          wins: 4,
          games: 13,
          winrate: 0.31,
          player_character_image: "/SSBUAssets/Joker1.png",
          opponent_character_image: "/SSBUAssets/Pikachu1.png",
        },
        Fox: {
          wins: 6,
          games: 16,
          winrate: 0.38,
          player_character_image: "/SSBUAssets/Joker1.png",
          opponent_character_image: "/SSBUAssets/Fox1.png",
        },
      },
    },
    best_stages: {
      Battlefield: { wins: 18, losses: 4, winrate: 0.82 },
      "Pokemon Stadium 2": { wins: 16, losses: 5, winrate: 0.76 },
    },
    worst_stages: {
      "Final Destination": { wins: 9, losses: 11, winrate: 0.45 },
      "Small Battlefield": { wins: 12, losses: 13, winrate: 0.48 },
    },
  },
  recentPlacements: [
    { event: "Weekly Tournament #45", placement: 3, entrants: 64 },
    { event: "Monthly Major", placement: 7, entrants: 128 },
    { event: "Weekly Tournament #44", placement: 2, entrants: 48 },
  ],
};

// Check if a playerId is a demo/mock user
export const isDemoUser = (playerId: string): boolean => {
  return playerId === "demo-user" || playerId === "demo" || playerId === "mock";
};

// Get mock data for a specific game
export const getMockStatsForGame = (gameId: string): GameStats | null => {
  switch (gameId) {
    case "valorant":
      return mockValorantStats;
    case "rocket-league":
      return mockRocketLeagueStats;
    case "smash":
      return mockSmashStats;
    case "overwatch":
      return null; // Coming soon
    default:
      return null;
  }
};
