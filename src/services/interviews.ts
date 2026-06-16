import api from "@/lib/api";
import type {
  Interview,
  InterviewStatus,
  InterviewType,
  InterviewEvaluation,
  Recommendation,
} from "@shared/types";

export interface CreateInterviewRequest {
  candidateId: string;
  jobId: string;
  round: number;
  type: InterviewType;
  scheduledAt: string;
  duration: number;
  meetingRoom?: string;
  meetingLink?: string;
  interviewerIds: string[];
}

export interface UpdateInterviewRequest {
  round?: number;
  type?: InterviewType;
  scheduledAt?: string;
  duration?: number;
  meetingRoom?: string;
  meetingLink?: string;
  status?: InterviewStatus;
  interviewerIds?: string[];
}

export interface InterviewListParams {
  page?: number;
  pageSize?: number;
  status?: InterviewStatus;
  candidateId?: string;
  jobId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface InterviewListResponse {
  data: Interview[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateEvaluationRequest {
  technicalRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  teamworkRating: number;
  cultureFitRating: number;
  overallRating: number;
  comments?: string;
  recommendation?: Recommendation;
}

export const interviewsService = {
  getInterviews: (params?: InterviewListParams) =>
    api.get<InterviewListResponse>("/interviews", { params }),

  getInterview: (id: string) => api.get<Interview>(`/interviews/${id}`),

  createInterview: (data: CreateInterviewRequest) =>
    api.post<Interview>("/interviews", data),

  updateInterview: (id: string, data: UpdateInterviewRequest) =>
    api.patch<Interview>(`/interviews/${id}`, data),

  deleteInterview: (id: string) => api.delete<void>(`/interviews/${id}`),

  getEvaluations: (interviewId: string) =>
    api.get<InterviewEvaluation[]>(`/interviews/${interviewId}/evaluations`),

  createEvaluation: (
    interviewId: string,
    data: CreateEvaluationRequest
  ) =>
    api.post<InterviewEvaluation>(
      `/interviews/${interviewId}/evaluations`,
      data
    ),
};

export default interviewsService;
