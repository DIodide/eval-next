import { type NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the current user to check if they're an admin
    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const isAdmin = currentUser.publicMetadata?.admin === true;
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json() as { targetUserId: string };
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    const targetUser = await client.users.getUser(targetUserId);
    
    console.log(`[ADMIN CLEANUP] Admin ${userId}: cleaning Epic Games metadata for user ${targetUserId}`);
    
    // Check current state
    const hasEpicAccount = targetUser.externalAccounts.some(acc => 
      acc.provider === 'custom_epic_games' || acc.provider === 'epic_games'
    );
    const hasEpicMetadata = !!targetUser.publicMetadata?.epicGames;
    
    console.log(`[ADMIN CLEANUP] Target user state: account=${hasEpicAccount}, metadata=${hasEpicMetadata}`);

    // Force removal of Epic Games metadata (admin override)
    if (hasEpicMetadata) {
      console.log(`[ADMIN CLEANUP] Force removing Epic Games metadata for user ${targetUserId}`);
      
      await client.users.updateUserMetadata(targetUserId, {
        publicMetadata: {
          ...targetUser.publicMetadata,
          epicGames: null
        }
      });

      console.log(`[ADMIN CLEANUP] ✅ Epic Games metadata removed by admin`);
      return NextResponse.json({ 
        success: true, 
        cleaned: true,
        message: `Epic Games metadata cleaned up for user ${targetUserId}`,
        adminAction: true
      });
    }

    console.log(`[ADMIN CLEANUP] No Epic Games metadata to clean for user ${targetUserId}`);
    return NextResponse.json({ 
      success: true, 
      cleaned: false,
      message: 'No Epic Games metadata found to clean',
      adminAction: true
    });
  } catch (error) {
    console.error('[ADMIN CLEANUP] Epic Games error:', error);
    return NextResponse.json({ error: 'Admin Epic Games cleanup failed' }, { status: 500 });
  }
} 