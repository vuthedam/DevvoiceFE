import { useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth.js";

const Avatar = ({ user, size = 34 }) => {
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt="avatar"
        className="rounded-circle border border-2 border-white object-fit-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {user?.fullName?.[0]?.toUpperCase() ?? "U"}
    </div>
  );
};

const UserDropdown = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // đóng khi click bên ngoài
  const handleBlur = (e) => {
    if (!ref.current?.contains(e.relatedTarget)) setOpen(false);
  };

  return (
    <div className="position-relative" ref={ref} onBlur={handleBlur}>
      <button
        className="btn p-0 border-0 d-flex align-items-center gap-2"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Avatar user={user} />
        <span className="text-white small d-none d-lg-inline">{user?.fullName}</span>
        <span className="text-white-50" style={{ fontSize: 10 }}>▼</span>
      </button>

      {open && (
        <ul
          className="dropdown-menu dropdown-menu-end show shadow"
          style={{ minWidth: 180, top: "calc(100% + 8px)", right: 0 }}
        >
          <li className="px-3 py-1 border-bottom">
            <div className="fw-semibold small">{user?.fullName}</div>
            <div className="text-muted" style={{ fontSize: 12 }}>@{user?.username}</div>
          </li>
          <li>
            <Link className="dropdown-item" to="/profile" onClick={() => setOpen(false)}>
              👤 Hồ sơ
            </Link>
          </li>
          <li>
            <Link className="dropdown-item" to="/my-posts" onClick={() => setOpen(false)}>
              📋 Bài viết của tôi
            </Link>
          </li>
          <li><hr className="dropdown-divider my-1" /></li>
          <li>
            <button
              className="dropdown-item text-danger"
              onClick={() => { setOpen(false); onLogout(); }}
            >
              🚪 Đăng xuất
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/posts?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setMobileOpen(false);
    }
  };

  const navLinkClass = ({ isActive }) =>
    `nav-link px-2 ${isActive ? "text-white fw-semibold" : "text-white-50"}`;

  return (
    <header className="sticky-top" style={{ background: "#1a1f2e", zIndex: 1030 }}>
      <div className="container">
        <nav className="d-flex align-items-center py-2 gap-3">

          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <Link to="/" className="text-decoration-none flex-shrink-0">
            <span className="fw-bold text-white fs-5">⚡ DevVoice</span>
          </Link>

          {/* ── Search — desktop ──────────────────────────────────────────── */}
          <form
            onSubmit={handleSearch}
            className="d-none d-md-flex align-items-center flex-grow-1 mx-2"
            style={{ maxWidth: 380 }}
          >
            <div className="input-group input-group-sm">
              <input
                type="search"
                className="form-control border-0 rounded-start"
                placeholder="Tìm bài viết..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: "#2d3548", color: "#fff" }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm rounded-end"
              >
                🔍
              </button>
            </div>
          </form>

          {/* ── Desktop Nav Links ─────────────────────────────────────────── */}
          <ul className="nav d-none d-md-flex align-items-center gap-1 me-auto">
            <li><NavLink to="/" end className={navLinkClass}>Trang chủ</NavLink></li>
            <li><NavLink to="/posts" className={navLinkClass}>Bài viết</NavLink></li>
            {isAuthenticated && (
              <>
                <li>
                  <NavLink to="/my-posts" className={navLinkClass}>Của tôi</NavLink>
                </li>
                <li>
                  <NavLink to="/create-post" className="btn btn-primary btn-sm ms-1">
                    + Tạo bài
                  </NavLink>
                </li>
              </>
            )}
            {isAdmin && (
              <li>
                <NavLink to="/admin" className="btn btn-outline-danger btn-sm ms-1">
                  Admin
                </NavLink>
              </li>
            )}
          </ul>

          {/* ── Auth ─────────────────────────────────────────────────────── */}
          <div className="d-none d-md-flex align-items-center gap-2 ms-auto flex-shrink-0">
            {isAuthenticated ? (
              <UserDropdown user={user} onLogout={logout} />
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile toggle ─────────────────────────────────────────────── */}
          <button
            className="btn btn-sm btn-outline-light d-md-none ms-auto"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </nav>

        {/* ── Mobile Menu ───────────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="pb-3 d-md-none border-top border-secondary mt-1 pt-2">
            {/* Search */}
            <form onSubmit={handleSearch} className="mb-3">
              <div className="input-group input-group-sm">
                <input
                  type="search"
                  className="form-control border-0"
                  placeholder="Tìm bài viết..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ background: "#2d3548", color: "#fff" }}
                />
                <button type="submit" className="btn btn-primary btn-sm">🔍</button>
              </div>
            </form>

            {/* Links */}
            <ul className="nav flex-column gap-1">
              {[
                { to: "/", label: "🏠 Trang chủ", end: true },
                { to: "/posts", label: "📰 Bài viết" },
                ...(isAuthenticated
                  ? [
                      { to: "/my-posts", label: "📋 Bài viết của tôi" },
                      { to: "/create-post", label: "✏️ Tạo bài viết" },
                      { to: "/profile", label: "👤 Hồ sơ" },
                    ]
                  : []),
                ...(isAdmin ? [{ to: "/admin", label: "⚙️ Admin" }] : []),
              ].map(({ to, label, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `nav-link py-1 ${isActive ? "text-white fw-semibold" : "text-white-50"}`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Auth buttons */}
            <div className="mt-3 d-flex gap-2">
              {isAuthenticated ? (
                <button className="btn btn-outline-danger btn-sm w-100" onClick={logout}>
                  🚪 Đăng xuất
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn btn-outline-light btn-sm flex-grow-1"
                    onClick={() => setMobileOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary btn-sm flex-grow-1"
                    onClick={() => setMobileOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
