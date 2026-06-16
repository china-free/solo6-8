import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Star,
  Calendar,
  MapPin,
  MessageSquare,
  UserCircle,
  Clock,
  Edit3,
  FileText,
  ChevronRight,
} from "lucide-react";
import { CandidateStatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type {
  Candidate,
  StatusLog,
  Interview,
  InterviewEvaluation,
  CandidateStatus,
} from "@shared/types";
import {
  CANDIDATE_STATUS_LABELS,
  CANDIDATE_STATUS_COLORS,
} from "@shared/types";

const mockCandidate: Candidate = {
  id: "1",
  name: "张伟",
  email: "zhangwei@example.com",
  phone: "13800138001",
  position: "高级前端工程师",
  experience: 6,
  education: "硕士",
  skills: ["React", "TypeScript", "Node.js", "Vue", "Webpack", "Next.js", "GraphQL"],
  status: "SECOND_INTERVIEW",
  source: "BOSS直聘",
  rating: 4.5,
  createdAt: "2026-06-12",
};

const mockStatusLogs: StatusLog[] = [
  {
    id: "1",
    candidateId: "1",
    toStatus: "NEW",
    operatorId: "hr1",
    operator: {
      id: "hr1",
      name: "HR小李",
      email: "hr1@example.com",
      role: "HR",
      createdAt: "2026-01-01",
    },
    note: "简历投递成功",
    createdAt: "2026-06-12 09:30",
  },
  {
    id: "2",
    candidateId: "1",
    fromStatus: "NEW",
    toStatus: "SCREENING",
    operatorId: "hr1",
    operator: {
      id: "hr1",
      name: "HR小李",
      email: "hr1@example.com",
      role: "HR",
      createdAt: "2026-01-01",
    },
    note: "开始简历筛选",
    createdAt: "2026-06-12 14:00",
  },
  {
    id: "3",
    candidateId: "1",
    fromStatus: "SCREENING",
    toStatus: "SCREENING_PASSED",
    operatorId: "hr1",
    operator: {
      id: "hr1",
      name: "HR小李",
      email: "hr1@example.com",
      role: "HR",
      createdAt: "2026-01-01",
    },
    note: "简历筛选通过，符合岗位要求",
    createdAt: "2026-06-13 10:00",
  },
  {
    id: "4",
    candidateId: "1",
    fromStatus: "SCREENING_PASSED",
    toStatus: "FIRST_INTERVIEW",
    operatorId: "hr1",
    operator: {
      id: "hr1",
      name: "HR小李",
      email: "hr1@example.com",
      role: "HR",
      createdAt: "2026-01-01",
    },
    note: "已安排初面，面试官：技术部王经理",
    createdAt: "2026-06-13 15:30",
  },
  {
    id: "5",
    candidateId: "1",
    fromStatus: "FIRST_INTERVIEW",
    toStatus: "SECOND_INTERVIEW",
    operatorId: "mgr1",
    operator: {
      id: "mgr1",
      name: "王经理",
      email: "wang@example.com",
      role: "HIRING_MANAGER",
      createdAt: "2026-01-01",
    },
    note: "初面通过，技术基础扎实，进入复试",
    createdAt: "2026-06-15 11:00",
  },
];

const mockInterviews: Interview[] = [
  {
    id: "1",
    candidateId: "1",
    jobId: "1",
    round: 1,
    type: "VIDEO",
    scheduledAt: "2026-06-14 10:00",
    duration: 60,
    status: "COMPLETED",
    interviewers: [
      {
        id: "mgr1",
        name: "王经理",
        email: "wang@example.com",
        role: "HIRING_MANAGER",
        department: "技术部",
        createdAt: "2026-01-01",
      },
    ],
    createdAt: "2026-06-13",
  },
  {
    id: "2",
    candidateId: "1",
    jobId: "1",
    round: 2,
    type: "ONSITE",
    scheduledAt: "2026-06-17 14:00",
    duration: 90,
    meetingRoom: "会议室A",
    status: "SCHEDULED",
    interviewers: [
      {
        id: "dir1",
        name: "刘总监",
        email: "liu@example.com",
        role: "HIRING_MANAGER",
        department: "技术部",
        createdAt: "2026-01-01",
      },
      {
        id: "hr1",
        name: "HR小李",
        email: "hr1@example.com",
        role: "HR",
        department: "人力资源部",
        createdAt: "2026-01-01",
      },
    ],
    createdAt: "2026-06-15",
  },
];

const mockEvaluations: InterviewEvaluation[] = [
  {
    id: "1",
    interviewId: "1",
    interviewerId: "mgr1",
    interviewer: {
      id: "mgr1",
      name: "王经理",
      email: "wang@example.com",
      role: "HIRING_MANAGER",
      createdAt: "2026-01-01",
    },
    candidateId: "1",
    technicalRating: 4,
    communicationRating: 5,
    problemSolvingRating: 4,
    teamworkRating: 5,
    cultureFitRating: 4,
    overallRating: 4.4,
    comments:
      "候选人技术基础扎实，对React生态有深入理解，沟通表达清晰，团队协作意识强。建议进入复试，重点考察架构设计能力。",
    recommendation: "HIRE",
    createdAt: "2026-06-14 12:00",
  },
];

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-700 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function StatusTimeline() {
  return (
    <div className="relative">
      <h3 className="font-semibold text-gray-900 mb-4">状态流转</h3>
      <div className="relative pl-6">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
        {mockStatusLogs.map((log, index) => (
          <div key={log.id} className="relative pb-6 last:pb-0">
            <div
              className={cn(
                "absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center",
                CANDIDATE_STATUS_COLORS[log.toStatus],
                "border-2 border-white"
              )}
            >
              <div className="w-2 h-2 rounded-full bg-current" />
            </div>
            <div className="card p-3">
              <div className="flex items-center justify-between">
                <CandidateStatusBadge status={log.toStatus} />
                <span className="text-xs text-gray-400">{log.createdAt}</span>
              </div>
              {log.note && (
                <p className="text-sm text-gray-600 mt-2">{log.note}</p>
              )}
              {log.operator && (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <UserCircle className="w-3.5 h-3.5" />
                  操作人: {log.operator.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InterviewRecord({
  interview,
  onClick,
}: {
  interview: Interview;
  onClick: () => void;
}) {
  const typeLabel = {
    PHONE: "电话面试",
    ONSITE: "现场面试",
    VIDEO: "视频面试",
  };
  const typeColor = {
    PHONE: "bg-amber-50 text-amber-700",
    ONSITE: "bg-blue-50 text-blue-700",
    VIDEO: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div
      onClick={onClick}
      className="card p-4 hover:shadow-card-hover cursor-pointer transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              第{interview.round}轮面试
            </span>
            <span
              className={cn(
                "badge border-0 px-2 py-0.5 text-xs font-medium",
                typeColor[interview.type]
              )}
            >
              {typeLabel[interview.type]}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {interview.scheduledAt}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {interview.duration}分钟
            </span>
            {interview.meetingRoom && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {interview.meetingRoom}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <UserCircle className="w-3.5 h-3.5" />
            {interview.interviewers.map((i) => i.name).join("、")}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-300" />
      </div>
    </div>
  );
}

function EvaluationSummary() {
  if (mockEvaluations.length === 0) {
    return (
      <div className="card p-6 text-center text-gray-500">
        <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        暂无评价记录
      </div>
    );
  }

  const avgEvaluation = mockEvaluations[0];
  const recommendationLabel = {
    HIRE: "强烈推荐",
    CONSIDER: "考虑",
    REJECT: "不推荐",
  };
  const recommendationColor = {
    HIRE: "bg-emerald-100 text-emerald-700",
    CONSIDER: "bg-amber-100 text-amber-700",
    REJECT: "bg-red-100 text-red-700",
  };

  const ratings = [
    { label: "技术能力", value: avgEvaluation.technicalRating },
    { label: "沟通能力", value: avgEvaluation.communicationRating },
    { label: "解决问题", value: avgEvaluation.problemSolvingRating },
    { label: "团队协作", value: avgEvaluation.teamworkRating },
    { label: "文化匹配", value: avgEvaluation.cultureFitRating },
  ];

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">评价汇总</h3>
      <div className="space-y-3 mb-4">
        {ratings.map((r) => (
          <div key={r.label}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">{r.label}</span>
              <span className="font-medium text-gray-900">{r.value}/5</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
                style={{ width: `${(r.value / 5) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">综合评分:</span>
          <span className="font-bold text-lg text-gray-900">
            {avgEvaluation.overallRating.toFixed(1)}
          </span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={cn(
                  "w-4 h-4",
                  s <= Math.round(avgEvaluation.overallRating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-200"
                )}
              />
            ))}
          </div>
        </div>
        <span
          className={cn(
            "badge border-0 px-3 py-1 text-sm font-medium",
            recommendationColor[avgEvaluation.recommendation!]
          )}
        >
          {recommendationLabel[avgEvaluation.recommendation!]}
        </span>
      </div>
      {avgEvaluation.comments && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 leading-relaxed">
            {avgEvaluation.comments}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            — {avgEvaluation.interviewer?.name}
          </p>
        </div>
      )}
    </div>
  );
}

function SkeletonDetail() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="h-6 w-24 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CandidateDetail() {
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
        <button onClick={() => navigate("/resumes")} className="btn-ghost p-2">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {mockCandidate.name}
            </h1>
            <CandidateStatusBadge status={mockCandidate.status} />
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {mockCandidate.position} · 来源: {mockCandidate.source}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary">
            <FileText className="w-4 h-4" />
            查看简历
          </button>
          <button className="btn-primary">
            <Edit3 className="w-4 h-4" />
            推进状态
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-2xl">
                {mockCandidate.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "w-4 h-4",
                          s <= Math.round(mockCandidate.rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {mockCandidate.rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  加入时间: {mockCandidate.createdAt}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <InfoItem icon={Mail} label="邮箱" value={mockCandidate.email} />
              <InfoItem icon={Phone} label="电话" value={mockCandidate.phone} />
              <InfoItem
                icon={Briefcase}
                label="工作经验"
                value={`${mockCandidate.experience}年`}
              />
              <InfoItem
                icon={GraduationCap}
                label="学历"
                value={mockCandidate.education}
              />
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-3">技能标签</h3>
            <div className="flex flex-wrap gap-2">
              {mockCandidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 text-sm bg-primary-50 text-primary-700 rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <StatusTimeline />
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">面试记录</h3>
              <button className="text-sm text-primary-600 hover:text-primary-700">
                新建面试
              </button>
            </div>
            <div className="space-y-3">
              {mockInterviews.map((interview) => (
                <InterviewRecord
                  key={interview.id}
                  interview={interview}
                  onClick={() => navigate(`/interviews/evaluate/${interview.id}`)}
                />
              ))}
            </div>
          </div>

          <div className="card p-6">
            <EvaluationSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
