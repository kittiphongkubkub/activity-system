import prisma from "@/lib/db";
import { notifyStatusChange, createNotification } from "./notifications";

export const WORKFLOW_ROLES = [
  { step_order: 1, step_name: "อาจารย์ที่ปรึกษา", assignee_role: "advisor" },
  { step_order: 2, step_name: "ประธานหลักสูตร", assignee_role: "program_chair" },
  { step_order: 3, step_name: "หัวหน้าสาขาวิชา", assignee_role: "dept_head" },
  { step_order: 4, step_name: "ประชุมคณะ (กบค.)", assignee_role: "faculty_committee" },
  { step_order: 5, step_name: "คณบดี", assignee_role: "dean" },
  { step_order: 6, step_name: "มหาวิทยาลัย", assignee_role: "university" },
];

// --- SCORING CONFIGURATION BASED ON NEW IMAGE GUIDELINES ---

const MANAGEMENT_SCORES: Record<string, Record<string, number>> = {
  union: { president: 10, vp: 8, committee: 5 },
  club: { president: 8, vp: 6, committee: 4 },
  working_group: { president: 8, vp: 6, committee: 4, operator: 4 }, // Added operator to working group as per 1.3
};

const IMPACT_SCORES: Record<string, number> = {
  national: 10,
  community: 8,
  university: 6,
  faculty: 4,
  personal: 2,
};

const PARTICIPATION_SCORES: Record<string, number> = {
  operator: 2,
  participant: 1,
};

export async function createWorkflowSteps(projectId: string, docType: "025" | "027", userId?: string) {
  await prisma.workflowStep.deleteMany({
    where: { projectId, docType },
  });

  const steps = WORKFLOW_ROLES.map((role, index) => ({
    projectId,
    docType,
    stepOrder: role.step_order,
    stepName: role.step_name + (docType === "027" ? " (สรุปผล)" : ""),
    assigneeRole: role.assignee_role,
    status: index === 0 ? "in_review" : "pending",
  }));

  // Create audit log for submission/resubmission
  if (userId) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    await prisma.auditLog.create({
      data: {
        projectId,
        userId,
        action: docType === "027" ? "summary_submit" : "submit",
        fromStatus: project?.status,
        toStatus: docType === "027" ? "summary_submitted" : "submitted",
        stepName: "ระบบ",
      }
    });
  }

  return await prisma.workflowStep.createMany({
    data: steps,
  });
}

async function rewardActivityScore(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) return;

  let totalScore = 0;
  const { organizationType, studentRole, impactLevel } = project;

  // Rule: Total Score = (Role Score from 1 OR 3) + Impact Score from 2

  // 1 & 3. Role Score
  let roleScore = 0;
  if (organizationType && studentRole && MANAGEMENT_SCORES[organizationType]?.[studentRole]) {
    roleScore = MANAGEMENT_SCORES[organizationType][studentRole];
  } else if (studentRole && PARTICIPATION_SCORES[studentRole]) {
    roleScore = PARTICIPATION_SCORES[studentRole];
  }
  
  totalScore += roleScore;

  // 2. Impact Score
  if (impactLevel && IMPACT_SCORES[impactLevel]) {
    totalScore += IMPACT_SCORES[impactLevel];
  }

  // Ensure minimum 1 point if something went wrong but project is completed
  if (totalScore === 0) totalScore = 1;

  await prisma.activityScore.create({
    data: {
      studentId: project.ownerId,
      projectId: projectId,
      activityType: project.projectType || "ทั่วไป",
      score: totalScore,
      notes: `คะแนนสะสมจากโครงการ: ${project.projectName} (บทบาท: ${studentRole}, ระดับผลกระทบ: ${impactLevel})`,
    },
  });

  await createNotification({
    userId: project.ownerId,
    projectId,
    type: "score_awarded",
    title: "ได้รับคะแนนกิจกรรมใหม่",
    message: `คุณได้รับคะแนนกิจกรรม ${totalScore} คะแนน จากการทำโครงการ "${project.projectName}" สำเร็จ`,
  });
}

export async function processStepReview({
  stepId,
  approverId,
  decision,
  comments,
}: {
  stepId: string;
  approverId: string;
  decision: "approve" | "reject" | "revision";
  comments?: string;
}) {
  const currentStep = await prisma.workflowStep.findUnique({
    where: { id: stepId },
    include: { project: true },
  });

  if (!currentStep) throw new Error("Step not found");

  const { projectId, docType, stepOrder } = currentStep;

  if (decision === "approve") {
    await prisma.workflowStep.update({
      where: { id: stepId },
      data: {
        status: "approved",
        assigneeId: approverId,
        comments,
        reviewedAt: new Date(),
      },
    });

    let finalStatus = currentStep.project.status;
    const nextStep = await prisma.workflowStep.findFirst({
      where: {
        projectId,
        docType,
        stepOrder: stepOrder + 1,
      },
    });

    if (nextStep) {
      await prisma.workflowStep.update({
        where: { id: nextStep.id },
        data: { status: "in_review" },
      });
      
      finalStatus = docType === "027" ? "summary_under_review" : "under_review";
      await prisma.project.update({
        where: { id: projectId },
        data: { 
          currentStep: nextStep.stepName,
          status: finalStatus
        },
      });

      // Notify the next reviewer
      const { notifyNextReviewer } = await import("./notifications");
      await notifyNextReviewer(projectId, nextStep.stepName, nextStep.assigneeRole, nextStep.assigneeId);
    } else {
      finalStatus = docType === "025" ? "approved" : "completed";
      
      await prisma.project.update({
        where: { id: projectId },
        data: { status: finalStatus, currentStep: null },
      });

      if (finalStatus === "completed") {
        await rewardActivityScore(projectId);
      }
      
      await notifyStatusChange(projectId, finalStatus);
    }

    await prisma.auditLog.create({
      data: {
        projectId,
        userId: approverId,
        action: "approve",
        fromStatus: currentStep.project.status,
        toStatus: finalStatus,
        comments,
        stepName: currentStep.stepName,
      }
    });
  } else if (decision === "revision") {
    await prisma.workflowStep.update({
      where: { id: stepId },
      data: {
        status: "revision_required",
        assigneeId: approverId,
        comments,
        reviewedAt: new Date(),
      },
    });

    const newStatus = docType === "027" ? "summary_revision_required" : "revision_required";

    await prisma.auditLog.create({
      data: {
        projectId,
        userId: approverId,
        action: "request_revision",
        fromStatus: currentStep.project.status,
        toStatus: newStatus,
        comments,
        stepName: currentStep.stepName,
      }
    });
    await prisma.project.update({
      where: { id: projectId },
      data: { status: newStatus },
    });

    await notifyStatusChange(projectId, newStatus);
  } else if (decision === "reject") {
    await prisma.workflowStep.update({
      where: { id: stepId },
      data: {
        status: "rejected",
        assigneeId: approverId,
        comments,
        reviewedAt: new Date(),
      },
    });

    const newStatus = docType === "027" ? "summary_rejected" : "rejected";

    await prisma.auditLog.create({
      data: {
        projectId,
        userId: approverId,
        action: "reject",
        fromStatus: currentStep.project.status,
        toStatus: newStatus,
        comments,
        stepName: currentStep.stepName,
      }
    });
    await prisma.project.update({
      where: { id: projectId },
      data: { status: newStatus },
    });

    await notifyStatusChange(projectId, newStatus);
  }
}
