import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAuthStore } from "@/store/auth";
import AppLayout from "@/components/Layout/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import JobList from "@/pages/JobList";
import JobDetail from "@/pages/JobDetail";
import ResumeList from "@/pages/ResumeList";
import CandidateDetail from "@/pages/CandidateDetail";
import InterviewList from "@/pages/InterviewList";
import InterviewEvaluate from "@/pages/InterviewEvaluate";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";

function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function PublicRoute() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/resumes" element={<ResumeList />} />
            <Route path="/candidates/:id" element={<CandidateDetail />} />
            <Route path="/interviews" element={<InterviewList />} />
            <Route path="/interviews/evaluate/:id" element={<InterviewEvaluate />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
