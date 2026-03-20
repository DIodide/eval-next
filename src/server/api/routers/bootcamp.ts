import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  playerProcedure,
} from "@/server/api/trpc";
import type { PrismaClient } from "@prisma/client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
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
  getBootcampProgress: playerProcedure
    .input(z.object({ bootcampSlug: z.string() }))
    .query(async ({ ctx, input }) => {
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
              player_id: ctx.playerId,
              bootcamp_id: bootcamp.id,
            },
          },
        }),
        ctx.db.userLessonProgress.findMany({
          where: {
            player_id: ctx.playerId,
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
  markVideoWatched: playerProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { allowed, reason } = await canAccessLesson(
        ctx.db,
        ctx.playerId,
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
            player_id: ctx.playerId,
            lesson_id: input.lessonId,
          },
        },
        update: { video_watched: true },
        create: {
          player_id: ctx.playerId,
          lesson_id: input.lessonId,
          video_watched: true,
        },
      });

      // Initialize bootcamp progress if needed
      await ctx.db.userBootcampProgress.upsert({
        where: {
          player_id_bootcamp_id: {
            player_id: ctx.playerId,
            bootcamp_id: lesson.module.bootcamp_id,
          },
        },
        update: {},
        create: {
          player_id: ctx.playerId,
          bootcamp_id: lesson.module.bootcamp_id,
        },
      });

      return { success: true };
    }),

  /**
   * Submit quiz answers — grades server-side, 100% required to pass
   */
  submitQuiz: playerProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
        answers: z.array(z.number().int().min(0)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { allowed, reason } = await canAccessLesson(
        ctx.db,
        ctx.playerId,
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
            player_id: ctx.playerId,
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
            player_id: ctx.playerId,
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
        ctx.playerId,
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
  submitReflection: playerProcedure
    .input(
      z.object({
        lessonId: z.string().uuid(),
        reflectionText: z.string().min(100).max(5000).trim(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { allowed, reason } = await canAccessLesson(
        ctx.db,
        ctx.playerId,
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
            player_id: ctx.playerId,
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
            player_id: ctx.playerId,
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
        ctx.playerId,
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
  getProgressSummary: playerProcedure
    .input(z.object({ bootcampSlug: z.string() }))
    .query(async ({ ctx, input }) => {
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
              player_id: ctx.playerId,
              bootcamp_id: bootcamp.id,
            },
          },
        }),
        ctx.db.playerBadge.findMany({
          where: { player_id: ctx.playerId },
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
          player_id: ctx.playerId,
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
  getLessonProgress: playerProcedure
    .input(z.object({ lessonId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const progress = await ctx.db.userLessonProgress.findUnique({
        where: {
          player_id_lesson_id: {
            player_id: ctx.playerId,
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
        completed: !!progress.completed_at,
      };
    }),
});
