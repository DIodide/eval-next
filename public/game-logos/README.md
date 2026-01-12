# Game Logos Directory

This directory contains SVG logo files for esports games.

## File Naming Convention

Logo files should be named using the normalized game name:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Add .svg extension

Example:
- "VALORANT" → `valorant.svg`
- "Rocket League" → `rocket-league.svg`
- "Super Smash Bros. Ultimate" → `super-smash-bros-ultimate.svg`

## Usage

Import the mapping in your code:

```typescript
import { getGameLogoPath } from "@/lib/game-logos";

const logoPath = getGameLogoPath("VALORANT");
// Returns: "/game-logos/valorant.svg"
```

## Available Games

1. Apex Legends → `/game-logos/apex-legends.svg`
2. Brawlhalla → `/game-logos/brawlhalla.svg`
3. COD Warzone → `/game-logos/cod-warzone.svg`
4. CS:GO → `/game-logos/csgo.svg`
5. Call of Duty → `/game-logos/call-of-duty.svg`
6. Chess → `/game-logos/chess.svg`
7. College Fair → `/game-logos/college-fair.svg`
8. Dota 2 → `/game-logos/dota-2.svg`
9. EA FC 24 → `/game-logos/ea-fc-24.svg`
10. FIFA 22 → `/game-logos/fifa-22.svg`
11. Fortnite → `/game-logos/fortnite.svg`
12. Forza → `/game-logos/forza.svg`
13. Halo Infinite → `/game-logos/halo-infinite.svg`
14. Hearthstone → `/game-logos/hearthstone.svg`
15. League of Legends → `/game-logos/league-of-legends.svg`
16. Legends of Runeterra → `/game-logos/legends-of-runeterra.svg`
17. Madden 22 → `/game-logos/madden-22.svg`
18. Madden NFL 24 → `/game-logos/madden-nfl-24.svg`
19. Magic the Gathering → `/game-logos/magic-the-gathering.svg`
20. Mario Kart 8 → `/game-logos/mario-kart-8.svg`
21. Marvel Rivals → `/game-logos/marvel-rivals.svg`
22. NBA 2K22 → `/game-logos/nba-2k22.svg`
23. Omega Strikers → `/game-logos/omega-strikers.svg`
24. Overwatch → `/game-logos/overwatch.svg`
25. Pokémon Unite → `/game-logos/pokmon-unite.svg`
26. Rainbow Six Siege → `/game-logos/rainbow-six-siege.svg`
27. Rocket League → `/game-logos/rocket-league.svg`
28. Smite → `/game-logos/smite.svg`
29. Splatoon 3 → `/game-logos/splatoon-3.svg`
30. Street Fighter → `/game-logos/street-fighter.svg`
31. Super Smash Bros Melee → `/game-logos/super-smash-bros-melee.svg`
32. Super Smash Bros Ultimate → `/game-logos/super-smash-bros-ultimate.svg`
33. Teamfight Tactics → `/game-logos/teamfight-tactics.svg`
34. Tekken → `/game-logos/tekken.svg`
35. Valorant → `/game-logos/valorant.svg`
36. iRacing → `/game-logos/iracing.svg`

## Adding New Logos

1. Place the SVG file in this directory with the normalized filename
2. Run `npx tsx scripts/migrate-game-logos.ts` to regenerate the mapping
3. The mapping will automatically include the new game
