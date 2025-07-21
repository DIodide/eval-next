import { ValorantTestComponent } from "@/components/valorant/ValorantTestComponent";

export default function TestValorantIntegrationPage() {
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-8">
        <h1 className="font-orbitron mb-2 text-3xl font-bold text-white">
          Valorant OAuth Integration Test
        </h1>
        <p className="font-rajdhani text-gray-400">
          This page tests the Valorant OAuth integration functionality.
        </p>
      </div>

      <div className="space-y-6">
        <ValorantTestComponent />

        <div className="rounded-lg border border-blue-600/30 bg-blue-900/20 p-4">
          <h3 className="mb-2 font-medium text-blue-200">
            Testing Instructions:
          </h3>
          <ol className="list-inside list-decimal space-y-1 text-sm text-blue-300">
            <li>First, go to Profile → External Accounts</li>
            <li>Connect your Valorant account through OAuth</li>
            <li>Return to this page to verify the PUUID was fetched</li>
            <li>
              Use the &quot;Refresh&quot; button to test the refresh
              functionality
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
