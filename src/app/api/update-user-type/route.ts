import { auth, clerkClient } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { type Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json() as { userType?: string };
    const { userType } = body;

    // Validate userType
    if (!userType || !['player', 'coach'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid userType. Must be "player" or "coach"' },
        { status: 400 }
      );
    }

    // Get current user data from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    
    // Check if userType is already set in Clerk metadata
    const currentUserType = clerkUser.unsafeMetadata?.userType as string;
    if (currentUserType) {
      return NextResponse.json(
        { error: 'User type is already set and cannot be changed' },
        { status: 403 }
      );
    }

    // Check if user already exists in database as player or coach
    const [existingPlayer, existingCoach] = await Promise.all([
      db.player.findUnique({
        where: { clerk_id: userId },
        select: { id: true }
      }),
      db.coach.findUnique({
        where: { clerk_id: userId },
        select: { id: true }
      })
    ]);

    if (existingPlayer || existingCoach) {
      return NextResponse.json(
        { error: 'User already exists in database and cannot change type' },
        { status: 403 }
      );
    }

    // Update the user's unsafeMetadata in Clerk
    await client.users.updateUserMetadata(userId, {
      unsafeMetadata: {
        userType: userType
      }
    });

    // Create database record based on userType (similar to webhook logic)
    if (userType === 'player') {
      try {
        const newPlayer = await db.player.create({
          data: {
            clerk_id: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
            first_name: clerkUser.firstName ?? '',
            last_name: clerkUser.lastName ?? '',
            username: clerkUser.username,
            image_url: clerkUser.imageUrl,
            external_accounts: clerkUser.externalAccounts as unknown as Prisma.InputJsonValue,
            // Optional fields - can be updated later through user profile
            school: null,
            school_id: null,
            gpa: null,
            transcript: null,
            class_year: null,
            guardian_email: null,
          }
        });
        console.log('Player created successfully:', newPlayer.id);
      } catch (error) {
        console.error('Error creating player:', error);
        // Rollback Clerk metadata if database creation fails
        await client.users.updateUserMetadata(userId, {
          unsafeMetadata: {}
        });
        return NextResponse.json(
          { error: 'Failed to create player profile' },
          { status: 500 }
        );
      }
    } else if (userType === 'coach') {
      try {
        const newCoach = await db.coach.create({
          data: {
            clerk_id: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
            first_name: clerkUser.firstName ?? '',
            last_name: clerkUser.lastName ?? '',
            username: clerkUser.username ?? '',
            image_url: clerkUser.imageUrl,
            external_accounts: clerkUser.externalAccounts as unknown as Prisma.InputJsonValue,
            school: '', // TODO: This should be set during onboarding
            school_id: null, // Optional - can be linked later
          }
        });
        console.log('Coach created successfully:', newCoach.id);
      } catch (error) {
        console.error('Error creating coach:', error);
        // Rollback Clerk metadata if database creation fails
        await client.users.updateUserMetadata(userId, {
          unsafeMetadata: {}
        });
        return NextResponse.json(
          { error: 'Failed to create coach profile' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ 
      success: true, 
      userType,
      message: `${userType === 'coach' ? 'Coach' : 'Player'} profile created successfully`
    });

  } catch (error) {
    console.error('Error updating user type:', error);
    return NextResponse.json(
      { error: 'Failed to update user type' },
      { status: 500 }
    );
  }
} 