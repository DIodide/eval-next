import { type NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

interface RiotAccountResponse {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    
    console.log("DEBUG 0: user", user.externalAccounts);
      
      
    // Find the Valorant external account
    const valorantAccount = user.externalAccounts.find(
      account => account.provider === 'oauth_custom_valorant'
    );
    
    if (!valorantAccount) {
      return NextResponse.json({ error: 'No Valorant account found' }, { status: 400 });
    }

    // Get the OAuth access token using Clerk's backend method
    let accessToken: string;
    try {
      const tokenResponse = await client.users.getUserOauthAccessToken(userId, 'custom_valorant');
      
      if (!tokenResponse.data || tokenResponse.data.length === 0) {
        console.error('No OAuth access token found for Valorant account');
        return NextResponse.json({ error: 'No OAuth access token found for Valorant account' }, { status: 400 });
      }
      console.log("Found OAuth access token for Valorant account");
      
      accessToken = tokenResponse.data[0]?.token ?? '';
      
      if (!accessToken) {
        console.error('Invalid OAuth access token for Valorant account');
        return NextResponse.json({ error: 'Invalid OAuth access token for Valorant account' }, { status: 400 });
      }
    } catch (tokenError) {
      console.error('Error retrieving OAuth access token:', tokenError);
      return NextResponse.json({ error: 'Failed to retrieve OAuth access token' }, { status: 500 });
    }

    // Call Riot API to get account info
    const riotResponse = await fetch('https://americas.api.riotgames.com/riot/account/v1/accounts/me', {
      headers: {
        'Authorization': `Bearer ${String(accessToken)}`,
        'User-Agent': 'EVAL-Gaming/1.0',
      },
    });

    if (!riotResponse.ok) {
      const errorText = await riotResponse.text();
      console.error('Riot API error:', errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch Riot account data',
        details: errorText 
      }, { status: 400 });
    }

    const riotData = await riotResponse.json() as RiotAccountResponse;
    
    // Update user's publicMetadata with PUUID and game info
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        valorant: {
          puuid: riotData.puuid,
          gameName: riotData.gameName,
          tagLine: riotData.tagLine,
          lastUpdated: new Date().toISOString(),
        }
      }
    });

    console.log(`Successfully linked Valorant account for user ${userId}: ${riotData.gameName}#${riotData.tagLine}`);

    return NextResponse.json({ 
      success: true,
      puuid: riotData.puuid,
      gameName: riotData.gameName,
      tagLine: riotData.tagLine
    });

  } catch (error) {
    console.error('Error processing Riot OAuth:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 