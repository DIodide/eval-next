import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { clerkClient } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { db } from '@/server/db'
import { Prisma } from '@prisma/client'

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
        } catch (error) {
          console.error('Error creating player:', error)
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
        } catch (error) {
          console.error('Error creating coach:', error)
          // You might want to throw an error here to trigger webhook retry
          // throw error
        }
      } else {
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
          // You might want to throw an error here to trigger webhook retry
          // throw error
        }
      } else {
        console.warn('Unknown user type or missing userType in unsafe_metadata')
      }
    }
    
    // Handle user.deleted
    if (eventType === 'user.deleted') {
      console.log('User deleted:', { userId: evt.data.id })
      
      try {
        // Try to delete from both player and coach tables
        // Only one will succeed, the other will fail silently
        
        const deletedPlayer = await db.player.deleteMany({
          where: { clerk_id: evt.data.id }
        })
        
        const deletedCoach = await db.coach.deleteMany({
          where: { clerk_id: evt.data.id }
        })
        
        if (deletedPlayer.count > 0) {
          console.log('Player deleted successfully')
        } else if (deletedCoach.count > 0) {
          console.log('Coach deleted successfully')  
        } else {
          console.warn('No user found to delete with clerk_id:', evt.data.id)
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        // You might want to throw an error here to trigger webhook retry
        // throw error
      }
      
      // Alternative approach: Soft delete by adding a 'deleted' field to your schema
      // await db.player.updateMany({
      //   where: { clerk_id: evt.data.id },
      //   data: { deleted: true }
      // })
    }

    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}