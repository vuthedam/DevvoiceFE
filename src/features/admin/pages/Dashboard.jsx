import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";
import Loading from "../../../components/Loading";
import PageHeader from "../components/PageHeader";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import * as adminApi from "../api/adminApi.js";

const Dashboard = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [postStats, setPostStats] = useState(null);
  const [reportStats, setReportStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ps, rs] = await Promise.all([
          adminApi.getAdminPostStats(),
          adminApi.getReportStats(),
        ]);
        setPostStats(ps.data);
        setReportStats(rs.data?.counts);
      } catch (err) {
        showToast(getApiErrorMessage(err), "danger");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loading text="Đang tải thống kê..." />;

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Tổng quan hệ thống DevVoice" />

      <h6 className="text-muted fw-semibold mb-3 text-uppercase" style={{ fontSize: 12 }}>
        Bài viết
      </h6>
      <div className="row g-3 mb-4">
        {[
          { label: "Tổng bài viết",   value: postStats?.total,    icon: "📝", color: "primary", path: "/admin/posts" },
          { label: "Chờ duyệt",       value: postStats?.pending,  icon: "⏳", color: "warning", path: "/admin/pending" },
          { label: "Đã duyệt",        value: postStats?.approved, icon: "✅", color: "success", path: "/admin/posts?status=approved" },
          { label: "Từ chối",         value: postStats?.rejected, icon: "❌", color: "danger",  path: "/admin/posts?status=rejected" },
          { label: "Đang ẩn",         value: postStats?.hidden,   icon: "🙈", color: "secondary",path: "/admin/posts?status=hidden" },
          { label: "Đã xóa",          value: postStats?.deleted,  icon: "🗑️", color: "dark",    path: "/admin/posts?status=deleted" },
        ].map(({ label, value, icon, color, path }) => (
          <div key={label} className="col-6 col-md-4 col-xl-2">
            <StatCard
              label={label}
              value={value}
              icon={icon}
              color={color}
              onClick={() => navigate(path)}
            />
          </div>
        ))}
      </div>

      <h6 className="text-muted fw-semibold mb-3 text-uppercase" style={{ fontSize: 12 }}>
        Reports
      </h6>
      <div className="row g-3">
        {[
          { label: "Tổng reports",  value: reportStats?.total,    icon: "🚩", color: "primary", path: "/admin/reports" },
          { label: "Chờ xử lý",    value: reportStats?.pending,  icon: "⏳", color: "warning", path: "/admin/reports?status=pending" },
          { label: "Đã xử lý",     value: reportStats?.resolved, icon: "✅", color: "success", path: "/admin/reports?status=resolved" },
          { label: "Đã từ chối",   value: reportStats?.rejected, icon: "❌", color: "danger",  path: "/admin/reports?status=rejected" },
        ].map(({ label, value, icon, color, path }) => (
          <div key={label} className="col-6 col-md-3">
            <StatCard
              label={label}
              value={value}
              icon={icon}
              color={color}
              onClick={() => navigate(path)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default Dashboard;
