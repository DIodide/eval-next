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
  const futureDate6 = new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000) // 5 weeks from now
  const futureDate7 = new Date(now.getTime() + 42 * 24 * 60 * 60 * 1000) // 6 weeks from now
  const futureDate8 = new Date(now.getTime() + 49 * 24 * 60 * 60 * 1000) // 7 weeks from now
  const futureDate9 = new Date(now.getTime() + 56 * 24 * 60 * 60 * 1000) // 8 weeks from now

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
    },
    {
      title: 'VALORANT Summer Bootcamp Tryouts',
      description: 'Intensive summer training program for dedicated VALORANT players.',
      long_description: 'A 6-week intensive bootcamp featuring daily practice, professional coaching, and tournament preparation. Only the most committed players need apply.',
      game_id: valorantGame.id,
      school_id: createdSchools[1]!.id,
      coach_id: createdCoaches[1]!.id,
      date: futureDate6,
      time_start: '10:00',
      time_end: '14:00',
      location: 'Esports Institute Training Facility',
      type: 'IN_PERSON' as const,
      price: '$50',
      max_spots: 12,
      registered_spots: 3,
      registration_deadline: new Date(futureDate6.getTime() - 7 * 24 * 60 * 60 * 1000),
      min_gpa: 3.2,
      class_years: ['Sophomore', 'Junior', 'Senior'],
      required_roles: ['Duelist', 'Controller', 'Initiator', 'Sentinel']
    },
    {
      title: 'Rocket League Freestyle & Competitive Hybrid Team',
      description: 'Unique team combining competitive play with freestyle skills.',
      long_description: 'Looking for players who excel in both competitive Rocket League and freestyle mechanics. This innovative program prepares players for both tournament play and content creation.',
      game_id: rocketLeagueGame.id,
      school_id: createdSchools[2]!.id,
      coach_id: createdCoaches[2]!.id,
      date: futureDate7,
      time_start: '16:30',
      time_end: '19:30',
      location: 'Online - Custom Training Servers',
      type: 'ONLINE' as const,
      price: 'Free',
      max_spots: 10,
      registered_spots: 7,
      registration_deadline: new Date(futureDate7.getTime() - 3 * 24 * 60 * 60 * 1000),
      min_gpa: 2.8,
      class_years: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
      required_roles: ['All positions', 'Freestyle skills preferred']
    },
    {
      title: 'Smash Ultimate Character Specialist Program',
      description: 'Master your main and develop secondary characters.',
      long_description: 'An advanced program focusing on character mastery, matchup optimization, and developing a strong secondary character. Perfect for players looking to take their game to the next level.',
      game_id: smashGame.id,
      school_id: createdSchools[3]!.id,
      coach_id: createdCoaches[3]!.id,
      date: futureDate8,
      time_start: '14:00',
      time_end: '18:00',
      location: 'Digital Sports Gaming Lab B',
      type: 'IN_PERSON' as const,
      price: '$15',
      max_spots: 8,
      registered_spots: 2,
      registration_deadline: new Date(futureDate8.getTime() - 6 * 24 * 60 * 60 * 1000),
      min_gpa: 3.0,
      class_years: ['Sophomore', 'Junior', 'Senior'],
      required_roles: ['Character specialists', 'High-level players only']
    },
    {
      title: 'Overwatch 2 Tank Masterclass Tryouts',
      description: 'Specialized training for tank players only.',
      long_description: 'Elite Gaming College presents an intensive tank-focused program. Learn advanced positioning, resource management, and shot-calling from professional coaches.',
      game_id: overwatchGame.id,
      school_id: createdSchools[4]!.id,
      coach_id: createdCoaches[4]!.id,
      date: futureDate9,
      time_start: '19:00',
      time_end: '22:00',
      location: 'Hybrid - Elite Gaming Center & Discord',
      type: 'HYBRID' as const,
      price: '$20',
      max_spots: 6,
      registered_spots: 1,
      registration_deadline: new Date(futureDate9.getTime() - 4 * 24 * 60 * 60 * 1000),
      min_gpa: 3.3,
      class_years: ['Junior', 'Senior'],
      required_roles: ['Tank mains only', 'Diamond+ preferred']
    },
    {
      title: 'VALORANT Late Night Grind Sessions',
      description: 'Evening practice sessions for working students.',
      long_description: 'Perfect for students with day jobs or heavy course loads. Late evening practice sessions focusing on ranked climb and team coordination.',
      game_id: valorantGame.id,
      school_id: createdSchools[0]!.id,
      coach_id: createdCoaches[0]!.id,
      date: new Date(futureDate1.getTime() + 3 * 24 * 60 * 60 * 1000),
      time_start: '21:00',
      time_end: '23:30',
      location: 'Online - Team Voice Chat',
      type: 'ONLINE' as const,
      price: 'Free',
      max_spots: 20,
      registered_spots: 14,
      registration_deadline: new Date(futureDate1.getTime() + 1 * 24 * 60 * 60 * 1000),
      min_gpa: 2.5,
      class_years: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
      required_roles: ['All roles', 'Night owls preferred']
    },
    {
      title: 'Rocket League 1v1 Duel Specialists',
      description: 'Master the art of 1v1 Rocket League gameplay.',
      long_description: 'Focused training on 1v1 mechanics, boost management, and mental fortitude. Great for players looking to improve their individual skills that translate to team play.',
      game_id: rocketLeagueGame.id,
      school_id: createdSchools[1]!.id,
      coach_id: createdCoaches[1]!.id,
      date: new Date(futureDate2.getTime() + 10 * 24 * 60 * 60 * 1000),
      time_start: '15:00',
      time_end: '17:00',
      location: 'Online - Private Servers',
      type: 'ONLINE' as const,
      price: '$8',
      max_spots: 16,
      registered_spots: 5,
      registration_deadline: new Date(futureDate2.getTime() + 8 * 24 * 60 * 60 * 1000),
      min_gpa: 2.7,
      class_years: ['Freshman', 'Sophomore', 'Junior'],
      required_roles: ['Individual skill focus', 'All ranks welcome']
    },
    {
      title: 'Smash Ultimate Regional Tournament Prep',
      description: 'Prepare for upcoming regional tournaments with our elite team.',
      long_description: 'Intensive preparation for major regional tournaments. Includes bracket analysis, character matchup studies, and high-level practice matches.',
      game_id: smashGame.id,
      school_id: createdSchools[2]!.id,
      coach_id: createdCoaches[2]!.id,
      date: new Date(futureDate3.getTime() + 5 * 24 * 60 * 60 * 1000),
      time_start: '12:00',
      time_end: '17:00',
      location: 'Gaming Academy Tournament Room',
      type: 'IN_PERSON' as const,
      price: '$30',
      max_spots: 12,
      registered_spots: 8,
      registration_deadline: new Date(futureDate3.getTime() + 2 * 24 * 60 * 60 * 1000),
      min_gpa: 3.5,
      class_years: ['Junior', 'Senior'],
      required_roles: ['Tournament experienced players', 'PR ranked preferred']
    },
    {
      title: 'Overwatch 2 Support Synergy Workshop',
      description: 'Advanced support player collaboration and positioning.',
      long_description: 'Master support hero synergies, positioning, and cooldown management. Learn how to carry games from the support role with advanced techniques.',
      game_id: overwatchGame.id,
      school_id: createdSchools[3]!.id,
      coach_id: createdCoaches[3]!.id,
      date: new Date(futureDate4.getTime() + 12 * 24 * 60 * 60 * 1000),
      time_start: '17:30',
      time_end: '20:30',
      location: 'Digital Sports Esports Arena',
      type: 'IN_PERSON' as const,
      price: 'Free',
      max_spots: 8,
      registered_spots: 6,
      registration_deadline: new Date(futureDate4.getTime() + 10 * 24 * 60 * 60 * 1000),
      min_gpa: 3.1,
      class_years: ['Sophomore', 'Junior', 'Senior'],
      required_roles: ['Support mains', 'Plat+ rank required']
    },
    {
      title: 'VALORANT IGL Leadership Development',
      description: 'Develop in-game leadership and strategic calling skills.',
      long_description: 'Specialized program for aspiring in-game leaders. Focus on strategic thinking, team communication, and mid-round adaptations.',
      game_id: valorantGame.id,
      school_id: createdSchools[4]!.id,
      coach_id: createdCoaches[4]!.id,
      date: new Date(futureDate5.getTime() + 8 * 24 * 60 * 60 * 1000),
      time_start: '16:00',
      time_end: '19:00',
      location: 'Elite Gaming Strategy Room',
      type: 'IN_PERSON' as const,
      price: '$18',
      max_spots: 6,
      registered_spots: 2,
      registration_deadline: new Date(futureDate5.getTime() + 6 * 24 * 60 * 60 * 1000),
      min_gpa: 3.4,
      class_years: ['Junior', 'Senior'],
      required_roles: ['IGL aspirants', 'Strong communication skills']
    },
    {
      title: 'Rocket League Rotation & Positioning Clinic',
      description: 'Master team rotations and optimal positioning.',
      long_description: 'Deep dive into advanced rotational concepts, field positioning, and team spacing. Essential skills for competitive team play.',
      game_id: rocketLeagueGame.id,
      school_id: createdSchools[0]!.id,
      coach_id: createdCoaches[0]!.id,
      date: new Date(futureDate6.getTime() + 4 * 24 * 60 * 60 * 1000),
      time_start: '14:30',
      time_end: '16:30',
      location: 'University Gaming Lab C',
      type: 'IN_PERSON' as const,
      price: '$12',
      max_spots: 15,
      registered_spots: 11,
      registration_deadline: new Date(futureDate6.getTime() + 2 * 24 * 60 * 60 * 1000),
      min_gpa: 2.9,
      class_years: ['Freshman', 'Sophomore', 'Junior'],
      required_roles: ['All positions', 'Team-oriented players']
    },
    {
      title: 'Smash Ultimate Newcomer Bootcamp',
      description: 'Comprehensive program for new competitive players.',
      long_description: 'Perfect for players new to competitive Smash. Covers fundamentals, character selection, basic tech, and tournament etiquette.',
      game_id: smashGame.id,
      school_id: createdSchools[1]!.id,
      coach_id: createdCoaches[1]!.id,
      date: new Date(futureDate7.getTime() + 6 * 24 * 60 * 60 * 1000),
      time_start: '13:00',
      time_end: '16:00',
      location: 'Esports Institute Beginner Lab',
      type: 'IN_PERSON' as const,
      price: 'Free',
      max_spots: 20,
      registered_spots: 16,
      registration_deadline: new Date(futureDate7.getTime() + 4 * 24 * 60 * 60 * 1000),
      min_gpa: 2.5,
      class_years: ['Freshman', 'Sophomore'],
      required_roles: ['Beginners welcome', 'All characters']
    },
    {
      title: 'Overwatch 2 VOD Review & Analysis Workshop',
      description: 'Learn to analyze gameplay footage for improvement.',
      long_description: 'Develop critical viewing skills for gameplay improvement. Learn to identify mistakes, positioning errors, and optimization opportunities through VOD analysis.',
      game_id: overwatchGame.id,
      school_id: createdSchools[2]!.id,
      coach_id: createdCoaches[2]!.id,
      date: new Date(futureDate8.getTime() + 3 * 24 * 60 * 60 * 1000),
      time_start: '18:30',
      time_end: '21:00',
      location: 'Online - Streaming Platform',
      type: 'ONLINE' as const,
      price: '$5',
      max_spots: 25,
      registered_spots: 18,
      registration_deadline: new Date(futureDate8.getTime() + 1 * 24 * 60 * 60 * 1000),
      min_gpa: 2.8,
      class_years: ['Sophomore', 'Junior', 'Senior'],
      required_roles: ['All roles', 'Analytical mindset required']
    },
    {
      title: 'VALORANT Agent Mastery Workshop',
      description: 'Deep dive into specific agent abilities and strategies.',
      long_description: 'Rotating workshops focusing on different agents each session. Master utility usage, positioning, and agent-specific strategies.',
      game_id: valorantGame.id,
      school_id: createdSchools[3]!.id,
      coach_id: createdCoaches[3]!.id,
      date: new Date(futureDate9.getTime() + 7 * 24 * 60 * 60 * 1000),
      time_start: '15:30',
      time_end: '18:00',
      location: 'Hybrid - Campus Lab & Discord',
      type: 'HYBRID' as const,
      price: '$15',
      max_spots: 14,
      registered_spots: 9,
      registration_deadline: new Date(futureDate9.getTime() + 5 * 24 * 60 * 60 * 1000),
      min_gpa: 3.0,
      class_years: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
      required_roles: ['All agents', 'Flexible players preferred']
    },
    {
      title: 'Rocket League Air Dribble & Ceiling Shot Clinic',
      description: 'Master advanced aerial mechanics and ceiling plays.',
      long_description: 'Intensive training on advanced aerial mechanics including air dribbles, ceiling shots, and flip resets. Boost your mechanical ceiling.',
      game_id: rocketLeagueGame.id,
      school_id: createdSchools[4]!.id,
      coach_id: createdCoaches[4]!.id,
      date: new Date(futureDate1.getTime() + 20 * 24 * 60 * 60 * 1000),
      time_start: '11:00',
      time_end: '14:00',
      location: 'Elite Gaming Mechanics Lab',
      type: 'IN_PERSON' as const,
      price: '$25',
      max_spots: 10,
      registered_spots: 4,
      registration_deadline: new Date(futureDate1.getTime() + 18 * 24 * 60 * 60 * 1000),
      min_gpa: 3.2,
      class_years: ['Sophomore', 'Junior', 'Senior'],
      required_roles: ['Advanced mechanics focus', 'Diamond+ preferred']
    },
    {
      title: 'Smash Ultimate Frame Data & Tech Workshop',
      description: 'Understanding frame data and advanced techniques.',
      long_description: 'Technical workshop covering frame data analysis, optimal punish options, and advanced techniques. For serious competitive players.',
      game_id: smashGame.id,
      school_id: createdSchools[0]!.id,
      coach_id: createdCoaches[0]!.id,
      date: new Date(futureDate2.getTime() + 16 * 24 * 60 * 60 * 1000),
      time_start: '16:00',
      time_end: '19:00',
      location: 'University Gaming Theory Lab',
      type: 'IN_PERSON' as const,
      price: '$22',
      max_spots: 8,
      registered_spots: 3,
      registration_deadline: new Date(futureDate2.getTime() + 14 * 24 * 60 * 60 * 1000),
      min_gpa: 3.6,
      class_years: ['Junior', 'Senior'],
      required_roles: ['Serious competitors only', 'Frame data knowledge helpful']
    },
    {
      title: 'Overwatch 2 Communication & Callouts Training',
      description: 'Master team communication and callout systems.',
      long_description: 'Essential communication skills for team play. Learn proper callout terminology, timing, and how to maintain clear communication under pressure.',
      game_id: overwatchGame.id,
      school_id: createdSchools[1]!.id,
      coach_id: createdCoaches[1]!.id,
      date: new Date(futureDate3.getTime() + 11 * 24 * 60 * 60 * 1000),
      time_start: '19:30',
      time_end: '21:30',
      location: 'Online - Team Communication Platform',
      type: 'ONLINE' as const,
      price: 'Free',
      max_spots: 18,
      registered_spots: 13,
      registration_deadline: new Date(futureDate3.getTime() + 9 * 24 * 60 * 60 * 1000),
      min_gpa: 2.6,
      class_years: ['Freshman', 'Sophomore', 'Junior', 'Senior'],
      required_roles: ['All roles', 'Good microphone required']
    },
    {
      title: 'VALORANT Mental Game & Clutch Performance',
      description: 'Develop mental resilience and clutch performance skills.',
      long_description: 'Sports psychology meets esports. Learn to manage pressure, maintain focus, and perform in clutch situations. Includes meditation and visualization techniques.',
      game_id: valorantGame.id,
      school_id: createdSchools[2]!.id,
      coach_id: createdCoaches[2]!.id,
      date: new Date(futureDate4.getTime() + 21 * 24 * 60 * 60 * 1000),
      time_start: '17:00',
      time_end: '19:30',
      location: 'Gaming Academy Wellness Center',
      type: 'IN_PERSON' as const,
      price: '$35',
      max_spots: 12,
      registered_spots: 7,
      registration_deadline: new Date(futureDate4.getTime() + 19 * 24 * 60 * 60 * 1000),
      min_gpa: 3.1,
      class_years: ['Sophomore', 'Junior', 'Senior'],
      required_roles: ['Mental performance focus', 'Open mindset required']
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

  // Seed Combines
  console.log('🎮 Seeding combines...')
  const combines = [
    {
      title: 'VALORANT Summer Showcase',
      description: 'Join our premier VALORANT combine event featuring top collegiate scouts.',
      long_description: 'The EVAL Summer Showcase is a premier scouting event where players can demonstrate their skills in front of collegiate recruiters. The event includes aim testing, team coordination exercises, and full match analysis.',
      game_id: valorantGame.id,
      date: futureDate1,
      time_start: '10:00 AM',
      time_end: '6:00 PM',
      location: 'Online - EVAL Tournament Server',
      type: 'ONLINE' as const,
      year: '2024',
      max_spots: 64,
      prize_pool: 'Scholarship Opportunities',
      format: 'Swiss System + Playoffs',
      requirements: 'Immortal 1+ or Competitive Team Experience',
      invite_only: false,
      status: 'REGISTRATION_OPEN' as const
    },
    {
      title: 'Overwatch 2 Elite Combine',
      description: 'High-level OW2 scouting event for collegiate programs.',
      long_description: 'A comprehensive scouting combine for Overwatch 2 players looking to join collegiate programs. Players will be evaluated on mechanical skill, game sense, and team coordination through various drills and scrimmages.',
      game_id: overwatchGame.id,
      date: futureDate2,
      time_start: '9:00 AM',
      time_end: '5:00 PM',
      location: 'EVAL Esports Center - Los Angeles',
      type: 'IN_PERSON' as const,
      year: '2024',
      max_spots: 36,
      prize_pool: '$2,000 + College Scout Exposure',
      format: 'Role-Based Assessment + Team Matches',
      requirements: 'Masters+ or Organized Team Experience',
      invite_only: true,
      status: 'UPCOMING' as const
    },
    {
      title: 'Rocket League Prospect Series',
      description: 'Multi-day combine event for aspiring Rocket League pros.',
      long_description: 'The Prospect Series is a comprehensive scouting combine featuring individual skill assessments, team play evaluation, and mentorship from professional coaches. Perfect for players seeking collegiate opportunities.',
      game_id: rocketLeagueGame.id,
      date: futureDate3,
      time_start: '11:00 AM',
      time_end: '7:00 PM',
      location: 'Hybrid - Multiple Locations',
      type: 'HYBRID' as const,
      year: '2024',
      max_spots: 48,
      prize_pool: 'College Scholarships + Cash Prizes',
      format: 'Individual Skills + 3v3 Tournament',
      requirements: 'Grand Champion 1+ in any playlist',
      invite_only: false,
      status: 'UPCOMING' as const
    },
    {
      title: 'Smash Ultimate College Circuit',
      description: 'Regional scouting combine for Smash Ultimate players.',
      long_description: 'A regional scouting combine focused on identifying top Smash Ultimate talent for collegiate programs. Features bracket play, friendlies with coaches, and individual skill assessment stations.',
      game_id: smashGame.id,
      date: futureDate4,
      time_start: '12:00 PM',
      time_end: '8:00 PM',
      location: 'Regional Gaming Centers',
      type: 'IN_PERSON' as const,
      year: '2024',
      max_spots: 128,
      prize_pool: 'Scholarship Consideration + Equipment',
      format: 'Round Robin Pools + Bracket',
      requirements: 'PR Ranked or Tournament Experience',
      invite_only: false,
      status: 'REGISTRATION_OPEN' as const
    },
    {
      title: 'VALORANT Women\'s Combine',
      description: 'Exclusive scouting event for women VALORANT players.',
      long_description: 'An inclusive combine event specifically designed to showcase women VALORANT players to collegiate programs. Features individual skill assessment, team play evaluation, and networking opportunities.',
      game_id: valorantGame.id,
      date: futureDate5,
      time_start: '2:00 PM',
      time_end: '6:00 PM',
      location: 'Online - Private Servers',
      type: 'ONLINE' as const,
      year: '2024',
      max_spots: 40,
      prize_pool: 'Direct College Scout Access',
      format: 'Skills Assessment + 5v5 Matches',
      requirements: 'Diamond+ or Competitive Experience',
      invite_only: true,
      status: 'UPCOMING' as const
    },
    {
      title: 'League of Legends Academy Combine',
      description: 'Premier LoL scouting event for collegiate and academy teams.',
      long_description: 'A comprehensive League of Legends combine featuring individual skill assessment, team coordination drills, and strategic gameplay evaluation. Designed for players seeking opportunities in collegiate and academy programs.',
      game_id: createdGames.find(g => g.name === 'League of Legends')?.id ?? createdGames[0]!.id,
      date: new Date(futureDate1.getTime() + 10 * 24 * 60 * 60 * 1000),
      time_start: '1:00 PM',
      time_end: '9:00 PM',
      location: 'Online - Tournament Realm',
      type: 'ONLINE' as const,
      year: '2024',
      max_spots: 80,
      prize_pool: '$5,000 + Academy Opportunities',
      format: 'Role Assessment + 5v5 Scrimmages',
      requirements: 'Master+ or Collegiate Experience',
      invite_only: false,
      status: 'REGISTRATION_OPEN' as const
    },
    {
      title: 'Multi-Game Showcase Weekend',
      description: 'Cross-game combine featuring multiple esports titles.',
      long_description: 'A unique multi-game combine where players can showcase skills across different titles. Perfect for versatile players and programs looking for adaptable talent. Features VALORANT, Overwatch 2, and Rocket League.',
      game_id: valorantGame.id,
      date: new Date(futureDate2.getTime() + 5 * 24 * 60 * 60 * 1000),
      time_start: '10:00 AM',
      time_end: '8:00 PM',
      location: 'EVAL Gaming Complex - Austin, TX',
      type: 'IN_PERSON' as const,
      year: '2024',
      max_spots: 96,
      prize_pool: 'Multi-Game Scholarships',
      format: 'Cross-Game Assessment',
      requirements: 'High rank in any supported game',
      invite_only: false,
      status: 'UPCOMING' as const
    },
    {
      title: 'International Invitational',
      description: 'Elite invite-only combine for top international talent.',
      long_description: 'An exclusive international combine featuring the best players from around the world. By invitation only, this event showcases elite talent to top-tier collegiate programs and professional organizations.',
      game_id: valorantGame.id,
      date: new Date(futureDate3.getTime() + 15 * 24 * 60 * 60 * 1000),
      time_start: '8:00 AM',
      time_end: '10:00 PM',
      location: 'EVAL International Arena - Las Vegas, NV',
      type: 'IN_PERSON' as const,
      year: '2024',
      max_spots: 32,
      prize_pool: '$10,000 + International Scholarships',
      format: 'Elite Tournament Format',
      requirements: 'Invitation Only - Top 0.1% Players',
      invite_only: true,
      status: 'UPCOMING' as const
    },
    {
      title: 'Overwatch 2 Support Specialist Combine',
      description: 'Dedicated combine for support role players in Overwatch 2.',
      long_description: 'A specialized combine focusing exclusively on support players. Features advanced positioning drills, cooldown management training, and team coordination exercises designed to showcase support skills.',
      game_id: overwatchGame.id,
      date: new Date(futureDate4.getTime() + 8 * 24 * 60 * 60 * 1000),
      time_start: '3:00 PM',
      time_end: '7:00 PM',
      location: 'Online - Dedicated Servers',
      type: 'ONLINE' as const,
      year: '2024',
      max_spots: 24,
      prize_pool: 'Support Role Scholarships',
      format: 'Role-Specific Assessment',
      requirements: 'Diamond+ Support Main',
      invite_only: false,
      status: 'REGISTRATION_OPEN' as const
    },
    {
      title: 'Rocket League Freestyle Championship',
      description: 'Showcase your mechanical skills in this freestyle-focused combine.',
      long_description: 'A unique combine that celebrates the artistic side of Rocket League. Players will be evaluated on creativity, mechanical skill, and style in addition to competitive gameplay.',
      game_id: rocketLeagueGame.id,
      date: new Date(futureDate5.getTime() + 12 * 24 * 60 * 60 * 1000),
      time_start: '6:00 PM',
      time_end: '10:00 PM',
      location: 'Online - Custom Arenas',
      type: 'ONLINE' as const,
      year: '2024',
      max_spots: 32,
      prize_pool: 'Content Creator Opportunities',
      format: 'Freestyle + Competitive',
      requirements: 'Advanced Mechanical Skills',
      invite_only: false,
      status: 'UPCOMING' as const
    },
    {
      title: 'Smash Ultimate Regional Qualifier',
      description: 'Qualify for the national championship through regional competition.',
      long_description: 'A high-stakes regional qualifier that serves as a pathway to the national championship. Top performers will receive direct invitations to the national tournament.',
      game_id: smashGame.id,
      date: new Date(futureDate6.getTime() + 6 * 24 * 60 * 60 * 1000),
      time_start: '11:00 AM',
      time_end: '9:00 PM',
      location: 'Regional Convention Center - Chicago, IL',
      type: 'IN_PERSON' as const,
      year: '2024',
      max_spots: 64,
      prize_pool: 'National Championship Qualification',
      format: 'Double Elimination Bracket',
      requirements: 'Regional PR or Tournament Wins',
      invite_only: false,
      status: 'REGISTRATION_OPEN' as const
    },
    {
      title: 'VALORANT Tactical Minds Invitational',
      description: 'Elite strategy-focused combine for IGL and tactical players.',
      long_description: 'An invitation-only combine designed for players with exceptional strategic minds and leadership qualities. Focus on tactical gameplay, mid-round calling, and team coordination.',
      game_id: valorantGame.id,
      date: new Date(futureDate7.getTime() + 18 * 24 * 60 * 60 * 1000),
      time_start: '1:00 PM',
      time_end: '8:00 PM',
      location: 'EVAL Strategy Center - New York, NY',
      type: 'IN_PERSON' as const,
      year: '2024',
      max_spots: 16,
      prize_pool: 'IGL Development Program',
      format: 'Strategic Assessment + Scrimmages',
      requirements: 'Proven IGL Experience + Radiant Rank',
      invite_only: true,
      status: 'UPCOMING' as const
    }
  ]

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
        const newCombine = await prisma.combine.create({ data: combine })
        console.log(`✅ Created combine: ${combine.title}`)
        createdCombines.push(newCombine)
      }
    } catch (error) {
      console.log(`⚠️  Could not create combine ${combine.title}:`, error)
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