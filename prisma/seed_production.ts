import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting production database seed...");

  // Seed Games
  console.log("📦 Seeding games...");
  const games = [
    {
      name: "VALORANT",
      short_name: "VAL",
      icon: "/valorant/logos/Valorant Logo Red Border.jpg",
      color: "#FF4654",
    },
    {
      name: "Overwatch 2",
      short_name: "OW2",
      icon: "/overwatch/logos/Overwatch2_Primary_LTBKGD.png",
      color: "#F99E1A",
    },
    {
      name: "Super Smash Bros. Ultimate",
      short_name: "SSBU",
      icon: "/smash/logos/Super Smash Bros Ultimate Black Logo.png",
      color: "#0066CC",
    },
    {
      name: "Rocket League",
      short_name: "RL",
      icon: "/rocket-league/logos/Rocket League Emblem.png",
      color: "#1F8EF1",
    },
  ];

  const createdGames = [];
  for (const game of games) {
    try {
      const existingGame = await prisma.game.findUnique({
        where: { short_name: game.short_name },
      });

      if (existingGame) {
        console.log(`⏭️  Game already exists: ${game.name}`);
        createdGames.push(existingGame);
      } else {
        const newGame = await prisma.game.create({ data: game });
        console.log(`✅ Created game: ${game.name}`);
        createdGames.push(newGame);
      }
    } catch (error) {
      console.log(`⚠️  Could not create game ${game.name}:`, error);
    }
  }

  // Find GSE supported games
  const valorantGame = createdGames.find((g) => g.short_name === "VAL");
  const smashGame = createdGames.find((g) => g.short_name === "SSBU");
  const rocketLeagueGame = createdGames.find((g) => g.short_name === "RL");
  const gseGames = [valorantGame, smashGame, rocketLeagueGame].filter(Boolean);

  // Create Garden State Esports League
  console.log("🏆 Creating Garden State Esports League...");
  let gseLeague = null;
  try {
    const existingLeague = await prisma.league.findFirst({
      where: {
        name: "Garden State Esports League",
        season: "2024-2025",
      },
    });

    if (existingLeague) {
      console.log("⏭️  Garden State Esports League already exists");
      gseLeague = existingLeague;
    } else {
      gseLeague = await prisma.league.create({
        data: {
          name: "Garden State Esports League",
          short_name: "GSE",
          description:
            "New Jersey's premier high school esports league, fostering competitive gaming excellence across the Garden State.",
          region: "Northeast",
          state: "NJ",
          tier: "COMPETITIVE",
          season: "2024-2025",
          status: "ACTIVE",
          format: "Round Robin + Playoffs",
          prize_pool: "Scholarships and Awards",
          founded_year: 2019,
        },
      });
      console.log("✅ Created Garden State Esports League");
    }
  } catch (error) {
    console.log("⚠️  Could not create Garden State Esports League:", error);
  }

  // Create league-game relationships for GSE supported games
  if (gseLeague && gseGames.length > 0) {
    console.log("🎮 Creating GSE game relationships...");
    let createdRelationships = 0;

    for (const game of gseGames) {
      if (!game) continue;

      try {
        const existingLeagueGame = await prisma.leagueGame.findUnique({
          where: {
            league_id_game_id: {
              league_id: gseLeague.id,
              game_id: game.id,
            },
          },
        });

        if (existingLeagueGame) {
          console.log(`⏭️  GSE-${game.short_name} relationship already exists`);
        } else {
          await prisma.leagueGame.create({
            data: {
              league_id: gseLeague.id,
              game_id: game.id,
            },
          });
          console.log(`✅ Created GSE-${game.short_name} game relationship`);
          createdRelationships++;
        }
      } catch (error) {
        console.log(
          `⚠️  Could not create GSE-${game.short_name} relationship:`,
          error,
        );
      }
    }
  }

  // Optional: Create a default league administrator for GSE
  // This is commented out as it would require actual Clerk user data
  // Uncomment and modify if you have specific admin user details to seed
  /*
  if (gseLeague) {
    try {
      const existingAdmin = await prisma.leagueAdministrator.findFirst({
        where: { league_id: gseLeague.id }
      })
      
      if (!existingAdmin) {
        await prisma.leagueAdministrator.create({
          data: {
            clerk_id: 'your_clerk_id_here',
            email: 'admin@gse.league',
            first_name: 'GSE',
            last_name: 'Administrator',
            username: 'gse_admin',
            league: 'Garden State Esports League',
            league_id: gseLeague.id,
            title: 'Commissioner'
          }
        })
        console.log('✅ Created GSE League Administrator')
      } else {
        console.log('⏭️  GSE League Administrator already exists')
      }
    } catch (error) {
      console.log('⚠️  Could not create GSE League Administrator:', error)
    }
  }
  */

  console.log("🎉 Production seed completed successfully!");
  console.log("📊 Summary:");
  console.log(`   - Games: ${createdGames.length}`);
  console.log(`   - GSE League: ${gseLeague ? "Created/Found" : "Failed"}`);
  console.log(
    `   - GSE Game Support: ${gseGames.map((g) => g?.short_name).join(", ")} (${gseGames.length} games)`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
