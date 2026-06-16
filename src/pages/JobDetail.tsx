import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Edit3,
  Share2,
  Star,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import {
  CandidateStatusBadge,
  JobStatusBadge,
} from "@/components/StatusBadge";
import type { Job, Candidate, CandidateStatus } from "@shared/types";
import { CANDIDATE_STATUS_LABELS } from "@shared/types";

const mockJob: Job = {
  id: "1",
  title: "高级前端工程师",
  department: "技术部",
  description:
    "负责公司核心产品的前端架构设计与开发，参与技术选型和方案设计，推动前端工程化建设，带领团队完成高质量的产品交付。\n\n主要职责：\n1. 负责核心业务模块的前端开发与维护\n2. 参与前端架构设计和技术选型\n3. 优化前端性能，提升用户体验\n4. 指导初级工程师，推动团队技术成长",
  requirements:
    "1. 5年以上前端开发经验，精通 React 技术栈\n2. 熟悉 TypeScript，具备良好的类型设计能力\n3. 有大型项目架构经验，熟悉微前端方案\n4. 具备良好的沟通能力和团队协作精神\n5. 熟悉 Node.js，有全栈开发经验者优先",
  salaryRange: "25K-40K",
  location: "北京",
  status: "PUBLISHED",
  hiringManagerId: "1",
  candidateCount: 32,
  createdAt: "2026-06-10",
};

const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "张伟",
    email: "zhangwei@example.com",
    phone: "13800138001",
    position: "高级前端工程师",
    experience: 6,
    education: "硕士",
    skills: ["React", "TypeScript", "Node.js", "Vue"],
    status: "SECOND_INTERVIEW",
    source: "BOSS直聘",
    rating: 4.5,
    createdAt: "2026-06-12",
  },
  {
    id: "2",
    name: "李娜",
    email: "lina@example.com",
    phone: "13800138002",
    position: "高级前端工程师",
    experience: 4,
    education: "本科",
    skills: ["React", "Vue", "JavaScript"],
    status: "FIRST_INTERVIEW",
    source: "拉勾网",
    rating: 4.0,
    createdAt: "2026-06-11",
  },
  {
    id: "3",
    name: "王磊",
    email: "wanglei@example.com",
    phone: "13800138003",
    position: "高级前端工程师",
    experience: 5,
    education: "本科",
    skills: ["React", "TypeScript", "Webpack"],
    status: "SCREENING_PASSED",
    source: "猎头推荐",
    rating: 3.5,
    createdAt: "2026-06-13",
  },
  {
    id: "4",
    name: "陈静",
    email: "chenjing@example.com",
    phone: "13800138004",
    position: "高级前端工程师",
    experience: 7,
    education: "硕士",
    skills: ["React", "Node.js", "Next.js", "GraphQL"],
    status: "OFFER_PENDING",
    source: "内部推荐",
    rating: 4.8,
    createdAt: "2026-06-08",
  },
  {
    id: "5",
    name: "刘洋",
    email: "liuyang@example.com",
    phone: "13800138005",
    position: "高级前端工程师",
    experience: 3,
    education: "本科",
    skills: ["Vue", "React", "JavaScript"],
    status: "SCREENING",
    source: "BOSS直聘",
    rating: 3.0,
    createdAt: "2026-06-14",
  },
];

function CandidateRow({
  candidate,
  onClick,
}: {
  candidate: Candidate;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium flex-shrink-0">
        {candidate.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-gray-900">{candidate.name}</p>
          <CandidateStatusBadge status={candidate.status} />
        </div>
        <p className="text-sm text-gray-500 mt-0.5">
          {candidate.experience}年经验 · {candidate.education}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
        <span className="text-sm font-medium text-gray-700">
          {candidate.rating.toFixed(1)}
        </span>
      </div>
      <div className="hidden sm:block text-xs text-gray-400 w-24 text-right">
        {CANDIDATE_STATUS_LABELS[candidate.status]}
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="card p-6 space-y-4">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="card p-6">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded mb-2 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SkeletonDetail />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/jobs")}
          className="btn-ghost p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{mockJob.title}</h1>
            <JobStatusBadge status={mockJob.status} />
          </div>
          <p className="text-gray-500 text-sm mt-1">{mockJob.department}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary">
            <Share2 className="w-4 h-4" />
            分享
          </button>
          <button className="btn-primary">
            <Edit3 className="w-4 h-4" />
            编辑
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">{mockJob.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-semibold text-lg">
              {mockJob.salaryRange}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">
              {mockJob.candidateCount} 位候选人
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-gray-500">
              发布于 {mockJob.createdAt}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">
              职位描述
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed">
              {mockJob.description}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">
              任职要求
            </h2>
            <div className="text-gray-600 whitespace-pre-line leading-relaxed">
              {mockJob.requirements}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">候选人列表</h2>
              <span className="text-sm text-gray-500">
                共 {mockCandidates.length} 人
              </span>
            </div>
          </div>
          {mockCandidates.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无候选人</p>
            </div>
          ) : (
            <div>
              {mockCandidates.map((candidate) => (
                <CandidateRow
                  key={candidate.id}
                  candidate={candidate}
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
