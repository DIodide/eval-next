import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TryoutsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            My Tryouts
          </h1>
          <p className="text-gray-400 mt-2">
            Track your tryout applications and status updates
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Browse Tryouts
        </Button>
      </div>

      {/* Tryouts Filter/Tabs */}
      <div className="flex gap-4">
        <Button variant="default" className="bg-blue-600">
          All Tryouts
        </Button>
        <Button variant="ghost" className="text-gray-300 hover:bg-gray-800">
          Active
        </Button>
        <Button variant="ghost" className="text-gray-300 hover:bg-gray-800">
          Pending
        </Button>
        <Button variant="ghost" className="text-gray-300 hover:bg-gray-800">
          Completed
        </Button>
      </div>

      {/* Tryouts List */}
      <div className="space-y-4">
        {/* Empty State */}
        <Card className="bg-[#1a1a2e] border-gray-800 p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">No Tryouts Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              You haven&apos;t applied to any tryouts yet. Start by browsing available opportunities and submitting your applications.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Browse Available Tryouts
            </Button>
          </div>
        </Card>

        {/* Example tryout cards (commented out for now) */}
        {/*
        <Card className="bg-[#1a1a2e] border-gray-800 p-6">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">University Name - Valorant Team</h3>
              <p className="text-gray-400">Applied 3 days ago</p>
              <Badge variant="secondary" className="bg-yellow-600 text-white">
                Under Review
              </Badge>
            </div>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              View Details
            </Button>
          </div>
        </Card>
        */}
      </div>
    </div>
  );
} 