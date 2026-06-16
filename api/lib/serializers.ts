import type { User as SharedUser, Job as SharedJob, Candidate as SharedCandidate, Interview as SharedInterview, InterviewEvaluation as SharedEvaluation, StatusLog as SharedStatusLog } from '@shared/types'

type PrismaUser = {
  id: string
  name: string
  email: string
  role: string
  department: string | null
  avatarUrl: string | null
  createdAt: Date
}

type PrismaJob = {
  id: string
  title: string
  department: string
  description: string
  requirements: string
  salaryRange: string | null
  location: string
  status: string
  hiringManagerId: string
  createdAt: Date
  hiringManager?: PrismaUser | null
  _count?: { candidates?: number }
}

type PrismaCandidate = {
  id: string
  name: string
  email: string
  phone: string
  position: string
  experience: number
  education: string | null
  skills: string
  resumeUrl: string | null
  status: string
  source: string | null
  rating: number
  appliedJobId: string | null
  createdAt: Date
  appliedJob?: PrismaJob | null
  interviews?: PrismaInterview[]
  evaluations?: PrismaEvaluation[]
  statusLogs?: PrismaStatusLog[]
}

type PrismaInterview = {
  id: string
  candidateId: string
  jobId: string
  round: number
  type: string
  scheduledAt: Date
  duration: number
  meetingRoom: string | null
  meetingLink: string | null
  status: string
  createdAt: Date
  candidate?: PrismaCandidate | null
  job?: PrismaJob | null
  interviewers?: PrismaUser[]
  evaluations?: PrismaEvaluation[]
}

type PrismaEvaluation = {
  id: string
  interviewId: string
  interviewerId: string
  candidateId: string
  technicalRating: number
  communicationRating: number
  problemSolvingRating: number
  teamworkRating: number
  cultureFitRating: number
  overallRating: number
  comments: string | null
  recommendation: string | null
  createdAt: Date
  interviewer?: PrismaUser | null
}

type PrismaStatusLog = {
  id: string
  candidateId: string
  fromStatus: string | null
  toStatus: string
  operatorId: string
  note: string | null
  createdAt: Date
  operator?: PrismaUser | null
}

export function serializeUser(user: PrismaUser): SharedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as SharedUser['role'],
    department: user.department ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    createdAt: user.createdAt.toISOString(),
  }
}

export function serializeJob(job: PrismaJob): SharedJob {
  return {
    id: job.id,
    title: job.title,
    department: job.department,
    description: job.description,
    requirements: job.requirements,
    salaryRange: job.salaryRange ?? undefined,
    location: job.location,
    status: job.status as SharedJob['status'],
    hiringManagerId: job.hiringManagerId,
    hiringManager: job.hiringManager ? serializeUser(job.hiringManager) : undefined,
    candidateCount: job._count?.candidates,
    createdAt: job.createdAt.toISOString(),
  }
}

export function serializeCandidate(candidate: PrismaCandidate): SharedCandidate {
  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    phone: candidate.phone,
    position: candidate.position,
    experience: candidate.experience,
    education: candidate.education ?? undefined,
    skills: candidate.skills ? candidate.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
    resumeUrl: candidate.resumeUrl ?? undefined,
    status: candidate.status as SharedCandidate['status'],
    source: candidate.source ?? undefined,
    rating: candidate.rating,
    appliedJobId: candidate.appliedJobId ?? undefined,
    appliedJob: candidate.appliedJob ? serializeJob(candidate.appliedJob) : undefined,
    interviews: candidate.interviews ? candidate.interviews.map(serializeInterview) : undefined,
    evaluations: candidate.evaluations ? candidate.evaluations.map(serializeEvaluation) : undefined,
    statusLogs: candidate.statusLogs ? candidate.statusLogs.map(serializeStatusLog) : undefined,
    createdAt: candidate.createdAt.toISOString(),
  }
}

export function serializeInterview(interview: PrismaInterview): SharedInterview {
  return {
    id: interview.id,
    candidateId: interview.candidateId,
    jobId: interview.jobId,
    round: interview.round,
    type: interview.type as SharedInterview['type'],
    scheduledAt: interview.scheduledAt.toISOString(),
    duration: interview.duration,
    meetingRoom: interview.meetingRoom ?? undefined,
    meetingLink: interview.meetingLink ?? undefined,
    status: interview.status as SharedInterview['status'],
    candidate: interview.candidate ? serializeCandidate(interview.candidate) : undefined,
    job: interview.job ? serializeJob(interview.job) : undefined,
    interviewers: interview.interviewers ? interview.interviewers.map(serializeUser) : [],
    evaluations: interview.evaluations ? interview.evaluations.map(serializeEvaluation) : undefined,
    createdAt: interview.createdAt.toISOString(),
  }
}

export function serializeEvaluation(evaluation: PrismaEvaluation): SharedEvaluation {
  return {
    id: evaluation.id,
    interviewId: evaluation.interviewId,
    interviewerId: evaluation.interviewerId,
    candidateId: evaluation.candidateId,
    technicalRating: evaluation.technicalRating,
    communicationRating: evaluation.communicationRating,
    problemSolvingRating: evaluation.problemSolvingRating,
    teamworkRating: evaluation.teamworkRating,
    cultureFitRating: evaluation.cultureFitRating,
    overallRating: evaluation.overallRating,
    comments: evaluation.comments ?? undefined,
    recommendation: (evaluation.recommendation as SharedEvaluation['recommendation']) ?? undefined,
    interviewer: evaluation.interviewer ? serializeUser(evaluation.interviewer) : undefined,
    createdAt: evaluation.createdAt.toISOString(),
  }
}

export function serializeStatusLog(log: PrismaStatusLog): SharedStatusLog {
  return {
    id: log.id,
    candidateId: log.candidateId,
    fromStatus: (log.fromStatus as SharedStatusLog['fromStatus']) ?? undefined,
    toStatus: log.toStatus as SharedStatusLog['toStatus'],
    operatorId: log.operatorId,
    operator: log.operator ? serializeUser(log.operator) : undefined,
    note: log.note ?? undefined,
    createdAt: log.createdAt.toISOString(),
  }
}
