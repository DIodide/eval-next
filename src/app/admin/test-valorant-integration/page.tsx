import { ValorantTestComponent } from "@/components/valorant/ValorantTestComponent";

export default function TestValorantIntegrationPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
          Valorant OAuth Integration Test
        </h1>
        <p className="text-gray-400 font-rajdhani">
          This page tests the Valorant OAuth integration functionality.
        </p>
      </div>

      <div className="space-y-6">
        <ValorantTestComponent />
        
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
          <h3 className="text-blue-200 font-medium mb-2">Testing Instructions:</h3>
          <ol className="text-blue-300 text-sm space-y-1 list-decimal list-inside">
            <li>First, go to Profile → External Accounts</li>
            <li>Connect your Valorant account through OAuth</li>
            <li>Return to this page to verify the PUUID was fetched</li>
            <li>Use the &quot;Refresh&quot; button to test the refresh functionality</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 