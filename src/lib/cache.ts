/**
 * Server-side cache helpers using Next.js unstable_cache.
 *
 * WHY: At 10,000 concurrent users, repeated calls to the same expensive DB
 * aggregates (dashboard stats, notification counts) would create massive
 * query pressure. unstable_cache stores results in the Next.js server-side
 * in-process cache with a TTL — no Redis required.
 *
 * Tags allow targeted invalidation (e.g. after a project status change).
 */
import { unstable_cache } from "next/cache";
import prisma from "@/lib/db";

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export const getCachedStudentStats = (userId: string) =>
  unstable_cache(
    async () => {
      const [approvedCount, pendingCount, revisionCount, totalParticipants] =
        await Promise.all([
          prisma.project.count({ where: { ownerId: userId, status: "completed" } }),
          prisma.project.count({
            where: {
              ownerId: userId,
              status: {
                in: [
                  "submitted",
                  "under_review",
                  "summary_submitted",
                  "summary_under_review",
                ],
              },
            },
          }),
          prisma.project.count({
            where: { ownerId: userId, status: "revision_required" },
          }),
          prisma.project.aggregate({
            where: { ownerId: userId },
            _sum: { expectedParticipants: true },
          }),
        ]);

      return { approvedCount, pendingCount, revisionCount, totalParticipants };
    },
    [`dashboard-stats-student-${userId}`],
    {
      revalidate: 60, // 60-second TTL
      tags: [`dashboard`, `user-${userId}`],
    }
  )();

export const getCachedAdminStats = () =>
  unstable_cache(
    async () => {
      const [allProjects, allPending, allCompleted, allUsers] =
        await Promise.all([
          prisma.project.count(),
          prisma.project.count({ where: { status: "under_review" } }),
          prisma.project.count({ where: { status: "completed" } }),
          prisma.user.count(),
        ]);

      return { allProjects, allPending, allCompleted, allUsers };
    },
    [`dashboard-stats-admin`],
    {
      revalidate: 60, // 60-second TTL — global stats can be slightly stale
      tags: [`dashboard`, `admin-stats`],
    }
  )();

// ─── Notification Unread Count ────────────────────────────────────────────────

export const getCachedUnreadCount = (userId: string) =>
  unstable_cache(
    async () => {
      const count = await prisma.notification.count({
        where: { userId, isRead: false },
      });
      return count;
    },
    [`unread-count-${userId}`],
    {
      revalidate: 30, // 30-second TTL — matches the old polling interval
      tags: [`notifications`, `user-${userId}`],
    }
  )();

// ─── Activity Score Total ─────────────────────────────────────────────────────

export const getCachedScoreTotal = (userId: string) =>
  unstable_cache(
    async () => {
      const result = await prisma.activityScore.aggregate({
        where: { studentId: userId },
        _sum: { score: true },
        _count: { id: true },
      });
      return {
        total: result._sum.score ?? 0,
        count: result._count.id,
      };
    },
    [`score-total-${userId}`],
    {
      revalidate: 120, // Scores change infrequently — 2-minute TTL is fine
      tags: [`scores`, `user-${userId}`],
    }
  )();
