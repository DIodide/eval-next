/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "test-data":
        return await testCreateMockData();
      case "check-conversations":
        return await checkConversations();
      case "check-messages":
        return await checkMessages();
      case "check-coaches":
        return await checkCoaches();
      case "check-players":
        return await checkPlayers();
      case "cleanup":
        return await cleanupTestData();
      default:
        return NextResponse.json({
          message: "Available actions: test-data, check-conversations, check-messages, check-coaches, check-players, cleanup",
          usage: "GET /api/test-messages?action=test-data"
        });
    }
  } catch (error) {
    console.error("Test messages API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function testCreateMockData() {
  try {
    // First, let's check if we have any coaches and players
    const existingCoaches = await db.coach.findMany({ take: 5 });
    const existingPlayers = await db.player.findMany({ take: 5 });

    console.log("Existing coaches:", existingCoaches.length);
    console.log("Existing players:", existingPlayers.length);

    let testCoach, testPlayer;

    // Create test coach if none exist
    if (existingCoaches.length === 0) {
      testCoach = await db.coach.create({
        data: {
          clerk_id: "test_coach_clerk_id",
          email: "testcoach@example.com",
          first_name: "Test",
          last_name: "Coach",
          username: "testcoach",
          image_url: null,
          school: "Test University",
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      console.log("Created test coach:", testCoach.id);
    } else {
      testCoach = existingCoaches[0]!;
      console.log("Using existing coach:", testCoach.id);
    }

    // Create test player if none exist
    if (existingPlayers.length === 0) {
      testPlayer = await db.player.create({
        data: {
          clerk_id: "test_player_clerk_id",
          email: "testplayer@example.com",
          first_name: "Test",
          last_name: "Player",
          username: "testplayer",
          image_url: null,
          school: "Test High School",
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      console.log("Created test player:", testPlayer.id);
    } else {
      testPlayer = existingPlayers[0]!;
      console.log("Using existing player:", testPlayer.id);
    }

    // Check if conversation already exists
    const existingConversation = await db.conversation.findFirst({
      where: {
        coach_id: testCoach.id,
        player_id: testPlayer.id,
      }
    });

    let conversation;
    if (!existingConversation) {
      // Create test conversation
      conversation = await db.conversation.create({
        data: {
          coach_id: testCoach.id,
          player_id: testPlayer.id,
          is_starred: false,
          is_archived: false,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      console.log("Created test conversation:", conversation.id);
    } else {
      conversation = existingConversation;
      console.log("Using existing conversation:", conversation.id);
    }

    // Create test messages
    const existingMessages = await db.message.findMany({
      where: { conversation_id: conversation.id }
    });

    if (existingMessages.length === 0) {
      const messages = await Promise.all([
        db.message.create({
          data: {
            conversation_id: conversation.id,
            sender_id: testCoach.id,
            sender_type: "COACH",
            content: "Hello! I'm interested in recruiting you for our esports program.",
            is_read: false,
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          }
        }),
        db.message.create({
          data: {
            conversation_id: conversation.id,
            sender_id: testPlayer.id,
            sender_type: "PLAYER",
            content: "Hi! Thank you for reaching out. I'd love to learn more about your program.",
            is_read: false,
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          }
        }),
        db.message.create({
          data: {
            conversation_id: conversation.id,
            sender_id: testCoach.id,
            sender_type: "COACH",
            content: "Great! We offer full scholarships and have a competitive VALORANT team. When would be a good time to chat?",
            is_read: false,
            created_at: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          }
        })
      ]);

      console.log("Created test messages:", messages.length);
    }

    return NextResponse.json({
      success: true,
      message: "Test data created successfully",
      data: {
        coach: { id: testCoach.id, email: testCoach.email },
        player: { id: testPlayer.id, email: testPlayer.email },
        conversation: { id: conversation.id },
        messagesCount: existingMessages.length === 0 ? 3 : existingMessages.length
      }
    });

  } catch (error) {
    console.error("Error creating test data:", error);
    return NextResponse.json(
      { error: "Failed to create test data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function checkConversations() {
  try {
    const conversations = await db.conversation.findMany({
      include: {
        coach: true,
        player: true,
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      count: conversations.length,
      conversations: conversations.map(conv => ({
        id: conv.id,
        coach: { id: conv.coach.id, email: conv.coach.email, name: `${conv.coach.first_name} ${conv.coach.last_name}` },
        player: { id: conv.player.id, email: conv.player.email, name: `${conv.player.first_name} ${conv.player.last_name}` },
        lastMessage: conv.messages[0] ? {
          content: conv.messages[0].content,
          sender_type: conv.messages[0].sender_type,
          created_at: conv.messages[0].created_at
        } : null,
        created_at: conv.created_at
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check conversations", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function checkMessages() {
  try {
    const messages = await db.message.findMany({
      include: {
        conversation: {
          include: {
            coach: true,
            player: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 20
    });

    return NextResponse.json({
      success: true,
      count: messages.length,
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_type: msg.sender_type,
        sender_id: msg.sender_id,
        is_read: msg.is_read,
        created_at: msg.created_at,
        conversation: {
          id: msg.conversation.id,
          coach: `${msg.conversation.coach.first_name} ${msg.conversation.coach.last_name}`,
          player: `${msg.conversation.player.first_name} ${msg.conversation.player.last_name}`
        }
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check messages", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function checkCoaches() {
  try {
    const coaches = await db.coach.findMany({
      take: 10,
      include: {
        school_ref: true
      }
    });

    return NextResponse.json({
      success: true,
      count: coaches.length,
      coaches: coaches.map(coach => ({
        id: coach.id,
        clerk_id: coach.clerk_id,
        email: coach.email,
        name: `${coach.first_name} ${coach.last_name}`,
        username: coach.username,
        school: coach.school,
        school_ref: coach.school_ref?.name ?? null
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check coaches", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function checkPlayers() {
  try {
    const players = await db.player.findMany({
      take: 10,
      include: {
        main_game: true
      }
    });

    return NextResponse.json({
      success: true,
      count: players.length,
      players: players.map(player => ({
        id: player.id,
        clerk_id: player.clerk_id,
        email: player.email,
        name: `${player.first_name} ${player.last_name}`,
        username: player.username,
        school: player.school,
        main_game: player.main_game?.name ?? null
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check players", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function cleanupTestData() {
  try {
    // Delete test messages
    const deletedMessages = await db.message.deleteMany({
      where: {
        conversation: {
          OR: [
            { coach: { clerk_id: "test_coach_clerk_id" } },
            { player: { clerk_id: "test_player_clerk_id" } }
          ]
        }
      }
    });

    // Delete test conversations
    const deletedConversations = await db.conversation.deleteMany({
      where: {
        OR: [
          { coach: { clerk_id: "test_coach_clerk_id" } },
          { player: { clerk_id: "test_player_clerk_id" } }
        ]
      }
    });

    // Delete test coach
    const deletedCoaches = await db.coach.deleteMany({
      where: { clerk_id: "test_coach_clerk_id" }
    });

    // Delete test player
    const deletedPlayers = await db.player.deleteMany({
      where: { clerk_id: "test_player_clerk_id" }
    });

    return NextResponse.json({
      success: true,
      message: "Test data cleaned up successfully",
      deleted: {
        messages: deletedMessages.count,
        conversations: deletedConversations.count,
        coaches: deletedCoaches.count,
        players: deletedPlayers.count
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to cleanup test data", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
} 