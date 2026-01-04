"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { GraduationCap, MapPin, Search, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CollegesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [hasScholarships, setHasScholarships] = useState<boolean | undefined>(
    undefined,
  );
  const [inUS, setInUS] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(0);
  const limit = 24;

  // Get available games
  const { data: games } = api.tryouts.getGames.useQuery();

  // Search colleges
  const { data: searchResults, isLoading } =
    api.schoolProfile.searchColleges.useQuery(
      {
        search: searchQuery || undefined,
        gameIds: selectedGames.length > 0 ? selectedGames : undefined,
        hasScholarships: hasScholarships,
        inUS: inUS,
        limit,
        offset: page * limit,
      },
      {
        staleTime: 30 * 1000,
      },
    );

  const handleGameToggle = (gameId: string) => {
    if (selectedGames.includes(gameId)) {
      setSelectedGames(selectedGames.filter((id) => id !== gameId));
    } else {
      setSelectedGames([...selectedGames, gameId]);
    }
    setPage(0); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGames([]);
    setHasScholarships(undefined);
    setInUS(undefined);
    setPage(0);
  };

  const hasActiveFilters =
    selectedGames.length > 0 ||
    hasScholarships !== undefined ||
    inUS !== undefined ||
    searchQuery;

  const totalPages = searchResults ? Math.ceil(searchResults.total / limit) : 0;

  return (
    <div className="min-h-screen bg-black/95 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 py-12">
        <div className="container mx-auto px-6">
          <h1 className="font-orbitron mb-4 text-4xl font-black text-white md:text-5xl">
            COLLEGE DIRECTORY
          </h1>
          <p className="font-rajdhani text-xl text-gray-300">
            Discover colleges and universities with esports programs
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6 rounded-lg border border-gray-800 bg-gray-900/50 p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-orbitron text-lg font-bold text-white">
                  FILTERS
                </h2>
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="font-rajdhani text-xs text-gray-400 hover:text-white"
                  >
                    Clear
                  </Button>
                )}
              </div>

              {/* Search */}
              <div>
                <label className="font-rajdhani mb-2 block text-sm font-medium text-gray-300">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="College name, location..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(0);
                    }}
                    className="border-gray-700 bg-gray-800/50 pl-10 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20"
                  />
                </div>
              </div>

              {/* Games Filter */}
              {games && games.length > 0 && (
                <div>
                  <label className="font-rajdhani mb-2 block text-sm font-medium text-gray-300">
                    Games Supported
                  </label>
                  <div className="max-h-64 space-y-2 overflow-y-auto">
                    {games.map((game) => (
                      <label
                        key={game.id}
                        className="flex cursor-pointer items-center space-x-2"
                      >
                        <Checkbox
                          checked={selectedGames.includes(game.id)}
                          onCheckedChange={() => handleGameToggle(game.id)}
                          className="border-gray-600"
                        />
                        <span className="font-rajdhani text-sm text-gray-300">
                          {game.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Scholarships Filter */}
              <div>
                <label className="font-rajdhani mb-2 block text-sm font-medium text-gray-300">
                  Scholarships
                </label>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center space-x-2">
                    <Checkbox
                      checked={hasScholarships === true}
                      onCheckedChange={(checked) =>
                        setHasScholarships(checked ? true : undefined)
                      }
                      className="border-gray-600"
                    />
                    <span className="font-rajdhani text-sm text-gray-300">
                      Has Scholarships
                    </span>
                  </label>
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <label className="font-rajdhani mb-2 block text-sm font-medium text-gray-300">
                  Location
                </label>
                <div className="space-y-2">
                  <label className="flex cursor-pointer items-center space-x-2">
                    <Checkbox
                      checked={inUS === true}
                      onCheckedChange={(checked) =>
                        setInUS(checked ? true : undefined)
                      }
                      className="border-gray-600"
                    />
                    <span className="font-rajdhani text-sm text-gray-300">
                      In United States
                    </span>
                  </label>
                  <label className="flex cursor-pointer items-center space-x-2">
                    <Checkbox
                      checked={inUS === false}
                      onCheckedChange={(checked) =>
                        setInUS(checked ? false : undefined)
                      }
                      className="border-gray-600"
                    />
                    <span className="font-rajdhani text-sm text-gray-300">
                      Outside United States
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-orbitron text-2xl font-bold text-white">
                  COLLEGES
                </h2>
                {searchResults && (
                  <p className="font-rajdhani text-sm text-gray-400">
                    {searchResults.total} college
                    {searchResults.total !== 1 ? "s" : ""} found
                  </p>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="py-12 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent"></div>
                <p className="font-rajdhani mt-2 text-gray-400">Loading...</p>
              </div>
            )}

            {/* Results Grid */}
            {!isLoading &&
              searchResults &&
              searchResults.schools.length > 0 && (
                <>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {searchResults.schools.map((college) => (
                      <Link
                        key={college.id}
                        href={`/profiles/school/${college.id}`}
                      >
                        <Card className="group h-full border-gray-800 bg-gray-900/50 transition-all hover:border-cyan-400/50 hover:bg-gray-900">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              {college.logo_url ? (
                                <Image
                                  src={college.logo_url}
                                  alt={college.name}
                                  width={64}
                                  height={64}
                                  className="h-16 w-16 flex-shrink-0 rounded object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-purple-500 to-blue-600">
                                  <GraduationCap className="h-8 w-8 text-white" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h3 className="font-orbitron mb-1 truncate font-semibold text-white group-hover:text-cyan-400">
                                  {college.name}
                                </h3>
                                <div className="mb-2 flex items-center space-x-1 text-sm text-gray-400">
                                  <MapPin className="h-4 w-4" />
                                  <span className="font-rajdhani">
                                    {college.location}
                                    {college.state && `, ${college.state}`}
                                  </span>
                                </div>
                                <div className="font-rajdhani mb-2 text-xs text-gray-500">
                                  {college.type.replace("_", " ")}
                                </div>
                                {college.esports_titles &&
                                  college.esports_titles.length > 0 && (
                                    <div className="mb-2 flex flex-wrap gap-1">
                                      {college.esports_titles
                                        .slice(0, 3)
                                        .map((title, idx) => (
                                          <span
                                            key={idx}
                                            className="rounded bg-cyan-400/20 px-2 py-0.5 text-xs text-cyan-400"
                                          >
                                            {title}
                                          </span>
                                        ))}
                                      {college.esports_titles.length > 3 && (
                                        <span className="rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-400">
                                          +{college.esports_titles.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                {college.scholarships_available && (
                                  <div className="flex items-center space-x-1 text-xs font-semibold text-green-400">
                                    <Trophy className="h-3 w-3" />
                                    <span>Scholarships Available</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center space-x-2">
                      <Button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        Previous
                      </Button>
                      <span className="font-rajdhani text-sm text-gray-400">
                        Page {page + 1} of {totalPages}
                      </span>
                      <Button
                        onClick={() =>
                          setPage((p) => Math.min(totalPages - 1, p + 1))
                        }
                        disabled={page >= totalPages - 1}
                        variant="outline"
                        className="border-gray-700 text-gray-300 hover:bg-gray-800"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}

            {/* No Results */}
            {!isLoading &&
              searchResults &&
              searchResults.schools.length === 0 && (
                <div className="py-12 text-center">
                  <GraduationCap className="mx-auto mb-4 h-12 w-12 text-gray-600" />
                  <p className="font-rajdhani text-lg text-gray-400">
                    No colleges found
                  </p>
                  <p className="font-rajdhani mt-2 text-sm text-gray-500">
                    Try adjusting your filters or search query
                  </p>
                  {hasActiveFilters && (
                    <Button
                      onClick={clearFilters}
                      className="font-rajdhani mt-4"
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
