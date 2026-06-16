export type UserRole = "HR" | "INTERVIEWER" | "HIRING_MANAGER" | "ADMIN";

export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export type CandidateStatus =
  | "NEW"
  | "SCREENING"
  | "SCREENING_PASSED"
  | "FIRST_INTERVIEW"
  | "SECOND_INTERVIEW"
  | "FINAL_INTERVIEW"
  | "OFFER_PENDING"
  | "OFFER_SENT"
  | "OFFER_ACCEPTED"
  | "OFFER_REJECTED"
  | "HIRED"
  | "REJECTED";

export type InterviewType = "PHONE" | "ONSITE" | "VIDEO";

export type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export type Recommendation = "HIRE" | "CONSIDER" | "REJECT";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  salaryRange?: string;
  location: string;
  status: JobStatus;
  hiringManagerId: string;
  hiringManager?: User;
  candidateCount?: number;
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  education?: string;
  skills: string[];
  resumeUrl?: string;
  status: CandidateStatus;
  source?: string;
  rating: number;
  appliedJobId?: string;
  appliedJob?: Job;
  interviews?: Interview[];
  evaluations?: InterviewEvaluation[];
  statusLogs?: StatusLog[];
  createdAt: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidate?: Candidate;
  jobId: string;
  job?: Job;
  round: number;
  type: InterviewType;
  scheduledAt: string;
  duration: number;
  meetingRoom?: string;
  meetingLink?: string;
  status: InterviewStatus;
  interviewers: User[];
  evaluations?: InterviewEvaluation[];
  createdAt: string;
}

export interface InterviewEvaluation {
  id: string;
  interviewId: string;
  interviewerId: string;
  interviewer?: User;
  candidateId: string;
  technicalRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  teamworkRating: number;
  cultureFitRating: number;
  overallRating: number;
  comments?: string;
  recommendation?: Recommendation;
  createdAt: string;
}

export interface StatusLog {
  id: string;
  candidateId: string;
  fromStatus?: CandidateStatus;
  toStatus: CandidateStatus;
  operatorId: string;
  operator?: User;
  note?: string;
  createdAt: string;
}

export const CANDIDATE_STATUS_LABELS: Record<CandidateStatus, string> = {
  NEW: "新简历",
  SCREENING: "待筛选",
  SCREENING_PASSED: "筛选通过",
  FIRST_INTERVIEW: "待初面",
  SECOND_INTERVIEW: "待复试",
  FINAL_INTERVIEW: "待终面",
  OFFER_PENDING: "待发Offer",
  OFFER_SENT: "Offer已发送",
  OFFER_ACCEPTED: "Offer已接受",
  OFFER_REJECTED: "Offer已拒绝",
  HIRED: "已入职",
  REJECTED: "人才库",
};

export const CANDIDATE_STATUS_COLORS: Record<CandidateStatus, string> = {
  NEW: "bg-slate-100 text-slate-700 border-slate-200",
  SCREENING: "bg-amber-50 text-amber-700 border-amber-200",
  SCREENING_PASSED: "bg-blue-50 text-blue-700 border-blue-200",
  FIRST_INTERVIEW: "bg-indigo-50 text-indigo-700 border-indigo-200",
  SECOND_INTERVIEW: "bg-purple-50 text-purple-700 border-purple-200",
  FINAL_INTERVIEW: "bg-violet-50 text-violet-700 border-violet-200",
  OFFER_PENDING: "bg-cyan-50 text-cyan-700 border-cyan-200",
  OFFER_SENT: "bg-teal-50 text-teal-700 border-teal-200",
  OFFER_ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  OFFER_REJECTED: "bg-orange-50 text-orange-700 border-orange-200",
  HIRED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  HR: "HR招聘专员",
  INTERVIEWER: "面试官",
  HIRING_MANAGER: "用人部门负责人",
  ADMIN: "系统管理员",
};

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "草稿",
  PUBLISHED: "已发布",
  CLOSED: "已关闭",
};
