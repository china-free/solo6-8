import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Send,
  ThumbsUp,
  HelpCircle,
  ThumbsDown,
  UserCircle,
  Calendar,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ratingDimensions = [
  { key: "technicalRating", label: "技术能力", desc: "专业知识和技术水平" },
  { key: "communicationRating", label: "沟通能力", desc: "表达清晰、倾听理解" },
  { key: "problemSolvingRating", label: "解决问题", desc: "分析能力和逻辑思维" },
  { key: "teamworkRating", label: "团队协作", desc: "合作精神和沟通配合" },
  { key: "cultureFitRating", label: "文化匹配", desc: "价值观和企业文化契合" },
];

function RatingStars({
  value,
  onChange,
  readonly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={cn(
            "transition-transform",
            !readonly && "cursor-pointer hover:scale-110",
            readonly && "cursor-default"
          )}
          disabled={readonly}
        >
          <Star
            className={cn(
              "w-6 h-6 transition-colors",
              (hover || value) >= star
                ? "text-amber-400 fill-amber-400"
                : "text-gray-200"
            )}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-medium text-gray-700 w-8">
        {value}/5
      </span>
    </div>
  );
}

export default function InterviewEvaluate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ratings, setRatings] = useState({
    technicalRating: 0,
    communicationRating: 0,
    problemSolvingRating: 0,
    teamworkRating: 0,
    cultureFitRating: 0,
  });
  const [comments, setComments] = useState("");
  const [recommendation, setRecommendation] = useState<
    "HIRE" | "CONSIDER" | "REJECT" | null
  >(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      alert("评价提交成功！");
      navigate("/interviews");
    }, 1000);
  };

  const overallRating =
    Object.values(ratings).reduce((a, b) => a + b, 0) /
    Object.values(ratings).filter((v) => v > 0).length || 0;

  const recommendationOptions = [
    {
      value: "HIRE" as const,
      label: "强烈推荐",
      icon: ThumbsUp,
      color: "border-emerald-300 bg-emerald-50 text-emerald-700",
      activeColor: "border-emerald-500 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-200",
    },
    {
      value: "CONSIDER" as const,
      label: "考虑",
      icon: HelpCircle,
      color: "border-amber-300 bg-amber-50 text-amber-700",
      activeColor: "border-amber-500 bg-amber-100 text-amber-800 ring-2 ring-amber-200",
    },
    {
      value: "REJECT" as const,
      label: "不推荐",
      icon: ThumbsDown,
      color: "border-red-300 bg-red-50 text-red-700",
      activeColor: "border-red-500 bg-red-100 text-red-800 ring-2 ring-red-200",
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 space-y-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-4">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-32 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/interviews")}
          className="btn-ghost p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">面试评价</h1>
          <p className="text-gray-500 text-sm mt-1">张伟 · 第2轮复试</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">候选人信息</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xl">
                张
              </div>
              <div>
                <p className="font-medium text-gray-900">张伟</p>
                <p className="text-sm text-gray-500">高级前端工程师</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <UserCircle className="w-4 h-4 text-gray-400" />
                <span>6年工作经验 · 硕士</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>面试时间: 2026-06-16 10:00</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>地点: 会议室A</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">综合评分</h3>
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900 mb-2">
                {overallRating ? overallRating.toFixed(1) : "-"}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "w-5 h-5",
                      s <= Math.round(overallRating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">基于5个维度的平均分</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-6">维度评分</h3>
            <div className="space-y-5">
              {ratingDimensions.map((dim) => (
                <div key={dim.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{dim.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{dim.desc}</p>
                  </div>
                  <RatingStars
                    value={
                      ratings[dim.key as keyof typeof ratings]
                    }
                    onChange={(v) =>
                      setRatings((prev) => ({
                        ...prev,
                        [dim.key]: v,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">总体评价</h3>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="请输入您对候选人的综合评价，包括优点、不足和建议..."
              className="textarea h-32"
            />
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">推荐结果</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {recommendationOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = recommendation === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setRecommendation(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      isActive ? opt.activeColor : opt.color,
                      "hover:shadow-md"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-medium">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate("/interviews")}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                submitting ||
                !recommendation ||
                Object.values(ratings).some((v) => v === 0)
              }
              className="btn-primary"
            >
              <Send className="w-4 h-4" />
              {submitting ? "提交中..." : "提交评价"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
