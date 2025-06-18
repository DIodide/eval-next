import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  User, 
  Search, 
  Mail, 
  Calendar,
  School,
  Star,
  Trophy,
  ExternalLink
} from "lucide-react";
import { db } from "@/server/db";

async function getPlayers(searchTerm?: string) {
  try {
    const where = searchTerm ? {
      OR: [
        { email: { contains: searchTerm, mode: 'insensitive' as const } },
        { first_name: { contains: searchTerm, mode: 'insensitive' as const } },
        { last_name: { contains: searchTerm, mode: 'insensitive' as const } },
        { username: { contains: searchTerm, mode: 'insensitive' as const } },
        { school: { contains: searchTerm, mode: 'insensitive' as const } },
      ]
    } : {};

    const [players, totalCount] = await Promise.all([
      db.player.findMany({
        where,
        take: 50,
        orderBy: { created_at: 'desc' },
      }),
      db.player.count({ where }),
    ]);

    return {
      players,
      totalCount,
    };
  } catch (error) {
    console.error('Error fetching players:', error);
    return {
      players: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch players'
    };
  }
}

function getClassYearBadge(classYear: number | null) {
  if (!classYear) return null;
  
  const currentYear = new Date().getFullYear();
  const isGraduated = classYear < currentYear;
  
  return (
    <Badge className={isGraduated ? "bg-gray-500/20 text-gray-400" : "bg-blue-500/20 text-blue-400"}>
      <School className="h-3 w-3 mr-1" />
      Class of {classYear}
    </Badge>
  );
}

export default async function PlayersManagementPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const searchTerm = resolvedSearchParams.search;
  const { players, totalCount, error } = await getPlayers(searchTerm);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Player Management</h1>
            <p className="text-gray-400">Manage all player profiles and data</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          Total Players: {totalCount}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Search Players</CardTitle>
          <CardDescription className="text-gray-400">
            Search by name, email, username, or school
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/admin/database/players" method="get" className="flex space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                name="search"
                placeholder="Search players..."
                defaultValue={searchTerm}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Button type="submit">Search</Button>
            {searchTerm && (
              <Button variant="outline" asChild>
                <a href="/admin/database/players">Clear</a>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-400">
              <span>Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Players List */}
      <div className="grid gap-4">
        {players.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6 text-center">
              <User className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No players found</h3>
              <p className="text-gray-400">
                {searchTerm ? 'Try adjusting your search criteria.' : 'No players are currently registered.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          players.map((player) => (
            <Card key={player.id} className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {player.image_url ? (
                      <img
                        src={player.image_url}
                        alt={`${player.first_name} ${player.last_name}`}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-white">
                          {player.first_name} {player.last_name}
                        </h3>
                        {getClassYearBadge(player.class_year ? Number(player.class_year) : null)}
                        {player.gpa && (
                          <Badge className="bg-purple-500/20 text-purple-400">
                            <Star className="h-3 w-3 mr-1" />
                            GPA: {player.gpa?.toString()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{player.email}</span>
                        </div>
                        {player.username && (
                          <div>@{player.username}</div>
                        )}
                        {player.school && (
                          <div className="flex items-center space-x-1">
                            <School className="h-3 w-3" />
                            <span>{player.school}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div className="flex items-center space-x-1 justify-end">
                      <Calendar className="h-3 w-3" />
                      <span>Joined: {new Date(player.created_at).toLocaleDateString()}</span>
                    </div>
                    {player.updated_at && player.updated_at !== player.created_at && (
                      <div>
                        Updated: {new Date(player.updated_at).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="text-xs text-gray-500 font-mono">
                        ID: {player.id}
                      </div>
                      {player.username && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/profiles/player/${player.username}`} target="_blank">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Profile
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Additional Info */}
                {(player.guardian_email || player.transcript) && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="grid gap-2 text-sm">
                      {player.guardian_email && (
                        <div className="text-gray-400">
                          <span className="font-medium">Guardian:</span> {player.guardian_email}
                        </div>
                      )}
                      {player.transcript && (
                        <div className="text-gray-400">
                          <span className="font-medium">Transcript:</span> On file
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Info */}
      {players.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-400">
              Showing {players.length} of {totalCount} players
              {players.length < totalCount && (
                <div className="mt-2">
                  <Button variant="outline" disabled>
                    Load More (Not implemented)
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 