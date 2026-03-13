import assert from "node:assert/strict";
import test from "node:test";

import { TRPCError } from "@trpc/server";

import { FEATURE_KEYS } from "@/lib/server/entitlements";
import {
  subscribeToMessagingEvents,
  type MessagingEventRecord,
} from "@/lib/server/messaging-observability";
import { messagesRouter } from "@/server/api/routers/messages";
import { createMessagingTestDb } from "@/tests/helpers/createMessagingTestDb";

function createAuthContext(args: {
  userId: string;
  role?: "coach" | "player";
  onboarded?: boolean;
}) {
  return {
    userId: args.userId,
    sessionClaims: {
      publicMetadata: args.role
        ? {
            userType: args.role,
            onboarded: args.onboarded ?? false,
          }
        : {},
    },
    getToken: async () => null,
    has: () => false,
    debug: () => ({}),
    factorVerificationAge: [null, null],
    actor: undefined,
    orgId: null,
    orgRole: null,
    orgSlug: null,
    orgPermissions: null,
    redirectToSignIn: () => {
      throw new Error("redirectToSignIn should not be called in tests");
    },
    redirectToSignUp: () => {
      throw new Error("redirectToSignUp should not be called in tests");
    },
  };
}

function createCaller(
  db: ReturnType<typeof createMessagingTestDb>["db"],
  args: {
    userId: string;
    role?: "coach" | "player";
    onboarded?: boolean;
  },
) {
  return messagesRouter.createCaller({
    db: db as never,
    auth: createAuthContext(args) as never,
    headers: new Headers(),
  });
}

void test("free player quota blocks the fourth new coach intro but still allows replies", async () => {
  const harness = createMessagingTestDb();
  const school = harness.seedSchool({
    name: "Quota Test School",
    slug: "quota-test-school",
  });
  const player = harness.seedPlayer({
    clerk_id: "player-quota",
    email: "player-quota@example.com",
    first_name: "Player",
    last_name: "Quota",
    username: "player_quota",
  });
  const coaches = ["a", "b", "c", "d"].map((suffix) =>
    harness.seedCoach({
      clerk_id: `coach-quota-${suffix}`,
      email: `coach-quota-${suffix}@example.com`,
      first_name: "Coach",
      last_name: suffix.toUpperCase(),
      username: `coach_quota_${suffix}`,
      school: school.name,
      school_id: school.id,
    }),
  );

  const playerCaller = createCaller(harness.db, {
    userId: player.clerk_id,
    role: "player",
  });

  for (const coach of coaches.slice(0, 3)) {
    const result = await playerCaller.sendPlayerMessage({
      coachId: coach.id,
      content: `Intro for ${coach.username}`,
    });
    assert.ok(result.conversationId);
  }

  const quotaStatus = await playerCaller.getPlayerMessagingStatus();
  assert.equal(quotaStatus.monthlyConversationStartsRemaining, 0);
  assert.equal(quotaStatus.canStartConversation, false);

  await assert.rejects(
    async () =>
      playerCaller.sendPlayerMessage({
        coachId: coaches[3]!.id,
        content: "This one should fail",
      }),
    (error: unknown) =>
      error instanceof TRPCError &&
      error.code === "FORBIDDEN" &&
      error.message.includes("free monthly coach intro quota"),
  );

  const coachCaller = createCaller(harness.db, {
    userId: coaches[3]!.clerk_id,
    role: "coach",
    onboarded: true,
  });
  const coachStarted = await coachCaller.sendMessage({
    playerId: player.id,
    content: "Coach reached out first",
  });

  const reply = await playerCaller.sendPlayerMessage({
    conversationId: coachStarted.conversationId,
    content: "Reply is still allowed",
  });

  assert.equal(reply.conversationId, coachStarted.conversationId);
});

void test("conversation star and archive state are participant-specific", async () => {
  const harness = createMessagingTestDb();
  const school = harness.seedSchool({
    name: "Prefs Test School",
    slug: "prefs-test-school",
  });
  const coach = harness.seedCoach({
    clerk_id: "coach-prefs",
    email: "coach-prefs@example.com",
    first_name: "Coach",
    last_name: "Prefs",
    username: "coach_prefs",
    school: school.name,
    school_id: school.id,
  });
  const player = harness.seedPlayer({
    clerk_id: "player-prefs",
    email: "player-prefs@example.com",
    first_name: "Player",
    last_name: "Prefs",
    username: "player_prefs",
  });

  const coachCaller = createCaller(harness.db, {
    userId: coach.clerk_id,
    role: "coach",
    onboarded: true,
  });
  const playerCaller = createCaller(harness.db, {
    userId: player.clerk_id,
    role: "player",
  });

  const conversation = await coachCaller.sendMessage({
    playerId: player.id,
    content: "Hello from coach",
  });

  await playerCaller.togglePlayerStar({
    conversationId: conversation.conversationId,
  });
  await playerCaller.togglePlayerArchive({
    conversationId: conversation.conversationId,
  });

  const coachDetail = await coachCaller.getConversation({
    conversationId: conversation.conversationId,
  });
  const playerDetail = await playerCaller.getPlayerConversation({
    conversationId: conversation.conversationId,
  });

  assert.equal(coachDetail.isStarred, false);
  assert.equal(coachDetail.isArchived, false);
  assert.equal(playerDetail.isStarred, true);
  assert.equal(playerDetail.isArchived, true);

  const coachList = await coachCaller.getConversations({
    filter: "all",
    limit: 50,
  });
  const playerArchived = await playerCaller.getPlayerConversations({
    filter: "archived",
    limit: 50,
  });

  assert.equal(coachList.conversations.length, 1);
  assert.equal(playerArchived.conversations.length, 1);
});

void test("contact search, pagination, entitlement access, and observability use the new contract", async () => {
  const harness = createMessagingTestDb();
  const observedEvents: MessagingEventRecord[] = [];
  const unsubscribe = subscribeToMessagingEvents((event) => {
    observedEvents.push(event);
  });

  try {
    const school = harness.seedSchool({
      name: "Contract Test School",
      slug: "contract-test-school",
    });
    const player = harness.seedPlayer({
      clerk_id: "player-contract",
      email: "player-contract@example.com",
      first_name: "Player",
      last_name: "Contract",
      username: "player_contract",
    });
    const coachAlpha = harness.seedCoach({
      clerk_id: "coach-alpha",
      email: "coach-alpha@example.com",
      first_name: "Coach",
      last_name: "Alpha",
      username: "coach_alpha",
      school: school.name,
      school_id: school.id,
    });
    const coachBeta = harness.seedCoach({
      clerk_id: "coach-beta",
      email: "coach-beta@example.com",
      first_name: "Coach",
      last_name: "Beta",
      username: "coach_beta",
      school: school.name,
      school_id: school.id,
    });
    const coachGamma = harness.seedCoach({
      clerk_id: "coach-gamma",
      email: "coach-gamma@example.com",
      first_name: "Coach",
      last_name: "Gamma",
      username: "coach_gamma",
      school: school.name,
      school_id: school.id,
    });
    const coachDelta = harness.seedCoach({
      clerk_id: "coach-delta",
      email: "coach-delta@example.com",
      first_name: "Coach",
      last_name: "Delta",
      username: "coach_delta",
      school: school.name,
      school_id: school.id,
    });

    const customer = harness.seedStripeCustomer({
      clerk_user_id: player.clerk_id,
      stripe_customer_id: "cus_contract",
      email: player.email,
    });
    harness.seedEntitlement({
      stripe_customer_id: customer.id,
      feature_key: FEATURE_KEYS.DIRECT_MESSAGING,
      granted_by_type: "MANUAL",
      subscription_id: null,
      purchase_id: null,
      expires_at: null,
      is_active: true,
      metadata: null,
    });

    const playerCaller = createCaller(harness.db, {
      userId: player.clerk_id,
      role: "player",
    });

    const availableCoaches = await playerCaller.getAvailableCoaches({
      search: "beta",
      limit: 1,
    });
    assert.equal(availableCoaches.length, 1);
    assert.equal(availableCoaches[0]!.id, coachBeta.id);

    const access = await playerCaller.checkAccess();
    assert.equal(access.hasAccess, true);

    await createCaller(harness.db, {
      userId: coachAlpha.clerk_id,
      role: "coach",
      onboarded: true,
    }).sendMessage({
      playerId: player.id,
      content: "Conversation 1",
    });
    await createCaller(harness.db, {
      userId: coachBeta.clerk_id,
      role: "coach",
      onboarded: true,
    }).sendMessage({
      playerId: player.id,
      content: "Conversation 2",
    });
    await createCaller(harness.db, {
      userId: coachGamma.clerk_id,
      role: "coach",
      onboarded: true,
    }).sendMessage({
      playerId: player.id,
      content: "Conversation 3",
    });

    const firstPage = await playerCaller.getPlayerConversations({
      filter: "all",
      limit: 2,
    });
    assert.equal(firstPage.conversations.length, 2);
    assert.ok(firstPage.nextCursor);

    const secondPage = await playerCaller.getPlayerConversations({
      filter: "all",
      limit: 2,
      cursor: firstPage.nextCursor ?? undefined,
    });
    assert.equal(secondPage.conversations.length, 1);

    await playerCaller.sendPlayerMessage({
      coachId: coachDelta.id,
      content: "Unlimited intro still works",
    });

    assert.ok(
      observedEvents.some(
        (event) =>
          event.event === "conversation_created" && event.actorRole === "coach",
      ),
    );
    assert.ok(
      observedEvents.some(
        (event) =>
          event.event === "message_sent" &&
          event.actorRole === "player" &&
          event.status === "success",
      ),
    );
  } finally {
    unsubscribe();
  }
});
