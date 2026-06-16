import { cn } from "@/lib/utils";
import {
  CANDIDATE_STATUS_COLORS,
  CANDIDATE_STATUS_LABELS,
  JOB_STATUS_LABELS,
  type CandidateStatus,
  type JobStatus,
} from "@shared/types";

interface CandidateStatusBadgeProps {
  status: CandidateStatus;
  className?: string;
}

export function CandidateStatusBadge({ status, className }: CandidateStatusBadgeProps) {
  return (
    <span className={cn("badge", CANDIDATE_STATUS_COLORS[status], className)}>
      {CANDIDATE_STATUS_LABELS[status]}
    </span>
  );
}

interface JobStatusBadgeProps {
  status: JobStatus;
  className?: string;
}

const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
  PUBLISHED: "bg-green-50 text-green-700 border-green-200",
  CLOSED: "bg-red-50 text-red-700 border-red-200",
};

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  return (
    <span className={cn("badge", JOB_STATUS_COLORS[status], className)}>
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}

interface InterviewStatusBadgeProps {
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  className?: string;
}

const INTERVIEW_STATUS_COLORS = {
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
};

const INTERVIEW_STATUS_LABELS = {
  SCHEDULED: "待进行",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

export function InterviewStatusBadge({ status, className }: InterviewStatusBadgeProps) {
  return (
    <span className={cn("badge", INTERVIEW_STATUS_COLORS[status], className)}>
      {INTERVIEW_STATUS_LABELS[status]}
    </span>
  );
}

export { CANDIDATE_STATUS_COLORS, CANDIDATE_STATUS_LABELS, JOB_STATUS_LABELS };
