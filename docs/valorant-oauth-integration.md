# Valorant OAuth Integration

This document describes the Valorant OAuth integration that enhances the external accounts functionality by fetching and storing user PUUIDs from the Riot API.

## 🎯 Overview

The integration allows players to connect their Valorant accounts through OAuth and automatically fetches their PUUID, game name, and tag line from the Riot API. This data is stored in Clerk's publicMetadata for future use in game-specific features.

## 🔧 Implementation Components

### 1. API Route: `/api/riot/process-oauth`

**File**: `src/app/api/riot/process-oauth/route.ts`

- Handles POST requests to process Valorant OAuth connections
- Uses Clerk's `getUserOauthAccessToken()` to retrieve OAuth access tokens
- Calls Riot's `/riot/account/v1/accounts/me` endpoint
- Stores PUUID, gameName, and tagLine in user's publicMetadata

### 2. TypeScript Types

**File**: `src/types/valorant.ts`

- Defines `ValorantMetadata` interface
- Extends Clerk's `UserPublicMetadata` type
- Provides type safety for Valorant-related data

### 3. Enhanced External Accounts Page

**File**: `src/app/dashboard/player/profile/external-accounts/page.tsx`

**New Features**:

- OAuth callback handling with `?callback=true` parameter
- Automatic PUUID fetching after successful Valorant connection
- Enhanced UI displaying Riot ID (gameName#tagLine)
- "PUUID Linked" badge for verified connections

### 4. Player Profile Router Extensions

**File**: `src/server/api/routers/playerProfile.ts`

**New Procedures**:

- `getValorantData`: Retrieves Valorant metadata from user's publicMetadata
- `refreshValorantData`: Triggers refresh of Valorant data via API call

### 5. Test Components

**Files**:

- `src/components/valorant/ValorantTestComponent.tsx`
- `src/app/admin/test-valorant-integration/page.tsx`

## 🔄 User Flow

1. **Player navigates to External Accounts**

   - `/dashboard/player/profile/external-accounts`

2. **Player clicks "Connect Account" for Valorant**

   - OAuth flow redirects to Riot for authentication
   - User grants permissions

3. **OAuth callback processing**

   - Clerk receives OAuth callback with access token
   - Page detects `?callback=true` parameter
   - Automatically calls `/api/riot/process-oauth`

4. **PUUID retrieval and storage**

   - API uses OAuth token to call Riot's accounts/me endpoint
   - PUUID, gameName, and tagLine are stored in publicMetadata
   - Success notification shows connected Riot ID

5. **Enhanced display**
   - Connected account shows actual Riot ID (gameName#tagLine)
   - "PUUID Linked" badge indicates successful data retrieval
   - Test page available at `/admin/test-valorant-integration`

## 🔐 Security Features

- **OAuth Token Security**: Tokens handled server-side only via Clerk's backend SDK
- **Error Handling**: Comprehensive error handling for API failures
- **Rate Limiting**: Built on Riot's API rate limits
- **Data Privacy**: Only essential account info stored

## 🚀 Future Enhancements

With PUUID now available, the platform can integrate:

- **Match History**: Fetch recent Valorant matches
- **Rank Information**: Display current competitive rank
- **Statistics**: Show performance metrics
- **Team Formation**: Match players based on skill level
- **Tournament Integration**: Verify player identity for competitions

## 🧪 Testing

### Manual Testing

1. Navigate to External Accounts page
2. Connect Valorant account
3. Verify PUUID is fetched and displayed
4. Check test page at `/admin/test-valorant-integration`

### API Testing

```bash
# After connecting Valorant account
curl -X POST /api/riot/process-oauth \
  -H "Content-Type: application/json"
```

## 📝 Environment Requirements

Ensure the following are configured in your Clerk dashboard:

- **Custom OAuth Provider**: Set up for Riot Games
- **OAuth Scopes**: Appropriate permissions for account data
- **Redirect URLs**: Include callback URLs for OAuth flow

## 🔧 Configuration

The integration requires:

1. Riot Games OAuth provider configured in Clerk
2. Proper OAuth scopes for account access
3. Redirect URLs configured for the OAuth flow

## 📚 References

- [Clerk OAuth Documentation](https://clerk.com/docs/custom-flows/oauth-connections)
- [Riot API Documentation](https://developer.riotgames.com/)
- [getUserOauthAccessToken Reference](https://clerk.com/docs/references/backend/user/get-user-oauth-access-token)
