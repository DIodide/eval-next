/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
 
 
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/prefer-optional-chain */

// This test is for running the player profile test suite.

import { NextResponse } from "next/server";
import { playerProfileRouter } from "@/server/api/routers/playerProfile";
import { db } from "@/server/db";

// Test results interface
interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  duration?: number;
}

// Mock auth context for testing
const createTestContext = (userId: string) => ({
  db,
  auth: { 
    userId,
    sessionClaims: {},
    sessionId: "test-session",
    getToken: async () => null,
    has: () => false,
    debug: () => ({}),
  } as any,
  headers: new Headers(),
});

export async function GET() {
  const results: TestResult[] = [];
  const testUserId = `test-user-${Date.now()}`;
  let testPlayer: any = null;

  try {
    console.log("🧪 Starting Comprehensive Player Profile Tests...\n");

    // Setup: Create test player
    try {
      testPlayer = await db.player.create({
        data: {
          clerk_id: testUserId,
          email: `test-${Date.now()}@example.com`,
          first_name: "Test",
          last_name: "Player",
          username: `testplayer-${Date.now()}`,
        },
      });
      results.push({
        name: "Setup: Create Test Player",
        status: 'PASS',
        message: `Created player with ID: ${testPlayer.id}`,
      });
    } catch (error) {
      results.push({
        name: "Setup: Create Test Player",
        status: 'FAIL',
        message: `Failed to create test player: ${(error as Error).message}`,
      });
      return NextResponse.json({ success: false, results });
    }

    const ctx = createTestContext(testUserId);
    const caller = playerProfileRouter.createCaller(ctx);

    // Test 1: getProfile
    try {
      const startTime = Date.now();
      const profile = await caller.getProfile();
      const duration = Date.now() - startTime;
      
      if (profile && profile.id === testPlayer.id) {
        results.push({
          name: "getProfile",
          status: 'PASS',
          message: `Successfully retrieved profile for player ${profile.id}`,
          duration,
        });
      } else {
        results.push({
          name: "getProfile",
          status: 'FAIL',
          message: "Profile returned but doesn't match expected player",
          duration,
        });
      }
    } catch (error) {
      results.push({
        name: "getProfile",
        status: 'FAIL',
        message: `Error: ${(error as Error).message}`,
      });
    }

    // Test 2: updateProfile
    try {
      const startTime = Date.now();
      const updateData = {
        first_name: "Updated",
        last_name: "TestPlayer",
        bio: "This is a test bio for comprehensive testing",
        location: "Test City, Test State",
        gpa: 3.75,
      };
      
      const updatedProfile = await caller.updateProfile(updateData);
      const duration = Date.now() - startTime;
      
      if (updatedProfile && 
          updatedProfile.first_name === "Updated" && 
          updatedProfile.bio === "This is a test bio for comprehensive testing") {
        results.push({
          name: "updateProfile",
          status: 'PASS',
          message: "Successfully updated player profile with all fields",
          duration,
        });
      } else {
        results.push({
          name: "updateProfile",
          status: 'FAIL',
          message: "Profile updated but values don't match expected",
          duration,
        });
      }
    } catch (error) {
      results.push({
        name: "updateProfile",
        status: 'FAIL',
        message: `Error: ${(error as Error).message}`,
      });
    }

    // Test 3: updatePlatformConnection - Steam
    try {
      const startTime = Date.now();
      const connection = await caller.updatePlatformConnection({
        platform: "steam",
        username: "teststeamuser123",
      });
      const duration = Date.now() - startTime;
      
      if (connection && connection.platform === "steam" && connection.username === "teststeamuser123") {
        results.push({
          name: "updatePlatformConnection (Steam)",
          status: 'PASS',
          message: `Created Steam connection: ${connection.username}`,
          duration,
        });
      } else {
        results.push({
          name: "updatePlatformConnection (Steam)",
          status: 'FAIL',
          message: "Connection created but values don't match",
          duration,
        });
      }
    } catch (error) {
      results.push({
        name: "updatePlatformConnection (Steam)",
        status: 'FAIL',
        message: `Error: ${(error as Error).message}`,
      });
    }

    // Test 4: updatePlatformConnection - Update existing
    try {
      const startTime = Date.now();
      const connection = await caller.updatePlatformConnection({
        platform: "steam",
        username: "updatedsteamuser456",
      });
      const duration = Date.now() - startTime;
      
      if (connection && connection.username === "updatedsteamuser456") {
        results.push({
          name: "updatePlatformConnection (Update)",
          status: 'PASS',
          message: `Updated Steam connection: ${connection.username}`,
          duration,
        });
      } else {
        results.push({
          name: "updatePlatformConnection (Update)",
          status: 'FAIL',
          message: "Connection updated but username doesn't match",
          duration,
        });
      }
    } catch (error) {
      results.push({
        name: "updatePlatformConnection (Update)",
        status: 'FAIL',
        message: `Error: ${(error as Error).message}`,
      });
    }

    // Test 5: updateSocialConnection
    try {
      const startTime = Date.now();
      const socialConnection = await caller.updateSocialConnection({
        platform: "discord",
        username: "testuser#1234",
      });
      const duration = Date.now() - startTime;
      
      if (socialConnection && socialConnection.platform === "discord") {
        results.push({
          name: "updateSocialConnection (Discord)",
          status: 'PASS',
          message: `Created Discord connection: ${socialConnection.username}`,
          duration,
        });
      } else {
        results.push({
          name: "updateSocialConnection (Discord)",
          status: 'FAIL',
          message: "Social connection created but values don't match",
          duration,
        });
      }
    } catch (error) {
      results.push({
        name: "updateSocialConnection (Discord)",
        status: 'FAIL',
        message: `Error: ${(error as Error).message}`,
      });
    }

    // Test 6: getAvailableGames
    try {
      const startTime = Date.now();
      const games = await caller.getAvailableGames();
      const duration = Date.now() - startTime;
      
      if (Array.isArray(games)) {
        results.push({
          name: "getAvailableGames",
          status: 'PASS',
          message: `Retrieved ${games.length} available games`,
          duration,
        });
      } else {
        results.push({
          name: "getAvailableGames",
          status: 'FAIL',
          message: "Games returned but not in expected format",
          duration,
        });
      }
    } catch (error) {
      results.push({
        name: "getAvailableGames",
        status: 'FAIL',
        message: `Error: ${(error as Error).message}`,
      });
    }

    // Test 7: removePlatformConnection
    try {
      const startTime = Date.now();
      const result = await caller.removePlatformConnection({
        platform: "steam",
      });
      const duration = Date.now() - startTime;
      
      if (result && result.success) {
        results.push({
          name: "removePlatformConnection",
          status: 'PASS',
          message: "Successfully removed Steam connection",
          duration,
        });
      } else {
        results.push({
          name: "removePlatformConnection",
          status: 'FAIL',
          message: "Operation completed but success flag not set",
          duration,
        });
      }
    } catch (error) {
      results.push({
        name: "removePlatformConnection",
        status: 'FAIL',
        message: `Error: ${(error as Error).message}`,
      });
    }

    // Test 8: removeSocialConnection
    try {
      const startTime = Date.now();
      const result = await caller.removeSocialConnection({
        platform: "discord",
      });
      const duration = Date.now() - startTime;
      
      if (result && result.success) {
        results.push({
          name: "removeSocialConnection",
          status: 'PASS',
          message: "Successfully removed Discord connection",
          duration,
        });
      } else {
        results.push({
          name: "removeSocialConnection",
          status: 'FAIL',
          message: "Operation completed but success flag not set",
          duration,
        });
      }
    } catch (error) {
      results.push({
        name: "removeSocialConnection",
        status: 'FAIL',
        message: `Error: ${(error as Error).message}`,
      });
    }

    // Test 9: Error handling - Invalid user
    try {
      const invalidCtx = createTestContext("invalid-user-id");
      const invalidCaller = playerProfileRouter.createCaller(invalidCtx);
      
      try {
        await invalidCaller.getProfile();
        results.push({
          name: "Error Handling - Invalid User",
          status: 'FAIL',
          message: "Expected error but operation succeeded",
        });
      } catch (error) {
        const message = (error as Error).message;
        if (message.includes("Player profile not found") || message.includes("FORBIDDEN")) {
          results.push({
            name: "Error Handling - Invalid User",
            status: 'PASS',
            message: "Correctly rejected invalid user",
          });
        } else {
          results.push({
            name: "Error Handling - Invalid User",
            status: 'FAIL',
            message: `Unexpected error: ${message}`,
          });
        }
      }
    } catch (error) {
      results.push({
        name: "Error Handling - Invalid User",
        status: 'FAIL',
        message: `Setup error: ${(error as Error).message}`,
      });
    }

  } catch (error) {
    results.push({
      name: "Test Suite Error",
      status: 'FAIL',
      message: `Critical error: ${(error as Error).message}`,
    });
  } finally {
    // Cleanup
    if (testPlayer) {
      try {
        // Delete connections first
        await db.playerPlatformConnection.deleteMany({
          where: { player_id: testPlayer.id },
        });
        await db.playerSocialConnection.deleteMany({
          where: { player_id: testPlayer.id },
        });
        // Delete player
        await db.player.delete({
          where: { id: testPlayer.id },
        });
        
        results.push({
          name: "Cleanup",
          status: 'PASS',
          message: "Successfully cleaned up test data",
        });
      } catch (error) {
        results.push({
          name: "Cleanup",
          status: 'FAIL',
          message: `Cleanup failed: ${(error as Error).message}`,
        });
      }
    }
  }

  // Calculate summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log("\n📊 Test Results Summary:");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${total}`);
  console.log(`💯 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    const duration = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${icon} ${result.name}${duration}: ${result.message}`);
  });

  return NextResponse.json({
    success: failed === 0,
    summary: {
      passed,
      failed,
      total,
      successRate: ((passed / total) * 100).toFixed(1) + '%'
    },
    results,
  });
} 