import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { clerkClient } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import type { Prisma } from "@prisma/client";
import { logUserRegistration, logError } from "@/lib/discord-logger";

// Schema for Clerk unsafe_metadata
interface ClerkUnsafeMetadata {
  userType?: "player" | "coach" | "league";
  // Optional additional fields
}

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data;
    const eventType = evt.type;
    console.log(
      `[WEBHOOK] Received webhook with ID ${id} and event type of ${eventType}`,
    );
    // console.log('[WEBHOOK] Webhook payload:', evt.data)

    // Handle user.created
    if (eventType === "user.created") {
      console.log("[WEBHOOK] User create event received");
      const userData = evt.data;
      const unsafeMetadata =
        userData.unsafe_metadata as unknown as ClerkUnsafeMetadata;

      // Update publicMetadata with userType for secure access
      if (unsafeMetadata.userType) {
        try {
          const client = await clerkClient();
          await client.users.updateUser(userData.id, {
            publicMetadata: {
              ...userData.public_metadata,
              userType: unsafeMetadata.userType,
            },
          });
          console.log(
            `Updated publicMetadata with userType: ${unsafeMetadata.userType}`,
          );
        } catch (error) {
          console.error("Error updating publicMetadata:", error);
        }
      }

      // Database sync logic here based on user type
      if (unsafeMetadata.userType === "player") {
        try {
          const newPlayer = await db.player.create({
            data: {
              clerk_id: userData.id,
              email: userData.email_addresses[0]?.email_address ?? "",
              first_name: userData.first_name ?? "",
              last_name: userData.last_name ?? "",
              username: userData.username,
              image_url: userData.image_url,
              external_accounts:
                userData.external_accounts as unknown as Prisma.InputJsonValue,
              // Optional fields - can be updated later through user profile
              school: null,
              school_id: null,
              gpa: null,
              transcript: null,
              class_year: null,
              guardian_email: null,
            },
          });
          console.log("Player created successfully:", newPlayer.id);

          // Log player registration to Discord
          try {
            await logUserRegistration({
              userType: "player",
              registrationMethod: "Clerk Webhook",
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              userName:
                userData.first_name && userData.last_name
                  ? `${userData.first_name} ${userData.last_name}`
                  : (userData.username ?? null),
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error(
              "Discord notification failed for player registration:",
              discordError,
            );
          }
        } catch (error) {
          console.error("Error creating player:", error);

          // Log error to Discord
          try {
            await logError({
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error creating player",
              errorCode: "PLAYER_CREATION_FAILED",
              endpoint: "webhooks/user.created",
              severity: "high",
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error("Discord error logging failed:", discordError);
          }

          // You might want to throw an error here to trigger webhook retry
          // throw error
        }
      } else if (unsafeMetadata.userType === "coach") {
        try {
          const newCoach = await db.coach.create({
            data: {
              clerk_id: userData.id,
              email: userData.email_addresses[0]?.email_address ?? "",
              first_name: userData.first_name ?? "",
              last_name: userData.last_name ?? "",
              username: userData.username ?? "",
              image_url: userData.image_url,
              external_accounts:
                userData.external_accounts as unknown as Prisma.InputJsonValue,
              school: "", // TODO: This should be set during onboarding
              school_id: null, // Optional - can be linked later
            },
          });
          console.log("Coach created successfully:", newCoach.id);

          // Log coach registration to Discord
          try {
            await logUserRegistration({
              userType: "coach",
              registrationMethod: "Clerk Webhook",
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              userName:
                userData.first_name && userData.last_name
                  ? `${userData.first_name} ${userData.last_name}`
                  : (userData.username ?? null),
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error(
              "Discord notification failed for coach registration:",
              discordError,
            );
          }
        } catch (error) {
          console.error("Error creating coach:", error);

          // Log error to Discord
          try {
            await logError({
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error creating coach",
              errorCode: "COACH_CREATION_FAILED",
              endpoint: "webhooks/user.created",
              severity: "high",
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error("Discord error logging failed:", discordError);
          }

          // You might want to throw an error here to trigger webhook retry
          // throw error
        }
      } else if (unsafeMetadata.userType === "league") {
        try {
          const newLeagueAdmin = await db.leagueAdministrator.create({
            data: {
              clerk_id: userData.id,
              email: userData.email_addresses[0]?.email_address ?? "",
              first_name: userData.first_name ?? "",
              last_name: userData.last_name ?? "",
              username: userData.username,
              image_url: userData.image_url,
              external_accounts:
                userData.external_accounts as unknown as Prisma.InputJsonValue,
              league: "", // TODO: This should be set during onboarding
              league_id: null, // Optional - can be linked later
            },
          });
          console.log(
            "League Administrator created successfully:",
            newLeagueAdmin.id,
          );

          // Log league admin registration to Discord
          try {
            await logUserRegistration({
              userType: "league_admin",
              registrationMethod: "Clerk Webhook",
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              userName:
                userData.first_name && userData.last_name
                  ? `${userData.first_name} ${userData.last_name}`
                  : (userData.username ?? null),
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error(
              "Discord notification failed for league admin registration:",
              discordError,
            );
          }
        } catch (error) {
          console.error("Error creating league administrator:", error);

          // Log error to Discord
          try {
            await logError({
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error creating league administrator",
              errorCode: "LEAGUE_ADMIN_CREATION_FAILED",
              endpoint: "webhooks/user.created",
              severity: "high",
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error("Discord error logging failed:", discordError);
          }

          // You might want to throw an error here to trigger webhook retry
          // throw error
        }
      } else {
        // Log discord sign-in userType
        try {
          await logUserRegistration({
            userType: "not selected",
            registrationMethod: "Clerk Webhook",
            userId: userData.id,
            userEmail: userData.email_addresses[0]?.email_address ?? null,
            userName:
              userData.first_name && userData.last_name
                ? `${userData.first_name} ${userData.last_name}`
                : (userData.username ?? null),
            timestamp: new Date(),
          });
        } catch (discordError) {
          console.error("Discord error logging failed:", discordError);
        }

        console.warn(
          "Unknown user type or missing userType in unsafe_metadata",
        );
      }
    }

    // Handle user.updated
    if (eventType === "user.updated") {
      const userData = evt.data;
      const unsafeMetadata =
        userData.unsafe_metadata as unknown as ClerkUnsafeMetadata;

      // Extract relevant data for database sync
      const userDataForSync = {
        clerk_id: userData.id,
        email: userData.email_addresses?.[0]?.email_address ?? "",
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
        last_sign_in_at: userData.last_sign_in_at
          ? new Date(userData.last_sign_in_at)
          : null,
        two_factor_enabled: userData.two_factor_enabled,
        password_enabled: userData.password_enabled,
      };

      console.log("User updated - data for sync: omitted");

      // Database sync logic using upsert to handle both create and update scenarios
      if (unsafeMetadata.userType === "player") {
        try {
          const upsertedPlayer = await db.player.upsert({
            where: { clerk_id: userData.id },
            create: {
              clerk_id: userData.id,
              email: userData.email_addresses[0]?.email_address ?? "",
              first_name: userData.first_name ?? "",
              last_name: userData.last_name ?? "",
              username: userData.username,
              image_url: userData.image_url,
              external_accounts:
                userData.external_accounts as unknown as Prisma.InputJsonValue,
              // Optional fields - can be updated later through user profile
              school: null,
              school_id: null,
              gpa: null,
              transcript: null,
              class_year: null,
              guardian_email: null,
            },
            update: {
              email: userData.email_addresses[0]?.email_address ?? "",
              first_name: userData.first_name ?? "",
              last_name: userData.last_name ?? "",
              username: userData.username,
              image_url: userData.image_url,
              external_accounts:
                userData.external_accounts as unknown as Prisma.InputJsonValue,
              // Note: We only update basic fields from Clerk
              // School info, GPA, etc. should be updated through your app's profile system
            },
          });
          console.log("Player upserted successfully:", upsertedPlayer.id);

          // Log player registration to Discord if this was a new creation
          const isNewPlayer = !(await db.player.findFirst({
            where: {
              clerk_id: userData.id,
              created_at: { lt: new Date(Date.now() - 1000) }, // Existed more than 1 second ago
            },
          }));

          if (isNewPlayer) {
            try {
              await logUserRegistration({
                userType: "player",
                registrationMethod: "User Type Selection",
                userId: userData.id,
                userEmail: userData.email_addresses[0]?.email_address ?? null,
                userName:
                  userData.first_name && userData.last_name
                    ? `${userData.first_name} ${userData.last_name}`
                    : (userData.username ?? null),
                timestamp: new Date(),
              });
            } catch (discordError) {
              console.error(
                "Discord notification failed for player creation:",
                discordError,
              );
            }
          }
        } catch (error) {
          console.error("Error upserting player:", error);

          // Log error to Discord
          try {
            await logError({
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error upserting player",
              errorCode: "PLAYER_UPSERT_FAILED",
              endpoint: "webhooks/user.updated",
              severity: "medium",
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error("Discord error logging failed:", discordError);
          }

          // You might want to throw an error here to trigger webhook retry
          // throw error
        }
      } else if (unsafeMetadata.userType === "coach") {
        try {
          const upsertedCoach = await db.coach.upsert({
            where: { clerk_id: userData.id },
            create: {
              clerk_id: userData.id,
              email: userData.email_addresses[0]?.email_address ?? "",
              first_name: userData.first_name ?? "",
              last_name: userData.last_name ?? "",
              username: userData.username ?? "",
              image_url: userData.image_url,
              external_accounts:
                userData.external_accounts as unknown as Prisma.InputJsonValue,
              school: "", // TODO: This should be set during onboarding
              school_id: null, // Optional - can be linked later
            },
            update: {
              email: userData.email_addresses[0]?.email_address ?? "",
              first_name: userData.first_name ?? "",
              last_name: userData.last_name ?? "",
              username: userData.username ?? "",
              image_url: userData.image_url,
              external_accounts:
                userData.external_accounts as unknown as Prisma.InputJsonValue,
              // Note: We only update basic fields from Clerk
              // School info should be updated through your app's profile system
            },
          });
          console.log("Coach upserted successfully:", upsertedCoach.id);

          // Log coach registration to Discord if this was a new creation
          const isNewCoach = !(await db.coach.findFirst({
            where: {
              clerk_id: userData.id,
              created_at: { lt: new Date(Date.now() - 1000) }, // Existed more than 1 second ago
            },
          }));

          if (isNewCoach) {
            try {
              await logUserRegistration({
                userType: "coach",
                registrationMethod: "User Type Selection",
                userId: userData.id,
                userEmail: userData.email_addresses[0]?.email_address ?? null,
                userName:
                  userData.first_name && userData.last_name
                    ? `${userData.first_name} ${userData.last_name}`
                    : (userData.username ?? null),
                timestamp: new Date(),
              });
            } catch (discordError) {
              console.error(
                "Discord notification failed for coach creation:",
                discordError,
              );
            }
          }
        } catch (error) {
          console.error("Error upserting coach:", error);

          // Log error to Discord
          try {
            await logError({
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error upserting coach",
              errorCode: "COACH_UPSERT_FAILED",
              endpoint: "webhooks/user.updated",
              severity: "medium",
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error("Discord error logging failed:", discordError);
          }

          // You might want to throw an error here to trigger webhook retry
          // throw error
        }
      } else if (unsafeMetadata.userType === "league") {
        try {
          const upsertedLeagueAdmin = await db.leagueAdministrator.upsert({
            where: { clerk_id: userData.id },
            create: {
              clerk_id: userData.id,
              email: userData.email_addresses[0]?.email_address ?? "",
              first_name: userData.first_name ?? "",
              last_name: userData.last_name ?? "",
              username: userData.username,
              image_url: userData.image_url,
              external_accounts:
                userData.external_accounts as unknown as Prisma.InputJsonValue,
              league: "", // TODO: This should be set during onboarding
              league_id: null, // Optional - can be linked later
            },
            update: {
              email: userData.email_addresses[0]?.email_address ?? "",
              first_name: userData.first_name ?? "",
              last_name: userData.last_name ?? "",
              username: userData.username,
              image_url: userData.image_url,
              external_accounts:
                userData.external_accounts as unknown as Prisma.InputJsonValue,
              // Note: We only update basic fields from Clerk
              // League info should be updated through your app's profile system
            },
          });
          console.log(
            "League Administrator upserted successfully:",
            upsertedLeagueAdmin.id,
          );

          // Log league admin registration to Discord if this was a new creation
          const isNewLeagueAdmin = !(await db.leagueAdministrator.findFirst({
            where: {
              clerk_id: userData.id,
              created_at: { lt: new Date(Date.now() - 1000) }, // Existed more than 1 second ago
            },
          }));

          if (isNewLeagueAdmin) {
            try {
              await logUserRegistration({
                userType: "league_admin",
                registrationMethod: "User Type Selection",
                userId: userData.id,
                userEmail: userData.email_addresses[0]?.email_address ?? null,
                userName:
                  userData.first_name && userData.last_name
                    ? `${userData.first_name} ${userData.last_name}`
                    : (userData.username ?? null),
                timestamp: new Date(),
              });
            } catch (discordError) {
              console.error(
                "Discord notification failed for league admin creation:",
                discordError,
              );
            }
          }
        } catch (error) {
          console.error("Error upserting league administrator:", error);

          // Log error to Discord
          try {
            await logError({
              error:
                error instanceof Error
                  ? error.message
                  : "Unknown error upserting league administrator",
              errorCode: "LEAGUE_ADMIN_UPSERT_FAILED",
              endpoint: "webhooks/user.updated",
              severity: "medium",
              userId: userData.id,
              userEmail: userData.email_addresses[0]?.email_address ?? null,
              timestamp: new Date(),
            });
          } catch (discordError) {
            console.error("Discord error logging failed:", discordError);
          }

          // You might want to throw an error here to trigger webhook retry
          // throw error
        }
      } else {
        console.warn(
          "Unknown user type or missing userType in unsafe_metadata",
        );
      }
    }

    // Handle user.deleted
    if (eventType === "user.deleted") {
      const userData = evt.data;

      console.log("User deleted:", { userId: userData.id });

      try {
        // First, find existing records to get their emails before deletion
        const existingPlayer = await db.player.findFirst({
          where: { clerk_id: userData.id },
          select: { id: true, email: true },
        });

        const existingCoach = await db.coach.findFirst({
          where: { clerk_id: userData.id },
          select: { id: true, email: true },
        });

        const existingLeagueAdmin = await db.leagueAdministrator.findFirst({
          where: { clerk_id: userData.id },
          select: { id: true, email: true },
        });

        // Delete records that match both clerk_id and email for precise deletion
        let deletedPlayer = { count: 0 };
        let deletedCoach = { count: 0 };
        let deletedLeagueAdmin = { count: 0 };

        if (existingPlayer) {
          deletedPlayer = await db.player.deleteMany({
            where: {
              AND: [{ clerk_id: userData.id }, { email: existingPlayer.email }],
            },
          });
          console.log(
            `Player deleted successfully (${deletedPlayer.count} records) with email: ${existingPlayer.email}`,
          );
        }

        if (existingCoach) {
          deletedCoach = await db.coach.deleteMany({
            where: {
              AND: [{ clerk_id: userData.id }, { email: existingCoach.email }],
            },
          });
          console.log(
            `Coach deleted successfully (${deletedCoach.count} records) with email: ${existingCoach.email}`,
          );
        }

        if (existingLeagueAdmin) {
          deletedLeagueAdmin = await db.leagueAdministrator.deleteMany({
            where: {
              AND: [
                { clerk_id: userData.id },
                { email: existingLeagueAdmin.email },
              ],
            },
          });
          console.log(
            `League Administrator deleted successfully (${deletedLeagueAdmin.count} records) with email: ${existingLeagueAdmin.email}`,
          );
        }

        if (
          deletedPlayer.count === 0 &&
          deletedCoach.count === 0 &&
          deletedLeagueAdmin.count === 0
        ) {
          console.warn("No user found to delete with clerk_id:", userData.id);
        }
      } catch (error) {
        console.error("Error deleting user:", error);

        // Log error to Discord
        try {
          await logError({
            error:
              error instanceof Error
                ? error.message
                : "Unknown error deleting user",
            errorCode: "USER_DELETION_FAILED",
            endpoint: "webhooks/user.deleted",
            severity: "high",
            userId: userData.id,
            timestamp: new Date(),
          });
        } catch (discordError) {
          console.error("Discord error logging failed:", discordError);
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

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);

    // Log webhook verification error to Discord
    try {
      await logError({
        error:
          err instanceof Error
            ? err.message
            : "Unknown webhook verification error",
        errorCode: "WEBHOOK_VERIFICATION_FAILED",
        endpoint: "webhooks",
        severity: "high",
        timestamp: new Date(),
      });
    } catch (discordError) {
      console.error("Discord error logging failed:", discordError);
    }

    return new Response("Error verifying webhook", { status: 400 });
  }
}
