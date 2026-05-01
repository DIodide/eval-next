import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import type { PrismaClient } from "@prisma/client";
import { FEATURE_KEYS, hasFeatureAccess } from "@/lib/server/plan-access";

// Checks feature access only for modules beyond the first (order_index > 0).
// Module 0 is always free — call this before any write or gated read.
async function assertBootcampAccess(
  db: PrismaClient,
  userId: string,
  lessonId: string,
) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { order_index: true } } },
  });
  if (!lesson) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
  }
  if (lesson.module.order_index === 0) return; // first module is always free
  const ok = await hasFeatureAccess(userId, FEATURE_KEYS.BOOTCAMP_ACCESS);
  if (!ok) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Requires plan feature: ${FEATURE_KEYS.BOOTCAMP_ACCESS}`,
    });
  }
}

// ─── Helper: Resolve player ID from clerk auth ──────────────────────────────

async function resolvePlayerId(
  db: PrismaClient,
  userId: string | null,
): Promise<string> {
  if (!userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  const player = await db.player.findUnique({
    where: { clerk_id: userId },
    select: { id: true },
  });
  if (!player) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "No player profile found. Please complete your player profile setup first.",
    });
  }
  return player.id;
}


// ─── Types ───────────────────────────────────────────────────────────────────

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
}

// ─── Helper: Check if step interactive data is complete ──────────────────────

function isStepDataComplete(
  moduleOrderIndex: number,
  stepData: Record<string, unknown>,
): boolean {
  switch (moduleOrderIndex) {
    case 0: {
      // Step 1: Define Your Why - uses existing quiz/reflection flow, not step_data
      // This is handled by the legacy isLessonComplete() check instead
      return false;
    }
    case 1: {
      // Step 2: College list - Game, GPA, college rankings (5 schools), recruiting factors
      const collegeRankings = stepData.college_rankings as string[] | undefined;
      return (
        Array.isArray(collegeRankings) &&
        collegeRankings.length >= 5
      );
    }
    case 2: {
      // Step 3: Profile / Coach Perspective Workshop
      const coachPerspective = stepData.coach_perspective as Record<string, string> | undefined;
      if (!coachPerspective) return false;
      return (
        typeof coachPerspective.biggest_strength === "string" && coachPerspective.biggest_strength.trim().length > 0 &&
        typeof coachPerspective.biggest_growth_area === "string" && coachPerspective.biggest_growth_area.trim().length > 0 &&
        typeof coachPerspective.role_on_team === "string" && coachPerspective.role_on_team.trim().length > 0 &&
        typeof coachPerspective.example_leadership === "string" && coachPerspective.example_leadership.trim().length > 0 &&
        typeof coachPerspective.example_resilience === "string" && coachPerspective.example_resilience.trim().length > 0
      );
    }
    case 3: {
      // Step 4: Highlight reel - either watched examples or uploaded clips
      const reelAction = stepData.reel_action_completed as boolean | undefined;
      return reelAction === true;
    }
    case 4: {
      // Step 5: Email writing
      const emailDraft = stepData.email_draft as Record<string, string> | undefined;
      if (!emailDraft) return false;
      return (
        typeof emailDraft.who_you_are === "string" && emailDraft.who_you_are.trim().length > 0 &&
        typeof emailDraft.what_you_play === "string" && emailDraft.what_you_play.trim().length > 0 &&
        typeof emailDraft.your_experience === "string" && emailDraft.your_experience.trim().length > 0 &&
        typeof emailDraft.academics_character === "string" && emailDraft.academics_character.trim().length > 0 &&
        typeof emailDraft.why_reaching_out === "string" && emailDraft.why_reaching_out.trim().length > 0
      );
    }
    default:
      return false;
  }
}

// ─── Helper: Check if a lesson is complete ───────────────────────────────────

function isLessonComplete(progress: {
  video_watched: boolean;
  quiz_passed: boolean;
  requires_reflection: boolean;
  reflection_submitted_at: Date | null;
}): boolean {
  if (!progress.video_watched) return false;
  if (!progress.quiz_passed) return false;
  if (progress.requires_reflection && !progress.reflection_submitted_at)
    return false;
  return true;
}

// ─── Helper: Check if player can access a lesson (progression enforcement) ──

async function canAccessLesson(
  db: PrismaClient,
  playerId: string,
  lessonId: string,
) {
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          bootcamp: {
            include: {
              modules: {
                where: { is_published: true },
                orderBy: { order_index: "asc" },
                include: {
                  lessons: {
                    where: { is_published: true },
                    orderBy: { order_index: "asc" },
                    select: {
                      id: true,
                      order_index: true,
                      requires_reflection: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
  }

  const modules = lesson.module.bootcamp.modules;
  const currentModuleData = modules.find(
    (m) => m.id === lesson.module.id,
  );

  if (!currentModuleData) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Module not found" });
  }

  // Check all prior modules are complete
  for (const mod of modules) {
    if (mod.order_index >= currentModuleData.order_index) break;

    for (const prevLesson of mod.lessons) {
      const progress = await db.userLessonProgress.findUnique({
        where: {
          player_id_lesson_id: { player_id: playerId, lesson_id: prevLesson.id },
        },
      });

      if (
        !progress ||
        !isLessonComplete({
          video_watched: progress.video_watched,
          quiz_passed: progress.quiz_passed,
          requires_reflection: prevLesson.requires_reflection,
          reflection_submitted_at: progress.reflection_submitted_at,
        })
      ) {
        return { allowed: false, lesson, reason: "Previous module not complete" };
      }
    }
  }

  // Check prior lessons within the same module
  for (const prevLesson of currentModuleData.lessons) {
    if (prevLesson.order_index >= lesson.order_index) break;

    const progress = await db.userLessonProgress.findUnique({
      where: {
        player_id_lesson_id: { player_id: playerId, lesson_id: prevLesson.id },
      },
    });

    if (
      !progress ||
      !isLessonComplete({
        video_watched: progress.video_watched,
        quiz_passed: progress.quiz_passed,
        requires_reflection: prevLesson.requires_reflection,
        reflection_submitted_at: progress.reflection_submitted_at,
      })
    ) {
      return {
        allowed: false,
        lesson,
        reason: "Previous lesson not complete",
      };
    }
  }

  return { allowed: true, lesson };
}

// ─── Helper: Recalculate and update bootcamp progress ────────────────────────

async function recalculateBootcampProgress(
  db: PrismaClient,
  playerId: string,
  bootcampId: string,
) {
  const bootcamp = await db.bootcamp.findUnique({
    where: { id: bootcampId },
    include: {
      modules: {
        where: { is_published: true },
        orderBy: { order_index: "asc" },
        include: {
          lessons: {
            where: { is_published: true },
            orderBy: { order_index: "asc" },
            select: { id: true, requires_reflection: true },
          },
        },
      },
    },
  });

  if (!bootcamp) return;

  const allLessons = bootcamp.modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  if (totalLessons === 0) return;

  const lessonProgress = await db.userLessonProgress.findMany({
    where: {
      player_id: playerId,
      lesson_id: { in: allLessons.map((l) => l.id) },
    },
  });

  const progressMap = new Map(
    lessonProgress.map((p) => [p.lesson_id, p]),
  );

  let completedLessons = 0;
  let currentModuleIndex = 0;

  for (const mod of bootcamp.modules) {
    let moduleComplete = true;
    for (const lesson of mod.lessons) {
      const lp = progressMap.get(lesson.id);
      if (
        lp &&
        isLessonComplete({
          video_watched: lp.video_watched,
          quiz_passed: lp.quiz_passed,
          requires_reflection: lesson.requires_reflection,
          reflection_submitted_at: lp.reflection_submitted_at,
        })
      ) {
        completedLessons++;
      } else {
        moduleComplete = false;
      }
    }
    if (moduleComplete) {
      currentModuleIndex = Math.min(
        mod.order_index + 1,
        bootcamp.modules.length - 1,
      );
    }
  }

  const completionPercentage = Math.round(
    (completedLessons / totalLessons) * 100,
  );
  const isComplete = completedLessons === totalLessons;

  await db.userBootcampProgress.upsert({
    where: {
      player_id_bootcamp_id: { player_id: playerId, bootcamp_id: bootcampId },
    },
    update: {
      completion_percentage: completionPercentage,
      current_module_index: currentModuleIndex,
      completed_at: isComplete ? new Date() : null,
    },
    create: {
      player_id: playerId,
      bootcamp_id: bootcampId,
      completion_percentage: completionPercentage,
      current_module_index: currentModuleIndex,
      completed_at: isComplete ? new Date() : null,
    },
  });

  // Award badge if complete
  if (isComplete) {
    await db.playerBadge.upsert({
      where: {
        player_id_badge_type: {
          player_id: playerId,
          badge_type: "EVAL_VERIFIED",
        },
      },
      update: {},
      create: {
        player_id: playerId,
        badge_type: "EVAL_VERIFIED",
        metadata: { bootcamp_id: bootcampId, bootcamp_slug: bootcamp.slug },
      },
    });
  }

  return { completionPercentage, isComplete };
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const bootcampRouter = createTRPCRouter({
  /**
   * Get bootcamp overview (public — no auth required)
   */
  getBootcamp: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const bootcamp = await ctx.db.bootcamp.findUnique({
        where: { slug: input.slug, is_published: true },
        include: {
          modules: {
            where: { is_published: true },
            orderBy: { order_index: "asc" },
            include: {
              lessons: {
                where: { is_published: true },
                orderBy: { order_index: "asc" },
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  description: true,
                  order_index: true,
                  requires_reflection: true,
                },
              },
            },
          },
        },
      });

      if (!bootcamp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bootcamp not found",
        });
      }

      return bootcamp;
    }),

  /**
   * Get player's full progress for a bootcamp
   */
  getBootcampProgress: protectedProcedure
    .input(z.object({ bootcampSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const playerId = await resolvePlayerId(ctx.db, ctx.auth.userId);
      const bootcamp = await ctx.db.bootcamp.findUnique({
        where: { slug: input.bootcampSlug, is_published: true },
        include: {
          modules: {
            where: { is_published: true },
            orderBy: { order_index: "asc" },
            include: {
              lessons: {
                where: { is_published: true },
                orderBy: { order_index: "asc" },
                select: {
                  id: true,
                  slug: true,
                  title: true,
                  order_index: true,
                  requires_reflection: true,
                },
              },
            },
          },
        },
      });

      if (!bootcamp) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bootcamp not found",
        });
      }

      const allLessonIds = bootcamp.modules.flatMap((m) =>
        m.lessons.map((l) => l.id),
      );

      const [overallProgress, lessonProgress] = await Promise.all([
        ctx.db.userBootcampProgress.findUnique({
          where: {
            player_id_bootcamp_id: {
              player_id: playerId,
              bootcamp_id: bootcamp.id,
            },
          },
        }),
        ctx.db.userLessonProgress.findMany({
          where: {
            player_id: playerId,
            lesson_id: { in: allLessonIds },
          },
        }),
      ]);

      const progressMap = new Map(
        lessonProgress.map((p) => [p.lesson_id, p]),
      );

      const modulesWithProgress = bootcamp.modules.map((mod) => ({
        ...mod,
        lessons: mod.lessons.map((lesson) => {
          const lp = progressMap.get(lesson.id);
          return {
            ...lesson,
            progress: lp
              ? {
                  video_watched: lp.video_watched,
                  quiz_passed: lp.quiz_passed,
                  quiz_score: lp.quiz_score,
                  quiz_attempts: lp.quiz_attempts,
                  reflection_submitted: !!lp.reflection_submitted_at,
                  completed: !!lp.completed_at,
                }
              : null,
          };
        }),
      }));

      return {
        bootcamp: {
          id: bootcamp.id,
          slug: bootcamp.slug,
          title: bootcamp.title,
          description: bootcamp.description,
        },
        overallProgress: overallProgress
          ? {
              completionPercentage: overallProgress.completion_percentage,
              currentModuleIndex: overallProgress.current_module_index,
              startedAt: overallProgress.started_at,
              completedAt: overallProgress.completed_at,
            }
          : null,
        modules: modulesWithProgress,
      };
    }),

  /**
   * Get full lesson content (public for free modules, auth for others)
   */
  getLesson: publicProcedure
    .input(
      z.object({
        moduleSlug: z.string(),
        lessonSlug: z.string(),
        bootcampSlug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const lesson = await ctx.db.lesson.findFirst({
        where: {
          slug: input.lessonSlug,
          module: {
            slug: input.moduleSlug,
            bootcamp: { slug: input.bootcampSlug, is_published: true },
            is_published: true,
          },
          is_published: true,
        },
        include: {
          module: {
            include: {
              bootcamp: { select: { id: true, slug: true, title: true } },
            },
          },
          quiz: {
            select: {
              id: true,
              title: true,
              passing_score: true,
              questions: true,
            },
          },
        },
      });

      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }

      // Strip correct answers from quiz questions for client
      let quizForClient: {
        id: string;
        title: string;
        passingScore: number;
        totalQuestions: number;
        questions: { question: string; options: string[] }[];
      } | null = null;

      if (lesson.quiz) {
        const questions = lesson.quiz.questions as unknown as QuizQuestion[];
        quizForClient = {
          id: lesson.quiz.id,
          title: lesson.quiz.title,
          passingScore: lesson.quiz.passing_score,
          totalQuestions: questions.length,
          questions: questions.map((q) => ({
            question: q.question,
            options: q.options,
          })),
        };
      }

      return {
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.video_url,
        videoHlsUrl: lesson.video_hls_url,
        transcriptVttUrl: lesson.transcript_vtt_url,
        posterUrl: lesson.poster_url,
        durationSeconds: lesson.duration_seconds,
        chapters: lesson.chapters as
          | { start: number; end: number; title: string }[]
          | null,
        contentMarkdown: lesson.content_markdown,
        commonQuestions: lesson.common_questions as
          | { question: string; answer: string }[]
          | null,
        orderIndex: lesson.order_index,
        requiresReflection: lesson.requires_reflection,
        module: {
          slug: lesson.module.slug,
          title: lesson.module.title,
          isFree: lesson.module.is_free,
          orderIndex: lesson.module.order_index,
        },
        bootcamp: lesson.module.bootcamp,
        quiz: quizForClient,
      };
    }),

  /**
   * Mark a video as watched
   */
  markVideoWatched: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await assertBootcampAccess(ctx.db, ctx.auth.userId, input.lessonId);
      const playerId = await resolvePlayerId(ctx.db, ctx.auth.userId);
      const { allowed, reason } = await canAccessLesson(
        ctx.db,
        playerId,
        input.lessonId,
      );

      if (!allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: reason ?? "Cannot access this lesson yet",
        });
      }

      const lesson = await ctx.db.lesson.findUnique({
        where: { id: input.lessonId },
        include: { module: { select: { bootcamp_id: true } } },
      });

      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }

      await ctx.db.userLessonProgress.upsert({
        where: {
          player_id_lesson_id: {
            player_id: playerId,
            lesson_id: input.lessonId,
          },
        },
        update: { video_watched: true },
        create: {
          player_id: playerId,
          lesson_id: input.lessonId,
          video_watched: true,
        },
      });

      // Initialize bootcamp progress if needed
      await ctx.db.userBootcampProgress.upsert({
        where: {
          player_id_bootcamp_id: {
            player_id: playerId,
            bootcamp_id: lesson.module.bootcamp_id,
          },
        },
        update: {},
        create: {
          player_id: playerId,
          bootcamp_id: lesson.module.bootcamp_id,
        },
      });

      return { success: true };
    }),

  /**
   * Submit quiz answers — grades server-side, 100% required to pass
   */
  submitQuiz: protectedProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
        answers: z.array(z.number().int().min(0)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertBootcampAccess(ctx.db, ctx.auth.userId, input.lessonId);
      const playerId = await resolvePlayerId(ctx.db, ctx.auth.userId);
      const { allowed, reason } = await canAccessLesson(
        ctx.db,
        playerId,
        input.lessonId,
      );

      if (!allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: reason ?? "Cannot access this lesson yet",
        });
      }

      // Check video was watched first
      const currentProgress = await ctx.db.userLessonProgress.findUnique({
        where: {
          player_id_lesson_id: {
            player_id: playerId,
            lesson_id: input.lessonId,
          },
        },
      });

      if (!currentProgress?.video_watched) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must watch the video before taking the quiz",
        });
      }

      const lesson = await ctx.db.lesson.findUnique({
        where: { id: input.lessonId },
        include: {
          quiz: true,
          module: { select: { bootcamp_id: true } },
        },
      });

      if (!lesson?.quiz) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quiz not found for this lesson",
        });
      }

      const questions = lesson.quiz.questions as unknown as QuizQuestion[];

      if (input.answers.length !== questions.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Expected ${questions.length} answers, got ${input.answers.length}`,
        });
      }

      // Grade
      let correctCount = 0;
      const correctAnswers: number[] = [];
      for (let i = 0; i < questions.length; i++) {
        correctAnswers.push(questions[i]!.correct_index);
        if (input.answers[i] === questions[i]!.correct_index) {
          correctCount++;
        }
      }

      const passed = correctCount >= lesson.quiz.passing_score;

      // Determine if lesson is now complete
      const lessonComplete =
        passed &&
        (!lesson.requires_reflection || currentProgress.reflection_submitted_at !== null);

      await ctx.db.userLessonProgress.update({
        where: {
          player_id_lesson_id: {
            player_id: playerId,
            lesson_id: input.lessonId,
          },
        },
        data: {
          quiz_passed: passed || currentProgress.quiz_passed, // Don't un-pass
          quiz_score: correctCount,
          quiz_attempts: { increment: 1 },
          last_quiz_answers: input.answers,
          completed_at: lessonComplete ? new Date() : currentProgress.completed_at,
        },
      });

      // Recalculate bootcamp progress
      const progressResult = await recalculateBootcampProgress(
        ctx.db,
        playerId,
        lesson.module.bootcamp_id,
      );

      return {
        passed,
        score: correctCount,
        total: questions.length,
        correctAnswers,
        bootcampComplete: progressResult?.isComplete ?? false,
        completionPercentage: progressResult?.completionPercentage ?? 0,
      };
    }),

  /**
   * Submit written reflection (Step 1)
   */
  submitReflection: protectedProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
        reflectionText: z.string().min(100).max(5000).trim(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertBootcampAccess(ctx.db, ctx.auth.userId, input.lessonId);
      const playerId = await resolvePlayerId(ctx.db, ctx.auth.userId);
      const { allowed, reason } = await canAccessLesson(
        ctx.db,
        playerId,
        input.lessonId,
      );

      if (!allowed) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: reason ?? "Cannot access this lesson yet",
        });
      }

      const lesson = await ctx.db.lesson.findUnique({
        where: { id: input.lessonId },
        include: { module: { select: { bootcamp_id: true } } },
      });

      if (!lesson) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Lesson not found",
        });
      }

      if (!lesson.requires_reflection) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This lesson does not require a reflection",
        });
      }

      const currentProgress = await ctx.db.userLessonProgress.findUnique({
        where: {
          player_id_lesson_id: {
            player_id: playerId,
            lesson_id: input.lessonId,
          },
        },
      });

      if (!currentProgress?.video_watched) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You must watch the video before submitting a reflection",
        });
      }

      const lessonComplete = currentProgress.quiz_passed;

      await ctx.db.userLessonProgress.update({
        where: {
          player_id_lesson_id: {
            player_id: playerId,
            lesson_id: input.lessonId,
          },
        },
        data: {
          reflection_text: input.reflectionText,
          reflection_submitted_at: new Date(),
          completed_at: lessonComplete
            ? new Date()
            : currentProgress.completed_at,
        },
      });

      // Recalculate bootcamp progress
      const progressResult = await recalculateBootcampProgress(
        ctx.db,
        playerId,
        lesson.module.bootcamp_id,
      );

      return {
        success: true,
        bootcampComplete: progressResult?.isComplete ?? false,
        completionPercentage: progressResult?.completionPercentage ?? 0,
      };
    }),

  /**
   * Get lightweight progress summary (for sidebar badge, dashboard)
   */
  getProgressSummary: protectedProcedure
    .input(z.object({ bootcampSlug: z.string() }))
    .query(async ({ ctx, input }) => {
      const playerId = await resolvePlayerId(ctx.db, ctx.auth.userId);
      const bootcamp = await ctx.db.bootcamp.findUnique({
        where: { slug: input.bootcampSlug },
        select: { id: true },
      });

      if (!bootcamp) {
        return {
          completionPercentage: 0,
          totalLessons: 0,
          completedLessons: 0,
          badges: [],
          started: false,
        };
      }

      const [progress, badges] = await Promise.all([
        ctx.db.userBootcampProgress.findUnique({
          where: {
            player_id_bootcamp_id: {
              player_id: playerId,
              bootcamp_id: bootcamp.id,
            },
          },
        }),
        ctx.db.playerBadge.findMany({
          where: { player_id: playerId },
          select: { badge_type: true, earned_at: true },
        }),
      ]);

      // Count total and completed lessons
      const allLessons = await ctx.db.lesson.findMany({
        where: {
          module: { bootcamp_id: bootcamp.id, is_published: true },
          is_published: true,
        },
        select: { id: true, requires_reflection: true },
      });

      const completedProgress = await ctx.db.userLessonProgress.findMany({
        where: {
          player_id: playerId,
          lesson_id: { in: allLessons.map((l) => l.id) },
          completed_at: { not: null },
        },
      });

      return {
        completionPercentage: progress?.completion_percentage ?? 0,
        totalLessons: allLessons.length,
        completedLessons: completedProgress.length,
        badges: badges.map((b) => ({
          type: b.badge_type,
          earnedAt: b.earned_at,
        })),
        started: !!progress,
      };
    }),

  /**
   * Get lesson progress for a specific lesson (used by lesson page)
   */
  getLessonProgress: protectedProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const playerId = await resolvePlayerId(ctx.db, ctx.auth.userId);
      const progress = await ctx.db.userLessonProgress.findUnique({
        where: {
          player_id_lesson_id: {
            player_id: playerId,
            lesson_id: input.lessonId,
          },
        },
      });

      if (!progress) {
        return null;
      }

      return {
        videoWatched: progress.video_watched,
        quizPassed: progress.quiz_passed,
        quizScore: progress.quiz_score,
        quizAttempts: progress.quiz_attempts,
        reflectionText: progress.reflection_text,
        reflectionSubmitted: !!progress.reflection_submitted_at,
        stepData: progress.step_data as Record<string, unknown> | null,
        lastPositionSeconds: progress.last_position_seconds,
        completed: !!progress.completed_at,
      };
    }),

  /**
   * Persist the player's last playback position so the video can resume on
   * next visit. Throttle client-side — this runs on pause/beforeunload and
   * roughly every 5s during playback.
   */
  saveLastPosition: protectedProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
        positionSeconds: z.number().int().min(0).max(86400),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertBootcampAccess(ctx.db, ctx.auth.userId, input.lessonId);
      const playerId = await resolvePlayerId(ctx.db, ctx.auth.userId);
      await ctx.db.userLessonProgress.upsert({
        where: {
          player_id_lesson_id: {
            player_id: playerId,
            lesson_id: input.lessonId,
          },
        },
        update: { last_position_seconds: input.positionSeconds },
        create: {
          player_id: playerId,
          lesson_id: input.lessonId,
          last_position_seconds: input.positionSeconds,
        },
      });
      return { ok: true as const };
    }),

  /**
   * Save interactive step data (why_esports, your_why, college rankings, etc.)
   * and mark the step/lesson as complete when all required fields are filled.
   */
  saveStepData: protectedProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
        stepData: z.record(z.unknown()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await assertBootcampAccess(ctx.db, ctx.auth.userId, input.lessonId);
      const playerId = await resolvePlayerId(ctx.db, ctx.auth.userId);

      const lesson = await ctx.db.lesson.findUnique({
        where: { id: input.lessonId },
        include: { module: { select: { bootcamp_id: true, order_index: true } } },
      });

      if (!lesson) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Lesson not found" });
      }

      // Get or create progress
      const existing = await ctx.db.userLessonProgress.findUnique({
        where: {
          player_id_lesson_id: { player_id: playerId, lesson_id: input.lessonId },
        },
      });

      const existingData = (existing?.step_data ?? {}) as Record<string, unknown>;
      const mergedStepData = {
        ...existingData,
        ...input.stepData,
      };

      // Determine if this step should be marked complete based on its module
      const stepComplete = isStepDataComplete(lesson.module.order_index, mergedStepData);

      // Cast to satisfy Prisma's Json type
      const jsonStepData = mergedStepData as unknown as Record<string, string | number | boolean | null>;

      await ctx.db.userLessonProgress.upsert({
        where: {
          player_id_lesson_id: { player_id: playerId, lesson_id: input.lessonId },
        },
        update: {
          step_data: jsonStepData,
          video_watched: true,
          quiz_passed: stepComplete,
          completed_at: stepComplete ? new Date() : existing?.completed_at ?? null,
        },
        create: {
          player_id: playerId,
          lesson_id: input.lessonId,
          step_data: jsonStepData,
          video_watched: true,
          quiz_passed: stepComplete,
          completed_at: stepComplete ? new Date() : null,
        },
      });

      // Initialize bootcamp progress if needed
      await ctx.db.userBootcampProgress.upsert({
        where: {
          player_id_bootcamp_id: {
            player_id: playerId,
            bootcamp_id: lesson.module.bootcamp_id,
          },
        },
        update: {},
        create: {
          player_id: playerId,
          bootcamp_id: lesson.module.bootcamp_id,
        },
      });

      const progressResult = await recalculateBootcampProgress(
        ctx.db,
        playerId,
        lesson.module.bootcamp_id,
      );

      return {
        success: true,
        stepComplete,
        stepData: mergedStepData,
        bootcampComplete: progressResult?.isComplete ?? false,
        completionPercentage: progressResult?.completionPercentage ?? 0,
      };
    }),

  /**
   * Search colleges on the platform (for Step 2 college ranking)
   */
  searchColleges: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        type: { in: ["COLLEGE", "UNIVERSITY"] },
      };

      if (input.query && input.query.trim().length > 0) {
        where.name = { contains: input.query.trim(), mode: "insensitive" };
      }

      const schools = await ctx.db.school.findMany({
        where,
        select: {
          id: true,
          name: true,
          location: true,
          state: true,
          type: true,
          logo_url: true,
          scholarships_available: true,
          esports_titles: true,
        },
        orderBy: { name: "asc" },
        take: input.limit,
      });

      return schools;
    }),

  /**
   * Fetch the very first lesson of the first module for the homepage teaser.
   * Public, no auth required. Returns only what the video player needs.
   */
  getHomepageTeaser: publicProcedure.query(async ({ ctx }) => {
    const lesson = await ctx.db.lesson.findFirst({
      where: {
        order_index: 0,
        is_published: true,
        module: {
          order_index: 0,
          is_published: true,
          bootcamp: { slug: "recruit-bootcamp", is_published: true },
        },
      },
      select: {
        title: true,
        slug: true,
        video_url: true,
        video_hls_url: true,
        poster_url: true,
        duration_seconds: true,
        module: { select: { slug: true } },
      },
    });

    if (!lesson) return null;

    return {
      title: lesson.title,
      slug: lesson.slug,
      moduleSlug: lesson.module.slug,
      videoUrl: lesson.video_url,
      videoHlsUrl: lesson.video_hls_url,
      posterUrl: lesson.poster_url,
      durationSeconds: lesson.duration_seconds,
    };
  }),

  /**
   * Public read of a lesson within the first (free) module so guests can
   * preview Step 1 without signing in. Only resolves when module.order_index === 0.
   * Returns full content including quiz answers — this is intentional for the
   * client-side teaser experience; access stops at the next module.
   */
  getPublicStepOneLesson: publicProcedure
    .input(
      z.object({
        moduleSlug: z.string(),
        lessonSlug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const lesson = await ctx.db.lesson.findFirst({
        where: {
          slug: input.lessonSlug,
          is_published: true,
          module: {
            slug: input.moduleSlug,
            order_index: 0,
            is_published: true,
            bootcamp: { slug: "recruit-bootcamp", is_published: true },
          },
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          video_url: true,
          video_hls_url: true,
          transcript_vtt_url: true,
          poster_url: true,
          duration_seconds: true,
          content_markdown: true,
          common_questions: true,
          requires_reflection: true,
          quiz: {
            select: {
              title: true,
              passing_score: true,
              questions: true,
            },
          },
          module: {
            select: {
              slug: true,
              title: true,
              description: true,
              order_index: true,
            },
          },
        },
      });

      if (!lesson) return null;

      return {
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description,
        videoUrl: lesson.video_url,
        videoHlsUrl: lesson.video_hls_url,
        transcriptVttUrl: lesson.transcript_vtt_url,
        posterUrl: lesson.poster_url,
        durationSeconds: lesson.duration_seconds,
        contentMarkdown: lesson.content_markdown,
        commonQuestions: lesson.common_questions,
        requiresReflection: lesson.requires_reflection,
        quiz: lesson.quiz,
        module: {
          slug: lesson.module.slug,
          title: lesson.module.title,
          description: lesson.module.description,
          orderIndex: lesson.module.order_index,
        },
      };
    }),
});
