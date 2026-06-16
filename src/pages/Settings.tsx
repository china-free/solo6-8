import { useState, useEffect } from "react";
import {
  Users,
  Shield,
  Mail,
  BarChartHorizontal,
  Plus,
  Edit3,
  Trash2,
  Search,
  UserPlus,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { USER_ROLE_LABELS } from "@shared/types";
import type { UserRole } from "@shared/types";

type TabKey = "users" | "roles" | "templates" | "dimensions";

const tabs: Array<{ key: TabKey; label: string; icon: typeof Users }> = [
  { key: "users", label: "用户管理", icon: Users },
  { key: "roles", label: "角色权限", icon: Shield },
  { key: "templates", label: "邮件模板", icon: Mail },
  { key: "dimensions", label: "评价维度", icon: BarChartHorizontal },
];

const mockUsers = [
  {
    id: "1",
    name: "李明",
    email: "liming@example.com",
    role: "HR" as UserRole,
    department: "人力资源部",
    status: "active",
    createdAt: "2026-01-15",
  },
  {
    id: "2",
    name: "王芳",
    email: "wangfang@example.com",
    role: "HR" as UserRole,
    department: "人力资源部",
    status: "active",
    createdAt: "2026-02-20",
  },
  {
    id: "3",
    name: "张伟",
    email: "zhangwei@example.com",
    role: "INTERVIEWER" as UserRole,
    department: "技术部",
    status: "active",
    createdAt: "2026-01-10",
  },
  {
    id: "4",
    name: "刘静",
    email: "liujing@example.com",
    role: "INTERVIEWER" as UserRole,
    department: "产品部",
    status: "active",
    createdAt: "2026-03-05",
  },
  {
    id: "5",
    name: "陈强",
    email: "chenqiang@example.com",
    role: "HIRING_MANAGER" as UserRole,
    department: "技术部",
    status: "active",
    createdAt: "2025-12-01",
  },
  {
    id: "6",
    name: "赵丽",
    email: "zhaoli@example.com",
    role: "ADMIN" as UserRole,
    department: "行政部",
    status: "inactive",
    createdAt: "2025-10-15",
  },
];

const mockRoles = [
  {
    id: "1",
    name: "HR招聘专员",
    key: "HR",
    description: "负责简历筛选、面试安排、候选人沟通等招聘全流程",
    userCount: 8,
    permissions: ["查看简历", "安排面试", "发送Offer", "管理候选人状态"],
  },
  {
    id: "2",
    name: "面试官",
    key: "INTERVIEWER",
    description: "参与面试、撰写评价、推荐候选人",
    userCount: 25,
    permissions: ["查看分配的候选人", "提交面试评价", "查看面试安排"],
  },
  {
    id: "3",
    name: "用人部门负责人",
    key: "HIRING_MANAGER",
    description: "管理部门职位、审批Offer、最终决策",
    userCount: 12,
    permissions: ["创建职位", "查看全部候选人", "审批Offer", "最终录用决策"],
  },
  {
    id: "4",
    name: "系统管理员",
    key: "ADMIN",
    description: "系统配置、用户管理、权限分配、数据导出",
    userCount: 2,
    permissions: ["全部权限", "用户管理", "角色配置", "系统设置", "数据导出"],
  },
];

const mockTemplates = [
  {
    id: "1",
    name: "面试邀请邮件",
    type: "interview_invite",
    subject: "【XXX公司】面试邀请 - {{position}}",
    updatedAt: "2026-05-20",
    enabled: true,
  },
  {
    id: "2",
    name: "Offer发送邮件",
    type: "offer",
    subject: "【XXX公司】录用通知书 - {{name}}",
    updatedAt: "2026-06-01",
    enabled: true,
  },
  {
    id: "3",
    name: "简历筛选通过通知",
    type: "screening_passed",
    subject: "【XXX公司】简历筛选通过通知",
    updatedAt: "2026-05-15",
    enabled: true,
  },
  {
    id: "4",
    name: "简历淘汰通知",
    type: "rejection",
    subject: "【XXX公司】感谢您的应聘",
    updatedAt: "2026-04-30",
    enabled: false,
  },
];

const mockDimensions = [
  { id: "1", name: "技术能力", description: "专业知识和技术水平", enabled: true, weight: 25 },
  { id: "2", name: "沟通能力", description: "表达清晰、倾听理解", enabled: true, weight: 20 },
  { id: "3", name: "解决问题", description: "分析能力和逻辑思维", enabled: true, weight: 20 },
  { id: "4", name: "团队协作", description: "合作精神和沟通配合", enabled: true, weight: 15 },
  { id: "5", name: "文化匹配", description: "价值观和企业文化契合", enabled: true, weight: 20 },
  { id: "6", name: "学习能力", description: "快速学习和适应能力", enabled: false, weight: 0 },
];

function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = mockUsers.filter(
    (u) =>
      u.name.includes(searchTerm) ||
      u.email.includes(searchTerm) ||
      u.department.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索用户姓名、邮箱、部门..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9"
          />
        </div>
        <button className="btn-primary">
          <UserPlus className="w-4 h-4" />
          添加用户
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  姓名
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  邮箱
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  角色
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  部门
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  状态
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">
                  创建时间
                </th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className="badge bg-primary-50 text-primary-700 border-primary-200">
                      {USER_ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.department}</td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        "badge",
                        user.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      )}
                    >
                      {user.status === "active" ? "启用" : "停用"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{user.createdAt}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RolePermissions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {mockRoles.map((role) => (
        <div key={role.id} className="card p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{role.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {role.userCount} 位用户
              </p>
            </div>
            <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-4">{role.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {role.permissions.map((perm) => (
              <span
                key={perm}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
              >
                <Check className="w-3 h-3 text-emerald-500" />
                {perm}
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="card p-5 border-dashed border-2 flex flex-col items-center justify-center text-gray-400 hover:border-primary-300 hover:text-primary-500 cursor-pointer transition-colors min-h-[180px]">
        <Plus className="w-8 h-8 mb-2" />
        <p className="text-sm font-medium">新建角色</p>
      </div>
    </div>
  );
}

function EmailTemplates() {
  return (
    <div className="card divide-y divide-gray-100">
      {mockTemplates.map((template) => (
        <div
          key={template.id}
          className="p-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <span
                  className={cn(
                    "badge border-0",
                    template.enabled
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  )}
                >
                  {template.enabled ? "已启用" : "已停用"}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{template.subject}</p>
              <p className="text-xs text-gray-400 mt-1">
                最后更新: {template.updatedAt}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary text-xs">
              <Edit3 className="w-3.5 h-3.5" />
              编辑
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EvaluationDimensions() {
  const [dimensions, setDimensions] = useState(mockDimensions);

  const toggleDimension = (id: string) => {
    setDimensions((prev) =>
      prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const totalWeight = dimensions
    .filter((d) => d.enabled)
    .reduce((sum, d) => sum + d.weight, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          当前启用权重合计:{" "}
          <span
            className={cn(
              "font-semibold",
              totalWeight === 100 ? "text-emerald-600" : "text-amber-600"
            )}
          >
            {totalWeight}%
          </span>
          {totalWeight !== 100 && (
            <span className="text-amber-500 ml-2">（建议合计为100%）</span>
          )}
        </p>
        <button className="btn-primary text-sm">
          <Plus className="w-4 h-4" />
          添加维度
        </button>
      </div>

      <div className="card divide-y divide-gray-100">
        {dimensions.map((dim) => (
          <div key={dim.id} className="p-4 flex items-center gap-4">
            <button
              onClick={() => toggleDimension(dim.id)}
              className={cn(
                "w-10 h-6 rounded-full transition-colors relative",
                dim.enabled ? "bg-primary-600" : "bg-gray-200"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                  dim.enabled ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{dim.name}</h3>
                <span className="badge bg-primary-50 text-primary-700 border-0">
                  权重 {dim.weight}%
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">{dim.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
              <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const tabContent: Record<TabKey, React.ReactNode> = {
  users: <UserManagement />,
  roles: <RolePermissions />,
  templates: <EmailTemplates />,
  dimensions: <EvaluationDimensions />,
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabKey>("users");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="text-gray-500 text-sm mt-1">
          管理用户、角色、模板和评价维度
        </p>
      </div>

      <div className="card p-1 inline-flex bg-gray-100 rounded-xl flex-wrap">
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
        <div className="space-y-4">
          <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          <div className="card p-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 rounded mb-3 animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : (
        tabContent[activeTab]
      )}
    </div>
  );
}
