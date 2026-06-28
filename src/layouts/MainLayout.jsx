import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth.js";
import Button from "../components/Button";

const MainLayout = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100">
      <header className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold">
            DevVoice
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Trang chủ
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/posts" className="nav-link">
                  Bài viết
                </Link>
              </li>
              {isAdmin && (
                <li className="nav-item">
                  <Link to="/admin" className="nav-link">
                    Admin
                  </Link>
                </li>
              )}
            </ul>
            <div className="d-flex align-items-center gap-2">
              {isAuthenticated ? (
                <>
                  <span className="text-light small d-none d-md-inline">
                    Xin chào, {user?.fullName}
                  </span>
                  <Link to="/profile">
                    <Button variant="outline-light" size="sm">
                      Hồ sơ
                    </Button>
                  </Link>
                  <Button variant="light" size="sm" onClick={logout}>
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline-light" size="sm">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="light" size="sm">
                      Đăng ký
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container flex-grow-1 py-4">
        <Outlet />
      </main>

      <footer className="bg-light border-top py-3 mt-auto">
        <div className="container text-center text-muted small">
          © {new Date().getFullYear()} DevVoice — MERN Stack Project
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
