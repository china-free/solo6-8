import api from "@/lib/api";
import type { Job, JobStatus } from "@shared/types";

export interface CreateJobRequest {
  title: string;
  department: string;
  description: string;
  requirements: string;
  salaryRange?: string;
  location: string;
  hiringManagerId: string;
}

export interface UpdateJobRequest {
  title?: string;
  department?: string;
  description?: string;
  requirements?: string;
  salaryRange?: string;
  location?: string;
  status?: JobStatus;
  hiringManagerId?: string;
}

export interface JobListParams {
  page?: number;
  pageSize?: number;
  status?: JobStatus;
  department?: string;
  search?: string;
}

export interface JobListResponse {
  data: Job[];
  total: number;
  page: number;
  pageSize: number;
}

export const jobsService = {
  getJobs: (params?: JobListParams) =>
    api.get<JobListResponse>("/jobs", { params }),

  getJob: (id: string) => api.get<Job>(`/jobs/${id}`),

  createJob: (data: CreateJobRequest) => api.post<Job>("/jobs", data),

  updateJob: (id: string, data: UpdateJobRequest) =>
    api.patch<Job>(`/jobs/${id}`, data),

  deleteJob: (id: string) => api.delete<void>(`/jobs/${id}`),
};

export default jobsService;
