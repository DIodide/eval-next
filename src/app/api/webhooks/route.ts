import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { clerkClient } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { db } from '@/server/db'
import type { Prisma } from '@prisma/client'
import { logUserRegistration, logError } from '@/lib/discord-logger'

// Schema for Clerk unsafe_metadata
interface ClerkUnsafeMetadata {
  userType?: 'player' | 'coach'
  // Optional additional fields
  }


export async function POST(req: NextRequest) {
    try {
        
    const evt = await verifyWebhook(req)

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data
    const eventType = evt.type
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    console.log('Webhook payload:', evt.data)
    
    // Handle user.created
    if (eventType === 'user.created') {
      const userData = evt.data 
      const unsafeMetadata = userData.unsafe_metadata as unknown as ClerkUnsafeMetadata
      
      // Extract relevant data for database sync
      const userDataForSync = {
        clerk_id: userData.id,
        email: userData.email_addresses?.[0]?.email_address ?? '',
        first_name: userData.first_name,
        last_name: userData.last_name,
        image_url: userData.image_url,
        username: userData.username,
        created_at: new Date(userData.created_at),
        updated_at: new Date(userData.updated_at),
        public_metadata: userData.public_metadata,
        unsafe_metadata: userData.unsafe_metadata,
        // User type from unsafe metadata
        user_type: unsafeMetadata.userType,
        // Additional useful fields
        external_id: userData.external_id,
        last_sign_in_at: userData.last_sign_in_at ? new Date(userData.last_sign_in_at) : null,
        two_factor_enabled: userData.two_factor_enabled,
        password_enabled: userData.password_enabled,
      }
      
      console.log('User created - data for sync:', userDataForSync)
      
      // Update publicMetadata with userType for secure access
      if (unsafeMetadata.userType) {
        try {
          const client = await clerkClient()
          await client.users.updateUser(userData.id, {
            publicMetadata: {
              ...userData.public_metadata,
              userType: unsafeMetadata.userType
            }
          })
          console.log(`Updated publicMetadata with userType: ${unsafeMetadata.userType}`)
        } catch (error) {
          console.error('Error updating publicMetadata:', error)
        }
      }
      
      // TODO: Add database sync logic here based on user type
      if (unsafeMetadata.userType === 'player') {
        try {
          const newPlayer = await db.player.create({
            data: {
              clerk_id: userData.id,
              email: userData.email_addresses[0]?.email_address ?? '',
              first_name: userData.first_name ?? '',
              last_name: userData.last_name ?? '',
              username: userData.username,
              image_url: userData.image_url,
              external_accounts: userData.external_accounts as unknown as Prisma.InputJsonValue,
              // Optional fields - can be updated later through user profile
              school: null,
              school_id: null,
              gpa: null,
              transcript: null,
              class_year: null,
              guardian_email: null,
            }
          })
          console.log('Player created successfully:', newPlayer.id)

          // Log player registration to Discord
          try {
            await logUserRegistration({
              userType: 'player',
              registrationMethod: 'Clerk Webhook',
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              userName: userData.first_name && userData.last_name 
                ? `${userData.first_name} ${userData.last_name}` 
                : userData.username ?? null,
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error('Discord notification failed for player registration:', discordError);
          }
        } catch (error) {
          console.error('Error creating player:', error)
          
          // Log error to Discord
          try {
            await logError({
              error: error instanceof Error ? error.message : 'Unknown error creating player',
              errorCode: 'PLAYER_CREATION_FAILED',
              endpoint: 'webhooks/user.created',
              severity: 'high',
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error('Discord error logging failed:', discordError);
          }
          
          // You might want to throw an error here to trigger webhook retry
          // throw error
        }
      } else if (unsafeMetadata.userType === 'coach') {
        try {
          const newCoach = await db.coach.create({
            data: {
              clerk_id: userData.id,
              email: userData.email_addresses[0]?.email_address ?? '',
              first_name: userData.first_name ?? '',
              last_name: userData.last_name ?? '',
              username: userData.username ?? '',
              image_url: userData.image_url,
              external_accounts: userData.external_accounts as unknown as Prisma.InputJsonValue,
              school: '', // TODO: This should be set during onboarding
              school_id: null, // Optional - can be linked later
            }
          })
          console.log('Coach created successfully:', newCoach.id)

          // Log coach registration to Discord
          try {
            await logUserRegistration({
              userType: 'coach',
              registrationMethod: 'Clerk Webhook',
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              userName: userData.first_name && userData.last_name 
                ? `${userData.first_name} ${userData.last_name}` 
                : userData.username ?? null,
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error('Discord notification failed for coach registration:', discordError);
          }
        } catch (error) {
          console.error('Error creating coach:', error)
          
          // Log error to Discord
          try {
            await logError({
              error: error instanceof Error ? error.message : 'Unknown error creating coach',
              errorCode: 'COACH_CREATION_FAILED',
              endpoint: 'webhooks/user.created',
              severity: 'high',
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error('Discord error logging failed:', discordError);
          }
          
          // You might want to throw an error here to trigger webhook retry
          // throw error
        }
      } else {
        // Log discord sign-in userType
        try {
          await logUserRegistration({
            userType: "not selected",
            registrationMethod: 'Clerk Webhook',
            userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              userName: userData.first_name && userData.last_name 
                ? `${userData.first_name} ${userData.last_name}` 
                : userData.username ?? null,
            timestamp: new Date(),
          });
        } catch (discordError) {
          console.error('Discord error logging failed:', discordError);
        }
        
        console.warn('Unknown user type or missing userType in unsafe_metadata')
      }
    }
    
    // Handle user.updated
    if (eventType === 'user.updated') {
      const userData = evt.data 
      const unsafeMetadata = userData.unsafe_metadata as unknown as ClerkUnsafeMetadata
      
      // Extract relevant data for database sync
      const userDataForSync = {
        clerk_id: userData.id,
        email: userData.email_addresses?.[0]?.email_address ?? '',
        first_name: userData.first_name,
        last_name: userData.last_name,
        image_url: userData.image_url,
        username: userData.username,
        created_at: new Date(userData.created_at),
        updated_at: new Date(userData.updated_at),
        public_metadata: userData.public_metadata,
          unsafe_metadata: userData.unsafe_metadata,
        // User type from unsafe metadata
        user_type: unsafeMetadata.userType,
        // Additional useful fields
        external_id: userData.external_id,
        last_sign_in_at: userData.last_sign_in_at ? new Date(userData.last_sign_in_at) : null,
        two_factor_enabled: userData.two_factor_enabled,
        password_enabled: userData.password_enabled,
      }
      
      console.log('User updated - data for sync:', userDataForSync)
      
      // TODO: Add database sync logic here based on user type
      if (unsafeMetadata.userType === 'player') {
        try {
          const updatedPlayer = await db.player.update({
            where: { clerk_id: userData.id },
            data: {
              email: userData.email_addresses[0]?.email_address ?? '',
              first_name: userData.first_name ?? '',
              last_name: userData.last_name ?? '',
              username: userData.username,
              image_url: userData.image_url,
              external_accounts: userData.external_accounts as unknown as Prisma.InputJsonValue,
              // Note: We only update basic fields from Clerk
              // School info, GPA, etc. should be updated through your app's profile system
            }
          })
          console.log('Player updated successfully:', updatedPlayer.id)
        } catch (error) {
          console.error('Error updating player:', error)
          
          // Log error to Discord
          try {
            await logError({
              error: error instanceof Error ? error.message : 'Unknown error updating player',
              errorCode: 'PLAYER_UPDATE_FAILED',
              endpoint: 'webhooks/user.updated',
              severity: 'medium',
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error('Discord error logging failed:', discordError);
          }
          
          // You might want to throw an error here to trigger webhook retry
          // throw error
        }
          
      } else if (unsafeMetadata.userType === 'coach') {
        try {
          const updatedCoach = await db.coach.update({
            where: { clerk_id: userData.id },
            data: {
              email: userData.email_addresses[0]?.email_address ?? '',
              first_name: userData.first_name ?? '',
              last_name: userData.last_name ?? '',
              username: userData.username ?? '',
              image_url: userData.image_url,
              external_accounts: userData.external_accounts as unknown as Prisma.InputJsonValue,
              // Note: We only update basic fields from Clerk
              // School info should be updated through your app's profile system
            }
          })
          console.log('Coach updated successfully:', updatedCoach.id)
        } catch (error) {
          console.error('Error updating coach:', error)
          
          // Log error to Discord
          try {
            await logError({
              error: error instanceof Error ? error.message : 'Unknown error updating coach',
              errorCode: 'COACH_UPDATE_FAILED',
              endpoint: 'webhooks/user.updated',
              severity: 'medium',
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error('Discord error logging failed:', discordError);
          }
          
          // You might want to throw an error here to trigger webhook retry
          // throw error
        }
      } else {
        console.warn('Unknown user type or missing userType in unsafe_metadata')
      }
    }
    
    // Handle user.deleted
    if (eventType === 'user.deleted') {
      const userData = evt.data
      
      console.log('User deleted:', { userId: userData.id })
      
      try {
        // First, find existing records to get their emails before deletion
        const existingPlayer = await db.player.findFirst({
          where: { clerk_id: userData.id },
          select: { id: true, email: true }
        })
        
        const existingCoach = await db.coach.findFirst({
          where: { clerk_id: userData.id },
          select: { id: true, email: true }
        })
        
        // Delete records that match both clerk_id and email for precise deletion
        let deletedPlayer = { count: 0 }
        let deletedCoach = { count: 0 }
        
        if (existingPlayer) {
          deletedPlayer = await db.player.deleteMany({
            where: { 
              AND: [
                { clerk_id: userData.id },
                { email: existingPlayer.email }
              ]
            }
          })
          console.log(`Player deleted successfully (${deletedPlayer.count} records) with email: ${existingPlayer.email}`)
        }
        
        if (existingCoach) {
          deletedCoach = await db.coach.deleteMany({
            where: { 
              AND: [
                { clerk_id: userData.id },
                { email: existingCoach.email }
              ]
            }
          })
          console.log(`Coach deleted successfully (${deletedCoach.count} records) with email: ${existingCoach.email}`)
        }
        
        if (deletedPlayer.count === 0 && deletedCoach.count === 0) {
          console.warn('No user found to delete with clerk_id:', userData.id)
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        
        // Log error to Discord
        try {
          await logError({
            error: error instanceof Error ? error.message : 'Unknown error deleting user',
            errorCode: 'USER_DELETION_FAILED',
            endpoint: 'webhooks/user.deleted',
            severity: 'high',
            userId: userData.id,
            timestamp: new Date(),
          });
        } catch (discordError) {
          console.error('Discord error logging failed:', discordError);
        }
        
        // You might want to throw an error here to trigger webhook retry
        // throw error
      }
      
      // Alternative approach: Soft delete by adding a 'deleted' field to your schema
      // await db.player.updateMany({
      //   where: { clerk_id: userData.id },
      //   data: { deleted: true }
      // })
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    
    // Log webhook verification error to Discord
    try {
      await logError({
        error: err instanceof Error ? err.message : 'Unknown webhook verification error',
        errorCode: 'WEBHOOK_VERIFICATION_FAILED',
        endpoint: 'webhooks',
        severity: 'high',
        timestamp: new Date(),
      });
    } catch (discordError) {
      console.error('Discord error logging failed:', discordError);
    }
    
    return new Response('Error verifying webhook', { status: 400 })
  }
}