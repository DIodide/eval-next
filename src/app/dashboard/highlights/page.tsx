import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HighlightsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-white">
            My Highlights
          </h1>
          <p className="text-gray-400 mt-2">
            Showcase your best gaming moments and achievements
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Upload Highlight
        </Button>
      </div>

      {/* Highlights Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upload Card */}
        <Card className="bg-[#1a1a2e] border-gray-800 border-dashed border-2 p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Upload Your First Highlight</h3>
              <p className="text-gray-400 text-sm mt-2">
                Share your best plays with college recruiters
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Choose Files
            </Button>
          </div>
        </Card>

        {/* Tips Card */}
        <Card className="bg-[#1a1a2e] border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Highlight Tips</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• Keep clips under 2 minutes</li>
            <li>• Show game-changing moments</li>
            <li>• Include team coordination</li>
            <li>• Add descriptive titles</li>
            <li>• Tag relevant games</li>
          </ul>
        </Card>

        {/* Stats Card */}
        <Card className="bg-[#1a1a2e] border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Highlight Stats</h3>
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-blue-400">0</p>
              <p className="text-sm text-gray-400">Total Highlights</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">0</p>
              <p className="text-sm text-gray-400">Total Views</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">0</p>
              <p className="text-sm text-gray-400">Recruiter Views</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Empty State for highlights list */}
      <Card className="bg-[#1a1a2e] border-gray-800 p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">No Highlights Yet</h3>
          <p className="text-gray-400 max-w-md mx-auto">
            Start building your highlight reel by uploading your best gaming moments. This helps recruiters see your skills in action.
          </p>
          <div className="flex gap-4 justify-center">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Upload Video
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Learn More
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 