import api from "@/lib/api";
import type { Candidate, CandidateStatus } from "@shared/types";

export interface CreateCandidateRequest {
  name: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  education?: string;
  skills: string[];
  resumeUrl?: string;
  source?: string;
  appliedJobId?: string;
}

export interface UpdateCandidateRequest {
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  experience?: number;
  education?: string;
  skills?: string[];
  resumeUrl?: string;
  status?: CandidateStatus;
  source?: string;
  rating?: number;
}

export interface CandidateListParams {
  page?: number;
  pageSize?: number;
  status?: CandidateStatus;
  appliedJobId?: string;
  search?: string;
}

export interface CandidateListResponse {
  data: Candidate[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UpdateStatusRequest {
  status: CandidateStatus;
  note?: string;
}

export const candidatesService = {
  getCandidates: (params?: CandidateListParams) =>
    api.get<CandidateListResponse>("/candidates", { params }),

  getCandidate: (id: string) => api.get<Candidate>(`/candidates/${id}`),

  createCandidate: (data: CreateCandidateRequest) =>
    api.post<Candidate>("/candidates", data),

  updateCandidate: (id: string, data: UpdateCandidateRequest) =>
    api.patch<Candidate>(`/candidates/${id}`, data),

  deleteCandidate: (id: string) => api.delete<void>(`/candidates/${id}`),

  updateStatus: (id: string, data: UpdateStatusRequest) =>
    api.post<Candidate>(`/candidates/${id}/status`, data),
};

export default candidatesService;
