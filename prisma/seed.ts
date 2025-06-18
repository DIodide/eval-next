/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

  // School data with new fields - reduced from 47 to 25 schools for better performance
  console.log('🏫 Seeding schools...')
  const schools = [
    // Universities (6 instead of 8)
    {
      name: 'University of Gaming',
      type: 'UNIVERSITY' as const,
      location: 'Los Angeles',
      state: 'CA',
      region: 'West',
      website: 'https://universitygaming.edu',
      logo_url: '/eval/logos/university-gaming-logo.png',
      bio: 'Premier university for esports education and competitive gaming programs.',
      email: 'info@universitygaming.edu',
      phone: '(555) 123-4567'
    },
    {
      name: 'Digital Sports University',
      type: 'UNIVERSITY' as const,
      location: 'Atlanta',
      state: 'GA',
      region: 'Southeast',
      website: 'https://digitalsports.edu',
      logo_url: '/eval/logos/digital-sports-logo.png',
      bio: 'Leading institution in digital athletics and esports technology.',
      email: 'admissions@digitalsports.edu',
      phone: '(555) 234-5678'
    },
    {
      name: 'Northwestern Gaming University',
      type: 'UNIVERSITY' as const,
      location: 'Seattle',
      state: 'WA',
      region: 'West',
      website: 'https://nwgaming.edu',
      logo_url: '/eval/logos/nw-gaming-logo.png',
      bio: 'Innovation in esports education with cutting-edge facilities.',
      email: 'contact@nwgaming.edu',
      phone: '(555) 345-6789'
    },
    {
      name: 'Eastern Esports University',
      type: 'UNIVERSITY' as const,
      location: 'Boston',
      state: 'MA',
      region: 'Northeast',
      website: 'https://easternesports.edu',
      logo_url: '/eval/logos/eastern-esports-logo.png',
      bio: 'Excellence in competitive gaming and esports management.',
      email: 'info@easternesports.edu',
      phone: '(555) 456-7890'
    },
    {
      name: 'Central Gaming State',
      type: 'UNIVERSITY' as const,
      location: 'Kansas City',
      state: 'MO',
      region: 'Midwest',
      website: 'https://centralgaming.edu',
      logo_url: '/eval/logos/central-gaming-logo.png',
      bio: 'State university with comprehensive esports programs.',
      email: 'info@centralgaming.edu',
      phone: '(555) 567-8901'
    },
    {
      name: 'Southern Gaming University',
      type: 'UNIVERSITY' as const,
      location: 'Austin',
      state: 'TX',
      region: 'South',
      website: 'https://southerngaming.edu',
      logo_url: '/eval/logos/southern-gaming-logo.png',
      bio: 'Home to championship esports teams and innovative programs.',
      email: 'contact@southerngaming.edu',
      phone: '(555) 678-9012'
    },
    
    // Colleges (5 instead of 8)
    {
      name: 'Esports Institute',
      type: 'COLLEGE' as const,
      location: 'Austin',
      state: 'TX',
      region: 'South',
      website: 'https://esportsinstitute.edu',
      logo_url: '/eval/logos/esports-institute-logo.png',
      bio: 'Specialized college focusing on professional esports training.',
      email: 'admissions@esportsinstitute.edu',
      phone: '(555) 789-0123'
    },
    {
      name: 'Elite Gaming College',
      type: 'COLLEGE' as const,
      location: 'Phoenix',
      state: 'AZ',
      region: 'Southwest',
      website: 'https://elitegaming.edu',
      logo_url: '/eval/logos/elite-gaming-logo.png',
      bio: 'Elite-level training for aspiring professional gamers.',
      email: 'info@elitegaming.edu',
      phone: '(555) 890-1234'
    },
    {
      name: 'Digital Athletics College',
      type: 'COLLEGE' as const,
      location: 'Chicago',
      state: 'IL',
      region: 'Midwest',
      website: 'https://digitalathletics.edu',
      logo_url: '/eval/logos/digital-athletics-logo.png',
      bio: 'Bridging traditional athletics with digital competition.',
      email: 'contact@digitalathletics.edu',
      phone: '(555) 901-2345'
    },
    {
      name: 'Cyber Sports College',
      type: 'COLLEGE' as const,
      location: 'New York',
      state: 'NY',
      region: 'Northeast',
      website: 'https://cybersports.edu',
      logo_url: '/eval/logos/cyber-sports-logo.png',
      bio: 'Premier cyber sports education in the heart of NYC.',
      email: 'info@cybersports.edu',
      phone: '(555) 012-3456'
    },
    {
      name: 'Strategic Gaming College',
      type: 'COLLEGE' as const,
      location: 'Portland',
      state: 'OR',
      region: 'West',
      website: 'https://strategicgaming.edu',
      logo_url: '/eval/logos/strategic-gaming-logo.png',
      bio: 'Focus on strategic thinking and competitive analysis.',
      email: 'admissions@strategicgaming.edu',
      phone: '(555) 123-4567'
    },
    
    // High Schools (6 instead of 8)
    {
      name: 'Gaming Academy High School',
      type: 'HIGH_SCHOOL' as const,
      location: 'Seattle',
      state: 'WA',
      region: 'West',
      website: 'https://gamingacademy.edu',
      logo_url: '/eval/logos/gaming-academy-logo.png',
      bio: 'High school pioneering esports education for young athletes.',
      email: 'info@gamingacademy.edu',
      phone: '(555) 234-5678'
    },
    {
      name: 'Esports Prep Academy',
      type: 'HIGH_SCHOOL' as const,
      location: 'Los Angeles',
      state: 'CA',
      region: 'West',
      website: 'https://esportsprep.edu',
      logo_url: '/eval/logos/esports-prep-logo.png',
      bio: 'Preparing students for collegiate esports scholarships.',
      email: 'admissions@esportsprep.edu',
      phone: '(555) 345-6789'
    },
    {
      name: 'Digital Champions High',
      type: 'HIGH_SCHOOL' as const,
      location: 'Houston',
      state: 'TX',
      region: 'South',
      website: 'https://digitalchampions.edu',
      logo_url: '/eval/logos/digital-champions-logo.png',
      bio: 'Creating the next generation of digital champions.',
      email: 'contact@digitalchampions.edu',
      phone: '(555) 456-7890'
    },
    {
      name: 'Elite Gaming Prep',
      type: 'HIGH_SCHOOL' as const,
      location: 'Atlanta',
      state: 'GA',
      region: 'Southeast',
      website: 'https://elitegamingprep.edu',
      logo_url: '/eval/logos/elite-prep-logo.png',
      bio: 'Elite preparation for competitive gaming careers.',
      email: 'info@elitegamingprep.edu',
      phone: '(555) 567-8901'
    },
    {
      name: 'Competitive Edge High School',
      type: 'HIGH_SCHOOL' as const,
      location: 'Chicago',
      state: 'IL',
      region: 'Midwest',
      website: 'https://competitiveedge.edu',
      logo_url: '/eval/logos/competitive-edge-logo.png',
      bio: 'Giving students the competitive edge in esports.',
      email: 'admissions@competitiveedge.edu',
      phone: '(555) 678-9012'
    },
    {
      name: 'NextGen Gaming High',
      type: 'HIGH_SCHOOL' as const,
      location: 'Orlando',
      state: 'FL',
      region: 'Southeast',
      website: 'https://nextgengaming.edu',
      logo_url: '/eval/logos/nextgen-gaming-logo.png',
      bio: 'Next generation gaming education and training.',
      email: 'info@nextgengaming.edu',
      phone: '(555) 789-0123'
    },
    
    // Garden State Esports League Schools (keep all GSE data as requested)
    {
      name: 'West Essex Regional High School',
      type: 'HIGH_SCHOOL' as const,
      location: 'North Caldwell',
      state: 'NJ',
      region: 'Northeast',
      website: 'https://wesex.org',
      logo_url: '/eval/logos/west-essex-logo.png',
      bio: 'Leading high school in New Jersey with strong esports program.',
      email: 'info@wesex.org',
      phone: '(973) 228-1200'
    },
    {
      name: 'Haddon Heights High School',
      type: 'HIGH_SCHOOL' as const,
      location: 'Haddon Heights',
      state: 'NJ',
      region: 'Northeast',
      website: 'https://haddonheights.k12.nj.us',
      logo_url: '/eval/logos/haddon-heights-logo.png',
      bio: 'Community-focused high school with growing esports presence.',
      email: 'info@haddonheights.k12.nj.us',
      phone: '(856) 547-7800'
    },
    {
      name: 'Bronx River High School',
      type: 'HIGH_SCHOOL' as const,
      location: 'Bronx',
      state: 'NY',
      region: 'Northeast',
      website: 'https://bronxriver.nyc.doe.gov',
      logo_url: '/eval/logos/bronx-river-logo.png',
      bio: 'Urban high school building champions in academics and esports.',
      email: 'info@bronxriver.nyc.doe.gov',
      phone: '(718) 904-4800'
    },
    {
      name: 'Mercer County Tech',
      type: 'HIGH_SCHOOL' as const,
      location: 'Trenton',
      state: 'NJ',
      region: 'Northeast',
      website: 'https://mcvts.net',
      logo_url: '/eval/logos/mercer-county-tech-logo.png',
      bio: 'Technical high school with innovative esports programs.',
      email: 'info@mcvts.net',
      phone: '(609) 586-2129'
    },
    {
      name: 'Cherokee High School',
      type: 'HIGH_SCHOOL' as const,
      location: 'Marlton',
      state: 'NJ',
      region: 'Northeast',
      website: 'https://cherokee.lenape.k12.nj.us',
      logo_url: '/eval/logos/cherokee-logo.png',
      bio: 'Large high school with comprehensive esports offerings.',
      email: 'info@cherokee.lenape.k12.nj.us',
      phone: '(856) 983-5140'
    },
    {
      name: 'East Side High School',
      type: 'HIGH_SCHOOL' as const,
      location: 'Newark',
      state: 'NJ',
      region: 'Northeast',
      website: 'https://eastside.newark.k12.nj.us',
      logo_url: '/eval/logos/east-side-logo.png',
      bio: 'Historic Newark high school with modern esports facilities.',
      email: 'info@eastside.newark.k12.nj.us',
      phone: '(973) 733-6900'
    },
    {
      name: 'Plainfield High School',
      type: 'HIGH_SCHOOL' as const,
      location: 'Plainfield',
      state: 'NJ',
      region: 'Northeast',
      website: 'https://plainfieldnjk12.org',
      logo_url: '/eval/logos/plainfield-logo.png',
      bio: 'Diverse high school community with competitive esports teams.',
      email: 'info@plainfieldnjk12.org',
      phone: '(908) 731-4333'
    },
    {
      name: 'Saint Peter\'s Prep',
      type: 'HIGH_SCHOOL' as const,
      location: 'Jersey City',
      state: 'NJ',
      region: 'Northeast',
      website: 'https://stpeters.org',
      logo_url: '/eval/logos/saint-peters-prep-logo.png',
      bio: 'Private preparatory school with elite esports program.',
      email: 'info@stpeters.org',
      phone: '(201) 547-6400'
    },
    {
      name: 'East Brunswick High School',
      type: 'HIGH_SCHOOL' as const,
      location: 'East Brunswick',
      state: 'NJ',
      region: 'Northeast',
      website: 'https://ebnet.org',
      logo_url: '/eval/logos/east-brunswick-logo.png',
      bio: 'Suburban excellence in academics and competitive gaming.',
      email: 'info@ebnet.org',
      phone: '(732) 613-6700'
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

  // Reduced Mock Coaches - optimized from 30+ to 20
  console.log('👨‍🏫 Seeding coaches...')
  const coaches = [
    // University coaches (6)
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
      email: 'emily.davis@digitalsports.edu',
      first_name: 'Emily',
      last_name: 'Davis',
      username: 'emilydavis',
      school: 'Digital Sports University',
      school_id: createdSchools[1]?.id
    },
    {
      clerk_id: 'coach_3_mock_id',
      email: 'michael.chen@nwgaming.edu',
      first_name: 'Michael',
      last_name: 'Chen',
      username: 'michaelchen',
      school: 'Northwestern Gaming University',
      school_id: createdSchools[2]?.id
    },
    {
      clerk_id: 'coach_4_mock_id',
      email: 'sarah.rodriguez@easternesports.edu',
      first_name: 'Sarah',
      last_name: 'Rodriguez',
      username: 'sarahrodriguez',
      school: 'Eastern Esports University',
      school_id: createdSchools[3]?.id
    },
    {
      clerk_id: 'coach_5_mock_id',
      email: 'david.johnson@centralgaming.edu',
      first_name: 'David',
      last_name: 'Johnson',
      username: 'davidjohnson',
      school: 'Central Gaming State',
      school_id: createdSchools[4]?.id
    },
    {
      clerk_id: 'coach_6_mock_id',
      email: 'alex.martinez@southerngaming.edu',
      first_name: 'Alex',
      last_name: 'Martinez',
      username: 'alexmartinez',
      school: 'Southern Gaming University',
      school_id: createdSchools[5]?.id
    },
    
    // College coaches (5)
    {
      clerk_id: 'coach_7_mock_id',
      email: 'sarah.johnson@esportsinstitute.edu',
      first_name: 'Sarah',
      last_name: 'Johnson',
      username: 'sarahjohnson',
      school: 'Esports Institute',
      school_id: createdSchools[6]?.id
    },
    {
      clerk_id: 'coach_8_mock_id',
      email: 'alex.chen@elitegaming.edu',
      first_name: 'Alex',
      last_name: 'Chen',
      username: 'alexchen',
      school: 'Elite Gaming College',
      school_id: createdSchools[7]?.id
    },
    {
      clerk_id: 'coach_9_mock_id',
      email: 'james.thompson@digitalathletics.edu',
      first_name: 'James',
      last_name: 'Thompson',
      username: 'jamesthompson',
      school: 'Digital Athletics College',
      school_id: createdSchools[8]?.id
    },
    {
      clerk_id: 'coach_10_mock_id',
      email: 'mark.brown@cybersports.edu',
      first_name: 'Mark',
      last_name: 'Brown',
      username: 'markbrown',
      school: 'Cyber Sports College',
      school_id: createdSchools[9]?.id
    },
    {
      clerk_id: 'coach_11_mock_id',
      email: 'carlos.rivera@strategicgaming.edu',
      first_name: 'Carlos',
      last_name: 'Rivera',
      username: 'carlosrivera',
      school: 'Strategic Gaming College',
      school_id: createdSchools[10]?.id
    },
    
    // High school coaches (9 - including GSE coaches)
    {
      clerk_id: 'coach_12_mock_id',
      email: 'mike.wilson@gamingacademy.edu',
      first_name: 'Mike',
      last_name: 'Wilson',
      username: 'mikewilson',
      school: 'Gaming Academy High School',
      school_id: createdSchools[11]?.id
    },
    {
      clerk_id: 'coach_13_mock_id',
      email: 'jennifer.taylor@esportsprep.edu',
      first_name: 'Jennifer',
      last_name: 'Taylor',
      username: 'jennifertaylor',
      school: 'Esports Prep Academy',
      school_id: createdSchools[12]?.id
    },
    {
      clerk_id: 'coach_14_mock_id',
      email: 'kevin.martinez@digitalchampions.edu',
      first_name: 'Kevin',
      last_name: 'Martinez',
      username: 'kevinmartinez',
      school: 'Digital Champions High',
      school_id: createdSchools[13]?.id
    },
    {
      clerk_id: 'coach_15_mock_id',
      email: 'amanda.davis@elitegamingprep.edu',
      first_name: 'Amanda',
      last_name: 'Davis',
      username: 'amandadavis',
      school: 'Elite Gaming Prep',
      school_id: createdSchools[14]?.id
    },
    {
      clerk_id: 'coach_16_mock_id',
      email: 'ryan.garcia@competitiveedge.edu',
      first_name: 'Ryan',
      last_name: 'Garcia',
      username: 'ryangarcia',
      school: 'Competitive Edge High School',
      school_id: createdSchools[15]?.id
    },
    {
      clerk_id: 'coach_17_mock_id',
      email: 'laura.kim@nextgengaming.edu',
      first_name: 'Laura',
      last_name: 'Kim',
      username: 'laurakim',
      school: 'NextGen Gaming High',
      school_id: createdSchools[16]?.id
    },
    
    // GSE coaches (keep all)
    {
      clerk_id: 'coach_18_mock_id',
      email: 'coach.wesex@gmail.com',
      first_name: 'Daniel',
      last_name: 'Martinez',
      username: 'danielmartinez',
      school: 'West Essex Regional High School',
      school_id: createdSchools.find(s => s.name === 'West Essex Regional High School')?.id
    },
    {
      clerk_id: 'coach_19_mock_id',
      email: 'coach.haddon@gmail.com',
      first_name: 'Jessica',
      last_name: 'Chen',
      username: 'jessicachen',
      school: 'Haddon Heights High School',
      school_id: createdSchools.find(s => s.name === 'Haddon Heights High School')?.id
    },
    {
      clerk_id: 'coach_20_mock_id',
      email: 'coach.bronx@gmail.com',
      first_name: 'Marcus',
      last_name: 'Thompson',
      username: 'marcusthompson',
      school: 'Bronx River High School',
      school_id: createdSchools.find(s => s.name === 'Bronx River High School')?.id
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

  // Expanded Tryouts
  console.log('🎯 Seeding tryouts...')
  const now = new Date()
  
  // Generate dates for the next 12 weeks
  const futureDates = []
  for (let i = 1; i <= 84; i++) { // 12 weeks = 84 days
    futureDates.push(new Date(now.getTime() + i * 24 * 60 * 60 * 1000))
  }

  // Get the game IDs
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
    console.log(`   Available schools: ${createdSchools.length}`)
    console.log(`   Available coaches: ${createdCoaches.length}`)
    return
  }

  console.log(`✅ Proceeding with tryout creation: ${createdSchools.length} schools, ${createdCoaches.length} coaches`)

  // Helper function to get random elements
  const getRandomElement = <T>(array: T[]): T => {
    if (array.length === 0) {
      throw new Error('Cannot get random element from empty array')
    }
    return array[Math.floor(Math.random() * array.length)]!
  }
  const getRandomElements = <T>(array: T[], count: number): T[] => {
    const shuffled = [...array].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  // Tryout types and locations
  const tryoutTypes = ['IN_PERSON', 'ONLINE', 'HYBRID'] as const
  const timeSlots = [
    { start: '09:00', end: '12:00' },
    { start: '10:00', end: '13:00' },
    { start: '13:00', end: '16:00' },
    { start: '14:00', end: '17:00' },
    { start: '15:00', end: '18:00' },
    { start: '16:00', end: '19:00' },
    { start: '17:00', end: '20:00' },
    { start: '18:00', end: '21:00' },
    { start: '19:00', end: '22:00' }
  ]

  const classYearOptions = [
    ['Freshman', 'Sophomore'],
    ['Sophomore', 'Junior'],
    ['Junior', 'Senior'],
    ['Freshman', 'Sophomore', 'Junior'],
    ['Sophomore', 'Junior', 'Senior'],
    ['Freshman', 'Sophomore', 'Junior', 'Senior']
  ]

  const prices = ['Free', '$5', '$10', '$15', '$20', '$25', '$30', '$50', '$75']
  const gpaRequirements = [2.5, 2.7, 2.8, 3.0, 3.2, 3.3, 3.5]

  // Generate optimized tryouts - reduced from 93 total to 50 total
  const tryouts = []

  // VALORANT tryouts
  const valorantTitles = [
    'VALORANT Varsity Team Tryouts',
    'VALORANT Competitive Squad Selection',
    'VALORANT Academy Team Recruitment',
    'VALORANT Women\'s Team Tryouts',
    'VALORANT IGL Development Program',
    'VALORANT Tactical Minds Workshop',
    'VALORANT Agent Mastery Clinic',
    'VALORANT Summer Bootcamp',
    'VALORANT Late Night Practice Sessions',
    'VALORANT Ranked Climb Workshop',
    'VALORANT Team Strategy Course',
    'VALORANT Aim Training Intensive'
  ]

  const valorantRoles = [
    ['Duelist', 'Controller', 'Initiator', 'Sentinel', 'IGL'],
    ['All roles welcome'],
    ['Duelist', 'Controller'],
    ['Initiator', 'Sentinel'],
    ['IGL', 'Support players'],
    ['Entry fraggers', 'Support roles'],
    ['Flex players welcome']
  ]

  for (let i = 0; i < 15; i++) {
    const school = getRandomElement(createdSchools)
    const coach = createdCoaches.find(c => c.school_id === school.id) ?? getRandomElement(createdCoaches)
    const timeSlot = getRandomElement(timeSlots)
    const date = getRandomElement(futureDates)
    
    tryouts.push({
      title: getRandomElement(valorantTitles),
      description: `Join our competitive VALORANT team! Looking for skilled players across all roles.`,
      long_description: `${school.name} is hosting tryouts for our VALORANT team. We're looking for dedicated players with strong mechanical skills, game sense, and teamwork abilities.`,
      game_id: valorantGame.id,
      school_id: school.id,
      coach_id: coach.id,
      date: date,
      time_start: timeSlot.start,
      time_end: timeSlot.end,
      location: getRandomElement([...tryoutTypes]) === 'ONLINE' ? 'Online - Discord Server' : `${school.name} Gaming Center`,
      type: getRandomElement([...tryoutTypes]),
      status: 'PUBLISHED' as const,
      price: getRandomElement(prices),
      max_spots: Math.floor(Math.random() * 20) + 8, // 8-27 spots
      registered_spots: Math.floor(Math.random() * 15),
      registration_deadline: new Date(date.getTime() - Math.floor(Math.random() * 7 + 1) * 24 * 60 * 60 * 1000),
      min_gpa: getRandomElement(gpaRequirements),
      class_years: getRandomElement(classYearOptions),
      required_roles: getRandomElement(valorantRoles)
    })
  }

  // Overwatch 2 tryouts
  const overwatchTitles = [
    'Overwatch 2 Spring Team Selection',
    'Overwatch 2 Tank Specialist Program',
    'Overwatch 2 Support Synergy Workshop',
    'Overwatch 2 DPS Academy',
    'Overwatch 2 Team Coordination Course',
    'Overwatch 2 VOD Review Workshop',
    'Overwatch 2 Competitive Ladder Climb',
    'Overwatch 2 Role Mastery Program',
    'Overwatch 2 Strategy Development',
    'Overwatch 2 Meta Analysis Course'
  ]

  const overwatchRoles = [
    ['Tank', 'DPS', 'Support'],
    ['Tank mains only'],
    ['Support specialists'],
    ['DPS players'],
    ['Flex players'],
    ['All roles welcome'],
    ['Main tank', 'Off tank'],
    ['Main support', 'Flex support']
  ]

  for (let i = 0; i < 12; i++) {
    const school = getRandomElement(createdSchools)
    const coach = createdCoaches.find(c => c.school_id === school.id) ?? getRandomElement(createdCoaches)
    const timeSlot = getRandomElement(timeSlots)
    const date = getRandomElement(futureDates)
    
    tryouts.push({
      title: getRandomElement(overwatchTitles),
      description: `Open tryouts for our OW2 competitive team. All ranks welcome!`,
      long_description: `${school.name} is building a new Overwatch 2 roster. We welcome players of all skill levels who demonstrate dedication and coachability.`,
      game_id: overwatchGame.id,
      school_id: school.id,
      coach_id: coach.id,
      date: date,
      time_start: timeSlot.start,
      time_end: timeSlot.end,
      location: getRandomElement([...tryoutTypes]) === 'ONLINE' ? 'Online - Custom Servers' : `${school.name} Esports Lab`,
      type: getRandomElement([...tryoutTypes]),
      status: 'PUBLISHED' as const,
      price: getRandomElement(prices),
      max_spots: Math.floor(Math.random() * 18) + 6, // 6-23 spots
      registered_spots: Math.floor(Math.random() * 12),
      registration_deadline: new Date(date.getTime() - Math.floor(Math.random() * 7 + 1) * 24 * 60 * 60 * 1000),
      min_gpa: getRandomElement(gpaRequirements),
      class_years: getRandomElement(classYearOptions),
      required_roles: getRandomElement(overwatchRoles)
    })
  }

  // Rocket League tryouts
  const rocketLeagueTitles = [
    'Rocket League Division II Recruitment',
    'Rocket League Rotation Mastery',
    'Rocket League Freestyle Championship',
    'Rocket League 1v1 Specialist Program',
    'Rocket League Team Chemistry Workshop',
    'Rocket League Aerial Training',
    'Rocket League Strategy Course',
    'Rocket League Mechanical Skills Boot Camp',
    'Rocket League Competitive Analysis',
    'Rocket League Tournament Prep'
  ]

  const rocketLeagueRoles = [
    ['All positions'],
    ['Striker', 'Midfielder', 'Goalkeeper'],
    ['Freestyle specialists'],
    ['Mechanical players'],
    ['Team players'],
    ['Solo queue specialists'],
    ['Tournament experienced']
  ]

  for (let i = 0; i < 12; i++) {
    const school = getRandomElement(createdSchools)
    const coach = createdCoaches.find(c => c.school_id === school.id) ?? getRandomElement(createdCoaches)
    const timeSlot = getRandomElement(timeSlots)
    const date = getRandomElement(futureDates)
    
    tryouts.push({
      title: getRandomElement(rocketLeagueTitles),
      description: `Join our nationally ranked Rocket League program!`,
      long_description: `${school.name}'s Rocket League team is recruiting talented players for our championship-caliber program.`,
      game_id: rocketLeagueGame.id,
      school_id: school.id,
      coach_id: coach.id,
      date: date,
      time_start: timeSlot.start,
      time_end: timeSlot.end,
      location: getRandomElement([...tryoutTypes]) === 'ONLINE' ? 'Online - Private Servers' : `${school.name} Gaming Arena`,
      type: getRandomElement([...tryoutTypes]),
      status: 'PUBLISHED' as const,
      price: getRandomElement(prices),
      max_spots: Math.floor(Math.random() * 16) + 8, // 8-23 spots
      registered_spots: Math.floor(Math.random() * 10),
      registration_deadline: new Date(date.getTime() - Math.floor(Math.random() * 7 + 1) * 24 * 60 * 60 * 1000),
      min_gpa: getRandomElement(gpaRequirements),
      class_years: getRandomElement(classYearOptions),
      required_roles: getRandomElement(rocketLeagueRoles)
    })
  }

  // Smash Ultimate tryouts
  const smashTitles = [
    'Smash Ultimate Tournament Prep Tryouts',
    'Smash Ultimate Character Specialist Program',
    'Smash Ultimate Regional Qualifier',
    'Smash Ultimate Newcomer Bootcamp',
    'Smash Ultimate Tech Skill Workshop',
    'Smash Ultimate Mental Game Training',
    'Smash Ultimate Matchup Analysis',
    'Smash Ultimate Combo Lab',
    'Smash Ultimate Neutral Game Course',
    'Smash Ultimate Advanced Techniques'
  ]

  const smashRoles = [
    ['All characters welcome'],
    ['Character specialists'],
    ['High-level players only'],
    ['Beginners welcome'],
    ['Tournament experienced'],
    ['Tech skill focused'],
    ['Neutral game specialists']
  ]

  for (let i = 0; i < 11; i++) {
    const school = getRandomElement(createdSchools)
    const coach = createdCoaches.find(c => c.school_id === school.id) ?? getRandomElement(createdCoaches)
    const timeSlot = getRandomElement(timeSlots)
    const date = getRandomElement(futureDates)
    
    tryouts.push({
      title: getRandomElement(smashTitles),
      description: `Elite training program for competitive Smash players.`,
      long_description: `${school.name}'s elite Smash Ultimate training program is accepting new members. This intensive program focuses on tournament preparation and skill development.`,
      game_id: smashGame.id,
      school_id: school.id,
      coach_id: coach.id,
      date: date,
      time_start: timeSlot.start,
      time_end: timeSlot.end,
      location: getRandomElement([...tryoutTypes]) === 'ONLINE' ? 'Online - Parsec/Slippi' : `${school.name} Tournament Room`,
      type: getRandomElement([...tryoutTypes]),
      status: 'PUBLISHED' as const,
      price: getRandomElement(prices),
      max_spots: Math.floor(Math.random() * 14) + 6, // 6-19 spots
      registered_spots: Math.floor(Math.random() * 8),
      registration_deadline: new Date(date.getTime() - Math.floor(Math.random() * 7 + 1) * 24 * 60 * 60 * 1000),
      min_gpa: getRandomElement(gpaRequirements),
      class_years: getRandomElement(classYearOptions),
      required_roles: getRandomElement(smashRoles)
    })
  }

  // Create all tryouts
  const createdTryouts = []
  for (const tryout of tryouts) {
    try {
      const existingTryout = await prisma.tryout.findFirst({
        where: {
          title: tryout.title,
          game_id: tryout.game_id,
          school_id: tryout.school_id,
          date: tryout.date
        }
      })
      
      if (existingTryout) {
        console.log(`⏭️  Tryout already exists: ${tryout.title}`)
        createdTryouts.push(existingTryout)
      } else {
        const newTryout = await prisma.tryout.create({ data: tryout })
        console.log(`✅ Created tryout: ${tryout.title}`)
        createdTryouts.push(newTryout)
      }
    } catch (error) {
      console.log(`⚠️  Could not create tryout ${tryout.title}:`, error)
    }
  }

  console.log('🎉 Database seed completed successfully!')

  // Expanded Combines
  console.log('🏆 Seeding combines...')
  
  // Generate combines for the next 16 weeks (longer timeline than tryouts)
  const combineFutureDates = []
  for (let i = 7; i <= 112; i += 7) { // Start 1 week out, every week for 16 weeks
    combineFutureDates.push(new Date(now.getTime() + i * 24 * 60 * 60 * 1000))
  }

  // Combine statuses (mostly registration open since they're public events)
  const combineStatuses = ['UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED']
  const currentYear = new Date().getFullYear().toString()

  // Prize pools for combines
  const prizePools = [
    'Scholarship Opportunities',
    '$5,000 Total Prize Pool',
    '$10,000 Total Prize Pool',
    '$2,500 Winner Takes All',
    'University Recruitment',
    'Professional Team Tryouts',
    'Gaming Equipment Prizes',
    '$1,000 + Gaming Gear',
    'Tournament Qualifiers',
    'Pro Player Mentorship'
  ]

  // Requirements for combines
  const requirements = [
    'All skill levels welcome',
    'Intermediate to advanced players',
    'Must be enrolled in college',
    'High school seniors and college students',
    'Minimum rank: Gold',
    'Previous tournament experience preferred',
    'Team captains and IGLs encouraged',
    'Open to all competitive players',
    'Must have stable internet connection',
    'Streaming setup preferred but not required'
  ]

  // Format options
  const formats = [
    'Swiss System',
    'Single Elimination',
    'Double Elimination',
    'Round Robin',
    'Bo3 Group Stage + Bo5 Finals',
    'Skills Assessment + Scrimmages',
    'Individual Performance + Team Play',
    '1v1 + Team Competition'
  ]

  const combines = []

  // VALORANT Combines
  const valorantCombineTitles = [
    'VALORANT Spring Regional Combine',
    'VALORANT Tactical Excellence Showcase',
    'VALORANT IGL Development Combine',
    'VALORANT Women\'s Competitive Combine',
    'VALORANT Collegiate Championship Qualifier',
    'VALORANT Aim Labs Performance Combine',
    'VALORANT Strategy & Teamwork Assessment',
    'VALORANT Pro Path Combine',
    'VALORANT Agent Mastery Showcase',
    'VALORANT Rookie Development Combine'
  ]

  for (let i = 0; i < 12; i++) {
    const school = getRandomElement(createdSchools)
    const coach = createdCoaches.find(c => c.school_id === school.id) ?? getRandomElement(createdCoaches)
    const date = getRandomElement(combineFutureDates)
    const isOnline = getRandomElement([true, false, false]) // 33% online, 67% in-person/hybrid
    
    combines.push({
      title: getRandomElement(valorantCombineTitles),
      description: 'Elite VALORANT combine showcasing the region\'s top competitive talent.',
      long_description: `Join us for an intensive VALORANT combine featuring top collegiate and aspiring professional players. This event includes skill assessments, team strategy sessions, and competitive matches designed to identify and develop the next generation of esports talent.`,
      game_id: valorantGame.id,
      coach_id: coach.id,
      date: date,
      time_start: '09:00',
      time_end: '17:00',
      location: isOnline ? 'Online - Custom Servers & Discord' : `${school.name} Esports Arena`,
      type: isOnline ? 'ONLINE' : getRandomElement(['IN_PERSON', 'HYBRID']),
      year: currentYear,
      max_spots: Math.floor(Math.random() * 48) + 16, // 16-63 spots
      claimed_spots: Math.floor(Math.random() * 20),
      prize_pool: getRandomElement(prizePools),
      format: getRandomElement(formats),
      status: getRandomElement(combineStatuses) as 'UPCOMING' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED',
      requirements: getRandomElement(requirements),
      invite_only: Math.random() < 0.2 // 20% invite only
    })
  }

  // Overwatch 2 Combines  
  const overwatchCombineTitles = [
    'Overwatch 2 Tank Mastery Combine',
    'Overwatch 2 Support Synergy Showcase',
    'Overwatch 2 DPS Excellence Combine',
    'Overwatch 2 Team Coordination Assessment',
    'Overwatch 2 Meta Strategy Combine',
    'Overwatch 2 Role Flexibility Showcase',
    'Overwatch 2 Leadership Development Combine',
    'Overwatch 2 Communication Skills Assessment'
  ]

  for (let i = 0; i < 6; i++) {
    const school = getRandomElement(createdSchools)
    const coach = createdCoaches.find(c => c.school_id === school.id) ?? getRandomElement(createdCoaches)
    const date = getRandomElement(combineFutureDates)
    const isOnline = getRandomElement([true, false])
    
    combines.push({
      title: getRandomElement(overwatchCombineTitles),
      description: 'Premier Overwatch 2 combine focusing on role mastery and team coordination.',
      long_description: `Experience the ultimate Overwatch 2 combine where players demonstrate their skills across all roles. Features include VOD reviews, strategy sessions, and competitive scrimmages with professional coaches.`,
      game_id: overwatchGame.id,
      coach_id: coach.id,
      date: date,
      time_start: '10:00',
      time_end: '16:00',
      location: isOnline ? 'Online - Private Lobbies' : `${school.name} Gaming Center`,
      type: isOnline ? 'ONLINE' : getRandomElement(['IN_PERSON', 'HYBRID']),
      year: currentYear,
      max_spots: Math.floor(Math.random() * 36) + 12, // 12-47 spots
      claimed_spots: Math.floor(Math.random() * 15),
      prize_pool: getRandomElement(prizePools),
      format: getRandomElement(formats),
      status: getRandomElement(combineStatuses) as 'UPCOMING' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED',
      requirements: getRandomElement(requirements),
      invite_only: Math.random() < 0.15 // 15% invite only
    })
  }

  // Rocket League Combines
  const rocketLeagueCombineTitles = [
    'Rocket League Mechanical Mastery Combine',
    'Rocket League Rotation Excellence Showcase',
    'Rocket League 1v1 Specialist Combine',
    'Rocket League Team Chemistry Assessment',
    'Rocket League Freestyle Skills Combine',
    'Rocket League Strategy & Positioning Showcase',
    'Rocket League Speed & Precision Combine'
  ]

  for (let i = 0; i < 5; i++) {
    const school = getRandomElement(createdSchools)
    const coach = createdCoaches.find(c => c.school_id === school.id) ?? getRandomElement(createdCoaches)
    const date = getRandomElement(combineFutureDates)
    const isOnline = getRandomElement([true, true, false]) // 67% online
    
    combines.push({
      title: getRandomElement(rocketLeagueCombineTitles),
      description: 'High-octane Rocket League combine testing mechanical skill and game sense.',
      long_description: `Showcase your Rocket League prowess in this comprehensive combine featuring mechanical challenges, tactical gameplay, and team-based competitions. Perfect for players looking to take their game to the next level.`,
      game_id: rocketLeagueGame.id,
      coach_id: coach.id,
      date: date,
      time_start: '13:00',
      time_end: '18:00',
      location: isOnline ? 'Online - Private Matches' : `${school.name} Tournament Hall`,
      type: isOnline ? 'ONLINE' : getRandomElement(['IN_PERSON', 'HYBRID']),
      year: currentYear,
      max_spots: Math.floor(Math.random() * 32) + 8, // 8-39 spots
      claimed_spots: Math.floor(Math.random() * 12),
      prize_pool: getRandomElement(prizePools),
      format: getRandomElement(formats),
      status: getRandomElement(combineStatuses) as 'UPCOMING' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED',
      requirements: getRandomElement(requirements),
      invite_only: Math.random() < 0.1 // 10% invite only
    })
  }

  // Smash Ultimate Combines
  const smashCombineTitles = [
    'Smash Ultimate Tech Skill Combine',
    'Smash Ultimate Neutral Game Showcase',
    'Smash Ultimate Character Specialist Combine',
    'Smash Ultimate Mental Game Assessment',
    'Smash Ultimate Tournament Prep Combine',
    'Smash Ultimate Advanced Techniques Showcase'
  ]

  for (let i = 0; i < 4; i++) {
    const school = getRandomElement(createdSchools)
    const coach = createdCoaches.find(c => c.school_id === school.id) ?? getRandomElement(createdCoaches)
    const date = getRandomElement(combineFutureDates)
    
    combines.push({
      title: getRandomElement(smashCombineTitles),
      description: 'Elite Smash Ultimate combine for competitive fighting game players.',
      long_description: `Join the most comprehensive Smash Ultimate combine featuring bracket play, character matchup analysis, and technical skill assessments. Designed for serious competitive players ready to prove their tournament readiness.`,
      game_id: smashGame.id,
      coach_id: coach.id,
      date: date,
      time_start: '11:00',
      time_end: '19:00',
      location: `${school.name} FGC Tournament Space`,
      type: getRandomElement(['IN_PERSON', 'HYBRID']),
      year: currentYear,
      max_spots: Math.floor(Math.random() * 24) + 8, // 8-31 spots
      claimed_spots: Math.floor(Math.random() * 10),
      prize_pool: getRandomElement(prizePools),
      format: getRandomElement(formats),
      status: getRandomElement(combineStatuses) as 'UPCOMING' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED',
      requirements: getRandomElement(requirements),
      invite_only: Math.random() < 0.25 // 25% invite only (more exclusive for FGC)
    })
  }

  // Create all combines
  const createdCombines = []
  for (const combine of combines) {
    try {
      const existingCombine = await prisma.combine.findFirst({
        where: {
          title: combine.title,
          game_id: combine.game_id,
          date: combine.date
        }
      })
      
      if (existingCombine) {
        console.log(`⏭️  Combine already exists: ${combine.title}`)
        createdCombines.push(existingCombine)
      } else {
        // @ts-expect-error - Type compatibility issue with EventType enum, but data is valid
        const newCombine = await prisma.combine.create({ data: combine })
        console.log(`✅ Created combine: ${combine.title}`)
        createdCombines.push(newCombine)
      }
    } catch (error) {
      console.log(`⚠️  Could not create combine ${combine.title}:`, error)
    }
  }

  console.log('🎉 Database seed completed successfully!')

  // Expanded Players
  console.log('👤 Seeding players...')
  
  // Define arrays for random data generation
  const firstNames = [
    // Male names
    'Alex', 'Brandon', 'Chris', 'Daniel', 'Ethan', 'Felix', 'Gabriel', 'Hunter', 'Isaac', 'Jake',
    'Kevin', 'Liam', 'Mason', 'Nathan', 'Owen', 'Parker', 'Quinn', 'Ryan', 'Samuel', 'Tyler',
    'Victor', 'William', 'Xavier', 'Zachary', 'Adam', 'Blake', 'Cole', 'Dylan', 'Evan', 'Finn',
    // Female names
    'Ava', 'Bella', 'Chloe', 'Diana', 'Emma', 'Faith', 'Grace', 'Hannah', 'Iris', 'Jade',
    'Kylie', 'Luna', 'Maya', 'Nora', 'Olivia', 'Paige', 'Quinn', 'Riley', 'Sophia', 'Taylor',
    'Uma', 'Victoria', 'Willow', 'Xara', 'Yasmin', 'Zoe', 'Aria', 'Brooke', 'Cora', 'Demi'
  ]

  const lastNames = [
    'Anderson', 'Brown', 'Chen', 'Davis', 'Evans', 'Foster', 'Garcia', 'Harris', 'Jackson', 'Kim',
    'Lopez', 'Miller', 'Nguyen', 'O\'Connor', 'Patel', 'Rodriguez', 'Smith', 'Taylor', 'Wilson', 'Young',
    'Martinez', 'Johnson', 'Williams', 'Jones', 'Lee', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen',
    'Wright', 'King', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Carter', 'Mitchell', 'Perez',
    'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Thomas', 'White', 'Thompson', 'Moore', 'Martin'
  ]

  const locations = [
    'Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA',
    'San Antonio, TX', 'San Diego, CA', 'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL',
    'Fort Worth, TX', 'Columbus, OH', 'Charlotte, NC', 'San Francisco, CA', 'Indianapolis, IN', 'Seattle, WA',
    'Denver, CO', 'Boston, MA', 'Nashville, TN', 'Baltimore, MD', 'Las Vegas, NV', 'Portland, OR',
    'Oklahoma City, OK', 'Memphis, TN', 'Louisville, KY', 'Milwaukee, WI', 'Albuquerque, NM', 'Tucson, AZ',
    'Fresno, CA', 'Sacramento, CA', 'Mesa, AZ', 'Kansas City, MO', 'Atlanta, GA', 'Long Beach, CA',
    'Colorado Springs, CO', 'Raleigh, NC', 'Miami, FL', 'Virginia Beach, VA', 'Omaha, NE', 'Oakland, CA',
    'Minneapolis, MN', 'Tulsa, OK', 'Arlington, TX', 'New Orleans, LA', 'Wichita, KS', 'Cleveland, OH'
  ]

  const majors = [
    'Computer Science', 'Business Administration', 'Psychology', 'Engineering', 'Communications',
    'Marketing', 'Biology', 'English', 'Political Science', 'Economics', 'Mathematics', 'Art',
    'History', 'Criminal Justice', 'Nursing', 'Education', 'Sociology', 'Chemistry', 'Finance',
    'Information Technology', 'Graphic Design', 'Music', 'Philosophy', 'Physics', 'Journalism',
    'International Business', 'Pre-Med', 'Pre-Law', 'Game Design', 'Digital Media', 'Sports Management'
  ]

  const bios = [
    'Passionate gamer with a competitive spirit and strong teamwork skills.',
    'Dedicated to improving my gameplay and contributing to team success.',
    'Strategic player who loves analyzing game mechanics and optimizing performance.',
    'Team player with excellent communication and leadership abilities.',
    'Aspiring professional gamer looking to take skills to the next level.',
    'Creative player who enjoys finding innovative strategies and solutions.',
    'Hardworking student-athlete balancing academics and competitive gaming.',
    'Experienced tournament player with a drive for excellence.',
    'Collaborative team member who thrives in high-pressure situations.',
    'Goal-oriented player focused on continuous improvement and mastery.'
  ]

  // Game-specific data
  const valorantAgentsPool = [
    'Jett', 'Phoenix', 'Reyna', 'Raze', 'Yoru', 'Neon', // Duelists
    'Sova', 'Breach', 'Skye', 'KAY/O', 'Fade', 'Gekko', // Initiators
    'Brimstone', 'Omen', 'Viper', 'Astra', 'Harbor', 'Clove', // Controllers
    'Sage', 'Cypher', 'Killjoy', 'Chamber', 'Deadlock', 'Vyse' // Sentinels
  ]

  const valorantRolesPool = ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'IGL', 'Flex']
  const valorantRanksPool = ['Iron 1', 'Iron 2', 'Iron 3', 'Bronze 1', 'Bronze 2', 'Bronze 3', 'Silver 1', 'Silver 2', 'Silver 3', 'Gold 1', 'Gold 2', 'Gold 3', 'Platinum 1', 'Platinum 2', 'Platinum 3', 'Diamond 1', 'Diamond 2', 'Diamond 3', 'Ascendant 1', 'Ascendant 2', 'Ascendant 3', 'Immortal 1', 'Immortal 2', 'Immortal 3', 'Radiant']

  const overwatchHeroesPool = [
    'D.Va', 'Doomfist', 'Junker Queen', 'Orisa', 'Ramattra', 'Reinhardt', 'Roadhog', 'Sigma', 'Winston', 'Wrecking Ball', 'Zarya', 'Mauga', // Tanks
    'Ashe', 'Bastion', 'Cassidy', 'Genji', 'Hanzo', 'Junkrat', 'Mei', 'Pharah', 'Reaper', 'Soldier: 76', 'Symmetra', 'Torbjörn', 'Tracer', 'Widowmaker', 'Venture', // DPS
    'Ana', 'Baptiste', 'Brigitte', 'Kiriko', 'Lifeweaver', 'Lúcio', 'Mercy', 'Moira', 'Zenyatta', 'Illari' // Support
  ]

  const overwatchRolesPool = ['Tank', 'DPS', 'Support', 'Flex']
  const overwatchRanksPool = ['Bronze 5', 'Bronze 4', 'Bronze 3', 'Bronze 2', 'Bronze 1', 'Silver 5', 'Silver 4', 'Silver 3', 'Silver 2', 'Silver 1', 'Gold 5', 'Gold 4', 'Gold 3', 'Gold 2', 'Gold 1', 'Platinum 5', 'Platinum 4', 'Platinum 3', 'Platinum 2', 'Platinum 1', 'Diamond 5', 'Diamond 4', 'Diamond 3', 'Diamond 2', 'Diamond 1', 'Master 5', 'Master 4', 'Master 3', 'Master 2', 'Master 1', 'Grandmaster 5', 'Grandmaster 4', 'Grandmaster 3', 'Grandmaster 2', 'Grandmaster 1', 'Champion', 'Top 500']

  const rocketLeaguePositionsPool = ['Striker', 'Midfielder', 'Goalkeeper', 'All positions']
  const rocketLeagueRanksPool = ['Bronze I', 'Bronze II', 'Bronze III', 'Silver I', 'Silver II', 'Silver III', 'Gold I', 'Gold II', 'Gold III', 'Platinum I', 'Platinum II', 'Platinum III', 'Diamond I', 'Diamond II', 'Diamond III', 'Champion I', 'Champion II', 'Champion III', 'Grand Champion I', 'Grand Champion II', 'Grand Champion III', 'Supersonic Legend']

  const smashCharactersPool = [
    'Mario', 'Donkey Kong', 'Link', 'Samus', 'Dark Samus', 'Yoshi', 'Kirby', 'Fox', 'Pikachu', 'Luigi',
    'Ness', 'Captain Falcon', 'Jigglypuff', 'Peach', 'Daisy', 'Bowser', 'Ice Climbers', 'Sheik', 'Zelda', 'Dr. Mario',
    'Pichu', 'Falco', 'Marth', 'Lucina', 'Young Link', 'Ganondorf', 'Mewtwo', 'Roy', 'Chrom', 'Mr. Game & Watch',
    'Meta Knight', 'Pit', 'Dark Pit', 'Zero Suit Samus', 'Wario', 'Snake', 'Ike', 'Pokémon Trainer', 'Diddy Kong', 'Lucas',
    'Sonic', 'King Dedede', 'Olimar', 'Lucario', 'R.O.B.', 'Toon Link', 'Wolf', 'Villager', 'Mega Man', 'Wii Fit Trainer',
    'Rosalina & Luma', 'Little Mac', 'Greninja', 'Mii Brawler', 'Mii Swordfighter', 'Mii Gunner', 'Palutena', 'Pac-Man', 'Robin', 'Shulk',
    'Bowser Jr.', 'Duck Hunt', 'Ryu', 'Ken', 'Cloud', 'Corrin', 'Bayonetta', 'Inkling', 'Ridley', 'Simon',
    'Richter', 'King K. Rool', 'Isabelle', 'Incineroar', 'Piranha Plant', 'Joker', 'Hero', 'Banjo & Kazooie', 'Terry', 'Byleth',
    'Min Min', 'Steve', 'Sephiroth', 'Pyra', 'Mythra', 'Kazuya', 'Sora'
  ]

  const playStylesPool = ['Aggressive', 'Passive', 'Tactical', 'Support-focused', 'Mechanical', 'Strategic', 'Adaptive', 'Team-oriented']

  const platformsPool = ['Steam', 'Epic Games', 'Battle.net', 'Xbox Live', 'PlayStation Network', 'Nintendo Online']
  const socialPlatformsPool = ['Discord', 'Twitch', 'YouTube', 'Twitter', 'Instagram', 'TikTok']

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
    } else {
      gseLeague = await prisma.league.create({
        data: {
          name: 'Garden State Esports League',
          short_name: 'GSE',
          description: 'New Jersey\'s premier high school esports league, fostering competitive gaming excellence across the Garden State.',
                     game_id: valorantGame?.id ?? createdGames.find(g => g.short_name === 'VAL')?.id!,
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
    }
  } catch (error) {
    console.log('⚠️  Could not create Garden State Esports League:', error)
  }

  // Garden State Esports League Players Data
  const gsePlayersData = [
    {username: 'Santicio', team: 'West Essex Regional High School', mainAgent: 'Brimstone', role: 'Controller', eval: 86.72903306},
    {username: 'Daydreaming', team: 'West Essex Regional High School', mainAgent: 'Vyse', role: 'Sentinel', eval: 82.71489702},
    {username: 'spoty', team: 'West Essex Regional High School', mainAgent: 'Breach', role: 'Initiator', eval: 86.06275828},
    {username: 'Ashiwashi', team: 'West Essex Regional High School', mainAgent: 'Viper, Tejo', role: 'Controller', eval: 92.90625673},
    {username: 'buppa', team: 'West Essex Regional High School', mainAgent: 'Waylay', role: 'Duelist', eval: 81.75213639},
    {username: 'Him', team: 'Haddon Heights High School', mainAgent: 'Iso, Harbor', role: 'Duelist, Controller', eval: 64.96402326},
    {username: 'CURDS#5435', team: 'Haddon Heights High School', mainAgent: 'Sage, Brimstone', role: 'Sentinel, Controller', eval: 65.14666511},
    {username: 'ezzz', team: 'Haddon Heights High School', mainAgent: 'Skye, Sage', role: 'Initiator, Sentinel', eval: 67.67587935},
    {username: 'CURDS#5608', team: 'Haddon Heights High School', mainAgent: 'KAY/O, Fade', role: 'Initiator', eval: 67.32456227},
    {username: 'gunit', team: 'Haddon Heights High School', mainAgent: 'Omen, Yoru', role: 'Controller, Duelist', eval: 69.27919372},
    {username: 'RADICAL RUBEN', team: 'Bronx River High School', mainAgent: 'Jett', role: 'Duelist', eval: 83.10281981},
    {username: 'MasonTroyAdams', team: 'Bronx River High School', mainAgent: 'Sova', role: 'Initiator', eval: 85.70892395},
    {username: 'gohan', team: 'Bronx River High School', mainAgent: 'Breach, KAY/O', role: 'Initiator', eval: 85.15909853},
    {username: 'chula', team: 'Bronx River High School', mainAgent: 'Omen', role: 'Controller', eval: 86.56649492},
    {username: 'Omega', team: 'Bronx River High School', mainAgent: 'Sova, Killjoy', role: 'Initiator, Sentinel', eval: 82.20629882},
    {username: 'Fish', team: 'Mercer County Tech', mainAgent: 'Waylay, Killjoy', role: 'Duelist, Sentinel', eval: 73.85581025},
    {username: 'grub', team: 'Mercer County Tech', mainAgent: 'Tejo', role: 'Initiator', eval: 83.85426711},
    {username: 'ducks', team: 'Mercer County Tech', mainAgent: 'Cypher, Omen', role: 'Sentinel, Controller', eval: 80.90983964},
    {username: 'Hermit', team: 'Mercer County Tech', mainAgent: 'Omen, KAY/O', role: 'Controller, Initiator', eval: 82.81143954},
    {username: 'Beanman', team: 'Mercer County Tech', mainAgent: 'Breach, Iso', role: 'Initiator, Duelist', eval: 76.22474174},
    {username: 'soy milk', team: 'Cherokee High School', mainAgent: 'Omen', role: 'Controller', eval: 87.02147167},
    {username: 'Nic', team: 'Cherokee High School', mainAgent: 'Gekko', role: 'Initiator', eval: 78.74047576},
    {username: 'AsianPanda', team: 'Cherokee High School', mainAgent: 'Sova, Jett', role: 'Initiator, Duelist', eval: 85.98967003},
    {username: 'JTorando', team: 'Cherokee High School', mainAgent: 'Jett, Tejo', role: 'Duelist, Initiator', eval: 79.06429884},
    {username: 'HeinousHyena493', team: 'Cherokee High School', mainAgent: 'Cypher, Vyse', role: 'Sentinel', eval: 83.98943963},
    {username: 'D4ark Knight', team: 'East Side High School', mainAgent: 'Reyna', role: 'Duelist', eval: 65.53331477},
    {username: 'jxzkq', team: 'East Side High School', mainAgent: 'Waylay, Jett', role: 'Duelist', eval: 78.51205351},
    {username: 'bird', team: 'East Side High School', mainAgent: 'Omen, Cypher', role: 'Controller, Sentinel', eval: 69.7667885},
    {username: 'Akashi', team: 'East Side High School', mainAgent: 'Cypher, Omen', role: 'Sentinel, Controller', eval: 73.52496924},
    {username: 'ElColdestAlfredo', team: 'East Side High School', mainAgent: 'Gekko, Tejo', role: 'Initiator', eval: 69.07962584},
    {username: 'Aggretsuko', team: 'Plainfield High School', mainAgent: 'Vyse, Breach', role: 'Sentinel, Initiator', eval: 72.11217168},
    {username: 'spydr', team: 'Plainfield High School', mainAgent: 'Iso, Deadlock', role: 'Duelist, Sentinel', eval: 73.57796584},
    {username: 'PocketSage', team: 'Plainfield High School', mainAgent: 'Reyna, Raze', role: 'Duelist', eval: 66.96280766},
    {username: 'tomato bisque', team: 'Plainfield High School', mainAgent: 'Clove', role: 'Controller', eval: 76.69101626},
    {username: 'astr0', team: 'Plainfield High School', mainAgent: 'Gekko, Jett', role: 'Initiator, Duelist', eval: 72.06526897},
    {username: 'kizu', team: 'Saint Peter\'s Prep', mainAgent: 'Raze', role: 'Duelist', eval: 86.80057739},
    {username: 'goetta', team: 'Saint Peter\'s Prep', mainAgent: 'Vyse, Clove', role: 'Sentinel', eval: 86.21518019},
    {username: 'ItzCrazy', team: 'Saint Peter\'s Prep', mainAgent: 'Breach', role: 'Initiator', eval: 94.5179452},
    {username: 'Goob', team: 'Saint Peter\'s Prep', mainAgent: 'Omen', role: 'Controller', eval: 93.4273239},
    {username: 'ElmoThePooh', team: 'Saint Peter\'s Prep', mainAgent: 'Omen', role: 'Initiator, Controller', eval: 90.67492178},
    {username: 'Only', team: 'Saint Peter\'s Prep', mainAgent: 'Fade', role: 'Initiator', eval: 83.92431287},
    {username: 'xnaffled', team: 'East Brunswick High School', mainAgent: 'Viper, Astra', role: 'Controller', eval: 87.28541825},
    {username: 'caffeinated', team: 'East Brunswick High School', mainAgent: 'Sova', role: 'Initiator', eval: 73.79010715},
    {username: 'PIGU', team: 'East Brunswick High School', mainAgent: 'Reyna, Jett', role: 'Duelist', eval: 80.12229278},
    {username: 'spiderzayzooky', team: 'East Brunswick High School', mainAgent: 'Killjoy, Cypher', role: 'Sentinel', eval: 81.69212425},
    {username: 'dgs', team: 'East Brunswick High School', mainAgent: 'Jett, Phoenix', role: 'Duelist', eval: 77.53210694},
    {username: 'Seijuro Akashi', team: 'Livingston High School', mainAgent: 'Breach', role: 'Initiator', eval: 86.59720836},
    {username: 'kou', team: 'Livingston High School', mainAgent: 'Jett', role: 'Duelist', eval: 85.06315237},
    {username: 'i luv abgs', team: 'Livingston High School', mainAgent: 'Killjoy', role: 'Sentinel', eval: 83.96096885},
    {username: 'ryo', team: 'Livingston High School', mainAgent: 'Sova, Raze', role: 'Initiator', eval: 83.85209054},
    {username: 'rest', team: 'Livingston High School', mainAgent: 'Omen', role: 'Controller', eval: 91.89517342},
    {username: 'pedro', team: 'Technology High School', mainAgent: 'Chamber', role: 'Sentinel', eval: 68.26308839},
    {username: 'dan', team: 'Technology High School', mainAgent: 'Phoenix', role: 'Duelist', eval: 75.24611653},
    {username: 'Hydro', team: 'Technology High School', mainAgent: 'Astra, Omen', role: 'Controller', eval: 78.84845899},
    {username: 'hyein', team: 'Technology High School', mainAgent: 'Jett, Raze', role: 'Duelist', eval: 75.6216766},
    {username: 'Franciscocze', team: 'Technology High School', mainAgent: 'Tejo', role: 'Initiator', eval: 70.45602644},
    {username: 'MHS Pyroxy', team: 'Middlesex High School', mainAgent: 'Breach', role: 'Initiator', eval: 82.73161049},
    {username: 'MHS Soy Milk', team: 'Middlesex High School', mainAgent: 'Jett, Phoenix', role: 'Duelist', eval: 80.16837109},
    {username: 'MHS zhen', team: 'Middlesex High School', mainAgent: 'Sova, Tejo', role: 'Initiator', eval: 92.31627781},
    {username: 'MHS zinny', team: 'Middlesex High School', mainAgent: 'Omen', role: 'Controller', eval: 83.15657968},
    {username: 'MHS pr1sm', team: 'Middlesex High School', mainAgent: 'Cypher', role: 'Sentinel', eval: 85.5033857},
    {username: 'Nebula1dust', team: 'Technology High School', mainAgent: 'Cypher', role: 'Sentinel', eval: 72.44415682},
    {username: 'Beets', team: 'Old Bridge High School', mainAgent: 'Sova, Tejo', role: 'Initiator', eval: 83.63034781},
    {username: 'LFT Dandojo', team: 'Old Bridge High School', mainAgent: 'Yoru', role: 'Duelist', eval: 92.7764068},
    {username: 'EDowg315', team: 'Old Bridge High School', mainAgent: 'Clove', role: 'Controller', eval: 79.68743046},
    {username: 'rhonda', team: 'Old Bridge High School', mainAgent: 'Jett, Raze', role: 'Duelist', eval: 80.73328311},
    {username: 'Kim Chaewon', team: 'Old Bridge High School', mainAgent: 'Cypher', role: 'Sentinel', eval: 70.9871905},
    {username: 'TTVCyclone', team: 'Cherry Hill High School East', mainAgent: 'Jett', role: 'Duelist', eval: 88.68274921},
    {username: 'Mluck', team: 'Cherry Hill High School East', mainAgent: 'Sova, Skye', role: 'Initiator', eval: 81.42877924},
    {username: 'Sempie ichinese', team: 'Cherry Hill High School East', mainAgent: 'Omen', role: 'Controller', eval: 93.85965647},
    {username: 'kumkum', team: 'Cherry Hill High School East', mainAgent: 'Reyna', role: 'Duelist', eval: 82.54840755},
    {username: 'Pwnda', team: 'Cherry Hill High School East', mainAgent: 'Cypher, Vyse, Skye, Breach', role: 'Sentinel, Initiator', eval: 85.20318191},
    {username: 'That Barney Guy', team: 'NVRHS Demarest', mainAgent: 'Clove, Omen', role: 'Controller', eval: 85.84581105},
    {username: 'FUBAR', team: 'NVRHS Demarest', mainAgent: 'Jett, Chamber', role: 'Duelist, Sentinel', eval: 82.89954905},
    {username: 'nephis', team: 'NVRHS Demarest', mainAgent: 'Neon, Reyna, Gekko, Jett', role: 'Duelist', eval: 77.92643957},
    {username: 'yun', team: 'NVRHS Demarest', mainAgent: 'Raze, Sova', role: 'Duelist, Initiator', eval: 76.759805},
    {username: 'Mini C9 Oxy', team: 'NVRHS Demarest', mainAgent: 'Reyna, Jett', role: 'Duelist', eval: 82.92068175},
    {username: 'AIya', team: 'Ocean Township High School', mainAgent: 'Sage, Killjoy', role: 'Sentinel', eval: 80.08998203},
    {username: 'crepe', team: 'Ocean Township High School', mainAgent: 'Gekko, Breach', role: 'Initiator', eval: 75.93239896},
    {username: 'Fz1nnWoW', team: 'Ocean Township High School', mainAgent: 'Jett, Tejo', role: 'Duelist, Initiator', eval: 79.05248152},
    {username: 'i like bananasss', team: 'Ocean Township High School', mainAgent: 'Iso, Neon', role: 'Duelist', eval: 70.57617819},
    {username: 'bum', team: 'Ocean Township High School', mainAgent: 'Clove, Omen', role: 'Controller', eval: 75.67112564},
    {username: 'PiggyPlague303', team: 'McNair Academic High School', mainAgent: 'Vyse, Cypher', role: 'Sentinel', eval: 91.81014646},
    {username: 'Iconic', team: 'McNair Academic High School', mainAgent: 'Jett', role: 'Duelist', eval: 82.95606142},
    {username: 'Axstro', team: 'McNair Academic High School', mainAgent: 'Iso', role: 'Duelist', eval: 86.43218599},
    {username: 'anika', team: 'McNair Academic High School', mainAgent: 'Breach, Sova', role: 'Initiator', eval: 81.66789187},
    {username: 'Kiso', team: 'McNair Academic High School', mainAgent: 'Omen', role: 'Controller', eval: 86.84245342},
    {username: 'CrazyBuddy', team: 'David Brearley High School', mainAgent: 'Omen', role: 'Controller', eval: 74.12618073},
    {username: 'FLAWLESS LIKE ME', team: 'David Brearley High School', mainAgent: 'Yoru', role: 'Duelist', eval: 84.20719284},
    {username: 'WooperEnthusiast', team: 'David Brearley High School', mainAgent: 'Cypher', role: 'Sentinel', eval: 78.35309387},
    {username: 'lullu', team: 'David Brearley High School', mainAgent: 'Killjoy', role: 'Sentinel', eval: 78.78687061},
    {username: 'ziptrix', team: 'David Brearley High School', mainAgent: 'Sova', role: 'Initiator', eval: 82.15013491},
    {username: 'GreenDragoon', team: 'Barnegat High School', mainAgent: 'Cypher, Killjoy', role: 'Sentinel', eval: 81.14431801},
    {username: 'Funny Valentine', team: 'Barnegat High School', mainAgent: 'Jett, Iso', role: 'Duelist', eval: 87.56104926},
    {username: 'ILoveTheStrokes', team: 'Barnegat High School', mainAgent: 'Fade', role: 'Initiator', eval: 78.61812306},
    {username: 'Burrito', team: 'Barnegat High School', mainAgent: 'Brimstone', role: 'Controller', eval: 93.56603185},
    {username: 'EthalexG', team: 'Barnegat High School', mainAgent: 'Deadlock', role: 'Sentinel', eval: 84.88519659},
    {username: 'znex', team: 'High Tech High School', mainAgent: 'Tejo', role: 'Initiator', eval: 84.5555506},
    {username: 'dasiggster', team: 'High Tech High School', mainAgent: 'Tejo, Omen, Viper', role: 'Controller', eval: 77.88705936},
    {username: 'Tengarra', team: 'High Tech High School', mainAgent: 'Yoru, Jett, Reyna', role: 'Duelist', eval: 80.6331709},
    {username: 'LilRino', team: 'High Tech High School', mainAgent: 'Iso', role: 'Duelist', eval: 86.26516508},
    {username: 'Japoc', team: 'High Tech High School', mainAgent: 'Killjoy', role: 'Sentinel', eval: 75.65732878},
    {username: 'Winnypoo', team: 'Scotch Plains-Fanwood High School', mainAgent: 'Omen', role: 'Controller', eval: 90.63805246},
    {username: 'Titan', team: 'Scotch Plains-Fanwood High School', mainAgent: 'Jett', role: 'Duelist', eval: 77.02458573},
    {username: 'ANStykes', team: 'Scotch Plains-Fanwood High School', mainAgent: 'Cypher, Chamber', role: 'Sentinel', eval: 78.83894164},
    {username: 'BoopNoodleOnFire', team: 'Scotch Plains-Fanwood High School', mainAgent: 'Tejo', role: 'Initiator', eval: 80.09760131},
    {username: 'Malex', team: 'Scotch Plains-Fanwood High School', mainAgent: 'Reyna', role: 'Duelist', eval: 80.25853192},
    {username: 'OcEaN', team: 'Holmdel High School', mainAgent: 'Breach, Viper, Tejo', role: 'Initiator', eval: 89.68333295},
    {username: 'obbi', team: 'Holmdel High School', mainAgent: 'Cypher, Sova', role: 'Sentinel, Initiator', eval: 85.01221974},
    {username: 'foam', team: 'Holmdel High School', mainAgent: 'Raze', role: 'Duelist', eval: 86.74471101},
    {username: 'pwayer', team: 'Holmdel High School', mainAgent: 'Tejo', role: 'Initiator', eval: 76.24880697},
    {username: 'awsumkin', team: 'Holmdel High School', mainAgent: 'Clove', role: 'Controller', eval: 88.88493923},
    {username: 'poop', team: 'Holmdel High School', mainAgent: 'Killjoy', role: 'Sentinel', eval: 85.2403609},
    {username: 'citrusturtle', team: 'West Essex Regional High School', mainAgent: 'Cypher', role: 'Sentinel', eval: 80.55212695},
    {username: 'Banditvean', team: 'NVRHS Demarest', mainAgent: 'Killjoy', role: 'Sentinel', eval: 74.29721475},
    {username: 'ebisu', team: 'Community Health Academy of the Heights', mainAgent: 'Yoru, Breach', role: 'Duelist, Initiator', eval: 74.83142861},
    {username: 'Charzy', team: 'Community Health Academy of the Heights', mainAgent: 'Iso, Raze', role: 'Duelist', eval: 81.06664905},
    {username: 'neno', team: 'Community Health Academy of the Heights', mainAgent: 'Breach, Tejo', role: 'Initiator', eval: 83.57556873},
    {username: 'The Professor', team: 'Community Health Academy of the Heights', mainAgent: 'Cypher, Vyse', role: 'Sentinel', eval: 89.08572014},
    {username: 'sensei wu', team: 'Community Health Academy of the Heights', mainAgent: 'Omen', role: 'Controller', eval: 90.04111055}
  ]

  // Create GSE players
  console.log('🎮 Creating Garden State Esports League players...')
  const createdGSEPlayers = []
  
  for (const gsePlayerData of gsePlayersData) {
    // Find the school
    const school = createdSchools.find(s => s.name === gsePlayerData.team)
    if (!school) {
      console.log(`⚠️  School not found for ${gsePlayerData.username}: ${gsePlayerData.team}`)
      continue
    }

    // Generate random graduation year between 2025-2029
    const graduationYear = 2025 + Math.floor(Math.random() * 5) // 2025-2029
    const currentYear = new Date().getFullYear()
    let classYear = 'Senior'
    if (graduationYear === currentYear + 1) classYear = 'Senior'
    else if (graduationYear === currentYear + 2) classYear = 'Junior'
    else if (graduationYear === currentYear + 3) classYear = 'Sophomore'
    else if (graduationYear === currentYear + 4) classYear = 'Freshman'

    const player = {
      clerk_id: `gse_player_${gsePlayerData.username}_mock_id`,
      email: `${gsePlayerData.username.toLowerCase().replace(/[^a-z0-9]/g, '')}@${school.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.edu`,
      first_name: 'Unknown',
      last_name: 'Unknown',
      username: gsePlayerData.username,
      image_url: null,
      location: `${school.location}, ${school.state}`,
      bio: `Garden State Esports League competitor representing ${school.name}`,
      school: school.name,
      school_id: school.id,
      gpa: parseFloat((3.0 + Math.random() * 1.0).toFixed(2)), // 3.0-4.0 GPA
      class_year: classYear,
      graduation_date: graduationYear.toString(),
      intended_major: getRandomElement(['Computer Science', 'Information Technology', 'Game Design', 'Digital Media', 'Business Administration', 'Broadcasting', 'English']),
      main_game_id: valorantGame?.id || createdGames.find(g => g.short_name === 'VAL')?.id,
      guardian_email: `parent.${gsePlayerData.username.toLowerCase().replace(/[^a-z0-9]/g, '')}@email.com`,
      scholastic_contact: `${getRandomElement(['Ms.', 'Mr.', 'Dr.'])} ${getRandomElement(['Johnson', 'Smith', 'Williams', 'Brown', 'Davis'])}`,
      scholastic_contact_email: `contact.${gsePlayerData.username.toLowerCase().replace(/[^a-z0-9]/g, '')}@${school.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}.edu`,
      extra_curriculars: 'Garden State Esports League, Gaming Club, Academic Honor Society',
      academic_bio: 'Competitive esports athlete with strong academic performance and leadership skills.'
    }

    try {
      const existingPlayer = await prisma.player.findUnique({
        where: { clerk_id: player.clerk_id }
      })
      
      if (existingPlayer) {
        console.log(`⏭️  GSE Player already exists: ${gsePlayerData.username}`)
        createdGSEPlayers.push(existingPlayer)
      } else {
        const newPlayer = await prisma.player.create({ data: player })
        console.log(`✅ Created GSE player: ${gsePlayerData.username} (${school.name})`)
        createdGSEPlayers.push(newPlayer)

        // Create VALORANT game profile for GSE player
        if (valorantGame) {
          const agents = gsePlayerData.mainAgent.split(', ').map(agent => agent.trim())
          const roles = gsePlayerData.role.split(', ').map(role => role.trim())
          
          const gameProfile = {
            player_id: newPlayer.id,
            game_id: valorantGame.id,
            username: gsePlayerData.username,
            rating: Math.floor(1000 + (gsePlayerData.eval / 100) * 2000), // Scale EVAL to 1000-3000 rating
            combine_score: gsePlayerData.eval,
            league_score: gsePlayerData.eval,
            play_style: getRandomElement(playStylesPool),
            tracker_url: `https://tracker.gg/valorant/profile/riot/${gsePlayerData.username}`,
            rank: getRandomElement(valorantRanksPool.slice(-15)), // Higher ranks for these competitive players
            role: roles[0] || 'Flex',
            agents: agents,
            preferred_maps: getRandomElements(['Bind', 'Haven', 'Split', 'Ascent', 'Dust2', 'Inferno', 'Mirage', 'Cache'], 3)
          }

          await prisma.playerGameProfile.create({ data: gameProfile })
          console.log(`✅ Created VALORANT profile for GSE player: ${gsePlayerData.username}`)

          // Create PlayerLeague record
          if (gseLeague) {
            const playerLeague = {
              player_id: newPlayer.id,
              league_id: gseLeague.id,
              season: '2024-2025',
              eval_score: gsePlayerData.eval,
              main_agent: gsePlayerData.mainAgent,
              role: gsePlayerData.role,
              rank: 'Active',
              wins: Math.floor(Math.random() * 15) + 5, // 5-19 wins
              losses: Math.floor(Math.random() * 10) + 2, // 2-11 losses
              games_played: 0 // Will be calculated
            }
            playerLeague.games_played = playerLeague.wins + playerLeague.losses

            await prisma.playerLeague.create({ data: playerLeague })
            console.log(`✅ Created league participation for GSE player: ${gsePlayerData.username}`)
          }
        }
      }
    } catch (error) {
      console.log(`⚠️  Could not create GSE player ${gsePlayerData.username}:`, error)
    }
  }

  // Create 60 players (reduced from 120 for better performance)
  const players = []
  
  for (let i = 0; i < 60; i++) {
    const firstName = getRandomElement(firstNames)
    const lastName = getRandomElement(lastNames)
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}@email.com`
    const school = getRandomElement(createdSchools)
    const mainGame = getRandomElement(createdGames)
    const classYear = getRandomElement(['Freshman', 'Sophomore', 'Junior', 'Senior'])
    const gpa = parseFloat((2.5 + Math.random() * 1.5).toFixed(2)) // GPA between 2.5-4.0
    
    const player = {
      clerk_id: `player_${i + 1}_mock_id`,
      email: email,
      first_name: firstName,
      last_name: lastName,
      username: username,
      image_url: null,
      location: getRandomElement(locations),
      bio: getRandomElement(bios),
      school: school.name,
      school_id: school.id,
      gpa: gpa,
      class_year: classYear,
      graduation_date: String(new Date().getFullYear() + (classYear === 'Senior' ? 1 : classYear === 'Junior' ? 2 : classYear === 'Sophomore' ? 3 : 4)),
      intended_major: getRandomElement(majors),
      main_game_id: mainGame.id,
      guardian_email: `parent.${firstName.toLowerCase()}${lastName.toLowerCase()}@email.com`,
      scholastic_contact: `${getRandomElement(['Ms.', 'Mr.', 'Dr.'])} ${getRandomElement(lastNames)}`,
      scholastic_contact_email: `contact.${firstName.toLowerCase()}@${school.name.toLowerCase().replace(/\s+/g, '')}.edu`,
      extra_curriculars: getRandomElement([
        'Student Government, Gaming Club',
        'Honor Society, Esports Team Captain',
        'Volunteer Work, Programming Club',
        'Debate Team, Math Club',
        'Drama Club, Creative Writing',
        'Community Service, Robotics Team'
      ]),
      academic_bio: getRandomElement([
        'Honor roll student with strong analytical skills.',
        'Dean\'s list recipient focused on STEM subjects.',
        'Well-rounded student with leadership experience.',
        'Academic excellence in mathematics and sciences.',
        'Strong communication skills and academic performance.',
        'Dedicated student with a passion for technology.'
      ])
    }
    
    players.push(player)
  }

  // Create all players
  const createdPlayers = []
  for (const player of players) {
    try {
      const existingPlayer = await prisma.player.findUnique({
        where: { clerk_id: player.clerk_id }
      })
      
      if (existingPlayer) {
        console.log(`⏭️  Player already exists: ${player.first_name} ${player.last_name}`)
        createdPlayers.push(existingPlayer)
      } else {
        const newPlayer = await prisma.player.create({ data: player })
        console.log(`✅ Created player: ${player.first_name} ${player.last_name}`)
        createdPlayers.push(newPlayer)
      }
    } catch (error) {
      console.log(`⚠️  Could not create player ${player.first_name} ${player.last_name}:`, error)
    }
  }

  // Create game profiles for players
  console.log('🎮 Creating player game profiles...')
  for (const player of createdPlayers) {
    // Each player gets 1-3 game profiles
    const numProfiles = Math.floor(Math.random() * 3) + 1
    const selectedGames = getRandomElements(createdGames, numProfiles)
    
    for (const game of selectedGames) {
      try {
        const existingProfile = await prisma.playerGameProfile.findUnique({
          where: {
            player_id_game_id: {
              player_id: player.id,
              game_id: game.id
            }
          }
        })
        
        if (existingProfile) continue
        
        const gameProfile: any = {
          player_id: player.id,
          game_id: game.id,
          username: `${player.username ?? player.first_name.toLowerCase() + player.last_name.toLowerCase()}_${game.short_name}`,
          rating: Math.floor(Math.random() * 3000) + 1000,
          combine_score: parseFloat((Math.random() * 100).toFixed(1)),
          league_score: parseFloat((Math.random() * 100).toFixed(1)),
          play_style: getRandomElement(playStylesPool),
          tracker_url: `https://tracker.gg/${game.short_name.toLowerCase()}/${player.username ?? player.first_name.toLowerCase() + player.last_name.toLowerCase()}_${game.short_name}`
        }

        // Game-specific data
        if (game.short_name === 'VAL') {
          gameProfile.rank = getRandomElement(valorantRanksPool)
          gameProfile.role = getRandomElement(valorantRolesPool)
          gameProfile.agents = getRandomElements(valorantAgentsPool, Math.floor(Math.random() * 5) + 1)
          gameProfile.preferred_maps = getRandomElements(['Bind', 'Haven', 'Split', 'Ascent', 'Dust2', 'Inferno', 'Mirage', 'Cache'], Math.floor(Math.random() * 3) + 1)
        } else if (game.short_name === 'OW2') {
          gameProfile.rank = getRandomElement(overwatchRanksPool)
          gameProfile.role = getRandomElement(overwatchRolesPool)
          gameProfile.agents = getRandomElements(overwatchHeroesPool, Math.floor(Math.random() * 6) + 1)
          gameProfile.preferred_maps = getRandomElements(['King\'s Row', 'Hanamura', 'Temple of Anubis', 'Volskaya', 'Dorado', 'Route 66'], Math.floor(Math.random() * 3) + 1)
        } else if (game.short_name === 'RL') {
          gameProfile.rank = getRandomElement(rocketLeagueRanksPool)
          gameProfile.role = getRandomElement(rocketLeaguePositionsPool)
          gameProfile.agents = [] // No agents in Rocket League
          gameProfile.preferred_maps = getRandomElements(['DFH Stadium', 'Mannfield', 'Champions Field', 'Urban Central', 'Beckwith Park'], Math.floor(Math.random() * 3) + 1)
        } else if (game.short_name === 'SSBU') {
          gameProfile.rank = `${Math.floor(Math.random() * 10000000)} GSP`
          gameProfile.role = 'Main'
          gameProfile.agents = getRandomElements(smashCharactersPool, Math.floor(Math.random() * 3) + 1)
          gameProfile.preferred_maps = getRandomElements(['Battlefield', 'Final Destination', 'Small Battlefield', 'Pokemon Stadium 2', 'Smashville'], Math.floor(Math.random() * 3) + 1)
        }

        await prisma.playerGameProfile.create({ data: gameProfile })
        console.log(`✅ Created ${game.short_name} profile for ${player.first_name} ${player.last_name}`)
      } catch (error) {
        console.log(`⚠️  Could not create ${game.short_name} profile for ${player.first_name} ${player.last_name}:`, error)
      }
    }
  }

  // Create platform connections for players
  console.log('🔗 Creating platform connections...')
  for (const player of createdPlayers) {
    const numConnections = Math.floor(Math.random() * 3) + 1
    const selectedPlatforms = getRandomElements(platformsPool, numConnections)
    
    for (const platform of selectedPlatforms) {
      try {
        const existingConnection = await prisma.playerPlatformConnection.findUnique({
          where: {
            player_id_platform: {
              player_id: player.id,
              platform: platform.toLowerCase().replace(/\s+/g, '')
            }
          }
        })
        
        if (existingConnection) continue
        
        await prisma.playerPlatformConnection.create({
          data: {
            player_id: player.id,
            platform: platform.toLowerCase().replace(/\s+/g, ''),
            username: `${player.username ?? player.first_name.toLowerCase() + player.last_name.toLowerCase()}_${platform.toLowerCase().replace(/\s+/g, '')}`,
            connected: Math.random() > 0.1 // 90% connected
          }
        })
      } catch (error) {
        console.log(`⚠️  Could not create platform connection:`, error)
      }
    }
  }

  // Create social connections for players
  console.log('📱 Creating social connections...')
  for (const player of createdPlayers) {
    const numConnections = Math.floor(Math.random() * 4) + 1
    const selectedSocials = getRandomElements(socialPlatformsPool, numConnections)
    
    for (const social of selectedSocials) {
      try {
        const existingConnection = await prisma.playerSocialConnection.findUnique({
          where: {
            player_id_platform: {
              player_id: player.id,
              platform: social.toLowerCase()
            }
          }
        })
        
        if (existingConnection) continue
        
        let username = player.username ?? player.first_name.toLowerCase() + player.last_name.toLowerCase()
        if (social === 'Discord') {
          username = `${player.username ?? player.first_name.toLowerCase() + player.last_name.toLowerCase()}#${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
        } else if (social === 'Twitch' || social === 'YouTube') {
          username = `${player.username ?? player.first_name.toLowerCase() + player.last_name.toLowerCase()}_${social.toLowerCase()}`
        }
        
        await prisma.playerSocialConnection.create({
          data: {
            player_id: player.id,
            platform: social.toLowerCase(),
            username: username,
            connected: Math.random() > 0.2 // 80% connected
          }
        })
      } catch (error) {
        console.log(`⚠️  Could not create social connection:`, error)
      }
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
  console.log('👤 Available players:')
  const allPlayers = await prisma.player.findMany({
    include: {
      main_game: true,
      school_ref: true
    }
  })
  allPlayers.forEach(player => {
    console.log(`   • ${player.first_name} ${player.last_name} (${player.main_game?.short_name ?? 'No main game'}) - ${player.school_ref?.name ?? player.school ?? 'No school'}`)
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

  console.log('')
  console.log('🏆 Available combines:')
  const allCombines = await prisma.combine.findMany({
    include: {
      game: true,
      organizer: {
        include: {
          school_ref: true
        }
      }
    }
  })
  allCombines.forEach(combine => {
    console.log(`   • ${combine.title} - ${combine.game.name}`)
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