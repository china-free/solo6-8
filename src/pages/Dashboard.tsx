import { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import {
  CalendarDays,
  FileText,
  Briefcase,
  Users,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  MapPin,
  UserCircle,
  AlertCircle,
} from "lucide-react";
import { CandidateStatusBadge, InterviewStatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { InterviewStatus } from "@shared/types";

const mockStats = [
  {
    title: "今日面试数",
    value: 8,
    trend: 2,
    trendUp: true,
    icon: CalendarDays,
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "待处理简历",
    value: 32,
    trend: 5,
    trendUp: true,
    icon: FileText,
    color: "from-amber-500 to-amber-600",
  },
  {
    title: "在招职位数",
    value: 15,
    trend: 1,
    trendUp: false,
    icon: Briefcase,
    color: "from-emerald-500 to-emerald-600",
  },
  {
    title: "本月入职人数",
    value: 12,
    trend: 3,
    trendUp: true,
    icon: Users,
    color: "from-violet-500 to-violet-600",
  },
];

const mockFunnelData = [
  { value: 240, name: "新简历" },
  { value: 180, name: "筛选" },
  { value: 95, name: "初面" },
  { value: 52, name: "复试" },
  { value: 28, name: "终面" },
  { value: 18, name: "Offer" },
  { value: 12, name: "入职" },
];

const mockInterviews = [
  {
    id: "1",
    time: "09:00",
    candidateName: "张伟",
    position: "高级前端工程师",
    interviewer: "李明",
    type: "视频面试",
    status: "COMPLETED" as InterviewStatus,
    location: "会议室A",
  },
  {
    id: "2",
    time: "10:30",
    candidateName: "王芳",
    position: "产品经理",
    interviewer: "赵强",
    type: "现场面试",
    status: "SCHEDULED" as InterviewStatus,
    location: "会议室B",
  },
  {
    id: "3",
    time: "14:00",
    candidateName: "刘洋",
    position: "后端开发",
    interviewer: "陈静",
    type: "电话面试",
    status: "SCHEDULED" as InterviewStatus,
    location: "远程",
  },
  {
    id: "4",
    time: "15:30",
    candidateName: "孙丽",
    position: "UI设计师",
    interviewer: "周华",
    type: "视频面试",
    status: "SCHEDULED" as InterviewStatus,
    location: "会议室C",
  },
];

const mockTodos = [
  { id: "1", title: "审核10份简历", completed: true, priority: "high" },
  { id: "2", title: "安排张伟终面", completed: false, priority: "high" },
  { id: "3", title: "发送Offer给李娜", completed: false, priority: "medium" },
  { id: "4", title: "更新前端面试评价", completed: false, priority: "low" },
  { id: "5", title: "整理本周招聘数据", completed: false, priority: "medium" },
];

function StatCard({
  title, value, trend, trendUp, icon: Icon, color, loading }: {
  title: string;
  value: number;
  trend: number;
  trendUp: boolean;
  icon: typeof CalendarDays;
  color: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className={cn("w-12 h-12 rounded-xl bg-gray-200 animate-pulse")} />
        </div>
      </div>
    );
  }
  return (
    <div className="card p-5 hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {trendUp ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                trendUp ? "text-emerald-600" : "text-red-600"
              )}
            >
              {trendUp ? "+" : "-"}{trend}
            </span>
            <span className="text-xs text-gray-400">较昨日</span>
          </div>
        </div>
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br", color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

function InterviewTimeline() {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">今日面试</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
          查看全部 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        {mockInterviews.map((interview) => (
          <div key={interview.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                {interview.time}
              </span>
              <div className="w-px flex-1 bg-gray-200 my-1" />
            </div>
            <div className="flex-1 card p-3 hover:shadow-card-hover">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{interview.candidateName}</p>
                    <InterviewStatusBadge status={interview.status} />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{interview.position}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <UserCircle className="w-3.5 h-3.5" />
                      {interview.interviewer}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {interview.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {interview.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TodoList() {
  const [todos, setTodos] = useState(mockTodos);

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const priorityColor = {
    high: "bg-red-100 text-red-600",
    medium: "bg-amber-100 text-amber-600",
    low: "bg-gray-100 text-gray-600",
  };

  const priorityLabel = {
    high: "高",
    medium: "中",
    low: "低",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">待办事项</h3>
        <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
          管理 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        {todos.map((todo) => (
          <button
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
              todo.completed ? "bg-gray-50" : "hover:bg-gray-50"
            )}
          >
            {todo.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
            )}
            <span
              className={cn(
                "text-sm flex-1",
                todo.completed ? "text-gray-400 line-through" : "text-gray-700"
              )}
            >
              {todo.title}
            </span>
            <span className={cn("badge border-0 px-2 py-0.5 text-xs font-medium", priorityColor[todo.priority as keyof typeof priorityColor])}>
              {priorityLabel[todo.priority as keyof typeof priorityLabel]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FunnelChart() {
  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} 人",
    },
    series: [
      {
        name: "招聘漏斗",
        type: "funnel",
        left: "10%",
        top: 20,
        bottom: 20,
        width: "80%",
        min: 0,
        max: 300,
        minSize: "0%",
        maxSize: "100%",
        sort: "descending",
        gap: 2,
        label: {
          show: true,
          position: "inside",
          formatter: "{b}\n{c}人",
          fontSize: 12,
          color: "#fff",
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: "solid",
          },
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 1,
        },
        emphasis: {
          label: {
            fontSize: 14,
          },
        },
        data: mockFunnelData.map((item, index) => ({
          ...item,
          itemStyle: {
            color: [
              "#3b82f6",
              "#6366f1",
              "#8b5cf6",
              "#a855f7",
              "#d946ef",
              "#ec4899",
              "#10b981",
            ][index],
          },
        })),
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: 320 }} />;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">工作台</h1>
          <p className="text-gray-500 text-sm mt-1">欢迎回来，今天是个好日子</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary">
            <AlertCircle className="w-4 h-4" />
            导出报表
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat) => (
          <StatCard key={stat.title} {...stat} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-2">招聘漏斗</h3>
          {loading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="w-full h-full bg-gray-100 rounded-lg animate-pulse" />
            </div>
          ) : (
            <FunnelChart />
          )}
        </div>
        <div className="card p-5">
          {loading ? (
          <div className="space-y-4">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <TodoList />
        )}
        </div>
      </div>

      <div className="card p-5">
        {loading ? (
          <div className="space-y-4">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <InterviewTimeline />
        )}
      </div>
    </div>
  );
}
