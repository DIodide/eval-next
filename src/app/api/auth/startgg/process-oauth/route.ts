import { type NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    console.log("DEBUG 0: startgg/process-oauth");
    const authResult = await auth();
    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    // Find the start.gg external account
    console.log("DEBUG 0: user start.gg accounts", user.externalAccounts);
    const startggAccount = user.externalAccounts.find(acc => acc.provider === 'oauth_custom_start_gg');
    console.log("DEBUG 1: startggAccount", startggAccount);
    
    if (!startggAccount) {
      return NextResponse.json({ error: 'No start.gg account found' }, { status: 400 });
    }

    // Log the external account structure to understand available fields
    console.log('DEBUG 2: startggAccount structure:', JSON.stringify(startggAccount, null, 2));
    
    // Try to extract user ID from the external account
    // In Clerk, the provider user ID should be stored in the account object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const startggUserId = (startggAccount as any).externalId ?? (startggAccount as any).providerUserId ?? (startggAccount as any).id ?? '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const startggSlug = (startggAccount as any).username ?? (startggAccount as any).emailAddress ?? '';
    
    if (!startggUserId) {
      console.error('No user ID found in start.gg account data');
      return NextResponse.json({ error: 'No start.gg user ID found in external account' }, { status: 400 });
    }
    
    console.log(`Found start.gg account data: User ID: ${String(startggUserId)}, Username: ${String(startggSlug)}`);
    
    // Update user's publicMetadata with start.gg account info
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        start_gg: {
          userId: String(startggUserId),
          slug: String(startggSlug),
          lastUpdated: new Date().toISOString(),
        }
      }
    });

    console.log(`Successfully linked start.gg account for user ${userId}: ${startggSlug} (${startggUserId})`);

    return NextResponse.json({ 
      success: true,
      userId: String(startggUserId),
      slug: String(startggSlug)
    });

  } catch (error) {
    console.error('Error processing start.gg OAuth:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 