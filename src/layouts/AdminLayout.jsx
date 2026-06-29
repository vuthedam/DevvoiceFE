import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../features/auth/hooks/useAuth.js";
import Button from "../components/Button";

const NAV_ITEMS = [
  { to: "/admin",           label: "Dashboard",       icon: "📊", end: true },
  { to: "/admin/users",     label: "Người dùng",      icon: "👥" },
  { to: "/admin/posts",     label: "Bài viết",        icon: "📝" },
  { to: "/admin/pending",   label: "Chờ duyệt",       icon: "⏳" },
  { to: "/admin/comments",  label: "Bình luận",       icon: "💬" },
  { to: "/admin/reports",   label: "Reports",         icon: "🚩" },
  { to: "/admin/profile",   label: "Hồ sơ",           icon: "👤" },
];

const SidebarContent = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="d-flex flex-column h-100">
      {/* Brand */}
      <div className="px-3 py-3 border-bottom d-flex align-items-center justify-content-between">
        <span className="fw-bold fs-5 text-white">⚡ DevVoice Admin</span>
        {onClose && (
          <button className="btn btn-sm btn-close btn-close-white" onClick={onClose} />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-grow-1 py-2 overflow-auto">
        <ul className="nav flex-column px-2 gap-1">
          {NAV_ITEMS.map(({ to, label, icon, end }) => (
            <li key={to} className="nav-item">
              <NavLink
                to={to}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-link rounded px-3 py-2 d-flex align-items-center gap-2 ${
                    isActive
                      ? "bg-primary text-white fw-semibold"
                      : "text-white-50 admin-nav-hover"
                  }`
                }
              >
                <span>{icon}</span>
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info */}
      <div className="border-top px-3 py-3">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div
            className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
            style={{ width: 36, height: 36, fontSize: 14 }}
          >
            {user?.fullName?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="overflow-hidden">
            <div className="text-white small fw-semibold text-truncate">{user?.fullName}</div>
            <div className="text-white-50" style={{ fontSize: 11 }}>@{user?.username}</div>
          </div>
        </div>
        <Button variant="outline-light" size="sm" className="w-100" onClick={handleLogout}>
          Đăng xuất
        </Button>
      </div>
    </div>
  );
};

const SIDEBAR_WIDTH = 240;

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex min-vh-100" style={{ background: "#f4f6fb" }}>
      {/* ── Desktop Sidebar ──────────────────────────────────────────────── */}
      <aside
        className="d-none d-lg-flex flex-column flex-shrink-0"
        style={{
          width: SIDEBAR_WIDTH,
          background: "#1e2a3a",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Offcanvas ─────────────────────────────────────────────── */}
      {sidebarOpen && (
        <>
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ background: "rgba(0,0,0,.5)", zIndex: 1040 }}
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="position-fixed top-0 start-0 h-100 d-flex flex-column d-lg-none"
            style={{ width: SIDEBAR_WIDTH, background: "#1e2a3a", zIndex: 1050 }}
          >
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <div className="flex-grow-1 d-flex flex-column min-w-0">
        {/* Topbar */}
        <header className="bg-white border-bottom px-3 px-lg-4 py-2 d-flex align-items-center gap-3 sticky-top shadow-sm">
          <button
            className="btn btn-sm btn-outline-secondary d-lg-none"
            onClick={() => setSidebarOpen(true)}
            aria-label="Menu"
          >
            ☰
          </button>
          <span className="fw-semibold text-dark">Quản trị hệ thống</span>
          <span className="ms-auto badge bg-danger">Admin</span>
        </header>

        {/* Page content */}
        <main className="flex-grow-1 p-3 p-lg-4 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
