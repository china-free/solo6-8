import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Calendar,
  BarChart3,
  Settings,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    to: "/dashboard",
    label: "仪表盘",
    icon: LayoutDashboard,
  },
  {
    to: "/jobs",
    label: "职位管理",
    icon: Briefcase,
  },
  {
    to: "/resumes",
    label: "简历库",
    icon: FileText,
  },
  {
    to: "/interviews",
    label: "面试安排",
    icon: Calendar,
  },
  {
    to: "/analytics",
    label: "数据分析",
    icon: BarChart3,
  },
  {
    to: "/settings",
    label: "系统设置",
    icon: Settings,
  },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-30">
      <div className="h-16 flex items-center px-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">招聘系统</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                isActive ? "sidebar-link-active" : "sidebar-link"
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="text-xs text-gray-400 px-3 py-2">
          v1.0.0
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
