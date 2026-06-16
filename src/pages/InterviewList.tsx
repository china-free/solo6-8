import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Clock,
  MapPin,
  CalendarDays,
} from "lucide-react";
import { InterviewStatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import type { Interview, InterviewStatus } from "@shared/types";

const weekDays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

const typeColor = {
  PHONE: "bg-amber-100 text-amber-700 border-amber-200",
  ONSITE: "bg-blue-100 text-blue-700 border-blue-200",
  VIDEO: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const mockInterviews: Interview[] = [
  {
    id: "1",
    candidateId: "1",
    candidate: {
      id: "1",
      name: "张伟",
      email: "zhangwei@example.com",
      phone: "13800138001",
      position: "高级前端工程师",
      experience: 6,
      skills: ["React"],
      status: "SECOND_INTERVIEW",
      rating: 4.5,
      createdAt: "2026-06-12",
    },
    jobId: "1",
    round: 2,
    type: "ONSITE",
    scheduledAt: "2026-06-16 10:00",
    duration: 90,
    meetingRoom: "会议室A",
    status: "SCHEDULED",
    interviewers: [
      {
        id: "1",
        name: "刘总监",
        email: "liu@example.com",
        role: "HIRING_MANAGER",
        createdAt: "2026-01-01",
      },
    ],
    createdAt: "2026-06-15",
  },
  {
    id: "2",
    candidateId: "2",
    candidate: {
      id: "2",
      name: "李娜",
      email: "lina@example.com",
      phone: "13800138002",
      position: "高级前端工程师",
      experience: 4,
      skills: ["React"],
      status: "FIRST_INTERVIEW",
      rating: 4.0,
      createdAt: "2026-06-11",
    },
    jobId: "1",
    round: 1,
    type: "VIDEO",
    scheduledAt: "2026-06-16 14:00",
    duration: 60,
    meetingLink: "https://meet.example.com/abc",
    status: "SCHEDULED",
    interviewers: [
      {
        id: "2",
        name: "王经理",
        email: "wang@example.com",
        role: "HIRING_MANAGER",
        createdAt: "2026-01-01",
      },
    ],
    createdAt: "2026-06-14",
  },
  {
    id: "3",
    candidateId: "3",
    candidate: {
      id: "3",
      name: "王磊",
      email: "wanglei@example.com",
      phone: "13800138003",
      position: "后端开发工程师",
      experience: 5,
      skills: ["Java"],
      status: "SCREENING_PASSED",
      rating: 3.5,
      createdAt: "2026-06-13",
    },
    jobId: "3",
    round: 1,
    type: "PHONE",
    scheduledAt: "2026-06-17 09:00",
    duration: 30,
    status: "SCHEDULED",
    interviewers: [
      {
        id: "3",
        name: "陈工",
        email: "chen@example.com",
        role: "INTERVIEWER",
        createdAt: "2026-01-01",
      },
    ],
    createdAt: "2026-06-15",
  },
  {
    id: "4",
    candidateId: "7",
    candidate: {
      id: "7",
      name: "周华",
      email: "zhouhua@example.com",
      phone: "13800138007",
      position: "数据分析师",
      experience: 5,
      skills: ["SQL"],
      status: "FINAL_INTERVIEW",
      rating: 4.2,
      createdAt: "2026-06-05",
    },
    jobId: "5",
    round: 3,
    type: "ONSITE",
    scheduledAt: "2026-06-18 15:00",
    duration: 60,
    meetingRoom: "会议室B",
    status: "SCHEDULED",
    interviewers: [
      {
        id: "4",
        name: "赵总监",
        email: "zhao@example.com",
        role: "HIRING_MANAGER",
        createdAt: "2026-01-01",
      },
    ],
    createdAt: "2026-06-15",
  },
];

const todayInterviews = mockInterviews.filter((i) =>
  i.scheduledAt.includes("2026-06-16")
);
const weekInterviews = mockInterviews;

function InterviewBlock({
  interview,
  onClick,
}: {
  interview: Interview;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-2 rounded-lg border cursor-pointer transition-all hover:shadow-sm",
        typeColor[interview.type]
      )}
    >
      <p className="text-xs font-medium truncate">
        {interview.candidate?.name}
      </p>
      <p className="text-xs opacity-75 truncate">
        {interview.interviewers[0]?.name}
      </p>
    </div>
  );
}

function InterviewSidebarItem({
  interview,
  onClick,
}: {
  interview: Interview;
  onClick: () => void;
}) {
  const typeLabel = {
    PHONE: "电话",
    ONSITE: "现场",
    VIDEO: "视频",
  };

  return (
    <div
      onClick={onClick}
      className="card p-3 hover:shadow-card-hover cursor-pointer transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900 text-sm">
            {interview.candidate?.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {interview.candidate?.position}
          </p>
        </div>
        <InterviewStatusBadge status={interview.status} />
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {interview.scheduledAt.split(" ")[1]}
        </span>
        <span className="flex items-center gap-1">
          <UserCircle className="w-3 h-3" />
          {interview.interviewers[0]?.name}
        </span>
        {interview.meetingRoom && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {interview.meetingRoom}
          </span>
        )}
      </div>
      <div className="mt-2">
        <span className={cn("badge border-0 text-xs", typeColor[interview.type])}>
          {typeLabel[interview.type]}面试 · 第{interview.round}轮
        </span>
      </div>
    </div>
  );
}

export default function InterviewList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"today" | "week">("today");
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay() || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1 + weekOffset * 7);

    return weekDays.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates();
  const monthLabel = `${weekDates[0].getMonth() + 1}月`;

  const displayedInterviews =
    activeTab === "today" ? todayInterviews : weekInterviews;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">面试安排</h1>
          <p className="text-gray-500 text-sm mt-1">查看和管理所有面试</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate("/interviews/evaluate/new")}
        >
          <Plus className="w-4 h-4" />
          新建面试
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekOffset(weekOffset - 1)}
                  className="btn-ghost p-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="font-semibold text-gray-900">
                  {monthLabel} 第{Math.ceil((weekDates[0].getDate() + 6) / 7)}周
                </h2>
                <button
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  className="btn-ghost p-1.5"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setWeekOffset(0)}
                  className="btn-secondary text-xs px-2 py-1"
                >
                  今天
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((_, dayIdx) => (
                  <div key={dayIdx} className="space-y-1">
                    <div className="h-12 bg-gray-100 rounded animate-pulse" />
                    {timeSlots.map((_, tIdx) => (
                      <div
                        key={tIdx}
                        className="h-16 bg-gray-50 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-7 gap-1 min-w-[800px]">
                  {weekDays.map((day, dayIdx) => {
                    const date = weekDates[dayIdx];
                    const isToday =
                      date.toDateString() === new Date().toDateString();
                    return (
                      <div key={day} className="space-y-1">
                        <div
                          className={cn(
                            "text-center py-2 rounded-lg",
                            isToday
                              ? "bg-primary-50 text-primary-700"
                              : "bg-gray-50 text-gray-600"
                          )}
                        >
                          <p className="text-xs">{day}</p>
                          <p
                            className={cn(
                              "text-lg font-semibold",
                              isToday && "text-primary-700"
                            )}
                          >
                            {date.getDate()}
                          </p>
                        </div>
                        {timeSlots.map((time) => {
                          const interviewForSlot = mockInterviews.find((i) => {
                            const [iDate, iTime] = i.scheduledAt.split(" ");
                            const slotDateStr = `${date.getFullYear()}-${String(
                              date.getMonth() + 1
                            ).padStart(2, "0")}-${String(
                              date.getDate()
                            ).padStart(2, "0")}`;
                            return (
                              iDate === slotDateStr &&
                              iTime?.startsWith(time.slice(0, 2))
                            );
                          });

                          return (
                            <div
                              key={time}
                              className={cn(
                                "h-16 border-l border-t border-gray-100 relative rounded",
                                dayIdx === 0 && "border-l-0"
                              )}
                            >
                              <span className="absolute left-1 top-0.5 text-[10px] text-gray-300">
                                {time}
                              </span>
                              {interviewForSlot && (
                                <div className="absolute inset-1 mt-4">
                                  <InterviewBlock
                                    interview={interviewForSlot}
                                    onClick={() =>
                                      navigate(
                                        `/interviews/evaluate/${interviewForSlot.id}`
                                      )
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("today")}
                className={cn(
                  "flex-1 text-sm py-1.5 rounded-md font-medium transition-colors",
                  activeTab === "today"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                今日
              </button>
              <button
                onClick={() => setActiveTab("week")}
                className={cn(
                  "flex-1 text-sm py-1.5 rounded-md font-medium transition-colors",
                  activeTab === "week"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                本周
              </button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))
              ) : displayedInterviews.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">暂无面试安排</p>
                </div>
              ) : (
                displayedInterviews.map((interview) => (
                  <InterviewSidebarItem
                    key={interview.id}
                    interview={interview}
                    onClick={() =>
                      navigate(`/interviews/evaluate/${interview.id}`)
                    }
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
