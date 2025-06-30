#!/usr/bin/env tsx

/**
 * Clerk Users Reset Script
 * 
 * This script deletes all Clerk users and associated database records.
 * DEVELOPMENT ENVIRONMENT ONLY!
 */

// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import { createClerkClient } from '@clerk/backend';
import { db } from '../src/server/db';
import { env } from '../src/env.js';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  step: (msg: string) => console.log(`${colors.cyan}🔄 ${msg}${colors.reset}`),
};

async function main() {
  // Environment check
  if (env.NODE_ENV !== 'development') {
    log.error(`This script only works in development environment`);
    log.error(`Current NODE_ENV: ${env.NODE_ENV}`);
    process.exit(1);
  }

  log.info('Starting Clerk users deletion process...');
  log.info('Environment: development ✓');

  try {
    // Ensure CLERK_SECRET_KEY is available
    if (!env.CLERK_SECRET_KEY) {
      throw new Error('CLERK_SECRET_KEY is not set in environment variables');
    }
    
    // Initialize Clerk client with explicit secret key
    const client = createClerkClient({ 
      secretKey: env.CLERK_SECRET_KEY 
    });
    log.step('Initialized Clerk client');

    // Get all users
    log.step('Fetching all Clerk users...');
    const users = await client.users.getUserList({ 
      limit: 500, // Clerk's max limit per request
    });

    if (users.data.length === 0) {
      log.warning('No users found to delete');
      return;
    }

    log.info(`Found ${users.data.length} users to delete`);

    // Handle pagination if there are more users
    let allUsers = [...users.data];
    let hasNextPage = users.totalCount > users.data.length;
    let offset = users.data.length;

    while (hasNextPage) {
      log.step(`Fetching more users (offset: ${offset})...`);
      const nextPage = await client.users.getUserList({
        limit: 500,
        offset: offset,
      });
      
      allUsers = [...allUsers, ...nextPage.data];
      offset += nextPage.data.length;
      hasNextPage = offset < nextPage.totalCount;
    }

    log.info(`Total users to delete: ${allUsers.length}`);

    // Delete users one by one (Clerk doesn't have bulk delete)
    let deletedCount = 0;
    let errorCount = 0;

    for (const user of allUsers) {
      try {
        log.step(`Deleting user: ${user.emailAddresses[0]?.emailAddress ?? user.id} (${deletedCount + 1}/${allUsers.length})`);
        
        // Delete from Clerk (this will trigger webhook to clean up database)
        await client.users.deleteUser(user.id);
        
        deletedCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        errorCount++;
        log.error(`Failed to delete user ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Summary
    console.log('');
    log.success(`Deletion complete!`);
    log.info(`Successfully deleted: ${deletedCount} users`);
    if (errorCount > 0) {
      log.warning(`Failed to delete: ${errorCount} users`);
    }

    // Clean up any orphaned database records
    log.step('Cleaning up any orphaned clerk and database records...');
    
    try {
      // Get all Clerk user IDs that still exist
      const remainingUsers = await client.users.getUserList({ limit: 500 });
      const remainingClerkIds = new Set(remainingUsers.data.map(u => u.id));
      
      // Find database records that don't have corresponding Clerk users
      const orphanedPlayers = await db.player.findMany({
        where: {
          clerk_id: {
            notIn: Array.from(remainingClerkIds)
          }
        }
      });
      
      const orphanedCoaches = await db.coach.findMany({
        where: {
          clerk_id: {
            notIn: Array.from(remainingClerkIds)
          }
        }
      });

      if (orphanedPlayers.length > 0) {
        const orphanedPlayerIds = orphanedPlayers.map(p => p.id);
        
        // Delete related records first (in correct order to avoid foreign key constraints)
        log.step('Cleaning up related player data...');
        
        // Delete player-specific records without foreign key dependencies first
        await db.playerGameProfile.deleteMany({
          where: { player_id: { in: orphanedPlayerIds } }
        });
        
        await db.playerPlatformConnection.deleteMany({
          where: { player_id: { in: orphanedPlayerIds } }
        });
        
        await db.playerSocialConnection.deleteMany({
          where: { player_id: { in: orphanedPlayerIds } }
        });
        
        await db.playerRanking.deleteMany({
          where: { player_id: { in: orphanedPlayerIds } }
        });
        
        await db.playerPerformanceStats.deleteMany({
          where: { player_id: { in: orphanedPlayerIds } }
        });
        
        await db.playerLeague.deleteMany({
          where: { player_id: { in: orphanedPlayerIds } }
        });
        
        await db.tryoutRegistration.deleteMany({
          where: { player_id: { in: orphanedPlayerIds } }
        });
        
        await db.combineRegistration.deleteMany({
          where: { player_id: { in: orphanedPlayerIds } }
        });
        
        await db.teamMember.deleteMany({
          where: { player_id: { in: orphanedPlayerIds } }
        });
        
        // Finally delete the main player records
        await db.player.deleteMany({
          where: {
            clerk_id: {
              notIn: Array.from(remainingClerkIds)
            }
          }
        });
        
        log.success(`Cleaned up ${orphanedPlayers.length} orphaned player records and all related data`);
      }

      if (orphanedCoaches.length > 0) {
        const orphanedCoachIds = orphanedCoaches.map(c => c.id);
        
        // Delete related coach records (most have cascade delete, but let's be thorough)
        log.step('Cleaning up related coach data...');
        
        // Delete records that might not have cascade delete
        await db.team.deleteMany({
          where: { coach_id: { in: orphanedCoachIds } }
        });
        
        await db.combine.deleteMany({
          where: { coach_id: { in: orphanedCoachIds } }
        });
        
        await db.tryout.deleteMany({
          where: { coach_id: { in: orphanedCoachIds } }
        });
        
        // Finally delete the main coach records (this will cascade delete records with onDelete: Cascade)
        await db.coach.deleteMany({
          where: {
            clerk_id: {
              notIn: Array.from(remainingClerkIds)
            }
          }
        });
        
        log.success(`Cleaned up ${orphanedCoaches.length} orphaned coach records and all related data`);
      }

      if (orphanedPlayers.length === 0 && orphanedCoaches.length === 0) {
        log.info('No orphaned database records found');
      }

    } catch (dbError) {
      log.warning(`Database cleanup failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }

    console.log('');
    log.success('🎉 All Clerk users have been deleted successfully!');
    log.info('Note: Database webhooks should have automatically cleaned up associated records');
    log.info('Consider running "npm run db:reset:script" to ensure a completely clean state');

  } catch (error) {
    log.error(`Failed to delete users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 