import { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Users,
  UserCheck,
  CalendarRange,
  PieChart,
} from "lucide-react";

type TabKey = "funnel" | "channel" | "interviewer" | "period";

const tabs: Array<{ key: TabKey; label: string; icon: typeof BarChart3 }> = [
  { key: "funnel", label: "招聘漏斗", icon: BarChart3 },
  { key: "channel", label: "渠道分析", icon: Users },
  { key: "interviewer", label: "面试官绩效", icon: UserCheck },
  { key: "period", label: "周期统计", icon: CalendarRange },
];

const funnelOption = {
  tooltip: {
    trigger: "item",
    formatter: "{b}: {c} 人 ({d}%)",
  },
  series: [
    {
      name: "招聘漏斗",
      type: "funnel",
      left: "10%",
      top: 30,
      bottom: 30,
      width: "80%",
      min: 0,
      max: 300,
      minSize: "0%",
      maxSize: "100%",
      sort: "descending",
      gap: 3,
      label: {
        show: true,
        position: "inside",
        formatter: "{b}\n{c}人",
        fontSize: 13,
        color: "#fff",
      },
      itemStyle: {
        borderColor: "#fff",
        borderWidth: 2,
      },
      data: [
        { value: 500, name: "简历投递", itemStyle: { color: "#3b82f6" } },
        { value: 380, name: "简历筛选", itemStyle: { color: "#6366f1" } },
        { value: 220, name: "初面", itemStyle: { color: "#8b5cf6" } },
        { value: 130, name: "复试", itemStyle: { color: "#a855f7" } },
        { value: 68, name: "终面", itemStyle: { color: "#d946ef" } },
        { value: 42, name: "Offer", itemStyle: { color: "#ec4899" } },
        { value: 30, name: "入职", itemStyle: { color: "#10b981" } },
      ],
    },
  ],
};

const channelOption = {
  tooltip: {
    trigger: "item",
    formatter: "{b}: {c} 份简历 ({d}%)",
  },
  legend: {
    bottom: 0,
    left: "center",
  },
  series: [
    {
      name: "简历来源",
      type: "pie",
      radius: ["40%", "70%"],
      center: ["50%", "45%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: {
        show: false,
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 14,
          fontWeight: "bold",
        },
      },
      data: [
        { value: 180, name: "BOSS直聘", itemStyle: { color: "#3b82f6" } },
        { value: 120, name: "拉勾网", itemStyle: { color: "#10b981" } },
        { value: 95, name: "智联招聘", itemStyle: { color: "#f59e0b" } },
        { value: 60, name: "猎头推荐", itemStyle: { color: "#8b5cf6" } },
        { value: 45, name: "内部推荐", itemStyle: { color: "#ec4899" } },
      ],
    },
  ],
};

const interviewerOption = {
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "shadow",
    },
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "3%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    data: ["王经理", "刘总监", "陈工", "赵总监", "孙主管", "李经理"],
    axisLabel: {
      interval: 0,
      rotate: 0,
    },
  },
  yAxis: {
    type: "value",
    name: "面试人次",
  },
  series: [
    {
      name: "面试数",
      type: "bar",
      barWidth: "40%",
      data: [
        { value: 45, itemStyle: { color: "#3b82f6" } },
        { value: 38, itemStyle: { color: "#6366f1" } },
        { value: 32, itemStyle: { color: "#8b5cf6" } },
        { value: 28, itemStyle: { color: "#a855f7" } },
        { value: 22, itemStyle: { color: "#d946ef" } },
        { value: 18, itemStyle: { color: "#ec4899" } },
      ],
    },
  ],
};

const periodOption = {
  tooltip: {
    trigger: "axis",
  },
  legend: {
    bottom: 0,
  },
  grid: {
    left: "3%",
    right: "4%",
    bottom: "15%",
    containLabel: true,
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: ["1月", "2月", "3月", "4月", "5月", "6月"],
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      name: "新简历",
      type: "line",
      smooth: true,
      data: [120, 132, 101, 134, 190, 240],
      lineStyle: { color: "#3b82f6", width: 3 },
      itemStyle: { color: "#3b82f6" },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(59, 130, 246, 0.3)" },
            { offset: 1, color: "rgba(59, 130, 246, 0.05)" },
          ],
        },
      },
    },
    {
      name: "面试数",
      type: "line",
      smooth: true,
      data: [50, 62, 51, 64, 80, 95],
      lineStyle: { color: "#10b981", width: 3 },
      itemStyle: { color: "#10b981" },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
            { offset: 1, color: "rgba(16, 185, 129, 0.05)" },
          ],
        },
      },
    },
    {
      name: "入职数",
      type: "line",
      smooth: true,
      data: [8, 12, 10, 15, 18, 12],
      lineStyle: { color: "#8b5cf6", width: 3 },
      itemStyle: { color: "#8b5cf6" },
      areaStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: "rgba(139, 92, 246, 0.3)" },
            { offset: 1, color: "rgba(139, 92, 246, 0.05)" },
          ],
        },
      },
    },
  ],
};

const tabContent: Record<TabKey, React.ReactNode> = {
  funnel: (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-2">招聘漏斗</h3>
        <p className="text-sm text-gray-500 mb-4">各阶段候选人转化情况</p>
        <ReactECharts option={funnelOption} style={{ height: 400 }} />
      </div>
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-2">转化率统计</h3>
        <p className="text-sm text-gray-500 mb-4">关键阶段转化率指标</p>
        <div className="space-y-4">
          {[
            { label: "简历筛选通过率", value: "76%", color: "bg-emerald-500" },
            { label: "初面通过率", value: "57.9%", color: "bg-blue-500" },
            { label: "复试通过率", value: "59.1%", color: "bg-indigo-500" },
            { label: "终面通过率", value: "61.8%", color: "bg-violet-500" },
            { label: "Offer接受率", value: "71.4%", color: "bg-purple-500" },
            { label: "整体入职率", value: "6%", color: "bg-emerald-600" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium text-gray-900">{item.value}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", item.color)}
                  style={{ width: item.value }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  channel: (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-2">渠道分布</h3>
        <p className="text-sm text-gray-500 mb-4">各招聘渠道简历来源占比</p>
        <ReactECharts option={channelOption} style={{ height: 350 }} />
      </div>
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-2">渠道效果对比</h3>
        <p className="text-sm text-gray-500 mb-4">各渠道简历质量与入职转化率</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-2 font-medium text-gray-600">
                  渠道
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-600">
                  简历数
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-600">
                  面试率
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-600">
                  入职数
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-600">
                  转化率
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  name: "BOSS直聘",
                  resumes: 180,
                  interviewRate: "45%",
                  hired: 12,
                  conversion: "6.7%",
                },
                {
                  name: "拉勾网",
                  resumes: 120,
                  interviewRate: "38%",
                  hired: 8,
                  conversion: "6.7%",
                },
                {
                  name: "智联招聘",
                  resumes: 95,
                  interviewRate: "28%",
                  hired: 4,
                  conversion: "4.2%",
                },
                {
                  name: "猎头推荐",
                  resumes: 60,
                  interviewRate: "65%",
                  hired: 4,
                  conversion: "6.7%",
                },
                {
                  name: "内部推荐",
                  resumes: 45,
                  interviewRate: "72%",
                  hired: 2,
                  conversion: "4.4%",
                },
              ].map((row) => (
                <tr key={row.name} className="border-b border-gray-50">
                  <td className="py-3 px-2 text-gray-900">{row.name}</td>
                  <td className="py-3 px-2 text-right font-medium">
                    {row.resumes}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-600">
                    {row.interviewRate}
                  </td>
                  <td className="py-3 px-2 text-right font-medium text-emerald-600">
                    {row.hired}
                  </td>
                  <td className="py-3 px-2 text-right font-medium">
                    {row.conversion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ),
  interviewer: (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-2">面试官工作量</h3>
        <p className="text-sm text-gray-500 mb-4">本月各面试官面试次数</p>
        <ReactECharts option={interviewerOption} style={{ height: 350 }} />
      </div>
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-2">面试评分统计</h3>
        <p className="text-sm text-gray-500 mb-4">面试官平均分分布</p>
        <div className="space-y-4">
          {[
            {
              name: "王经理",
              count: 45,
              avgRating: 4.2,
              passRate: "62%",
            },
            {
              name: "刘总监",
              count: 38,
              avgRating: 4.5,
              passRate: "58%",
            },
            {
              name: "陈工",
              count: 32,
              avgRating: 3.9,
              passRate: "53%",
            },
            {
              name: "赵总监",
              count: 28,
              avgRating: 4.3,
              passRate: "68%",
            },
            {
              name: "孙主管",
              count: 22,
              avgRating: 4.0,
              passRate: "55%",
            },
            {
              name: "李经理",
              count: 18,
              avgRating: 4.1,
              passRate: "61%",
            },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.count} 次面试 · 通过率 {item.passRate}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <PieChart className="w-4 h-4 text-primary-500" />
                <span className="font-semibold text-gray-900">
                  {item.avgRating.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  period: (
    <div className="card p-6">
      <h3 className="font-semibold text-gray-900 mb-2">周期招聘趋势</h3>
      <p className="text-sm text-gray-500 mb-4">近6个月招聘数据变化趋势</p>
      <ReactECharts option={periodOption} style={{ height: 400 }} />
    </div>
  ),
};

export default function Analytics() {
  const [activeTab, setActiveTab] = useState<TabKey>("funnel");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">数据分析</h1>
        <p className="text-gray-500 text-sm mt-1">多维度招聘数据报表</p>
      </div>

      <div className="card p-1 inline-flex bg-gray-100 rounded-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="h-80 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="card p-6">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="h-80 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ) : (
        tabContent[activeTab]
      )}
    </div>
  );
}
