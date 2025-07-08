/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
 
 
/* eslint-disable @typescript-eslint/no-explicit-any */

// This test is for validating the player profile schema and the player profile router.

import { NextResponse } from "next/server";
import { playerProfileRouter } from "@/server/api/routers/playerProfile";
import { db } from "@/server/db";

// Test results interface
interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

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
  const testUserId = `validation-test-${Date.now()}`;
  let testPlayer: any = null;

  try {
    console.log("🔍 Starting Player Profile Validation Tests...\n");

    // Setup: Create test player
    testPlayer = await db.player.create({
      data: {
        clerk_id: testUserId,
        email: `validation-test-${Date.now()}@example.com`,
        first_name: "Validation",
        last_name: "Test",
        username: `validationtest-${Date.now()}`,
      },
    });

    const ctx = createTestContext(testUserId);
    const caller = playerProfileRouter.createCaller(ctx);

    // Test 1: Invalid platform for platform connection
    try {
      await caller.updatePlatformConnection({
        platform: "invalid-platform" as any,
        username: "testuser",
      });
      results.push({
        name: "Invalid Platform Validation",
        status: 'FAIL',
        message: "Should have rejected invalid platform",
      });
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes("Invalid enum value") || message.includes("validation")) {
        results.push({
          name: "Invalid Platform Validation",
          status: 'PASS',
          message: "Correctly rejected invalid platform",
        });
      } else {
        results.push({
          name: "Invalid Platform Validation",
          status: 'FAIL',
          message: `Unexpected error: ${message}`,
        });
      }
    }

    // Test 2: Empty username for platform connection
    try {
      await caller.updatePlatformConnection({
        platform: "steam",
        username: "",
      });
      results.push({
        name: "Empty Username Validation",
        status: 'FAIL',
        message: "Should have rejected empty username",
      });
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes("String must contain at least 3 character(s)")) {
        results.push({
          name: "Empty Username Validation",
          status: 'PASS',
          message: "Correctly rejected empty username",
        });
      } else {
        results.push({
          name: "Empty Username Validation",
          status: 'FAIL',
          message: `Unexpected error: ${message}`,
        });
      }
    }

    // Test 3: Invalid GPA value
    try {
      await caller.updateProfile({
        gpa: 5.0, // Invalid - should be max 4.0
      });
      results.push({
        name: "Invalid GPA Validation",
        status: 'FAIL',
        message: "Should have rejected GPA > 4.0",
      });
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes("Number must be less than or equal to 4")) {
        results.push({
          name: "Invalid GPA Validation",
          status: 'PASS',
          message: "Correctly rejected invalid GPA",
        });
      } else {
        results.push({
          name: "Invalid GPA Validation",
          status: 'FAIL',
          message: `Unexpected error: ${message}`,
        });
      }
    }

    // Test 4: Invalid email format for guardian_email
    try {
      await caller.updateProfile({
        guardian_email: "invalid-email",
      });
      results.push({
        name: "Invalid Email Validation",
        status: 'FAIL',
        message: "Should have rejected invalid email format",
      });
    } catch (error) {
      const message = (error as Error).message;
      if (message.includes("Invalid email")) {
        results.push({
          name: "Invalid Email Validation",
          status: 'PASS',
          message: "Correctly rejected invalid email",
        });
      } else {
        results.push({
          name: "Invalid Email Validation",
          status: 'FAIL',
          message: `Unexpected error: ${message}`,
        });
      }
    }

    // Test 5: Valid empty string for optional email (should be allowed)
    try {
      await caller.updateProfile({
        guardian_email: "",
      });
      results.push({
        name: "Empty Email Allowed",
        status: 'PASS',
        message: "Correctly allowed empty email string",
      });
    } catch (error) {
      results.push({
        name: "Empty Email Allowed",
        status: 'FAIL',
        message: `Should allow empty email: ${(error as Error).message}`,
      });
    }

    // Test 6: Valid platform connection with all platforms
    const validPlatforms = ["steam", "valorant", "battlenet", "epicgames", "startgg"];
    let platformTestsPassed = 0;
    
    for (const platform of validPlatforms) {
      try {
        await caller.updatePlatformConnection({
          platform: platform as any,
          username: `testuser-${platform}`,
        });
        platformTestsPassed++;
      } catch (error) {
        // Ignore errors for this test
      }
    }

    results.push({
      name: "All Valid Platforms",
      status: platformTestsPassed === validPlatforms.length ? 'PASS' : 'FAIL',
      message: `${platformTestsPassed}/${validPlatforms.length} platforms accepted`,
    });

    // Test 7: Valid social connection with all platforms
    const validSocialPlatforms = ["github", "discord", "instagram", "twitch", "x"];
    let socialTestsPassed = 0;
    
    for (const platform of validSocialPlatforms) {
      try {
        await caller.updateSocialConnection({
          platform: platform as any,
          username: `testuser-${platform}`,
        });
        socialTestsPassed++;
      } catch (error) {
        // Ignore errors for this test
      }
    }

    results.push({
      name: "All Valid Social Platforms",
      status: socialTestsPassed === validSocialPlatforms.length ? 'PASS' : 'FAIL',
      message: `${socialTestsPassed}/${validSocialPlatforms.length} social platforms accepted`,
    });

    // Test 8: Large bio text (testing limits)
    try {
      const largeBio = "x".repeat(1000); // 1000 character bio
      await caller.updateProfile({
        bio: largeBio,
      });
      results.push({
        name: "Large Bio Text",
        status: 'PASS',
        message: "Successfully accepted large bio text",
      });
    } catch (error) {
      results.push({
        name: "Large Bio Text",
        status: 'FAIL',
        message: `Error with large bio: ${(error as Error).message}`,
      });
    }

  } catch (error) {
    results.push({
      name: "Test Setup Error",
      status: 'FAIL',
      message: `Critical error: ${(error as Error).message}`,
    });
  } finally {
    // Cleanup
    if (testPlayer) {
      try {
        await db.playerPlatformConnection.deleteMany({
          where: { player_id: testPlayer.id },
        });
        await db.playerSocialConnection.deleteMany({
          where: { player_id: testPlayer.id },
        });
        await db.player.delete({
          where: { id: testPlayer.id },
        });
      } catch (error) {
        console.error("Cleanup failed:", error);
      }
    }
  }

  // Calculate summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;

  console.log("\n🔍 Validation Test Results:");
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
  });

  console.log(`\n📊 Validation Summary: ${passed}/${total} passed (${((passed / total) * 100).toFixed(1)}%)`);

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