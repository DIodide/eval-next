import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-orbitron font-bold text-white">
          Messages
        </h1>
        <p className="text-gray-400 mt-2">
          Communicate with college recruiters and coaches
        </p>
      </div>

      {/* Messages Layout */}
      <div className="grid gap-6 lg:grid-cols-3 h-[600px]">
        {/* Conversations List */}
        <Card className="bg-[#1a1a2e] border-gray-800 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Conversations</h3>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                New
              </Button>
            </div>
            
            <Input 
              placeholder="Search conversations..." 
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
            />

            {/* Empty State */}
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-800 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">No conversations yet</p>
            </div>
          </div>
        </Card>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="bg-[#1a1a2e] border-gray-800 h-full">
            {/* Empty Chat State */}
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m2-4h4a2 2 0 012 2v6a2 2 0 01-2 2h-4m-6-6v2a2 2 0 002 2h2m2-4V6a2 2 0 012-2h2a2 2 0 012 2v2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Start a Conversation</h3>
                  <p className="text-gray-400 text-sm mt-2">
                    Select a conversation or reach out to a recruiter to get started
                  </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Browse Recruiters
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Message Guidelines */}
      <Card className="bg-[#1a1a2e] border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Messaging Guidelines</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <h4 className="font-medium text-white">Be Professional</h4>
            <p className="text-sm text-gray-400">Use proper grammar and maintain a respectful tone</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-white">Be Concise</h4>
            <p className="text-sm text-gray-400">Get to the point while being thorough</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-white">Be Responsive</h4>
            <p className="text-sm text-gray-400">Reply to messages within 24-48 hours</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-white">Be Authentic</h4>
            <p className="text-sm text-gray-400">Show your genuine interest and personality</p>
          </div>
        </div>
      </Card>
    </div>
  );
} 