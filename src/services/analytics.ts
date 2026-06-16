import api from "@/lib/api";

export interface CandidateStatusStats {
  status: string;
  count: number;
}

export interface JobStats {
  id: string;
  title: string;
  candidateCount: number;
  interviewCount: number;
  hiredCount: number;
}

export interface InterviewerStats {
  id: string;
  name: string;
  interviewCount: number;
  avgRating: number;
}

export interface PipelineStats {
  stage: string;
  count: number;
  avgDays: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface DashboardSummary {
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  newCandidates: number;
  scheduledInterviews: number;
  hiredThisMonth: number;
}

export interface AnalyticsParams {
  dateFrom?: string;
  dateTo?: string;
  jobId?: string;
  department?: string;
}

export const analyticsService = {
  getDashboardSummary: (params?: AnalyticsParams) =>
    api.get<DashboardSummary>("/analytics/summary", { params }),

  getCandidateStatusStats: (params?: AnalyticsParams) =>
    api.get<CandidateStatusStats[]>("/analytics/candidates/status", {
      params,
    }),

  getJobStats: (params?: AnalyticsParams) =>
    api.get<JobStats[]>("/analytics/jobs", { params }),

  getInterviewerStats: (params?: AnalyticsParams) =>
    api.get<InterviewerStats[]>("/analytics/interviewers", { params }),

  getPipelineStats: (params?: AnalyticsParams) =>
    api.get<PipelineStats[]>("/analytics/pipeline", { params }),

  getCandidatesTrend: (params?: AnalyticsParams) =>
    api.get<TimeSeriesData[]>("/analytics/candidates/trend", { params }),

  getHiresTrend: (params?: AnalyticsParams) =>
    api.get<TimeSeriesData[]>("/analytics/hires/trend", { params }),
};

export default analyticsService;
