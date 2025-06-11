import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Seed Games
  console.log('📦 Seeding games...')
  const games = [
    {
      name: 'VALORANT',
      short_name: 'VAL',
      icon: '/valorant/logos/valorant-logo.png',
      color: '#FF4654'
    },
    {
      name: 'Overwatch 2',
      short_name: 'OW2',
      icon: '/overwatch/logos/overwatch-logo.png',
      color: '#F99E1A'
    },
    {
      name: 'Super Smash Bros. Ultimate',
      short_name: 'SSBU',
      icon: '/smash/logos/smash-logo.png',
      color: '#0066CC'
    },
    {
      name: 'Rocket League',
      short_name: 'RL',
      icon: '/rocket-league/logos/rocket-league-logo.png',
      color: '#1F8EF1'
    }
  ]

  for (const game of games) {
    try {
      const existingGame = await prisma.game.findUnique({
        where: { short_name: game.short_name }
      })
      
      if (existingGame) {
        console.log(`⏭️  Game already exists: ${game.name}`)
      } else {
        await prisma.game.create({ data: game })
        console.log(`✅ Created game: ${game.name}`)
      }
    } catch (error) {
      console.log(`⚠️  Could not create game ${game.name}:`, error)
    }
  }

  // Seed Schools
  console.log('🏫 Seeding schools...')
  const schools = [
    {
      name: 'University of Gaming',
      type: 'UNIVERSITY' as const,
      location: 'Los Angeles',
      state: 'CA',
      region: 'West',
      website: 'https://universitygaming.edu'
    },
    {
      name: 'Esports Institute',
      type: 'COLLEGE' as const,
      location: 'Austin',
      state: 'TX',
      region: 'South',
      website: 'https://esportsinstitute.edu'
    },
    {
      name: 'Gaming Academy High School',
      type: 'HIGH_SCHOOL' as const,
      location: 'Seattle',
      state: 'WA',
      region: 'West',
      website: 'https://gamingacademy.edu'
    }
  ]

  for (const school of schools) {
    try {
      const existingSchool = await prisma.school.findFirst({
        where: {
          name: school.name,
          type: school.type,
          state: school.state
        }
      })
      
      if (existingSchool) {
        console.log(`⏭️  School already exists: ${school.name}`)
      } else {
        await prisma.school.create({ data: school })
        console.log(`✅ Created school: ${school.name}`)
      }
    } catch (error) {
      console.log(`⚠️  Could not create school ${school.name}:`, error)
    }
  }

  console.log('🎉 Database seed completed successfully!')
  console.log('')
  console.log('🎮 Available games:')
  const allGames = await prisma.game.findMany()
  allGames.forEach(game => {
    console.log(`   • ${game.name} (${game.short_name})`)
  })

  console.log('')
  console.log('🏫 Available schools:')
  const allSchools = await prisma.school.findMany()
  allSchools.forEach(school => {
    console.log(`   • ${school.name} (${school.type})`)
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('🔌 Database connection closed')
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  }) 