import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  MapPin,
  Users,
  Calendar,
  Filter,
  Briefcase,
} from "lucide-react";
import { JobStatusBadge } from "@/components/StatusBadge";
import type { Job, JobStatus } from "@shared/types";

const mockJobs: Job[] = [
  {
    id: "1",
    title: "高级前端工程师",
    department: "技术部",
    description: "负责公司核心产品的前端架构设计与开发",
    requirements: "5年以上前端开发经验，精通React",
    salaryRange: "25K-40K",
    location: "北京",
    status: "PUBLISHED",
    hiringManagerId: "1",
    candidateCount: 32,
    createdAt: "2026-06-10",
  },
  {
    id: "2",
    title: "产品经理",
    department: "产品部",
    description: "负责产品规划、需求分析和产品迭代",
    requirements: "3年以上B端产品经验",
    salaryRange: "20K-35K",
    location: "上海",
    status: "PUBLISHED",
    hiringManagerId: "2",
    candidateCount: 28,
    createdAt: "2026-06-08",
  },
  {
    id: "3",
    title: "资深后端开发",
    department: "技术部",
    description: "负责后端服务设计与高并发系统开发",
    requirements: "5年以上Java开发经验",
    salaryRange: "30K-50K",
    location: "北京",
    status: "PUBLISHED",
    hiringManagerId: "1",
    candidateCount: 18,
    createdAt: "2026-06-12",
  },
  {
    id: "4",
    title: "UI设计师",
    department: "设计部",
    description: "负责产品界面设计和视觉规范制定",
    requirements: "3年以上UI设计经验",
    salaryRange: "15K-25K",
    location: "深圳",
    status: "DRAFT",
    hiringManagerId: "3",
    candidateCount: 0,
    createdAt: "2026-06-15",
  },
  {
    id: "5",
    title: "数据分析师",
    department: "数据部",
    description: "负责业务数据分析和数据报告",
    requirements: "3年以上数据分析经验，精通SQL",
    salaryRange: "18K-30K",
    location: "杭州",
    status: "PUBLISHED",
    hiringManagerId: "4",
    candidateCount: 15,
    createdAt: "2026-06-05",
  },
  {
    id: "6",
    title: "测试工程师",
    department: "技术部",
    description: "负责产品测试和自动化测试框架搭建",
    requirements: "3年以上测试经验",
    salaryRange: "15K-25K",
    location: "北京",
    status: "CLOSED",
    hiringManagerId: "1",
    candidateCount: 42,
    createdAt: "2026-05-20",
  },
];

const departments = ["全部", "技术部", "产品部", "设计部", "数据部"];
const statuses: Array<"全部" | JobStatus> = ["全部", "DRAFT", "PUBLISHED", "CLOSED"];

function JobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="card-hover p-5 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
          <p className="text-sm text-gray-500 mt-1">{job.department}</p>
        </div>
        <JobStatusBadge status={job.status} />
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          {job.location}
        </span>
        {job.salaryRange && (
          <span className="font-medium text-emerald-600">{job.salaryRange}</span>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="flex items-center gap-1 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          {job.candidateCount} 位候选人
        </span>
        <span className="flex items-center gap-1 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          {job.createdAt}
        </span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-5 w-14 bg-gray-200 rounded-full" />
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function JobList() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("全部");
  const [selectedStatus, setSelectedStatus] = useState<"全部" | JobStatus>("全部");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "全部" || job.department === selectedDepartment;
    const matchesStatus =
      selectedStatus === "全部" || job.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">职位管理</h1>
          <p className="text-gray-500 text-sm mt-1">管理所有在招职位</p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          新建职位
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索职位名称或部门..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="select w-36"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "全部" ? "全部部门" : dept}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as "全部" | JobStatus)
                }
                className="select w-36"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status === "全部"
                      ? "全部状态"
                      : status === "DRAFT"
                      ? "草稿"
                      : status === "PUBLISHED"
                      ? "已发布"
                      : "已关闭"}
                  </option>
                ))}
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
      ) : filteredJobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">暂无符合条件的职位</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={() => navigate(`/jobs/${job.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
