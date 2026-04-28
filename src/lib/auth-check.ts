import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import prisma from "./db";

/**
 * Fetches a project only if the current user has permission to view it.
 * Permissions:
 * - Owner of the project
 * - Advisor of the project
 * - Active reviewer for the current workflow step
 * - Admin or University staff
 */
export async function getAuthorizedProject(projectId: string) {
  const session = await getServerSession(authOptions);
  if (!session) return { project: null, user: null };

  const user = session.user as any;
  const userRole = user.role;

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
    include: {
      workflowSteps: {
        orderBy: { stepOrder: 'asc' }
      },
      advisor: true,
      owner: true,
      documents: true,
      members: {
        include: {
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
        include: {
          user: {
            select: {
              fullName: true,
              role: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  return { project, user };
}
