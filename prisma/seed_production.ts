import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting production database seed...')

  // Seed Games
  console.log('📦 Seeding games...')
  const games = [
    {
      name: 'VALORANT',
      short_name: 'VAL',
      icon: '/valorant/logos/Valorant Logo Red Border.jpg',
      color: '#FF4654'
    },
    {
      name: 'Overwatch 2',
      short_name: 'OW2',
      icon: '/overwatch/logos/Overwatch2_Primary_LTBKGD.png',
      color: '#F99E1A'
    },
    {
      name: 'Super Smash Bros. Ultimate',
      short_name: 'SSBU',
      icon: '/smash/logos/Super Smash Bros Ultimate Black Logo.png',
      color: '#0066CC'
    },
    {
      name: 'Rocket League',
      short_name: 'RL',
      icon: '/rocket-league/logos/Rocket League Emblem.png',
      color: '#1F8EF1'
    }
  ]

  const createdGames = []
  for (const game of games) {
    try {
      const existingGame = await prisma.game.findUnique({
        where: { short_name: game.short_name }
      })
      
      if (existingGame) {
        console.log(`⏭️  Game already exists: ${game.name}`)
        createdGames.push(existingGame)
      } else {
        const newGame = await prisma.game.create({ data: game })
        console.log(`✅ Created game: ${game.name}`)
        createdGames.push(newGame)
      }
    } catch (error) {
      console.log(`⚠️  Could not create game ${game.name}:`, error)
    }
  }

  // Find VALORANT game for GSE league
  const valorantGame = createdGames.find(g => g.short_name === 'VAL')
  
  // Create Garden State Esports League
  console.log('🏆 Creating Garden State Esports League...')
  let gseLeague = null
  try {
    const existingLeague = await prisma.league.findFirst({
      where: { name: 'Garden State Esports League' }
    })
    
    if (existingLeague) {
      console.log('⏭️  Garden State Esports League already exists')
      gseLeague = existingLeague
    } else if (valorantGame?.id) {
      gseLeague = await prisma.league.create({
        data: {
          name: 'Garden State Esports League',
          short_name: 'GSE',
          description: 'New Jersey\'s premier high school esports league, fostering competitive gaming excellence across the Garden State.',
          game_id: valorantGame.id,
          region: 'Northeast',
          state: 'NJ',
          tier: 'COMPETITIVE',
          season: '2024-2025',
          status: 'ACTIVE',
          format: 'Round Robin + Playoffs',
          prize_pool: '$25,000',
          founded_year: 2019
        }
      })
      console.log('✅ Created Garden State Esports League')
    } else {
      console.log('⚠️  Cannot create GSE League: VALORANT game not found')
    }
  } catch (error) {
    console.log('⚠️  Could not create Garden State Esports League:', error)
  }

  console.log('🎉 Production seed completed successfully!')
  console.log('📊 Summary:')
  console.log(`   - Games: ${createdGames.length}`)
  console.log(`   - GSE League: ${gseLeague ? 'Created/Found' : 'Failed'}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 