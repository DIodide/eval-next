import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

interface CleanupRequest {
  userId: string;
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await auth();
    const currentUserId = authResult.userId;
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin check here when admin permissions are implemented
    // const isAdmin = await checkAdminStatus(currentUserId);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    // }

    const body = await req.json() as CleanupRequest;
    const { userId } = body;
    
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Valid User ID is required' }, { status: 400 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    // Check current state
    const hasValorantAccount = user.externalAccounts.some(
      account => account.provider === 'custom_valorant'
    );
    const hasValorantMetadata = !!user.publicMetadata?.valorant;
    
    if (!hasValorantAccount && hasValorantMetadata) {
      // Clean up orphaned metadata
      const updatedMetadata = { ...user.publicMetadata };
      delete updatedMetadata.valorant;
      
      await client.users.updateUserMetadata(userId, {
        publicMetadata: updatedMetadata,
      });

      console.log(`🧹 [ADMIN] Cleaned up Valorant metadata for user: ${userId}`);

      return NextResponse.json({ 
        success: true, 
        cleaned: true,
        hadMetadata: true,
        hasExternalAccount: false,
        message: 'Removed orphaned Valorant metadata'
      });
    }

    return NextResponse.json({ 
      success: true, 
      cleaned: false,
      hadMetadata: hasValorantMetadata,
      hasExternalAccount: hasValorantAccount,
      message: hasValorantAccount 
        ? 'User has active Valorant account - no cleanup needed'
        : hasValorantMetadata 
          ? 'Unexpected state: has metadata but cleanup not triggered'
          : 'No Valorant metadata found - nothing to clean'
    });
  } catch (error) {
    console.error('❌ Error in admin cleanup:', error);
    return NextResponse.json({ 
      error: 'Failed to cleanup metadata' 
    }, { status: 500 });
  }
} 