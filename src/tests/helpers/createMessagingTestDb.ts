/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/prefer-optional-chain */

type SenderType = "COACH" | "PLAYER";
type ConversationInitiator = SenderType;

type SchoolRecord = {
  id: string;
  name: string;
  slug: string;
};

type GameRecord = {
  id: string;
  name: string;
};

type PlayerRecord = {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  image_url: string | null;
  school: string | null;
  class_year: string | null;
  location: string | null;
  gpa: number | null;
  main_game_id: string | null;
};

type CoachRecord = {
  id: string;
  clerk_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  image_url: string | null;
  school: string;
  school_id: string | null;
};

type ConversationRecord = {
  id: string;
  coach_id: string;
  player_id: string;
  initiated_by: ConversationInitiator;
  is_starred: boolean;
  is_archived: boolean;
  coach_is_starred: boolean;
  coach_is_archived: boolean;
  player_is_starred: boolean;
  player_is_archived: boolean;
  created_at: Date;
  updated_at: Date;
};

type MessageRecord = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: SenderType;
  content: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
};

type StripeCustomerRecord = {
  id: string;
  clerk_user_id: string;
  stripe_customer_id: string;
  email: string;
};

type EntitlementRecord = {
  id: string;
  stripe_customer_id: string;
  feature_key: string;
  granted_by_type: "MANUAL" | "PURCHASE" | "SUBSCRIPTION";
  subscription_id: string | null;
  purchase_id: string | null;
  expires_at: Date | null;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
};

type PlayerGameProfileRecord = {
  id: string;
  player_id: string;
  game_id: string;
  username: string;
  rank: string | null;
  role: string | null;
};

function containsInsensitive(value: string | null | undefined, search: string) {
  return (value ?? "").toLowerCase().includes(search.toLowerCase());
}

function matchDateRange(
  value: Date,
  range?: { gte?: Date; lt?: Date; gt?: Date; lte?: Date },
) {
  if (!range) return true;
  if (range.gte && value < range.gte) return false;
  if (range.gt && value <= range.gt) return false;
  if (range.lt && value >= range.lt) return false;
  if (range.lte && value > range.lte) return false;
  return true;
}

function sortByOrder<T extends Record<string, unknown>>(
  items: T[],
  orderBy:
    | Array<Record<string, "asc" | "desc">>
    | Record<string, "asc" | "desc">
    | undefined,
) {
  const orderEntries = Array.isArray(orderBy)
    ? orderBy
    : orderBy
      ? [orderBy]
      : [];

  return [...items].sort((left, right) => {
    for (const entry of orderEntries) {
      const [key, direction] = Object.entries(entry)[0] ?? [];
      if (!key || !direction) continue;

      const leftValue = left[key];
      const rightValue = right[key];

      if (leftValue === rightValue) continue;

      const modifier = direction === "asc" ? 1 : -1;
      return leftValue! < rightValue! ? -1 * modifier : 1 * modifier;
    }

    return 0;
  });
}

export function createMessagingTestDb() {
  const schools: SchoolRecord[] = [];
  const games: GameRecord[] = [];
  const players: PlayerRecord[] = [];
  const coaches: CoachRecord[] = [];
  const conversations: ConversationRecord[] = [];
  const messages: MessageRecord[] = [];
  const stripeCustomers: StripeCustomerRecord[] = [];
  const entitlements: EntitlementRecord[] = [];
  const playerGameProfiles: PlayerGameProfileRecord[] = [];

  let idCounter = 1;

  const nextId = (_prefix: string) =>
    `00000000-0000-4000-8000-${String(idCounter++).padStart(12, "0")}`;

  const getSchool = (schoolId: string | null) =>
    schoolId
      ? (schools.find((school) => school.id === schoolId) ?? null)
      : null;

  const getGame = (gameId: string | null) =>
    gameId ? (games.find((game) => game.id === gameId) ?? null) : null;

  const getPlayerGameProfiles = (playerId: string) =>
    playerGameProfiles
      .filter((profile) => profile.player_id === playerId)
      .map((profile) => ({
        ...profile,
        game: getGame(profile.game_id)!,
      }));

  const hydratePlayer = (player: PlayerRecord) => ({
    ...player,
    school_ref: getSchool(player.school ? null : null),
    main_game: getGame(player.main_game_id),
    game_profiles: getPlayerGameProfiles(player.id),
  });

  const hydrateCoach = (coach: CoachRecord) => ({
    ...coach,
    school_ref: getSchool(coach.school_id),
  });

  const getConversationMessages = (conversationId: string) =>
    messages.filter((message) => message.conversation_id === conversationId);

  const hydrateConversation = (conversation: ConversationRecord) => ({
    ...conversation,
    coach: hydrateCoach(
      coaches.find((coach) => coach.id === conversation.coach_id)!,
    ),
    player: hydratePlayer(
      players.find((player) => player.id === conversation.player_id)!,
    ),
    messages: getConversationMessages(conversation.id),
  });

  const filterEntitlements = (
    customerId: string,
    where?: {
      feature_key?: string | { in: string[] };
      is_active?: boolean;
      OR?: Array<{ expires_at: null } | { expires_at: { gt: Date } }>;
    },
  ) => {
    return entitlements.filter((entitlement) => {
      if (entitlement.stripe_customer_id !== customerId) return false;
      if (typeof where?.feature_key === "string") {
        if (entitlement.feature_key !== where.feature_key) return false;
      } else if (where?.feature_key?.in) {
        if (!where.feature_key.in.includes(entitlement.feature_key))
          return false;
      }

      if (
        typeof where?.is_active === "boolean" &&
        entitlement.is_active !== where.is_active
      ) {
        return false;
      }

      if (where?.OR?.length) {
        return where.OR.some((clause) => {
          if ("expires_at" in clause && clause.expires_at === null) {
            return entitlement.expires_at === null;
          }
          if ("expires_at" in clause && clause.expires_at?.gt) {
            return (
              entitlement.expires_at !== null &&
              entitlement.expires_at > clause.expires_at.gt
            );
          }
          return false;
        });
      }

      return true;
    });
  };

  const matchesPlayerSearch = (player: PlayerRecord, search: string) => {
    return (
      containsInsensitive(player.first_name, search) ||
      containsInsensitive(player.last_name, search) ||
      containsInsensitive(player.email, search) ||
      containsInsensitive(player.username, search) ||
      containsInsensitive(player.school, search)
    );
  };

  const matchesCoachSearch = (coach: CoachRecord, search: string) => {
    const school = getSchool(coach.school_id);
    return (
      containsInsensitive(coach.first_name, search) ||
      containsInsensitive(coach.last_name, search) ||
      containsInsensitive(coach.email, search) ||
      containsInsensitive(coach.username, search) ||
      containsInsensitive(coach.school, search) ||
      containsInsensitive(school?.name, search)
    );
  };

  const matchesConversationWhere = (
    conversation: ConversationRecord,
    where: any,
  ) => {
    if (!where) return true;
    if (where.id && conversation.id !== where.id) return false;
    if (where.coach_id && conversation.coach_id !== where.coach_id)
      return false;
    if (where.player_id && conversation.player_id !== where.player_id)
      return false;
    if (
      where.initiated_by &&
      conversation.initiated_by !== where.initiated_by
    ) {
      return false;
    }
    if (
      typeof where.coach_is_archived === "boolean" &&
      conversation.coach_is_archived !== where.coach_is_archived
    ) {
      return false;
    }
    if (
      typeof where.player_is_archived === "boolean" &&
      conversation.player_is_archived !== where.player_is_archived
    ) {
      return false;
    }
    if (
      typeof where.coach_is_starred === "boolean" &&
      conversation.coach_is_starred !== where.coach_is_starred
    ) {
      return false;
    }
    if (
      typeof where.player_is_starred === "boolean" &&
      conversation.player_is_starred !== where.player_is_starred
    ) {
      return false;
    }
    if (!matchDateRange(conversation.created_at, where.created_at)) {
      return false;
    }

    if (where.player?.is?.OR) {
      const player = players.find(
        (entry) => entry.id === conversation.player_id,
      )!;
      if (
        !where.player.is.OR.some((clause: any) =>
          matchesPlayerSearch(
            player,
            clause.first_name?.contains ??
              clause.last_name?.contains ??
              clause.email?.contains ??
              clause.school?.contains ??
              clause.username?.contains ??
              "",
          ),
        )
      ) {
        return false;
      }
    }

    if (where.coach?.is?.OR) {
      const coach = coaches.find(
        (entry) => entry.id === conversation.coach_id,
      )!;
      if (
        !where.coach.is.OR.some((clause: any) =>
          matchesCoachSearch(
            coach,
            clause.first_name?.contains ??
              clause.last_name?.contains ??
              clause.email?.contains ??
              clause.school?.contains ??
              clause.username?.contains ??
              "",
          ),
        )
      ) {
        return false;
      }
    }

    if (where.messages?.some) {
      const conversationMessages = getConversationMessages(conversation.id);
      const some = where.messages.some;
      const matchesSome = conversationMessages.some((message) => {
        if (some.is_read !== undefined && message.is_read !== some.is_read) {
          return false;
        }
        if (some.sender_type && message.sender_type !== some.sender_type) {
          return false;
        }
        return true;
      });

      if (!matchesSome) {
        return false;
      }
    }

    return true;
  };

  const filterMessages = (where: any) => {
    return messages.filter((message) => {
      if (
        where.conversation_id &&
        message.conversation_id !== where.conversation_id
      ) {
        return false;
      }
      if (where.sender_type && message.sender_type !== where.sender_type) {
        return false;
      }
      if (
        typeof where.is_read === "boolean" &&
        message.is_read !== where.is_read
      ) {
        return false;
      }
      if (where.id?.in && !where.id.in.includes(message.id)) {
        return false;
      }
      if (where.conversation) {
        const conversation = conversations.find(
          (entry) => entry.id === message.conversation_id,
        )!;
        if (
          where.conversation.coach_id &&
          conversation.coach_id !== where.conversation.coach_id
        ) {
          return false;
        }
        if (
          typeof where.conversation.coach_is_archived === "boolean" &&
          conversation.coach_is_archived !==
            where.conversation.coach_is_archived
        ) {
          return false;
        }
      }
      return true;
    });
  };

  const db = {
    conversation: {
      count: async ({ where }: any) =>
        conversations.filter((conversation) =>
          matchesConversationWhere(conversation, where),
        ).length,
      findFirst: async ({ where }: any) => {
        const match = conversations.find((conversation) =>
          matchesConversationWhere(conversation, where),
        );
        return match ? hydrateConversation(match) : null;
      },
      findMany: async ({ where, orderBy, take, cursor, skip }: any) => {
        let items = conversations.filter((conversation) =>
          matchesConversationWhere(conversation, where),
        );
        items = sortByOrder(items, orderBy);

        if (cursor?.id) {
          const cursorIndex = items.findIndex((item) => item.id === cursor.id);
          if (cursorIndex >= 0) {
            items = items.slice(cursorIndex + (skip ?? 0));
          }
        }

        const limited = typeof take === "number" ? items.slice(0, take) : items;
        return limited.map(hydrateConversation).map((conversation) => ({
          ...conversation,
          messages: sortByOrder(
            conversation.messages,
            orderBy?.[0]?.created_at ? orderBy : [{ created_at: "desc" }],
          ),
          _count: {
            messages: conversation.messages.filter(
              (message) =>
                message.sender_type ===
                  (where?.messages?.some?.sender_type ??
                    (conversation.coach_id === where?.coach_id
                      ? "PLAYER"
                      : "COACH")) && message.is_read === false,
            ).length,
          },
        }));
      },
      create: async ({ data }: any) => {
        const conversation: ConversationRecord = {
          id: nextId("conversation"),
          coach_id: data.coach_id,
          player_id: data.player_id,
          initiated_by: data.initiated_by,
          is_starred: data.is_starred ?? false,
          is_archived: data.is_archived ?? false,
          coach_is_starred: data.coach_is_starred ?? false,
          coach_is_archived: data.coach_is_archived ?? false,
          player_is_starred: data.player_is_starred ?? false,
          player_is_archived: data.player_is_archived ?? false,
          created_at: data.created_at ?? new Date(),
          updated_at: data.updated_at ?? new Date(),
        };
        conversations.push(conversation);
        return hydrateConversation(conversation);
      },
      update: async ({ where, data }: any) => {
        const conversation = conversations.find(
          (entry) => entry.id === where.id,
        )!;
        Object.assign(conversation, data, {
          updated_at: data.updated_at ?? new Date(),
        });
        return hydrateConversation(conversation);
      },
    },
    message: {
      count: async ({ where }: any) => filterMessages(where).length,
      create: async ({ data }: any) => {
        const message: MessageRecord = {
          id: nextId("message"),
          conversation_id: data.conversation_id,
          sender_id: data.sender_id,
          sender_type: data.sender_type,
          content: data.content,
          is_read: data.is_read ?? false,
          created_at: data.created_at ?? new Date(),
          updated_at: data.updated_at ?? new Date(),
        };
        messages.push(message);
        return message;
      },
      updateMany: async ({ where, data }: any) => {
        const targets = filterMessages(where);
        for (const message of targets) {
          Object.assign(message, data, { updated_at: new Date() });
        }
        return { count: targets.length };
      },
    },
    player: {
      findUnique: async ({ where }: any) => {
        if (where.id) {
          const player = players.find((entry) => entry.id === where.id);
          return player ? hydratePlayer(player) : null;
        }
        if (where.clerk_id) {
          const player = players.find(
            (entry) => entry.clerk_id === where.clerk_id,
          );
          return player ? hydratePlayer(player) : null;
        }
        return null;
      },
      findMany: async ({ where, take, orderBy }: any = {}) => {
        let items = players.filter((player) => {
          if (!where) return true;
          if (where.OR) {
            return where.OR.some((clause: any) =>
              matchesPlayerSearch(
                player,
                clause.first_name?.contains ??
                  clause.last_name?.contains ??
                  clause.email?.contains ??
                  clause.username?.contains ??
                  clause.school?.contains ??
                  "",
              ),
            );
          }
          if (
            where.main_game_id &&
            player.main_game_id === where.main_game_id
          ) {
            return true;
          }
          if (where.OR && where.OR.length) {
            return true;
          }
          if (where.main_game_id) {
            return player.main_game_id === where.main_game_id;
          }
          if (where.game_profiles?.some?.game_id) {
            return getPlayerGameProfiles(player.id).some(
              (profile) => profile.game_id === where.game_profiles.some.game_id,
            );
          }
          if (where.OR) return true;
          return true;
        });

        if (where?.OR) {
          items = players.filter((player) =>
            where.OR.some((clause: any) =>
              matchesPlayerSearch(
                player,
                clause.first_name?.contains ??
                  clause.last_name?.contains ??
                  clause.email?.contains ??
                  clause.username?.contains ??
                  clause.school?.contains ??
                  "",
              ),
            ),
          );
        }

        if (
          where?.main_game_id ||
          where?.OR?.some((clause: any) => clause.main_game_id)
        ) {
          const targetGameId =
            where.main_game_id ??
            where.OR?.find((clause: any) => clause.main_game_id)?.main_game_id;
          items = items.filter(
            (player) => player.main_game_id === targetGameId,
          );
        }

        if (
          where?.OR?.some((clause: any) => clause.game_profiles?.some?.game_id)
        ) {
          const targetGameId = where.OR.find(
            (clause: any) => clause.game_profiles?.some?.game_id,
          )?.game_profiles.some.game_id;
          items = items.filter((player) =>
            getPlayerGameProfiles(player.id).some(
              (profile) => profile.game_id === targetGameId,
            ),
          );
        }

        items = sortByOrder(items, orderBy);
        const limited = typeof take === "number" ? items.slice(0, take) : items;
        return limited.map(hydratePlayer);
      },
    },
    coach: {
      findUnique: async ({ where }: any) => {
        if (where.id) {
          const coach = coaches.find((entry) => entry.id === where.id);
          return coach ? hydrateCoach(coach) : null;
        }
        if (where.clerk_id) {
          const coach = coaches.find(
            (entry) => entry.clerk_id === where.clerk_id,
          );
          return coach ? hydrateCoach(coach) : null;
        }
        return null;
      },
      findMany: async ({ where, take, orderBy }: any = {}) => {
        let items = coaches.filter((coach) => {
          if (!where) return true;
          if (where.school_id?.not === null && coach.school_id === null) {
            return false;
          }
          if (where.id?.in) {
            return where.id.in.includes(coach.id);
          }
          if (where.OR) {
            return where.OR.some((clause: any) =>
              matchesCoachSearch(
                coach,
                clause.first_name?.contains ??
                  clause.last_name?.contains ??
                  clause.email?.contains ??
                  clause.username?.contains ??
                  clause.school?.contains ??
                  clause.school_ref?.is?.name?.contains ??
                  "",
              ),
            );
          }
          return true;
        });

        items = sortByOrder(items, orderBy);
        const limited = typeof take === "number" ? items.slice(0, take) : items;
        return limited.map(hydrateCoach);
      },
    },
    stripeCustomer: {
      findUnique: async ({ where, include }: any) => {
        const customer = where.clerk_user_id
          ? stripeCustomers.find(
              (entry) => entry.clerk_user_id === where.clerk_user_id,
            )
          : stripeCustomers.find(
              (entry) =>
                entry.id === where.id ||
                entry.stripe_customer_id === where.stripe_customer_id,
            );

        if (!customer) {
          return null;
        }

        return {
          ...customer,
          entitlements: filterEntitlements(
            customer.id,
            include?.entitlements?.where,
          ),
        };
      },
    },
    $transaction: async (callback: (tx: any) => Promise<unknown>) => {
      return callback(db);
    },
  };

  return {
    db,
    state: {
      conversations,
      messages,
      players,
      coaches,
      schools,
      stripeCustomers,
      entitlements,
      games,
      playerGameProfiles,
    },
    seedSchool(data: { name: string; slug: string }) {
      const school: SchoolRecord = {
        id: nextId("school"),
        name: data.name,
        slug: data.slug,
      };
      schools.push(school);
      return school;
    },
    seedGame(data: { name: string }) {
      const game: GameRecord = {
        id: nextId("game"),
        name: data.name,
      };
      games.push(game);
      return game;
    },
    seedPlayer(
      data: Partial<PlayerRecord> & {
        clerk_id: string;
        email: string;
        first_name: string;
        last_name: string;
        username: string;
      },
    ) {
      const player: PlayerRecord = {
        id: nextId("player"),
        image_url: null,
        school: null,
        class_year: null,
        location: null,
        gpa: null,
        main_game_id: null,
        ...data,
      };
      players.push(player);
      return player;
    },
    seedCoach(
      data: Partial<CoachRecord> & {
        clerk_id: string;
        email: string;
        first_name: string;
        last_name: string;
        username: string;
        school: string;
        school_id: string | null;
      },
    ) {
      const coach: CoachRecord = {
        id: nextId("coach"),
        image_url: null,
        ...data,
      };
      coaches.push(coach);
      return coach;
    },
    seedPlayerGameProfile(data: Omit<PlayerGameProfileRecord, "id">) {
      const profile: PlayerGameProfileRecord = {
        id: nextId("profile"),
        ...data,
      };
      playerGameProfiles.push(profile);
      return profile;
    },
    seedStripeCustomer(data: {
      clerk_user_id: string;
      stripe_customer_id: string;
      email: string;
    }) {
      const customer: StripeCustomerRecord = {
        id: nextId("customer"),
        ...data,
      };
      stripeCustomers.push(customer);
      return customer;
    },
    seedEntitlement(
      data: Omit<EntitlementRecord, "id" | "created_at" | "updated_at">,
    ) {
      const entitlement: EntitlementRecord = {
        id: nextId("entitlement"),
        created_at: new Date(),
        updated_at: new Date(),
        ...data,
      };
      entitlements.push(entitlement);
      return entitlement;
    },
  };
}
