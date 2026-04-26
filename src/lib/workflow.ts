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

export async function createWorkflowSteps(projectId: string, docType: "025" | "027") {
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
      
      await prisma.project.update({
        where: { id: projectId },
        data: { 
          currentStep: nextStep.stepName,
          status: docType === "027" ? "summary_under_review" : "under_review"
        },
      });

      // Notify the next reviewer
      const { notifyNextReviewer } = await import("./notifications");
      await notifyNextReviewer(projectId, nextStep.stepName, nextStep.assigneeRole, nextStep.assigneeId);
    } else {
      const newStatus = docType === "025" ? "approved" : "completed";
      
      await prisma.project.update({
        where: { id: projectId },
        data: { status: newStatus, currentStep: null },
      });

      if (newStatus === "completed") {
        await rewardActivityScore(projectId);
      }
      
      await notifyStatusChange(projectId, newStatus);
    }
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

    await prisma.project.update({
      where: { id: projectId },
      data: { status: "revision_required" },
    });

    await notifyStatusChange(projectId, "revision_required");
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

    await prisma.project.update({
      where: { id: projectId },
      data: { status: "rejected" },
    });

    await notifyStatusChange(projectId, "rejected");
  }
}
