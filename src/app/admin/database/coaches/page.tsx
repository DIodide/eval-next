import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  Search,
  Mail,
  Calendar,
  School,
  ExternalLink,
} from "lucide-react";
import { db } from "@/server/db";

async function getCoaches(searchTerm?: string) {
  try {
    const where = searchTerm
      ? {
          OR: [
            { email: { contains: searchTerm, mode: "insensitive" as const } },
            {
              first_name: {
                contains: searchTerm,
                mode: "insensitive" as const,
              },
            },
            {
              last_name: { contains: searchTerm, mode: "insensitive" as const },
            },
            {
              username: { contains: searchTerm, mode: "insensitive" as const },
            },
            { school: { contains: searchTerm, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [coaches, totalCount] = await Promise.all([
      db.coach.findMany({
        where,
        take: 50,
        orderBy: { created_at: "desc" },
      }),
      db.coach.count({ where }),
    ]);

    return {
      coaches,
      totalCount,
    };
  } catch (error) {
    console.error("Error fetching coaches:", error);
    return {
      coaches: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : "Failed to fetch coaches",
    };
  }
}

export default async function CoachesManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const searchTerm = resolvedSearchParams.search;
  const { coaches, totalCount, error } = await getCoaches(searchTerm);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Coach Management</h1>
            <p className="text-gray-400">Manage all coach profiles and data</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">Total Coaches: {totalCount}</div>
      </div>

      {/* Search and Filters */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Search Coaches</CardTitle>
          <CardDescription className="text-gray-400">
            Search by name, email, username, or school
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action="/admin/database/coaches"
            method="get"
            className="flex space-x-4"
          >
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                name="search"
                placeholder="Search coaches..."
                defaultValue={searchTerm}
                className="border-gray-600 bg-gray-700 pl-10 text-white"
              />
            </div>
            <Button type="submit">Search</Button>
            {searchTerm && (
              <Button variant="outline" asChild>
                <a href="/admin/database/coaches">Clear</a>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-500/20 bg-red-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-400">
              <span>Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coaches List */}
      <div className="grid gap-4">
        {coaches.length === 0 ? (
          <Card className="border-gray-700 bg-gray-800">
            <CardContent className="pt-6 text-center">
              <GraduationCap className="mx-auto mb-4 h-12 w-12 text-gray-500" />
              <h3 className="mb-2 text-lg font-medium text-white">
                No coaches found
              </h3>
              <p className="text-gray-400">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "No coaches are currently registered."}
              </p>
            </CardContent>
          </Card>
        ) : (
          coaches.map((coach) => (
            <Card key={coach.id} className="border-gray-700 bg-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {coach.image_url ? (
                      <img
                        src={coach.image_url}
                        alt={`${coach.first_name} ${coach.last_name}`}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-600">
                        <GraduationCap className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <h3 className="font-medium text-white">
                          {coach.first_name} {coach.last_name}
                        </h3>
                        <Badge className="bg-green-500/20 text-green-400">
                          <GraduationCap className="mr-1 h-3 w-3" />
                          Coach
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{coach.email}</span>
                        </div>
                        {coach.username && <div>@{coach.username}</div>}
                        {coach.school && (
                          <div className="flex items-center space-x-1">
                            <School className="h-3 w-3" />
                            <span>{coach.school}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div className="flex items-center justify-end space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Joined:{" "}
                        {new Date(coach.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {coach.updated_at &&
                      coach.updated_at !== coach.created_at && (
                        <div>
                          Updated:{" "}
                          {new Date(coach.updated_at).toLocaleDateString()}
                        </div>
                      )}
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="font-mono text-xs text-gray-500">
                        ID: {coach.id}
                      </div>
                      {coach.school_id && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`/profiles/school/${coach.school_id}`}
                            target="_blank"
                          >
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View School
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {coach.school && (
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <div className="grid gap-2 text-sm">
                      <div className="text-gray-400">
                        <span className="font-medium">Institution:</span>{" "}
                        {coach.school}
                      </div>
                      {coach.school_id && (
                        <div className="text-gray-400">
                          <span className="font-medium">School ID:</span>{" "}
                          {coach.school_id}
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
      {coaches.length > 0 && (
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-400">
              Showing {coaches.length} of {totalCount} coaches
              {coaches.length < totalCount && (
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
