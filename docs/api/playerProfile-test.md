# Player Profile tRPC Test Page

## Overview

The Player Profile test page (`/test-playerprofile`) is a comprehensive testing interface for all playerProfile tRPC endpoints. It provides an interactive way to test each endpoint with proper forms and displays results/errors in real-time.

## Features

- **Authentication Status**: Shows current login status
- **Interactive Forms**: Pre-filled forms for testing mutations
- **Real-time Results**: Displays successful responses and error messages
- **Loading States**: Visual feedback during API calls
- **Clear Results**: Button to reset all test results

## Available Tests

### Query Endpoints

- **getProfile**: Fetch the current player's profile
- **getAvailableGames**: Get all available games for selection

### Mutation Endpoints

- **updateProfile**: Update player profile information with form inputs
- **updatePlatformConnection**: Add/update gaming platform connections
- **updateSocialConnection**: Add/update social media connections
- **removePlatformConnection**: Remove gaming platform connections
- **removeSocialConnection**: Remove social media connections

## Usage

1. Navigate to `/test-playerprofile` in your browser
2. Ensure you're logged in as a player account
3. Use the pre-filled forms to test mutations or click query buttons directly
4. View results in the "Test Results" section at the bottom
5. Use "Clear Results" to reset between tests

## Authentication Requirements

All endpoints require:

- User to be authenticated via Clerk
- User to have a valid player profile in the database
- User to be of type "player" (not school/admin)

## Test Data

The form comes pre-populated with test data:

- Profile: John Doe, University of Gaming student
- Platform: Steam account "testplayer123"
- Social: Discord account "testplayer#1234"

You can modify these values before testing to see different scenarios.

## Error Handling

The page displays both successful results (green) and errors (red) with full JSON output for debugging purposes.
