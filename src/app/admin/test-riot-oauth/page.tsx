'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LoaderIcon, 
  CheckIcon, 
  XIcon, 
  PlayIcon, 
  InfoIcon,
  UserIcon,
  KeyIcon,
  DatabaseIcon,
  RefreshCwIcon
} from 'lucide-react';

interface TestResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
  error?: string;
  timestamp: string;
}

interface RiotOAuthResponse {
  success: boolean;
  puuid?: string;
  gameName?: string;
  tagLine?: string;
  error?: string;
}

interface UserMetadataResponse {
  publicMetadata?: {
    valorant?: {
      puuid: string;
      gameName: string;
      tagLine: string;
      lastUpdated: string;
    };
  };
  error?: string;
}

export default function TestRiotOAuthPage() {
  const [testUserId, setTestUserId] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const addTestResult = (result: Omit<TestResult, 'timestamp'>) => {
    const newResult: TestResult = {
      ...result,
      timestamp: new Date().toISOString(),
    };
    setTestResults(prev => [newResult, ...prev]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test the process-oauth endpoint directly
  const testProcessOAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/riot/process-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json() as RiotOAuthResponse;

      if (response.ok && data.success) {
        addTestResult({
          success: true,
          message: `Successfully processed Riot OAuth for ${data.gameName}#${data.tagLine}`,
          data: {
            puuid: data.puuid,
            gameName: data.gameName,
            tagLine: data.tagLine,
          },
        });
      } else {
        addTestResult({
          success: false,
          message: 'Failed to process Riot OAuth',
          error: data.error ?? 'Unknown error',
        });
      }
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Error calling process-oauth endpoint',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test user's Valorant metadata retrieval
  const testUserMetadata = async () => {
    if (!testUserId.trim()) {
      addTestResult({
        success: false,
        message: 'User ID is required',
        error: 'Please provide a valid user ID',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/debug-user?userId=${encodeURIComponent(testUserId)}`, {
        method: 'GET',
      });

      const data = await response.json() as UserMetadataResponse;

      if (response.ok) {
        const valorantData = data.publicMetadata?.valorant;
        
        if (valorantData) {
          addTestResult({
            success: true,
            message: `Found Valorant metadata for user ${testUserId}`,
            data: {
              puuid: valorantData.puuid,
              gameName: valorantData.gameName,
              tagLine: valorantData.tagLine,
              lastUpdated: valorantData.lastUpdated,
            },
          });
        } else {
          addTestResult({
            success: false,
            message: `No Valorant metadata found for user ${testUserId}`,
            error: 'User has not connected their Valorant account or metadata was not saved',
          });
        }
      } else {
        addTestResult({
          success: false,
          message: 'Failed to fetch user metadata',
          error: data.error ?? 'Unknown error',
        });
      }
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Error fetching user metadata',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test metadata cleanup for a specific user
  const testMetadataCleanup = async () => {
    if (!testUserId.trim()) {
      addTestResult({
        success: false,
        message: 'User ID is required for cleanup test',
        error: 'Please provide a valid user ID',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/cleanup-valorant-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: testUserId }),
      });

      const data = await response.json() as {
        success?: boolean;
        cleaned?: boolean;
        hadMetadata?: boolean;
        hasExternalAccount?: boolean;
        message?: string;
        error?: string;
      };

      if (response.ok && data.success) {
        addTestResult({
          success: true,
          message: `Cleanup test completed for user ${testUserId}`,
          data: {
            cleaned: data.cleaned,
            hadMetadata: data.hadMetadata,
            hasExternalAccount: data.hasExternalAccount,
            message: data.message,
          },
        });
      } else {
        addTestResult({
          success: false,
          message: 'Failed to test cleanup',
          error: data.error ?? 'Unknown error',
        });
      }
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Error calling cleanup test endpoint',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test Riot API connection directly
  const testRiotAPIConnection = async () => {
    setIsLoading(true);
    try {
      // This is a simplified test - in production you'd need a valid access token
      const response = await fetch('https://americas.api.riotgames.com/riot/account/v1/accounts/me', {
        method: 'HEAD', // Just test if the endpoint is reachable
      });

      if (response.status === 401) {
        addTestResult({
          success: true,
          message: 'Riot API endpoint is reachable (401 expected without auth)',
          data: {
            status: response.status,
            statusText: response.statusText,
          },
        });
      } else {
        addTestResult({
          success: false,
          message: `Unexpected response from Riot API: ${response.status}`,
          error: `Status: ${response.status} ${response.statusText}`,
        });
      }
    } catch (error) {
      addTestResult({
        success: false,
        message: 'Failed to connect to Riot API',
        error: error instanceof Error ? error.message : 'Network error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Run all tests sequentially
  const runAllTests = async () => {
    setIsLoading(true);
    addTestResult({
      success: true,
      message: 'Starting comprehensive test suite...',
    });

    // Test 1: API Connection
    await testRiotAPIConnection();
    
    // Test 2: OAuth Process (if user is authenticated)
    await testProcessOAuth();

    // Test 3: User metadata test (if userId provided)
    if (testUserId.trim()) {
      await testUserMetadata();
      await testMetadataCleanup();
    }

    addTestResult({
      success: true,
      message: 'Test suite completed',
    });
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron font-bold text-white mb-2">
          Riot OAuth Integration Tests
        </h1>
        <p className="text-gray-400 font-rajdhani">
          Comprehensive testing suite for the Valorant OAuth integration functionality.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="oauth-test">OAuth Tests</TabsTrigger>
          <TabsTrigger value="user-data">User Data</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center gap-2">
                <InfoIcon className="h-5 w-5" />
                Integration Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
                  <h3 className="text-blue-200 font-medium mb-2">OAuth Flow</h3>
                  <p className="text-gray-400 text-sm">
                    Users connect their Riot account through Clerk&apos;s OAuth system
                  </p>
                </div>
                <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                  <h3 className="text-green-200 font-medium mb-2">API Integration</h3>
                  <p className="text-gray-400 text-sm">
                    Fetch PUUID and game data from Riot&apos;s /accounts/me endpoint
                  </p>
                </div>
                <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
                  <h3 className="text-purple-200 font-medium mb-2">Data Storage</h3>
                  <p className="text-gray-400 text-sm">
                    Store Valorant metadata in Clerk&apos;s publicMetadata
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <h3 className="text-yellow-200 font-medium mb-2">Test Requirements</h3>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• User must have a connected Valorant account with valid OAuth token</li>
                  <li>• API route must be accessible and properly configured</li>
                  <li>• Clerk must be configured with Riot OAuth provider</li>
                  <li>• Valid Riot API credentials must be available</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oauth-test" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white font-orbitron flex items-center gap-2">
                  <PlayIcon className="h-5 w-5" />
                  OAuth Process Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Test the /api/riot/process-oauth endpoint directly. This requires an authenticated user with a connected Valorant account.
                </p>
                <Button 
                  onClick={testProcessOAuth} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Test Process OAuth
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white font-orbitron flex items-center gap-2">
                  <DatabaseIcon className="h-5 w-5" />
                  Riot API Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Test connectivity to Riot's API endpoints. This checks if the API is reachable.
                </p>
                <Button 
                  onClick={testRiotAPIConnection} 
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? (
                    <>
                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <DatabaseIcon className="h-4 w-4 mr-2" />
                      Test API Connection
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-data" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white font-orbitron flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                User Metadata Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId" className="text-gray-300">User ID</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="Enter Clerk user ID to test"
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <p className="text-gray-400 text-sm">
                Enter a Clerk user ID to check if they have Valorant metadata stored. You can find user IDs in the admin users page.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={testUserMetadata} 
                  disabled={isLoading || !testUserId.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <KeyIcon className="h-4 w-4 mr-2" />
                      Check User Metadata
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={testMetadataCleanup} 
                  disabled={isLoading || !testUserId.trim()}
                  variant="outline"
                  className="w-full border-orange-600 text-orange-400 hover:bg-orange-900/20"
                >
                  {isLoading ? (
                    <>
                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <RefreshCwIcon className="h-4 w-4 mr-2" />
                      Test Cleanup
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-3 mt-4">
                <p className="text-orange-300 text-sm">
                  <strong>Cleanup Test:</strong> This will check if a user has orphaned Valorant metadata (metadata without an external account) and clean it up if found.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white font-orbitron">Test Results</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-gray-300">
                  {testResults.length} results
                </Badge>
                <Button onClick={clearResults} variant="outline" size="sm">
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No test results yet. Run some tests to see results here.
                </p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 ${
                        result.success 
                          ? 'border-green-600/30 bg-green-900/20' 
                          : 'border-red-600/30 bg-red-900/20'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckIcon className="h-4 w-4 text-green-400" />
                          ) : (
                            <XIcon className="h-4 w-4 text-red-400" />
                          )}
                          <span className={`font-medium ${
                            result.success ? 'text-green-200' : 'text-red-200'
                          }`}>
                            {result.message}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {result.error && (
                        <div className="mt-2 p-2 bg-red-950/50 rounded text-red-300 text-sm">
                          <strong>Error:</strong> {result.error}
                        </div>
                      )}
                      
                      {result.data && (
                        <div className="mt-2 p-2 bg-gray-900/50 rounded">
                          <Textarea
                            value={JSON.stringify(result.data, null, 2)}
                            readOnly
                            className="min-h-[100px] bg-transparent border-none text-xs font-mono text-gray-300"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 