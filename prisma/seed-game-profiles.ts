/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

// Configuration - Edit these to customize your seed
const PLAYER_USERNAMES = [
  // Add usernames of players you want to generate profiles for
  "moogitus",
  // Add more usernames as needed
];

// Game-specific data pools
const valorantAgentsPool = [
  "Jett",
  "Phoenix",
  "Reyna",
  "Raze",
  "Yoru",
  "Neon", // Duelists
  "Sova",
  "Breach",
  "Skye",
  "KAY/O",
  "Fade",
  "Gekko", // Initiators
  "Brimstone",
  "Omen",
  "Viper",
  "Astra",
  "Harbor",
  "Clove", // Controllers
  "Sage",
  "Cypher",
  "Killjoy",
  "Chamber",
  "Deadlock",
  "Vyse", // Sentinels
];

const valorantRolesPool = [
  "Duelist",
  "Initiator",
  "Controller",
  "Sentinel",
  "IGL",
  "Flex",
];
const valorantRanksPool = [
  "Iron 1",
  "Iron 2",
  "Iron 3",
  "Bronze 1",
  "Bronze 2",
  "Bronze 3",
  "Silver 1",
  "Silver 2",
  "Silver 3",
  "Gold 1",
  "Gold 2",
  "Gold 3",
  "Platinum 1",
  "Platinum 2",
  "Platinum 3",
  "Diamond 1",
  "Diamond 2",
  "Diamond 3",
  "Ascendant 1",
  "Ascendant 2",
  "Ascendant 3",
  "Immortal 1",
  "Immortal 2",
  "Immortal 3",
  "Radiant",
];

const overwatchHeroesPool = [
  "D.Va",
  "Doomfist",
  "Junker Queen",
  "Orisa",
  "Ramattra",
  "Reinhardt",
  "Roadhog",
  "Sigma",
  "Winston",
  "Wrecking Ball",
  "Zarya",
  "Mauga", // Tanks
  "Ashe",
  "Bastion",
  "Cassidy",
  "Genji",
  "Hanzo",
  "Junkrat",
  "Mei",
  "Pharah",
  "Reaper",
  "Soldier: 76",
  "Symmetra",
  "Torbjörn",
  "Tracer",
  "Widowmaker",
  "Venture", // DPS
  "Ana",
  "Baptiste",
  "Brigitte",
  "Kiriko",
  "Lifeweaver",
  "Lúcio",
  "Mercy",
  "Moira",
  "Zenyatta",
  "Illari", // Support
];

const overwatchRolesPool = ["Tank", "DPS", "Support", "Flex"];
const overwatchRanksPool = [
  "Bronze 5",
  "Bronze 4",
  "Bronze 3",
  "Bronze 2",
  "Bronze 1",
  "Silver 5",
  "Silver 4",
  "Silver 3",
  "Silver 2",
  "Silver 1",
  "Gold 5",
  "Gold 4",
  "Gold 3",
  "Gold 2",
  "Gold 1",
  "Platinum 5",
  "Platinum 4",
  "Platinum 3",
  "Platinum 2",
  "Platinum 1",
  "Diamond 5",
  "Diamond 4",
  "Diamond 3",
  "Diamond 2",
  "Diamond 1",
  "Master 5",
  "Master 4",
  "Master 3",
  "Master 2",
  "Master 1",
  "Grandmaster 5",
  "Grandmaster 4",
  "Grandmaster 3",
  "Grandmaster 2",
  "Grandmaster 1",
  "Champion",
  "Top 500",
];

const rocketLeaguePositionsPool = [
  "Striker",
  "Midfielder",
  "Goalkeeper",
  "All positions",
];
const rocketLeagueRanksPool = [
  "Bronze I",
  "Bronze II",
  "Bronze III",
  "Silver I",
  "Silver II",
  "Silver III",
  "Gold I",
  "Gold II",
  "Gold III",
  "Platinum I",
  "Platinum II",
  "Platinum III",
  "Diamond I",
  "Diamond II",
  "Diamond III",
  "Champion I",
  "Champion II",
  "Champion III",
  "Grand Champion I",
  "Grand Champion II",
  "Grand Champion III",
  "Supersonic Legend",
];

const smashCharactersPool = [
  "Mario",
  "Donkey Kong",
  "Link",
  "Samus",
  "Dark Samus",
  "Yoshi",
  "Kirby",
  "Fox",
  "Pikachu",
  "Luigi",
  "Ness",
  "Captain Falcon",
  "Jigglypuff",
  "Peach",
  "Daisy",
  "Bowser",
  "Ice Climbers",
  "Sheik",
  "Zelda",
  "Dr. Mario",
  "Pichu",
  "Falco",
  "Marth",
  "Lucina",
  "Young Link",
  "Ganondorf",
  "Mewtwo",
  "Roy",
  "Chrom",
  "Mr. Game & Watch",
  "Meta Knight",
  "Pit",
  "Dark Pit",
  "Zero Suit Samus",
  "Wario",
  "Snake",
  "Ike",
  "Pokémon Trainer",
  "Diddy Kong",
  "Lucas",
  "Sonic",
  "King Dedede",
  "Olimar",
  "Lucario",
  "R.O.B.",
  "Toon Link",
  "Wolf",
  "Villager",
  "Mega Man",
  "Wii Fit Trainer",
  "Rosalina & Luma",
  "Little Mac",
  "Greninja",
  "Mii Brawler",
  "Mii Swordfighter",
  "Mii Gunner",
  "Palutena",
  "Pac-Man",
  "Robin",
  "Shulk",
  "Bowser Jr.",
  "Duck Hunt",
  "Ryu",
  "Ken",
  "Cloud",
  "Corrin",
  "Bayonetta",
  "Inkling",
  "Ridley",
  "Simon",
  "Richter",
  "King K. Rool",
  "Isabelle",
  "Incineroar",
  "Piranha Plant",
  "Joker",
  "Hero",
  "Banjo & Kazooie",
  "Terry",
  "Byleth",
  "Min Min",
  "Steve",
  "Sephiroth",
  "Pyra",
  "Mythra",
  "Kazuya",
  "Sora",
];

const playStylesPool = [
  "Aggressive",
  "Passive",
  "Tactical",
  "Support-focused",
  "Mechanical",
  "Strategic",
  "Adaptive",
  "Team-oriented",
];

// Helper functions
const getRandomElement = <T>(array: T[]): T => {
  if (array.length === 0) {
    throw new Error("Cannot get random element from empty array");
  }
  return array[Math.floor(Math.random() * array.length)]!;
};

const getRandomElements = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

async function main() {
  console.log("🎮 Starting game profile generation...");

  // Get all games
  const games = await prisma.game.findMany();
  if (games.length === 0) {
    console.log("❌ No games found. Please run the main seed first.");
    return;
  }

  console.log(`📦 Found ${games.length} games:`);
  games.forEach((game) =>
    console.log(`   • ${game.name} (${game.short_name})`),
  );

  // Process each username
  for (const username of PLAYER_USERNAMES) {
    console.log(`\n👤 Processing player: ${username}`);

    // Find player by username
    const player = await prisma.player.findFirst({
      where: { username: username },
      include: {
        game_profiles: {
          include: { game: true },
        },
      },
    });

    if (!player) {
      console.log(`⚠️  Player not found: ${username}`);
      continue;
    }

    console.log(`✅ Found player: ${player.first_name} ${player.last_name}`);

    // Get existing game profiles
    const existingGameIds = player.game_profiles.map(
      (profile) => profile.game_id,
    );
    console.log(
      `   Existing profiles: ${player.game_profiles.map((p) => p.game.short_name).join(", ") || "None"}`,
    );

    // Generate profiles for games they don't have yet
    const availableGames = games.filter(
      (game) => !existingGameIds.includes(game.id),
    );

    if (availableGames.length === 0) {
      console.log(`   Player already has profiles for all games`);
      continue;
    }

    // Randomly select 1-3 new games for this player
    const numNewProfiles = Math.min(
      Math.floor(Math.random() * 3) + 1,
      availableGames.length,
    );
    const selectedGames = getRandomElements(availableGames, numNewProfiles);

    console.log(
      `   Creating ${numNewProfiles} new profile(s) for: ${selectedGames.map((g) => g.short_name).join(", ")}`,
    );

    // Create game profiles
    for (const game of selectedGames) {
      try {
        // Generate correlated scores (higher skill players have higher scores across the board)
        const skillLevel = Math.random(); // 0-1 skill multiplier
        const baseScore = 50 + skillLevel * 45; // 50-95 base score
        const variance = 5; // ±5 points variance

        const leagueScore = Math.max(
          0,
          Math.min(100, baseScore + (Math.random() - 0.5) * variance * 2),
        );

        const combineScore = Math.max(
          0,
          Math.min(100, baseScore + (Math.random() - 0.5) * variance * 2),
        );

        const gameProfile: any = {
          player_id: player.id,
          game_id: game.id,
          username: `${username}_${game.short_name}`,
          rating: Math.floor(1000 + skillLevel * 3000), // Rating scales with skill level
          combine_score: parseFloat(combineScore.toFixed(1)),
          league_score: parseFloat(leagueScore.toFixed(1)),
          play_style: getRandomElement(playStylesPool),
          tracker_url: `https://tracker.gg/${game.short_name.toLowerCase()}/${username}`,
        };

        // Game-specific data
        if (game.short_name === "VAL") {
          gameProfile.rank = getRandomElement(valorantRanksPool);
          gameProfile.role = getRandomElement(valorantRolesPool);
          gameProfile.agents = getRandomElements(
            valorantAgentsPool,
            Math.floor(Math.random() * 5) + 1,
          );
          gameProfile.preferred_maps = getRandomElements(
            [
              "Bind",
              "Haven",
              "Split",
              "Ascent",
              "Dust2",
              "Inferno",
              "Mirage",
              "Cache",
            ],
            Math.floor(Math.random() * 3) + 1,
          );
        } else if (game.short_name === "OW2") {
          gameProfile.rank = getRandomElement(overwatchRanksPool);
          gameProfile.role = getRandomElement(overwatchRolesPool);
          gameProfile.agents = getRandomElements(
            overwatchHeroesPool,
            Math.floor(Math.random() * 6) + 1,
          );
          gameProfile.preferred_maps = getRandomElements(
            [
              "King's Row",
              "Hanamura",
              "Temple of Anubis",
              "Volskaya",
              "Dorado",
              "Route 66",
            ],
            Math.floor(Math.random() * 3) + 1,
          );
        } else if (game.short_name === "RL") {
          gameProfile.rank = getRandomElement(rocketLeagueRanksPool);
          gameProfile.role = getRandomElement(rocketLeaguePositionsPool);
          gameProfile.agents = []; // No agents in Rocket League
          gameProfile.preferred_maps = getRandomElements(
            [
              "DFH Stadium",
              "Mannfield",
              "Champions Field",
              "Urban Central",
              "Beckwith Park",
            ],
            Math.floor(Math.random() * 3) + 1,
          );
        } else if (game.short_name === "SSBU") {
          gameProfile.rank = `${Math.floor(Math.random() * 10000000)} GSP`;
          gameProfile.role = "Main";
          gameProfile.agents = getRandomElements(
            smashCharactersPool,
            Math.floor(Math.random() * 3) + 1,
          );
          gameProfile.preferred_maps = getRandomElements(
            [
              "Battlefield",
              "Final Destination",
              "Small Battlefield",
              "Pokemon Stadium 2",
              "Smashville",
            ],
            Math.floor(Math.random() * 3) + 1,
          );
        }

        await prisma.playerGameProfile.create({ data: gameProfile });
        console.log(
          `   ✅ Created ${game.short_name} profile - Rank: ${gameProfile.rank}, Role: ${gameProfile.role}`,
        );
        console.log(
          `      Scores: League ${gameProfile.league_score}, Combine ${gameProfile.combine_score}, Rating ${gameProfile.rating}`,
        );
      } catch (error) {
        console.log(
          `   ⚠️  Could not create ${game.short_name} profile:`,
          error,
        );
      }
    }
  }

  console.log("\n🎉 Game profile generation completed!");

  // Summary
  console.log("\n📊 Summary:");
  for (const username of PLAYER_USERNAMES) {
    const player = await prisma.player.findFirst({
      where: { username: username },
      include: {
        game_profiles: {
          include: { game: true },
        },
      },
    });

    if (player) {
      console.log(
        `   ${username}: ${player.game_profiles.length} profile(s) - ${player.game_profiles.map((p) => p.game.short_name).join(", ")}`,
      );
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("🔌 Database connection closed");
  })
  .catch(async (e) => {
    console.error("❌ Game profile generation failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
