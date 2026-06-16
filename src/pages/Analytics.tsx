import { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  UserCheck,
  CalendarRange,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Trophy,
  Medal,
  Award,
  ArrowRight,
  Target,
  Zap,
  Star,
} from "lucide-react";

type TabKey = "funnel" | "channel" | "interviewer" | "period";

const tabs: Array<{ key: TabKey; label: string; icon: typeof BarChart3 }> = [
  { key: "funnel", label: "招聘漏斗", icon: BarChart3 },
  { key: "channel", label: "渠道分析", icon: Users },
  { key: "interviewer", label: "面试官绩效", icon: UserCheck },
  { key: "period", label: "周期趋势", icon: CalendarRange },
];

const COLORS = {
  primary: "#1e40af",
  primaryLight: "#3b82f6",
  accent: "#0d9488",
  accentLight: "#14b8a6",
  amber: "#f59e0b",
  amberLight: "#fbbf24",
  red: "#ef4444",
  redLight: "#f87171",
  purple: "#8b5cf6",
  pink: "#ec4899",
  slate: "#64748b",
};

interface FunnelStage {
  name: string;
  value: number;
  color: string;
}

interface ChannelData {
  name: string;
  resumes: number;
  interviews: number;
  hired: number;
  conversionRate: number;
  avgRating: number;
  score: number;
  statusBreakdown: { status: string; count: number; color: string }[];
}

interface InterviewerData {
  id: string;
  name: string;
  department: string;
  interviewCount: number;
  avgRating: number;
  passRate: number;
  hireRate: number;
  timelyRate: number;
  score: number;
  firstRound: number;
  secondRound: number;
  finalRound: number;
  professionalism: number;
  strictness: number;
  timeliness: number;
  passThroughRate: number;
  rounds: number;
}

interface TrendDataPoint {
  date: string;
  resumes: number;
  interviews: number;
  hired: number;
}

const funnelData: FunnelStage[] = [
  { name: "简历投递", value: 500, color: COLORS.primary },
  { name: "简历筛选", value: 380, color: COLORS.primaryLight },
  { name: "初面", value: 220, color: COLORS.accent },
  { name: "复试", value: 130, color: COLORS.accentLight },
  { name: "终面", value: 68, color: COLORS.amber },
  { name: "Offer发放", value: 42, color: COLORS.purple },
  { name: "已入职", value: 30, color: "#10b981" },
];

const stageDurations = [
  { name: "简历筛选", days: 2.5 },
  { name: "初面安排", days: 3.2 },
  { name: "初面→复试", days: 4.8 },
  { name: "复试→终面", days: 5.5 },
  { name: "终面→Offer", days: 3.8 },
  { name: "Offer→入职", days: 12.5 },
];

const channelData: ChannelData[] = [
  {
    name: "BOSS直聘",
    resumes: 180,
    interviews: 81,
    hired: 12,
    conversionRate: 6.7,
    avgRating: 3.8,
    score: 85,
    statusBreakdown: [
      { status: "新简历", count: 45, color: "#94a3b8" },
      { status: "筛选中", count: 35, color: "#f59e0b" },
      { status: "面试中", count: 58, color: "#3b82f6" },
      { status: "Offer", count: 18, color: "#8b5cf6" },
      { status: "已入职", count: 12, color: "#10b981" },
      { status: "已淘汰", count: 12, color: "#ef4444" },
    ],
  },
  {
    name: "拉勾网",
    resumes: 120,
    interviews: 46,
    hired: 8,
    conversionRate: 6.7,
    avgRating: 4.0,
    score: 82,
    statusBreakdown: [
      { status: "新简历", count: 28, color: "#94a3b8" },
      { status: "筛选中", count: 22, color: "#f59e0b" },
      { status: "面试中", count: 38, color: "#3b82f6" },
      { status: "Offer", count: 12, color: "#8b5cf6" },
      { status: "已入职", count: 8, color: "#10b981" },
      { status: "已淘汰", count: 12, color: "#ef4444" },
    ],
  },
  {
    name: "智联招聘",
    resumes: 95,
    interviews: 27,
    hired: 4,
    conversionRate: 4.2,
    avgRating: 3.5,
    score: 62,
    statusBreakdown: [
      { status: "新简历", count: 25, color: "#94a3b8" },
      { status: "筛选中", count: 18, color: "#f59e0b" },
      { status: "面试中", count: 22, color: "#3b82f6" },
      { status: "Offer", count: 6, color: "#8b5cf6" },
      { status: "已入职", count: 4, color: "#10b981" },
      { status: "已淘汰", count: 20, color: "#ef4444" },
    ],
  },
  {
    name: "猎头推荐",
    resumes: 60,
    interviews: 39,
    hired: 4,
    conversionRate: 6.7,
    avgRating: 4.5,
    score: 78,
    statusBreakdown: [
      { status: "新简历", count: 8, color: "#94a3b8" },
      { status: "筛选中", count: 6, color: "#f59e0b" },
      { status: "面试中", count: 25, color: "#3b82f6" },
      { status: "Offer", count: 8, color: "#8b5cf6" },
      { status: "已入职", count: 4, color: "#10b981" },
      { status: "已淘汰", count: 9, color: "#ef4444" },
    ],
  },
  {
    name: "内部推荐",
    resumes: 45,
    interviews: 32,
    hired: 2,
    conversionRate: 4.4,
    avgRating: 4.3,
    score: 75,
    statusBreakdown: [
      { status: "新简历", count: 6, color: "#94a3b8" },
      { status: "筛选中", count: 4, color: "#f59e0b" },
      { status: "面试中", count: 22, color: "#3b82f6" },
      { status: "Offer", count: 5, color: "#8b5cf6" },
      { status: "已入职", count: 2, color: "#10b981" },
      { status: "已淘汰", count: 6, color: "#ef4444" },
    ],
  },
];

const interviewerData: InterviewerData[] = [
  {
    id: "1",
    name: "王经理",
    department: "技术部",
    interviewCount: 45,
    avgRating: 4.2,
    passRate: 62,
    hireRate: 28,
    timelyRate: 95,
    score: 92,
    firstRound: 25,
    secondRound: 15,
    finalRound: 5,
    professionalism: 90,
    strictness: 75,
    timeliness: 95,
    passThroughRate: 62,
    rounds: 3,
  },
  {
    id: "2",
    name: "刘总监",
    department: "技术部",
    interviewCount: 38,
    avgRating: 4.5,
    passRate: 58,
    hireRate: 35,
    timelyRate: 88,
    score: 90,
    firstRound: 10,
    secondRound: 18,
    finalRound: 10,
    professionalism: 95,
    strictness: 85,
    timeliness: 88,
    passThroughRate: 58,
    rounds: 3,
  },
  {
    id: "3",
    name: "赵总监",
    department: "产品部",
    interviewCount: 28,
    avgRating: 4.3,
    passRate: 68,
    hireRate: 32,
    timelyRate: 92,
    score: 88,
    firstRound: 8,
    secondRound: 12,
    finalRound: 8,
    professionalism: 88,
    strictness: 70,
    timeliness: 92,
    passThroughRate: 68,
    rounds: 3,
  },
  {
    id: "4",
    name: "陈工",
    department: "技术部",
    interviewCount: 32,
    avgRating: 3.9,
    passRate: 53,
    hireRate: 22,
    timelyRate: 78,
    score: 72,
    firstRound: 20,
    secondRound: 10,
    finalRound: 2,
    professionalism: 78,
    strictness: 82,
    timeliness: 78,
    passThroughRate: 53,
    rounds: 2.5,
  },
  {
    id: "5",
    name: "孙主管",
    department: "运营部",
    interviewCount: 22,
    avgRating: 4.0,
    passRate: 55,
    hireRate: 25,
    timelyRate: 85,
    score: 78,
    firstRound: 12,
    secondRound: 8,
    finalRound: 2,
    professionalism: 82,
    strictness: 72,
    timeliness: 85,
    passThroughRate: 55,
    rounds: 2.5,
  },
  {
    id: "6",
    name: "李经理",
    department: "市场部",
    interviewCount: 18,
    avgRating: 4.1,
    passRate: 61,
    hireRate: 28,
    timelyRate: 90,
    score: 82,
    firstRound: 10,
    secondRound: 6,
    finalRound: 2,
    professionalism: 85,
    strictness: 68,
    timeliness: 90,
    passThroughRate: 61,
    rounds: 2.5,
  },
];

const weeklyTrendData: TrendDataPoint[] = [
  { date: "第1周", resumes: 45, interviews: 18, hired: 2 },
  { date: "第2周", resumes: 52, interviews: 22, hired: 3 },
  { date: "第3周", resumes: 38, interviews: 15, hired: 1 },
  { date: "第4周", resumes: 60, interviews: 25, hired: 3 },
  { date: "第5周", resumes: 55, interviews: 28, hired: 4 },
  { date: "第6周", resumes: 48, interviews: 20, hired: 2 },
  { date: "第7周", resumes: 65, interviews: 30, hired: 5 },
  { date: "第8周", resumes: 72, interviews: 32, hired: 4 },
  { date: "第9周", resumes: 58, interviews: 25, hired: 3 },
  { date: "第10周", resumes: 68, interviews: 35, hired: 5 },
  { date: "第11周", resumes: 75, interviews: 38, hired: 6 },
  { date: "第12周", resumes: 82, interviews: 42, hired: 5 },
];

const monthlyTrendData: TrendDataPoint[] = [
  { date: "1月", resumes: 120, interviews: 50, hired: 8 },
  { date: "2月", resumes: 132, interviews: 62, hired: 12 },
  { date: "3月", resumes: 101, interviews: 51, hired: 10 },
  { date: "4月", resumes: 134, interviews: 64, hired: 15 },
  { date: "5月", resumes: 190, interviews: 80, hired: 18 },
  { date: "6月", resumes: 240, interviews: 95, hired: 12 },
];

function getConversionRates(funnel: FunnelStage[]) {
  const rates: { from: string; to: string; rate: number }[] = [];
  for (let i = 0; i < funnel.length - 1; i++) {
    rates.push({
      from: funnel[i].name,
      to: funnel[i + 1].name,
      rate: funnel[i].value > 0 ? (funnel[i + 1].value / funnel[i].value) * 100 : 0,
    });
  }
  return rates;
}

function getBottlenecks(funnel: FunnelStage[]) {
  const rates = getConversionRates(funnel);
  const sorted = [...rates].sort((a, b) => a.rate - b.rate);
  return sorted.slice(0, 2);
}

function getLongestStages(durations: { name: string; days: number }[]) {
  return [...durations].sort((a, b) => b.days - a.days).slice(0, 3);
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-amber-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
  if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
  return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-slate-500">{rank}</span>;
}

function InsightCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  color = "primary",
  children,
}: {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ElementType;
  color?: "primary" | "accent" | "amber" | "red";
  children?: React.ReactNode;
}) {
  const colorClasses = {
    primary: "bg-primary-50 text-primary-600",
    accent: "bg-teal-50 text-teal-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="card p-5 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : trend === "down" ? (
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-slate-500"
                )}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn("p-2.5 rounded-xl", colorClasses[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {children && <div className="mt-4 pt-4 border-t border-slate-100">{children}</div>}
    </div>
  );
}

function ProgressBar({ value, max, color = "primary" }: { value: number; max: number; color?: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  const colorMap: Record<string, string> = {
    primary: "bg-primary-500",
    accent: "bg-teal-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };
  return (
    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-500", colorMap[color] || "bg-primary-500")}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function FunnelTab() {
  const conversionRates = useMemo(() => getConversionRates(funnelData), []);
  const bottlenecks = useMemo(() => getBottlenecks(funnelData), []);
  const longestStages = useMemo(() => getLongestStages(stageDurations), []);
  const totalDays = stageDurations.reduce((sum, s) => sum + s.days, 0);
  const overallRate = funnelData[0].value > 0 ? (funnelData[funnelData.length - 1].value / funnelData[0].value) * 100 : 0;

  const funnelOption = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          const idx = params.dataIndex;
          const prevRate = idx > 0 ? ((funnelData[idx].value / funnelData[idx - 1].value) * 100).toFixed(1) : "-";
          const totalRate = ((funnelData[idx].value / funnelData[0].value) * 100).toFixed(1);
          return `
            <div style="font-weight:600;margin-bottom:4px">${params.name}</div>
            <div>人数：<b>${params.value}</b> 人</div>
            <div>占总简历：<b>${totalRate}%</b></div>
            ${idx > 0 ? `<div>上一阶段转化率：<b>${prevRate}%</b></div>` : ""}
          `;
        },
      },
      series: [
        {
          name: "招聘漏斗",
          type: "funnel",
          left: "5%",
          top: 20,
          bottom: 20,
          width: "90%",
          minSize: "30%",
          maxSize: "100%",
          sort: "descending",
          gap: 4,
          label: {
            show: true,
            position: "inside",
            formatter: (params: any) => {
              const idx = params.dataIndex;
              const rate = idx > 0 ? ((funnelData[idx].value / funnelData[idx - 1].value) * 100).toFixed(0) : "-";
              return `{name|${params.name}}\n{value|${params.value}人}\n${idx > 0 ? `{rate|转化率 ${rate}%}` : ""}`;
            },
            rich: {
              name: {
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                lineHeight: 18,
              },
              value: {
                fontSize: 12,
                color: "rgba(255,255,255,0.9)",
                lineHeight: 18,
              },
              rate: {
                fontSize: 11,
                color: "rgba(255,255,255,0.8)",
                backgroundColor: "rgba(0,0,0,0.2)",
                padding: [2, 6],
                borderRadius: 10,
                lineHeight: 20,
              },
            },
          },
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 2,
          },
          emphasis: {
            label: {
              fontSize: 14,
            },
          },
          data: funnelData.map((item) => ({
            value: item.value,
            name: item.name,
            itemStyle: { color: item.color },
          })),
        },
      ],
    }),
    []
  );

  const durationOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: "{b}: {c} 天",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        name: "天数",
        axisLabel: { fontSize: 11 },
      },
      yAxis: {
        type: "category",
        data: stageDurations.map((d) => d.name),
        axisLabel: { fontSize: 11 },
      },
      series: [
        {
          type: "bar",
          barWidth: 16,
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: COLORS.primaryLight },
                { offset: 1, color: COLORS.primary },
              ],
            },
          },
          label: {
            show: true,
            position: "right",
            formatter: "{c}天",
            fontSize: 11,
            color: "#64748b",
          },
          data: stageDurations.map((d) => d.days),
        },
      ],
    }),
    []
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard
          title="整体入职率"
          value={`${overallRate.toFixed(1)}%`}
          subtitle={`${funnelData[0].value}份简历 → ${funnelData[funnelData.length - 1].value}人入职`}
          trend="up"
          trendValue="环比 +2.3%"
          icon={Target}
          color="primary"
        />
        <InsightCard
          title="平均招聘周期"
          value={`${totalDays.toFixed(1)}天`}
          subtitle="从投递到入职平均耗时"
          trend="down"
          trendValue="环比 -3.2天"
          icon={Clock}
          color="accent"
        />
        <InsightCard
          title="本月入职人数"
          value="30人"
          subtitle="达成月度目标的 75%"
          trend="up"
          trendValue="同比 +15.2%"
          icon={Zap}
          color="amber"
        />
        <InsightCard
          title="在招职位"
          value="12个"
          subtitle="累计候选人 500+"
          icon={BarChart3}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-slate-900">招聘漏斗</h3>
              <p className="text-sm text-slate-500 mt-0.5">各阶段候选人转化情况</p>
            </div>
          </div>
          <ReactECharts option={funnelOption} style={{ height: 420 }} />
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-900">关键转化瓶颈</h3>
            </div>
            <div className="space-y-3">
              {bottlenecks.map((bottleneck, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-slate-900 text-sm">
                        {bottleneck.from} → {bottleneck.to}
                      </span>
                    </div>
                    <span className="text-red-600 font-bold text-lg">{bottleneck.rate.toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 ml-8">
                    {idx === 0
                      ? `转化率最低的环节，建议加强${bottleneck.from}筛选标准，提升候选人质量匹配度`
                      : `转化效率偏低，建议优化${bottleneck.from}流程，减少不必要的等待时间`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">阶段转化率详情</h3>
            </div>
            <div className="space-y-3">
              {conversionRates.map((rate, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-600">
                      {rate.from} → {rate.to}
                    </span>
                    <span
                      className={cn(
                        "font-semibold",
                        rate.rate < 50 ? "text-red-600" : rate.rate < 65 ? "text-amber-600" : "text-emerald-600"
                      )}
                    >
                      {rate.rate.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={rate.rate}
                    max={100}
                    color={rate.rate < 50 ? "red" : rate.rate < 65 ? "amber" : "accent"}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-slate-900">阶段停留时间排行</h3>
            </div>
            <div className="space-y-2.5">
              {longestStages.map((stage, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2.5">
                    <RankIcon rank={idx + 1} />
                    <span className="text-sm text-slate-700">{stage.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{stage.days.toFixed(1)} 天</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-slate-900">各阶段耗时分布</h3>
            <p className="text-sm text-slate-500 mt-0.5">招聘周期中各阶段的平均耗时</p>
          </div>
        </div>
        <ReactECharts option={durationOption} style={{ height: 280 }} />
      </div>
    </div>
  );
}

function ChannelTab() {
  const sortedChannels = useMemo(() => [...channelData].sort((a, b) => b.score - a.score), []);
  const bestChannel = sortedChannels[0];
  const worstChannel = sortedChannels[sortedChannels.length - 1];

  const scatterOption = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
        formatter: (params: { dataIndex: number }) => {
          const data = channelData[params.dataIndex];
          return `
            <div style="font-weight:600;margin-bottom:6px">${data.name}</div>
            <div>简历数量：<b>${data.resumes}</b> 份</div>
            <div>入职转化率：<b>${data.conversionRate}%</b></div>
            <div>平均评分：<b>${data.avgRating.toFixed(1)}</b></div>
            <div>综合得分：<b>${data.score}</b></div>
          `;
        },
      },
      grid: {
        left: "8%",
        right: "8%",
        bottom: "12%",
        top: "8%",
      },
      xAxis: {
        type: "value",
        name: "简历数量",
        nameLocation: "middle",
        nameGap: 25,
        axisLabel: { fontSize: 11 },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      yAxis: {
        type: "value",
        name: "入职转化率(%)",
        nameLocation: "middle",
        nameGap: 35,
        axisLabel: { fontSize: 11 },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          type: "scatter",
          symbolSize: (data: number[]) => data[2] * 12,
          itemStyle: {
            opacity: 0.8,
            shadowBlur: 10,
            shadowOffsetY: 5,
            shadowColor: "rgba(0,0,0,0.1)",
          },
          label: {
            show: true,
            formatter: (params: any) => channelData[params.dataIndex].name,
            position: "top",
            fontSize: 11,
            color: "#475569",
          },
          data: channelData.map((c, i) => [
            c.resumes,
            c.conversionRate,
            c.avgRating,
            {
              itemStyle: {
                color: i === 0 ? COLORS.primary : i === sortedChannels.length - 1 ? COLORS.red : COLORS.accent,
              },
            },
          ]),
        },
      ],
      markArea: {
        silent: true,
        itemStyle: {
          opacity: 0.05,
        },
        data: [
          [
            {
              xAxis: "min",
              yAxis: "min",
              itemStyle: { color: COLORS.red },
            },
            {
              xAxis: "average",
              yAxis: "average",
            },
          ],
          [
            {
              xAxis: "average",
              yAxis: "average",
              itemStyle: { color: COLORS.accent },
            },
            {
              xAxis: "max",
              yAxis: "max",
            },
          ],
        ],
      },
    }),
    []
  );

  const stackBarOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      legend: {
        bottom: 0,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: { fontSize: 11 },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        top: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: channelData.map((c) => c.name),
        axisLabel: { fontSize: 11 },
      },
      yAxis: {
        type: "value",
        name: "人数",
        axisLabel: { fontSize: 11 },
      },
      series: channelData[0].statusBreakdown.map((status, idx) => ({
        name: status.status,
        type: "bar",
        stack: "total",
        barWidth: 32,
        itemStyle: {
          color: status.color,
        },
        emphasis: { focus: "series" },
        data: channelData.map((c) => c.statusBreakdown[idx].count),
      })),
    }),
    []
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightCard
          title="最佳渠道"
          value={bestChannel.name}
          subtitle={`综合得分 ${bestChannel.score} 分`}
          icon={Trophy}
          color="amber"
        >
          <div className="text-xs text-slate-500">
            <span className="text-emerald-600 font-medium">{bestChannel.hired}</span> 人入职 ·
            转化率 <span className="text-emerald-600 font-medium">{bestChannel.conversionRate}%</span>
          </div>
        </InsightCard>
        <InsightCard
          title="需优化渠道"
          value={worstChannel.name}
          subtitle={`综合得分 ${worstChannel.score} 分`}
          icon={AlertTriangle}
          color="red"
        >
          <div className="text-xs text-slate-500">
            建议优化招聘文案或减少投入
          </div>
        </InsightCard>
        <InsightCard
          title="活跃渠道数"
          value={`${channelData.length}个`}
          subtitle="本月累计收到简历 500 份"
          trend="up"
          trendValue="环比 +12%"
          icon={Users}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-slate-900">渠道效果矩阵</h3>
              <p className="text-sm text-slate-500 mt-0.5">气泡大小代表平均评分，右上角为优质渠道</p>
            </div>
          </div>
          <ReactECharts option={scatterOption} style={{ height: 380 }} />
          <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: COLORS.accent }} />
              优质渠道
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: COLORS.red }} />
              待优化渠道
            </span>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">渠道质量排行榜</h3>
              <p className="text-sm text-slate-500 mt-0.5">综合评估各渠道表现</p>
            </div>
          </div>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="text-left py-2.5 px-2 font-medium">排名</th>
                  <th className="text-left py-2.5 px-2 font-medium">渠道</th>
                  <th className="text-right py-2.5 px-2 font-medium">简历</th>
                  <th className="text-right py-2.5 px-2 font-medium">入职率</th>
                  <th className="text-right py-2.5 px-2 font-medium">评分</th>
                  <th className="text-right py-2.5 px-2 font-medium">得分</th>
                </tr>
              </thead>
              <tbody>
                {sortedChannels.map((channel, idx) => (
                  <tr
                    key={channel.name}
                    className={cn(
                      "border-b border-slate-50 transition-colors",
                      idx >= sortedChannels.length - 1 ? "bg-red-50/50" : "hover:bg-slate-50"
                    )}
                  >
                    <td className="py-3 px-2">
                      <RankIcon rank={idx + 1} />
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium text-slate-900">{channel.name}</div>
                      {idx >= sortedChannels.length - 1 && (
                        <span className="text-xs text-red-500">建议优化</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right font-medium">{channel.resumes}</td>
                    <td className="py-3 px-2 text-right text-emerald-600 font-medium">
                      {channel.conversionRate}%
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="inline-flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {channel.avgRating.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span
                        className={cn(
                          "font-bold",
                          idx === 0
                            ? "text-amber-600"
                            : idx >= sortedChannels.length - 1
                            ? "text-red-600"
                            : "text-slate-700"
                        )}
                      >
                        {channel.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-slate-900">各渠道候选人状态分布</h3>
            <p className="text-sm text-slate-500 mt-0.5">各渠道候选人在不同阶段的分布情况</p>
          </div>
        </div>
        <ReactECharts option={stackBarOption} style={{ height: 320 }} />
      </div>
    </div>
  );
}

function InterviewerTab() {
  const sortedInterviewers = useMemo(() => [...interviewerData].sort((a, b) => b.score - a.score), []);
  const radarInterviewers = useMemo(() => sortedInterviewers.slice(0, 4), [sortedInterviewers]);

  const radarOption = useMemo(
    () => ({
      tooltip: {
        trigger: "item",
      },
      legend: {
        bottom: 0,
        textStyle: { fontSize: 11 },
      },
      radar: {
        indicator: [
          { name: "专业度", max: 100 },
          { name: "严格度", max: 100 },
          { name: "及时率", max: 100 },
          { name: "通过率", max: 100 },
          { name: "面试轮次", max: 100 },
        ],
        shape: "polygon",
        splitNumber: 4,
        axisName: {
          fontSize: 11,
          color: "#64748b",
        },
        splitLine: {
          lineStyle: {
            color: "#e2e8f0",
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ["#f8fafc", "#f1f5f9"],
          },
        },
        axisLine: {
          lineStyle: {
            color: "#e2e8f0",
          },
        },
      },
      series: [
        {
          type: "radar",
          emphasis: { lineStyle: { width: 3 } },
          data: radarInterviewers.map((interviewer, idx) => ({
            value: [
              interviewer.professionalism,
              interviewer.strictness,
              interviewer.timeliness,
              interviewer.passThroughRate,
              (interviewer.rounds / 3) * 100,
            ],
            name: interviewer.name,
            lineStyle: {
              color: [COLORS.primary, COLORS.accent, COLORS.amber, COLORS.purple][idx],
              width: 2,
            },
            areaStyle: {
              opacity: 0.1,
              color: [COLORS.primary, COLORS.accent, COLORS.amber, COLORS.purple][idx],
            },
            itemStyle: {
              color: [COLORS.primary, COLORS.accent, COLORS.amber, COLORS.purple][idx],
            },
          })),
        },
      ],
    }),
    []
  );

  const workloadOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      legend: {
        bottom: 0,
        textStyle: { fontSize: 11 },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        top: "5%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        axisLabel: { fontSize: 11 },
      },
      yAxis: {
        type: "category",
        data: sortedInterviewers.map((i) => i.name),
        axisLabel: { fontSize: 11 },
      },
      series: [
        {
          name: "初面",
          type: "bar",
          stack: "total",
          barWidth: 20,
          itemStyle: { color: COLORS.primaryLight },
          data: sortedInterviewers.map((i) => i.firstRound),
        },
        {
          name: "复面",
          type: "bar",
          stack: "total",
          itemStyle: { color: COLORS.accent },
          data: sortedInterviewers.map((i) => i.secondRound),
        },
        {
          name: "终面",
          type: "bar",
          stack: "total",
          itemStyle: { color: COLORS.amber },
          data: sortedInterviewers.map((i) => i.finalRound),
        },
      ],
    }),
    []
  );

  const maxScore = 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InsightCard
          title="面试官总数"
          value={`${interviewerData.length}人`}
          subtitle="覆盖技术、产品、运营等部门"
          icon={Users}
          color="primary"
        />
        <InsightCard
          title="本月面试总数"
          value={`${interviewerData.reduce((s, i) => s + i.interviewCount, 0)}次`}
          subtitle={`人均面试 ${Math.round(interviewerData.reduce((s, i) => s + i.interviewCount, 0) / interviewerData.length)} 次`}
          trend="up"
          trendValue="环比 +8.5%"
          icon={BarChart3}
          color="accent"
        />
        <InsightCard
          title="平均评分"
          value={
            (
              interviewerData.reduce((s, i) => s + i.avgRating * i.interviewCount, 0) /
              interviewerData.reduce((s, i) => s + i.interviewCount, 0)
            ).toFixed(2)
          }
          subtitle="候选人平均评价得分"
          icon={Star}
          color="amber"
        />
        <InsightCard
          title="最佳面试官"
          value={sortedInterviewers[0].name}
          subtitle={`综合得分 ${sortedInterviewers[0].score} 分`}
          icon={Trophy}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-slate-900">面试官能力雷达图</h3>
              <p className="text-sm text-slate-500 mt-0.5">核心面试官多维度能力对比</p>
            </div>
          </div>
          <ReactECharts option={radarOption} style={{ height: 380 }} />
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">面试官绩效排行榜</h3>
              <p className="text-sm text-slate-500 mt-0.5">按综合得分降序排列</p>
            </div>
          </div>
          <div className="overflow-x-auto -mx-2 space-y-3">
            {sortedInterviewers.map((interviewer, idx) => (
              <div
                key={interviewer.id}
                className={cn(
                  "p-3 rounded-xl border transition-colors",
                  idx < 3 ? "border-amber-100 bg-amber-50/30" : "border-slate-100 hover:bg-slate-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <RankIcon rank={idx + 1} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-900">{interviewer.name}</span>
                        <span className="text-xs text-slate-400 ml-2">{interviewer.department}</span>
                      </div>
                      <span
                        className={cn(
                          "font-bold text-lg",
                          idx === 0
                            ? "text-amber-600"
                            : idx === 1
                            ? "text-slate-600"
                            : idx === 2
                            ? "text-amber-700"
                            : "text-slate-700"
                        )}
                      >
                        {interviewer.score}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
                      <span>面试 {interviewer.interviewCount} 次</span>
                      <span>通过率 {interviewer.passRate}%</span>
                      <span>及时率 {interviewer.timelyRate}%</span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={interviewer.score} max={maxScore} color="primary" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-slate-900">面试官工作量分布</h3>
            <p className="text-sm text-slate-500 mt-0.5">各面试官承担的初面/复面/终面次数</p>
          </div>
        </div>
        <ReactECharts option={workloadOption} style={{ height: 320 }} />
      </div>
    </div>
  );
}

function PeriodTab() {
  const [timeRange, setTimeRange] = useState<"weekly" | "monthly">("weekly");
  const trendData = timeRange === "weekly" ? weeklyTrendData : monthlyTrendData;

  const peakResumes = Math.max(...trendData.map((d) => d.resumes));

  const currentMonth = trendData[trendData.length - 1];
  const prevMonth = trendData[trendData.length - 2];

  const resumeChange = prevMonth.resumes > 0 ? ((currentMonth.resumes - prevMonth.resumes) / prevMonth.resumes) * 100 : 0;
  const interviewChange = prevMonth.interviews > 0 ? ((currentMonth.interviews - prevMonth.interviews) / prevMonth.interviews) * 100 : 0;
  const hiredChange = prevMonth.hired > 0 ? ((currentMonth.hired - prevMonth.hired) / prevMonth.hired) * 100 : 0;

  const avgCycle = 28.5;
  const avgCycleChange = -3.2;

  const trendOption = useMemo(
    () => ({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
      },
      legend: {
        bottom: 0,
        textStyle: { fontSize: 12 },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "15%",
        top: "8%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: trendData.map((d) => d.date),
        axisLabel: { fontSize: 11 },
        axisLine: { lineStyle: { color: "#e2e8f0" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { fontSize: 11 },
        splitLine: { lineStyle: { color: "#f1f5f9" } },
      },
      series: [
        {
          name: "新简历",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          data: trendData.map((d) => d.resumes),
          lineStyle: { color: COLORS.primary, width: 3 },
          itemStyle: { color: COLORS.primary },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(30, 64, 175, 0.2)" },
                { offset: 1, color: "rgba(30, 64, 175, 0.02)" },
              ],
            },
          },
          markPoint: {
            symbol: "pin",
            symbolSize: 50,
            data: [{ type: "max", name: "峰值" }],
            label: { fontSize: 10 },
          },
        },
        {
          name: "面试数",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          data: trendData.map((d) => d.interviews),
          lineStyle: { color: COLORS.accent, width: 3 },
          itemStyle: { color: COLORS.accent },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(13, 148, 136, 0.2)" },
                { offset: 1, color: "rgba(13, 148, 136, 0.02)" },
              ],
            },
          },
        },
        {
          name: "入职数",
          type: "line",
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          data: trendData.map((d) => d.hired),
          lineStyle: { color: COLORS.amber, width: 3 },
          itemStyle: { color: COLORS.amber },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(245, 158, 11, 0.2)" },
                { offset: 1, color: "rgba(245, 158, 11, 0.02)" },
              ],
            },
          },
        },
      ],
    }),
    [timeRange]
  );

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold text-slate-900">多指标趋势分析</h3>
            <p className="text-sm text-slate-500 mt-0.5">新简历、面试数、入职数的变化趋势</p>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setTimeRange("weekly")}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                timeRange === "weekly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              近12周
            </button>
            <button
              onClick={() => setTimeRange("monthly")}
              className={cn(
                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                timeRange === "monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              近6个月
            </button>
          </div>
        </div>
        <ReactECharts option={trendOption} style={{ height: 380 }} className="mt-4" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <InsightCard
          title="本月新增简历"
          value={currentMonth.resumes.toString()}
          trend={resumeChange >= 0 ? "up" : "down"}
          trendValue={`${resumeChange >= 0 ? "+" : ""}${resumeChange.toFixed(1)}%`}
          color="primary"
        />
        <InsightCard
          title="本月面试数"
          value={currentMonth.interviews.toString()}
          trend={interviewChange >= 0 ? "up" : "down"}
          trendValue={`${interviewChange >= 0 ? "+" : ""}${interviewChange.toFixed(1)}%`}
          color="accent"
        />
        <InsightCard
          title="本月入职数"
          value={currentMonth.hired.toString()}
          trend={hiredChange >= 0 ? "up" : "down"}
          trendValue={`${hiredChange >= 0 ? "+" : ""}${hiredChange.toFixed(1)}%`}
          color="amber"
        />
        <InsightCard
          title="招聘周期"
          value={`${avgCycle}天`}
          subtitle="平均耗时"
          trend={avgCycleChange < 0 ? "up" : "down"}
          trendValue={`${avgCycleChange}天`}
          color="primary"
        />
        <InsightCard
          title="最佳渠道"
          value="BOSS直聘"
          subtitle="本月入职 12 人"
          icon={Trophy}
          color="amber"
        />
        <InsightCard
          title="简历峰值"
          value={peakResumes.toString()}
          subtitle={timeRange === "weekly" ? "第12周" : "6月"}
          icon={Zap}
          color="accent"
        />
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-900">趋势洞察</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-primary-50 border border-primary-100">
            <h4 className="font-medium text-primary-900 mb-2">📈 简历量持续增长</h4>
            <p className="text-sm text-primary-700">
              本月新增简历 <b>{currentMonth.resumes}</b> 份，环比增长 <b>{resumeChange.toFixed(1)}%</b>
              ，招聘渠道拓展效果明显，建议继续加大投入。
            </p>
          </div>
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-100">
            <h4 className="font-medium text-teal-900 mb-2">⚡ 面试效率提升</h4>
            <p className="text-sm text-teal-700">
              招聘周期缩短 <b>{Math.abs(avgCycleChange)}天</b>，面试安排更及时，
              各环节衔接更加顺畅，候选人体验有所改善。
            </p>
          </div>
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <h4 className="font-medium text-amber-900 mb-2">⚠️ 入职转化波动</h4>
            <p className="text-sm text-amber-700">
              本月入职人数 {currentMonth.hired} 人，较上月{hiredChange >= 0 ? "增长" : "下降"}{" "}
              <b>{Math.abs(hiredChange).toFixed(1)}%</b>，需关注 Offer 接受率及候选人质量。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<TabKey>("funnel");

  const tabContent: Record<TabKey, React.ReactNode> = {
    funnel: <FunnelTab />,
    channel: <ChannelTab />,
    interviewer: <InterviewerTab />,
    period: <PeriodTab />,
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">数据分析</h1>
        <p className="text-slate-500 text-sm mt-1">多维度招聘数据洞察，助力决策</p>
      </div>

      <div className="card p-1 inline-flex bg-slate-100 rounded-xl overflow-x-auto max-w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                isActive ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div key={activeTab} className="animate-fade-in">
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
