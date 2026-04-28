/**
 * Workflow State Machine
 *
 * Defines all valid project status transitions and provides
 * a type-safe validation function used at API boundaries.
 * Prevents illegal state changes from reaching the database.
 */

// All possible project states
export type ProjectStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "revision_required"
  | "approved"
  | "rejected"
  | "summary_submitted"
  | "summary_under_review"
  | "summary_revision_required"
  | "summary_rejected"
  | "completed";

// Maps each state to the set of states it can legally transition to
const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  draft:                      ["submitted"],
  submitted:                  ["under_review", "revision_required", "rejected"],
  under_review:               ["under_review", "approved", "revision_required", "rejected"],
  revision_required:          ["submitted"],
  approved:                   ["summary_submitted"],
  rejected:                   [],             // Terminal state
  summary_submitted:          ["summary_under_review", "summary_revision_required", "summary_rejected"],
  summary_under_review:       ["summary_under_review", "completed", "summary_revision_required", "summary_rejected"],
  summary_revision_required:  ["summary_submitted"],
  summary_rejected:           [],             // Terminal state
  completed:                  [],             // Terminal state
};

// Human-readable Thai label for each status
export const STATUS_LABELS: Record<ProjectStatus, string> = {
  draft:                      "ร่าง",
  submitted:                  "ส่งแล้ว",
  under_review:               "กำลังพิจารณา",
  revision_required:          "ต้องแก้ไข",
  approved:                   "อนุมัติแล้ว",
  rejected:                   "ปฏิเสธ",
  summary_submitted:          "ส่งสรุปผลแล้ว",
  summary_under_review:       "พิจารณาสรุปผล",
  summary_revision_required:  "ต้องแก้ไขสรุปผล",
  summary_rejected:           "สรุปผลถูกปฏิเสธ",
  completed:                  "ปิดโครงการ",
};

/**
 * Validates whether a status transition is legal.
 * Call this at the API boundary BEFORE writing to the DB.
 *
 * @example
 * if (!canTransition(project.status, "approved")) {
 *   return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
 * }
 */
export function canTransition(from: string, to: string): boolean {
  const allowed = VALID_TRANSITIONS[from as ProjectStatus];
  if (!allowed) return false;
  return allowed.includes(to as ProjectStatus);
}

/**
 * Asserts a transition is valid, throwing a typed error if not.
 * Use inside processStepReview or any mutation that changes project status.
 *
 * @throws Error with user-friendly message
 */
export function assertValidTransition(from: string, to: string): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `ไม่สามารถเปลี่ยนสถานะจาก "${STATUS_LABELS[from as ProjectStatus] ?? from}" ไปยัง "${STATUS_LABELS[to as ProjectStatus] ?? to}" ได้`
    );
  }
}

/**
 * Returns which states a given status can transition to.
 * Useful for building dynamic UI buttons.
 */
export function getAllowedTransitions(from: string): ProjectStatus[] {
  return VALID_TRANSITIONS[from as ProjectStatus] ?? [];
}
