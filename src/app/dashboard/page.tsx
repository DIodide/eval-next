import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-orbitron font-bold text-white">
          EVAL Home
        </h1>
        <p className="text-gray-400 mt-2">
          Welcome to your esports recruitment dashboard
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Stats Cards */}
        <Card className="bg-[#1a1a2e] border-gray-800 p-6">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold text-white">Active Tryouts</h3>
            <p className="text-3xl font-bold text-blue-400">0</p>
            <p className="text-sm text-gray-400">Ongoing applications</p>
          </div>
        </Card>

        <Card className="bg-[#1a1a2e] border-gray-800 p-6">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold text-white">Profile Views</h3>
            <p className="text-3xl font-bold text-green-400">0</p>
            <p className="text-sm text-gray-400">This month</p>
          </div>
        </Card>

        <Card className="bg-[#1a1a2e] border-gray-800 p-6">
          <div className="flex flex-col space-y-2">
            <h3 className="text-lg font-semibold text-white">Messages</h3>
            <p className="text-3xl font-bold text-purple-400">0</p>
            <p className="text-sm text-gray-400">Unread</p>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-[#1a1a2e] border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <p className="text-gray-400 text-center py-8">
              No recent activity to display
            </p>
          </div>
        </Card>

        <Card className="bg-[#1a1a2e] border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upcoming Deadlines</h3>
          <div className="space-y-4">
            <p className="text-gray-400 text-center py-8">
              No upcoming deadlines
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
} 