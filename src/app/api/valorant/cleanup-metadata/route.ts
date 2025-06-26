import { NextRequest, NextResponse } from 'next/server';
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
    
    // Check if user still has a Valorant external account
    const hasValorantAccount = user.externalAccounts.some(
      account => account.provider === 'custom_valorant'
    );
    
    const hasValorantMetadata = !!user.publicMetadata?.valorant;
    
    if (!hasValorantAccount && hasValorantMetadata) {
      // Remove Valorant metadata since no external account exists
      const updatedMetadata = { ...user.publicMetadata };
      delete updatedMetadata.valorant;
      
      await client.users.updateUserMetadata(userId, {
        publicMetadata: updatedMetadata,
      });

      console.log(`🧹 Cleaned up Valorant metadata for user: ${userId}`);
      
      return NextResponse.json({ 
        success: true, 
        cleaned: true,
        message: 'Valorant metadata cleaned up successfully' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      cleaned: false,
      message: hasValorantAccount 
        ? 'User still has Valorant account - no cleanup needed'
        : 'No Valorant metadata found - nothing to clean'
    });
  } catch (error) {
    console.error('❌ Error cleaning up Valorant metadata:', error);
    return NextResponse.json({ 
      error: 'Failed to cleanup metadata' 
    }, { status: 500 });
  }
} 