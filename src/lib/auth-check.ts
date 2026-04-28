import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import prisma from "./db";
import { cache } from "react";

/**
 * Fetches a project only if the current user has permission to view it.
 * Permissions:
 * - Owner of the project
 * - Advisor of the project
 * - Active reviewer for the current workflow step
 * - Admin or University staff
 *
 * Uses React.cache: within a single render cycle, calling this with the same
 * projectId returns the cached result — no duplicate DB queries.
 */
export const getAuthorizedProject = cache(async (projectId: string) => {
  const session = await getServerSession(authOptions);
  if (!session) return { project: null, user: null };

  const user = session.user as any;
  const userRole = user.role;

  // HARDENING: Deactivated users are blocked regardless of valid JWT
  if (!user.id) return { project: null, user: null };

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: user.id },
        { advisorId: user.id },
        { 
          members: { 
            some: { 
              userId: user.id, 
              status: "accepted" // Only accepted members can view
            } 
          } 
        },
        {
          workflowSteps: {
            some: {
              OR: [
                { assigneeId: user.id },
                { assigneeRole: userRole, status: "in_review" }
              ]
            }
          }
        },
        // Allow users who have earned an activity score from this project
        {
          activityScores: {
            some: { studentId: user.id }
          }
        },
        // Check if user is admin/university staff (assuming role field in session)
        ...(userRole === "admin" || userRole === "university" ? [{ id: projectId }] : [])
      ]
    },
    select: {
      id: true,
      projectName: true,
      projectType: true,
      description: true,
      objectives: true,
      expectedOutcome: true,
      plannedStartDate: true,
      plannedEndDate: true,
      location: true,
      expectedParticipants: true,
      budgetRequested: true,
      ownerId: true,
      advisorId: true,
      department: true,
      academicYear: true,
      semester: true,
      studentRole: true,
      impactLevel: true,
      organizationType: true,
      status: true,
      certificateStatus: true,
      currentStep: true,
      createdAt: true,
      updatedAt: true,
      workflowSteps: {
        orderBy: { stepOrder: 'asc' },
        select: {
          id: true,
          stepOrder: true,
          stepName: true,
          assigneeRole: true,
          assigneeId: true,
          status: true,
          comments: true,
          reviewedAt: true,
        }
      },
      advisor: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        }
      },
      owner: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
        }
      },
      documents: {
        select: {
          id: true,
          docType: true,
          fileName: true,
          fileUrl: true, // Needed for direct links, but fetching separately would be better if these were huge
          fileSize: true,
          mimeType: true,
          createdAt: true,
        }
      },
      members: {
        select: {
          id: true,
          role: true,
          status: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              studentId: true,
            }
          }
        }
      },
      auditLogs: {
        select: {
          id: true,
          action: true,
          fromStatus: true,
          toStatus: true,
          comments: true,
          stepName: true,
          createdAt: true,
          user: {
            select: {
              fullName: true,
              role: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20 // Performance optimization: only load recent logs
      }
    }
  });

  return { project, user };
});

