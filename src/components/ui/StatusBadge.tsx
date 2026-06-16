import { CANDIDATE_STATUS_LABELS, CANDIDATE_STATUS_COLORS } from "@shared/types";
import type { CandidateStatus, JobStatus } from "@shared/types";
import { JOB_STATUS_LABELS } from "@shared/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: CandidateStatus | JobStatus;
  type?: "candidate" | "job";
  className?: string;
}

const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  PUBLISHED: "bg-green-50 text-green-700 border-green-200",
  CLOSED: "bg-red-50 text-red-700 border-red-200",
};

export function StatusBadge({
  status,
  type = "candidate",
  className,
}: StatusBadgeProps) {
  const label =
    type === "candidate"
      ? CANDIDATE_STATUS_LABELS[status as CandidateStatus]
      : JOB_STATUS_LABELS[status as JobStatus];

  const colorClass =
    type === "candidate"
      ? CANDIDATE_STATUS_COLORS[status as CandidateStatus]
      : JOB_STATUS_COLORS[status as JobStatus];

  return (
    <span className={cn("badge", colorClass, className)}>
      {label}
    </span>
  );
}

export default StatusBadge;
