
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

  // Expanded Schools Data
  console.log('🏫 Seeding schools...')
  const schools = [
    // Universities
    {
      name: 'University of Gaming',
      type: 'UNIVERSITY' as const,
      location: 'Los Angeles',
      state: 'CA',
      region: 'West',
      website: 'https://universitygaming.edu'
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
      name: 'Northwestern Gaming University',
      type: 'UNIVERSITY' as const,
      location: 'Seattle',
      state: 'WA',
      region: 'West',
      website: 'https://nwgaming.edu'
    },
    {
      name: 'Eastern Esports University',
      type: 'UNIVERSITY' as const,
      location: 'Boston',
      state: 'MA',
      region: 'Northeast',
      website: 'https://easternesports.edu'
    },
    {
      name: 'Central Gaming State',
      type: 'UNIVERSITY' as const,
      location: 'Kansas City',
      state: 'MO',
      region: 'Midwest',
      website: 'https://centralgaming.edu'
    },
    {
      name: 'Southern Gaming University',
      type: 'UNIVERSITY' as const,
      location: 'Austin',
      state: 'TX',
      region: 'South',
      website: 'https://southerngaming.edu'
    },
    {
      name: 'Pacific Esports University',
      type: 'UNIVERSITY' as const,
      location: 'San Francisco',
      state: 'CA',
      region: 'West',
      website: 'https://pacificesports.edu'
    },
    {
      name: 'Mountain Gaming University',
      type: 'UNIVERSITY' as const,
      location: 'Denver',
      state: 'CO',
      region: 'West',
      website: 'https://mountaingaming.edu'
    },
    
    // Colleges
    {
      name: 'Esports Institute',
      type: 'COLLEGE' as const,
      location: 'Austin',
      state: 'TX',
      region: 'South',
      website: 'https://esportsinstitute.edu'
    },
    {
      name: 'Elite Gaming College',
      type: 'COLLEGE' as const,
      location: 'Phoenix',
      state: 'AZ',
      region: 'Southwest',
      website: 'https://elitegaming.edu'
    },
    {
      name: 'Competitive Gaming Academy',
      type: 'COLLEGE' as const,
      location: 'Orlando',
      state: 'FL',
      region: 'Southeast',
      website: 'https://compgaming.edu'
    },
    {
      name: 'Digital Athletics College',
      type: 'COLLEGE' as const,
      location: 'Chicago',
      state: 'IL',
      region: 'Midwest',
      website: 'https://digitalathletics.edu'
    },
    {
      name: 'Pro Gaming Institute',
      type: 'COLLEGE' as const,
      location: 'Las Vegas',
      state: 'NV',
      region: 'West',
      website: 'https://progaming.edu'
    },
    {
      name: 'Cyber Sports College',
      type: 'COLLEGE' as const,
      location: 'New York',
      state: 'NY',
      region: 'Northeast',
      website: 'https://cybersports.edu'
    },
    {
      name: 'Gaming Excellence Academy',
      type: 'COLLEGE' as const,
      location: 'Miami',
      state: 'FL',
      region: 'Southeast',
      website: 'https://gamingexcellence.edu'
    },
    {
      name: 'Strategic Gaming College',
      type: 'COLLEGE' as const,
      location: 'Portland',
      state: 'OR',
      region: 'West',
      website: 'https://strategicgaming.edu'
    },
    
    // High Schools
    {
      name: 'Gaming Academy High School',
      type: 'HIGH_SCHOOL' as const,
      location: 'Seattle',
      state: 'WA',
      region: 'West',
      website: 'https://gamingacademy.edu'
    },
    {
      name: 'Esports Prep Academy',
      type: 'HIGH_SCHOOL' as const,
      location: 'Los Angeles',
      state: 'CA',
      region: 'West',
      website: 'https://esportsprep.edu'
    },
    {
      name: 'Digital Champions High',
      type: 'HIGH_SCHOOL' as const,
      location: 'Houston',
      state: 'TX',
      region: 'South',
      website: 'https://digitalchampions.edu'
    },
    {
      name: 'Elite Gaming Prep',
      type: 'HIGH_SCHOOL' as const,
      location: 'Atlanta',
      state: 'GA',
      region: 'Southeast',
      website: 'https://elitegamingprep.edu'
    },
    {
      name: 'Future Gamers Academy',
      type: 'HIGH_SCHOOL' as const,
      location: 'Phoenix',
      state: 'AZ',
      region: 'Southwest',
      website: 'https://futuregamers.edu'
    },
    {
      name: 'Competitive Edge High School',
      type: 'HIGH_SCHOOL' as const,
      location: 'Chicago',
      state: 'IL',
      region: 'Midwest',
      website: 'https://competitiveedge.edu'
    },
    {
      name: 'NextGen Gaming High',
      type: 'HIGH_SCHOOL' as const,
      location: 'Orlando',
      state: 'FL',
      region: 'Southeast',
      website: 'https://nextgengaming.edu'
    },
    {
      name: 'Pioneer Gaming Academy',
      type: 'HIGH_SCHOOL' as const,
      location: 'Denver',
      state: 'CO',
      region: 'West',
      website: 'https://pioneergaming.edu'
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

  // Expanded Mock Coaches
  console.log('👨‍🏫 Seeding coaches...')
  const coaches = [
    // University coaches
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
    {
      clerk_id: 'coach_7_mock_id',
      email: 'jessica.wong@pacificesports.edu',
      first_name: 'Jessica',
      last_name: 'Wong',
      username: 'jessicawong',
      school: 'Pacific Esports University',
      school_id: createdSchools[6]?.id
    },
    {
      clerk_id: 'coach_8_mock_id',
      email: 'robert.kim@mountaingaming.edu',
      first_name: 'Robert',
      last_name: 'Kim',
      username: 'robertkim',
      school: 'Mountain Gaming University',
      school_id: createdSchools[7]?.id
    },
    
    // College coaches
    {
      clerk_id: 'coach_9_mock_id',
      email: 'sarah.johnson@esportsinstitute.edu',
      first_name: 'Sarah',
      last_name: 'Johnson',
      username: 'sarahjohnson',
      school: 'Esports Institute',
      school_id: createdSchools[8]?.id
    },
    {
      clerk_id: 'coach_10_mock_id',
      email: 'alex.chen@elitegaming.edu',
      first_name: 'Alex',
      last_name: 'Chen',
      username: 'alexchen',
      school: 'Elite Gaming College',
      school_id: createdSchools[9]?.id
    },
    {
      clerk_id: 'coach_11_mock_id',
      email: 'maya.patel@compgaming.edu',
      first_name: 'Maya',
      last_name: 'Patel',
      username: 'mayapatel',
      school: 'Competitive Gaming Academy',
      school_id: createdSchools[10]?.id
    },
    {
      clerk_id: 'coach_12_mock_id',
      email: 'james.thompson@digitalathletics.edu',
      first_name: 'James',
      last_name: 'Thompson',
      username: 'jamesthompson',
      school: 'Digital Athletics College',
      school_id: createdSchools[11]?.id
    },
    {
      clerk_id: 'coach_13_mock_id',
      email: 'lisa.garcia@progaming.edu',
      first_name: 'Lisa',
      last_name: 'Garcia',
      username: 'lisagarcia',
      school: 'Pro Gaming Institute',
      school_id: createdSchools[12]?.id
    },
    {
      clerk_id: 'coach_14_mock_id',
      email: 'mark.brown@cybersports.edu',
      first_name: 'Mark',
      last_name: 'Brown',
      username: 'markbrown',
      school: 'Cyber Sports College',
      school_id: createdSchools[13]?.id
    },
    {
      clerk_id: 'coach_15_mock_id',
      email: 'stephanie.lee@gamingexcellence.edu',
      first_name: 'Stephanie',
      last_name: 'Lee',
      username: 'stephanielee',
      school: 'Gaming Excellence Academy',
      school_id: createdSchools[14]?.id
    },
    {
      clerk_id: 'coach_16_mock_id',
      email: 'carlos.rivera@strategicgaming.edu',
      first_name: 'Carlos',
      last_name: 'Rivera',
      username: 'carlosrivera',
      school: 'Strategic Gaming College',
      school_id: createdSchools[15]?.id
    },
    
    // High school coaches
    {
      clerk_id: 'coach_17_mock_id',
      email: 'mike.wilson@gamingacademy.edu',
      first_name: 'Mike',
      last_name: 'Wilson',
      username: 'mikewilson',
      school: 'Gaming Academy High School',
      school_id: createdSchools[16]?.id
    },
    {
      clerk_id: 'coach_18_mock_id',
      email: 'jennifer.taylor@esportsprep.edu',
      first_name: 'Jennifer',
      last_name: 'Taylor',
      username: 'jennifertaylor',
      school: 'Esports Prep Academy',
      school_id: createdSchools[17]?.id
    },
    {
      clerk_id: 'coach_19_mock_id',
      email: 'kevin.nguyen@digitalchampions.edu',
      first_name: 'Kevin',
      last_name: 'Nguyen',
      username: 'kevinnguyen',
      school: 'Digital Champions High',
      school_id: createdSchools[18]?.id
    },
    {
      clerk_id: 'coach_20_mock_id',
      email: 'amanda.williams@elitegamingprep.edu',
      first_name: 'Amanda',
      last_name: 'Williams',
      username: 'amandawilliams',
      school: 'Elite Gaming Prep',
      school_id: createdSchools[19]?.id
    },
    {
      clerk_id: 'coach_21_mock_id',
      email: 'brian.jones@futuregamers.edu',
      first_name: 'Brian',
      last_name: 'Jones',
      username: 'brianjones',
      school: 'Future Gamers Academy',
      school_id: createdSchools[20]?.id
    },
    {
      clerk_id: 'coach_22_mock_id',
      email: 'rachel.davis@competitiveedge.edu',
      first_name: 'Rachel',
      last_name: 'Davis',
      username: 'racheldavis',
      school: 'Competitive Edge High School',
      school_id: createdSchools[21]?.id
    },
    {
      clerk_id: 'coach_23_mock_id',
      email: 'anthony.miller@nextgengaming.edu',
      first_name: 'Anthony',
      last_name: 'Miller',
      username: 'anthonymiller',
      school: 'NextGen Gaming High',
      school_id: createdSchools[22]?.id
    },
    {
      clerk_id: 'coach_24_mock_id',
      email: 'natalie.clark@pioneergaming.edu',
      first_name: 'Natalie',
      last_name: 'Clark',
      username: 'natalieclark',
      school: 'Pioneer Gaming Academy',
      school_id: createdSchools[23]?.id
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

  // Generate many tryouts
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

  for (let i = 0; i < 30; i++) {
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

  for (let i = 0; i < 25; i++) {
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

  for (let i = 0; i < 20; i++) {
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

  for (let i = 0; i < 18; i++) {
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

  for (let i = 0; i < 10; i++) {
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

  for (let i = 0; i < 8; i++) {
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

  for (let i = 0; i < 6; i++) {
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
  const overwatchRanksPool = ['Bronze 5', 'Bronze 4', 'Bronze 3', 'Bronze 2', 'Bronze 1', 'Silver 5', 'Silver 4', 'Silver 3', 'Silver 2', 'Silver 1', 'Gold 5', 'Gold 4', 'Gold 3', 'Gold 2', 'Gold 1', 'Platinum 5', 'Platinum 4', 'Platinum 3', 'Platinum 2', 'Platinum 1', 'Diamond 5', 'Diamond 4', 'Diamond 3', 'Diamond 2', 'Diamond 1', 'Master 5', 'Master 4', 'Master 3', 'Master 2', 'Master 1', 'Grandmaster 5', 'Grandmaster 4', 'Grandmaster 3', 'Grandmaster 2', 'Grandmaster 1', 'Top 500']

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

  // Create 120 players (30 per game)
  const players = []
  
  for (let i = 0; i < 120; i++) {
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