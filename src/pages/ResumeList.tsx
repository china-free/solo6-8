import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Star,
  Briefcase,
  GraduationCap,
  Clock,
  User,
} from "lucide-react";
import { CandidateStatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { Candidate, CandidateStatus } from "@shared/types";

const mockCandidates: Candidate[] = [
  {
    id: "1",
    name: "张伟",
    email: "zhangwei@example.com",
    phone: "13800138001",
    position: "高级前端工程师",
    experience: 6,
    education: "硕士",
    skills: ["React", "TypeScript", "Node.js", "Vue", "Webpack"],
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
    skills: ["React", "Vue", "JavaScript", "CSS"],
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
    position: "后端开发工程师",
    experience: 5,
    education: "本科",
    skills: ["Java", "Spring Boot", "MySQL", "Redis"],
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
    skills: ["React", "Node.js", "Next.js", "GraphQL", "TypeScript"],
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
    position: "产品经理",
    experience: 3,
    education: "本科",
    skills: ["产品设计", "需求分析", "Axure", "数据分析"],
    status: "SCREENING",
    source: "BOSS直聘",
    rating: 3.0,
    createdAt: "2026-06-14",
  },
  {
    id: "6",
    name: "孙丽",
    email: "sunli@example.com",
    phone: "13800138006",
    position: "UI设计师",
    experience: 4,
    education: "本科",
    skills: ["Figma", "Sketch", "Photoshop", "交互设计"],
    status: "NEW",
    source: "拉勾网",
    rating: 0,
    createdAt: "2026-06-15",
  },
  {
    id: "7",
    name: "周华",
    email: "zhouhua@example.com",
    phone: "13800138007",
    position: "数据分析师",
    experience: 5,
    education: "硕士",
    skills: ["SQL", "Python", "Tableau", "数据分析"],
    status: "FINAL_INTERVIEW",
    source: "智联招聘",
    rating: 4.2,
    createdAt: "2026-06-05",
  },
  {
    id: "8",
    name: "吴敏",
    email: "wumin@example.com",
    phone: "13800138008",
    position: "测试工程师",
    experience: 3,
    education: "本科",
    skills: ["自动化测试", "Selenium", "Python", "接口测试"],
    status: "REJECTED",
    source: "BOSS直聘",
    rating: 2.8,
    createdAt: "2026-05-28",
  },
];

const statusOptions: Array<"全部" | CandidateStatus> = [
  "全部",
  "NEW",
  "SCREENING",
  "SCREENING_PASSED",
  "FIRST_INTERVIEW",
  "SECOND_INTERVIEW",
  "FINAL_INTERVIEW",
  "OFFER_PENDING",
  "OFFER_SENT",
  "OFFER_ACCEPTED",
  "HIRED",
  "REJECTED",
];

const sourceOptions = ["全部", "BOSS直聘", "拉勾网", "智联招聘", "猎头推荐", "内部推荐"];

const statusLabels: Record<CandidateStatus, string> = {
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

function CandidateCard({
  candidate,
  onClick,
}: {
  candidate: Candidate;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="card-hover p-5 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
          {candidate.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {candidate.position}
              </p>
            </div>
            <CandidateStatusBadge status={candidate.status} />
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-gray-400" />
              {candidate.experience}年经验
            </span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
              {candidate.education}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {candidate.createdAt}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-3">
            {candidate.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
              >
                {skill}
              </span>
            ))}
            {candidate.skills.length > 4 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded">
                +{candidate.skills.length - 4}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              来源: {candidate.source}
            </span>
            {candidate.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-medium text-gray-700">
                  {candidate.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-5 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-200 rounded" />
            </div>
            <div className="h-5 w-16 bg-gray-200 rounded-full" />
          </div>
          <div className="flex gap-4">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
          <div className="flex gap-1.5">
            <div className="h-5 w-12 bg-gray-200 rounded" />
            <div className="h-5 w-12 bg-gray-200 rounded" />
            <div className="h-5 w-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResumeList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"全部" | CandidateStatus>("全部");
  const [selectedSource, setSelectedSource] = useState("全部");
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredCandidates = mockCandidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === "全部" || c.status === selectedStatus;
    const matchesSource = selectedSource === "全部" || c.source === selectedSource;
    const matchesRating = c.rating >= minRating;
    return matchesSearch && matchesStatus && matchesSource && matchesRating;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">简历库</h1>
          <p className="text-gray-500 text-sm mt-1">管理所有候选人简历</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索姓名、职位、技能..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as "全部" | CandidateStatus)
                }
                className="select w-36"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s === "全部" ? "全部状态" : statusLabels[s]}
                  </option>
                ))}
              </select>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="select w-36"
              >
                {sourceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s === "全部" ? "全部来源" : s}
                  </option>
                ))}
              </select>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="select w-32"
              >
                <option value={0}>全部评分</option>
                <option value={1}>1星以上</option>
                <option value={2}>2星以上</option>
                <option value={3}>3星以上</option>
                <option value={4}>4星以上</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="card p-12 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无符合条件的候选人</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              onClick={() => navigate(`/candidates/${candidate.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
