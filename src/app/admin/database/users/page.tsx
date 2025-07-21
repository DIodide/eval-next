import Image from "next/image";
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
  Users,
  Search,
  Mail,
  Calendar,
  Shield,
  User,
  GraduationCap,
} from "lucide-react";
import { clerkClient } from "@clerk/nextjs/server";

async function getUsers(searchTerm?: string) {
  try {
    const client = await clerkClient();
    const users = await client.users.getUserList({
      limit: 50,
      ...(searchTerm && { query: searchTerm }),
    });

    return {
      users: users.data.map((user) => ({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress ?? "No email",
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        username: user.username ?? "",
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        userType:
          (user.publicMetadata?.userType as string) ||
          (user.unsafeMetadata?.userType as string) ||
          "unknown",
        isAdmin: user.privateMetadata?.role === "admin",
        externalId: user.externalId,
      })),
      totalCount: users.totalCount,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return {
      users: [],
      totalCount: 0,
      error: error instanceof Error ? error.message : "Failed to fetch users",
    };
  }
}

function getUserTypeBadge(userType: string) {
  switch (userType) {
    case "player":
      return (
        <Badge className="bg-blue-500/20 text-blue-400">
          <User className="mr-1 h-3 w-3" />
          Player
        </Badge>
      );
    case "coach":
      return (
        <Badge className="bg-green-500/20 text-green-400">
          <GraduationCap className="mr-1 h-3 w-3" />
          Coach
        </Badge>
      );
    default:
      return <Badge className="bg-gray-500/20 text-gray-400">Unknown</Badge>;
  }
}

export default async function UsersManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const searchTerm = resolvedSearchParams.search;
  const { users, totalCount, error } = await getUsers(searchTerm);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-gray-400">Manage all users in the system</p>
          </div>
        </div>
        <div className="text-sm text-gray-400">Total Users: {totalCount}</div>
      </div>

      {/* Search and Filters */}
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Search Users</CardTitle>
          <CardDescription className="text-gray-400">
            Search by email, name, or username
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action="/admin/database/users"
            method="get"
            className="flex space-x-4"
          >
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                name="search"
                placeholder="Search users..."
                defaultValue={searchTerm}
                className="border-gray-600 bg-gray-700 pl-10 text-white"
              />
            </div>
            <Button type="submit">Search</Button>
            {searchTerm && (
              <Button variant="outline" asChild>
                <a href="/admin/database/users">Clear</a>
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

      {/* Users List */}
      <div className="grid gap-4">
        {users.length === 0 ? (
          <Card className="border-gray-700 bg-gray-800">
            <CardContent className="pt-6 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-500" />
              <h3 className="mb-2 text-lg font-medium text-white">
                No users found
              </h3>
              <p className="text-gray-400">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "No users are currently registered."}
              </p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="border-gray-700 bg-gray-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-600">
                        <User className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-white">
                          {user.firstName}{" "}
                          {user.lastName || user.username || "Unknown"}
                        </h3>
                        {user.isAdmin && (
                          <Badge className="bg-red-500/20 text-red-400">
                            <Shield className="mr-1 h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                        {getUserTypeBadge(user.userType)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                        </div>
                        {user.username && <div>@{user.username}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {user.lastSignInAt && (
                      <div>
                        Last login:{" "}
                        {new Date(user.lastSignInAt).toLocaleDateString()}
                      </div>
                    )}
                    <div className="mt-1 font-mono text-xs text-gray-500">
                      ID: {user.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Info */}
      {users.length > 0 && (
        <Card className="border-gray-700 bg-gray-800">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-400">
              Showing {users.length} of {totalCount} users
              {users.length < totalCount && (
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
