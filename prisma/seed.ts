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
    },
    {
      name: 'Digital Sports University',
      type: 'UNIVERSITY' as const,
      location: 'Atlanta',
      state: 'GA',
      region: 'Southeast',
      website: 'https://digitalsports.edu'
    },
    {
      name: 'Elite Gaming College',
      type: 'COLLEGE' as const,
      location: 'Phoenix',
      state: 'AZ',
      region: 'Southwest',
      website: 'https://elitegaming.edu'
    }
  ]

  const createdSchools = []
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
        createdSchools.push(existingSchool)
      } else {
        const newSchool = await prisma.school.create({ data: school })
        console.log(`✅ Created school: ${school.name}`)
        createdSchools.push(newSchool)
      }
    } catch (error) {
      console.log(`⚠️  Could not create school ${school.name}:`, error)
    }
  }

  // Seed Mock Coaches
  console.log('👨‍🏫 Seeding coaches...')
  const coaches = [
    {
      clerk_id: 'coach_1_mock_id',
      email: 'coach.smith@universitygaming.edu',
      first_name: 'John',
      last_name: 'Smith',
      username: 'coachsmith',
      school: 'University of Gaming',
      school_id: createdSchools[0]?.id
    },
    {
      clerk_id: 'coach_2_mock_id',
      email: 'sarah.johnson@esportsinstitute.edu',
      first_name: 'Sarah',
      last_name: 'Johnson',
      username: 'sarahjohnson',
      school: 'Esports Institute',
      school_id: createdSchools[1]?.id
    },
    {
      clerk_id: 'coach_3_mock_id',
      email: 'mike.wilson@gamingacademy.edu',
      first_name: 'Mike',
      last_name: 'Wilson',
      username: 'mikewilson',
      school: 'Gaming Academy High School',
      school_id: createdSchools[2]?.id
    },
    {
      clerk_id: 'coach_4_mock_id',
      email: 'emily.davis@digitalsports.edu',
      first_name: 'Emily',
      last_name: 'Davis',
      username: 'emilydavis',
      school: 'Digital Sports University',
      school_id: createdSchools[3]?.id
    },
    {
      clerk_id: 'coach_5_mock_id',
      email: 'alex.chen@elitegaming.edu',
      first_name: 'Alex',
      last_name: 'Chen',
      username: 'alexchen',
      school: 'Elite Gaming College',
      school_id: createdSchools[4]?.id
    }
  ]

  const createdCoaches = []
  for (const coach of coaches) {
    try {
      const existingCoach = await prisma.coach.findUnique({
        where: { clerk_id: coach.clerk_id }
      })
      
      if (existingCoach) {
        console.log(`⏭️  Coach already exists: ${coach.first_name} ${coach.last_name}`)
        createdCoaches.push(existingCoach)
      } else {
        const newCoach = await prisma.coach.create({ data: coach })
        console.log(`✅ Created coach: ${coach.first_name} ${coach.last_name}`)
        createdCoaches.push(newCoach)
      }
    } catch (error) {
      console.log(`⚠️  Could not create coach ${coach.first_name} ${coach.last_name}:`, error)
    }
  }

  // Seed Tryouts
  console.log('🎯 Seeding tryouts...')
  const now = new Date()
  const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
  const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 2 weeks from now
  const futureDate3 = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000) // 3 weeks from now
  const futureDate4 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
  const futureDate5 = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000) // 4 weeks from now

  // Get the game and school IDs for tryouts
  const valorantGame = createdGames.find(g => g.short_name === 'VAL')
  const overwatchGame = createdGames.find(g => g.short_name === 'OW2')
  const smashGame = createdGames.find(g => g.short_name === 'SSBU')
  const rocketLeagueGame = createdGames.find(g => g.short_name === 'RL')

  // Only create tryouts if we have the required data
  if (!valorantGame || !overwatchGame || !smashGame || !rocketLeagueGame) {
    console.log('⚠️  Missing required games, skipping tryout creation')
    return
  }

  if (createdSchools.length < 5 || createdCoaches.length < 5) {
    console.log('⚠️  Missing required schools or coaches, skipping tryout creation')
    return
  }

  const tryouts = [
    {
      title: 'VALORANT Varsity Team Tryouts',
      description: 'Join our competitive VALORANT team! Looking for skilled players across all roles.',
      long_description: 'The University of Gaming is hosting tryouts for our VALORANT varsity team. We\'re looking for dedicated players with strong mechanical skills, game sense, and teamwork abilities. Players will be evaluated through aim tests, strategy discussions, and 5v5 scrimmages.',
      game_id: valorantGame.id,
      school_id: createdSchools[0]!.id,
      coach_id: createdCoaches[0]!.id,
      date: futureDate1,
      time_start: '14:00',
      time_end: '17:00',
      location: 'University Gaming Center - Room A101',
      type: 'IN_PERSON' as const,
      price: 'Free',
      max_spots: 24,
      registered_spots: 8,
      registration_deadline: new Date(futureDate1.getTime() - 2 * 24 * 60 * 60 * 1000),
      min_gpa: 3.0,
      class_years: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
      required_roles: ['Duelist', 'Controller', 'Initiator', 'Sentinel', 'IGL']
    },
    {
      title: 'Overwatch 2 Spring Team Selection',
      description: 'Open tryouts for our OW2 competitive team. All ranks welcome!',
      long_description: 'Esports Institute is building a new Overwatch 2 roster for the upcoming spring season. We welcome players of all skill levels who demonstrate dedication and coachability. Tryouts will include individual skill assessments and team-based scrimmages.',
      game_id: overwatchGame.id,
      school_id: createdSchools[1]!.id,
      coach_id: createdCoaches[1]!.id,
      date: futureDate2,
      time_start: '16:00',
      time_end: '19:00',
      location: 'Online - Discord Server',
      type: 'ONLINE' as const,
      price: 'Free',
      max_spots: 18,
      registered_spots: 12,
      registration_deadline: new Date(futureDate2.getTime() - 3 * 24 * 60 * 60 * 1000),
      min_gpa: 2.5,
      class_years: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
      required_roles: ['Tank', 'DPS', 'Support']
    },
    {
      title: 'Smash Ultimate Tournament Prep Tryouts',
      description: 'Elite training program for competitive Smash players.',
      long_description: 'Gaming Academy High School\'s elite Smash Ultimate training program is accepting new members. This intensive program focuses on tournament preparation, matchup knowledge, and mental game development.',
      game_id: smashGame.id,
      school_id: createdSchools[2]!.id,
      coach_id: createdCoaches[2]!.id,
      date: futureDate3,
      time_start: '15:30',
      time_end: '18:30',
      location: 'Gaming Academy - Esports Lab',
      type: 'IN_PERSON' as const,
      price: '$25',
      max_spots: 16,
      registered_spots: 6,
      registration_deadline: new Date(futureDate3.getTime() - 5 * 24 * 60 * 60 * 1000),
      min_gpa: 3.2,
      class_years: ['Sophomore', 'Junior', 'Senior'],
      required_roles: ['All characters welcome']
    },
    {
      title: 'Rocket League Division II Recruitment',
      description: 'Join our nationally ranked Rocket League program!',
      long_description: 'Digital Sports University\'s Division II Rocket League team is recruiting talented players for our championship-caliber program. We offer scholarships and professional coaching to help players reach their full potential.',
      game_id: rocketLeagueGame.id,
      school_id: createdSchools[3]!.id,
      coach_id: createdCoaches[3]!.id,
      date: futureDate4,
      time_start: '13:00',
      time_end: '16:00',
      location: 'Hybrid - Campus & Online',
      type: 'HYBRID' as const,
      price: 'Free',
      max_spots: 20,
      registered_spots: 15,
      registration_deadline: new Date(futureDate4.getTime() - 1 * 24 * 60 * 60 * 1000),
      min_gpa: 3.5,
      class_years: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
      required_roles: ['All positions', 'Looking for well-rounded players']
    },
    {
      title: 'VALORANT Women\'s Team Tryouts',
      description: 'Building the premier women\'s VALORANT team in collegiate esports.',
      long_description: 'Elite Gaming College is proud to announce tryouts for our women\'s VALORANT team. We\'re committed to fostering an inclusive and competitive environment for female gamers to excel at the highest levels of collegiate esports.',
      game_id: valorantGame.id,
      school_id: createdSchools[4]!.id,
      coach_id: createdCoaches[4]!.id,
      date: futureDate5,
      time_start: '17:00',
      time_end: '20:00',
      location: 'Elite Gaming Facility - Main Arena',
      type: 'IN_PERSON' as const,
      price: 'Free',
      max_spots: 15,
      registered_spots: 9,
      registration_deadline: new Date(futureDate5.getTime() - 4 * 24 * 60 * 60 * 1000),
      min_gpa: 3.0,
      class_years: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
      required_roles: ['All roles', 'Women-identifying players only']
    },
    {
      title: 'Overwatch 2 Academy Development Program',
      description: 'Development program for up-and-coming OW2 talent.',
      long_description: 'A structured development program designed for promising Overwatch 2 players who want to improve their skills and potentially join our main roster. Features individual coaching, VOD reviews, and scrimmage opportunities.',
      game_id: overwatchGame.id,
      school_id: createdSchools[0]!.id,
      coach_id: createdCoaches[0]!.id,
      date: new Date(futureDate2.getTime() + 7 * 24 * 60 * 60 * 1000),
      time_start: '18:00',
      time_end: '21:00',
      location: 'Online - Team Discord',
      type: 'ONLINE' as const,
      price: '$10',
      max_spots: 12,
      registered_spots: 4,
      registration_deadline: new Date(futureDate2.getTime() + 5 * 24 * 60 * 60 * 1000),
      min_gpa: 2.8,
      class_years: ['Freshman', 'Sophomore', 'Junior'],
      required_roles: ['Tank', 'DPS', 'Support', 'Flex']
    }
  ]

  for (const tryout of tryouts) {
    try {
      // Check if a similar tryout already exists
      const existingTryout = await prisma.tryout.findFirst({
        where: {
          title: tryout.title,
          game_id: tryout.game_id,
          school_id: tryout.school_id
        }
      })
      
      if (existingTryout) {
        console.log(`⏭️  Tryout already exists: ${tryout.title}`)
      } else {
        await prisma.tryout.create({ data: tryout })
        console.log(`✅ Created tryout: ${tryout.title}`)
      }
    } catch (error) {
      console.log(`⚠️  Could not create tryout ${tryout.title}:`, error)
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

  console.log('')
  console.log('👨‍🏫 Available coaches:')
  const allCoaches = await prisma.coach.findMany()
  allCoaches.forEach(coach => {
    console.log(`   • ${coach.first_name} ${coach.last_name} - ${coach.school}`)
  })

  console.log('')
  console.log('🎯 Available tryouts:')
  const allTryouts = await prisma.tryout.findMany({
    include: {
      game: true,
      school: true,
      organizer: true
    }
  })
  allTryouts.forEach(tryout => {
    console.log(`   • ${tryout.title} - ${tryout.game.name} at ${tryout.school.name}`)
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