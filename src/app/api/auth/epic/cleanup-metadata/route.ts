import { type NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    console.log(`[CLEANUP] User ${userId}: checking Epic Games cleanup`);
    
    // Check current state
    const hasEpicAccount = user.externalAccounts.some(acc => 
      acc.provider === 'custom_epic_games' || acc.provider === 'epic_games'
    );
    const hasEpicMetadata = !!user.publicMetadata?.epicGames;
    
    console.log(`[CLEANUP] State: account=${hasEpicAccount}, metadata=${hasEpicMetadata}`);

    // Simple logic: if metadata exists but no external account, remove it
    if (!hasEpicAccount && hasEpicMetadata) {
      console.log(`[CLEANUP] Removing orphaned Epic Games metadata`);
      
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          ...user.publicMetadata,
          epicGames: null
        }
      });

      console.log(`[CLEANUP] ✅ Epic Games metadata removed`);
      return NextResponse.json({ 
        success: true, 
        cleaned: true,
        message: 'Epic Games metadata cleaned up successfully'
      });
    }

    console.log(`[CLEANUP] No Epic Games cleanup needed`);
    return NextResponse.json({ 
      success: true, 
      cleaned: false,
      message: hasEpicAccount ? 'User has Epic Games account' : 'No Epic Games metadata to clean'
    });
  } catch (error) {
    console.error('[CLEANUP] Epic Games error:', error);
    return NextResponse.json({ error: 'Epic Games cleanup failed' }, { status: 500 });
  }
} 