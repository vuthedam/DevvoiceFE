import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../../../components/Loading";
import EmptyState from "../../../components/EmptyState";
import Pagination from "../../../components/Pagination";
import Button from "../../../components/Button";
import PostCard from "../components/PostCard.jsx";
import { usePosts } from "../hooks/usePosts.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { getTotalPages, paginateItems } from "../../../utils/pagination.js";

const PAGE_SIZE = 9;

const HeroBanner = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  return (
    <section
      className="rounded-3 p-4 p-md-5 mb-5 text-white position-relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a1f2e 0%, #2d3a5e 60%, #1e3a8a 100%)",
      }}
    >
      {/* decorative circles */}
      <div
        className="position-absolute rounded-circle opacity-25"
        style={{ width: 300, height: 300, background: "#3b82f6", top: -80, right: -60 }}
      />
      <div
        className="position-absolute rounded-circle opacity-10"
        style={{ width: 180, height: 180, background: "#60a5fa", bottom: -60, left: 40 }}
      />

      <div className="position-relative" style={{ zIndex: 1 }}>
        <span className="badge bg-primary bg-opacity-75 mb-3" style={{ fontSize: 12 }}>
          ⚡ Developer Community
        </span>
        <h1 className="display-6 fw-bold mb-3">
          Chia sẻ kiến thức,<br className="d-none d-md-block" /> cùng nhau phát triển
        </h1>
        <p className="mb-4 text-white-75" style={{ maxWidth: 480, opacity: 0.85 }}>
          Nền tảng dành riêng cho developer — đăng bài, bình luận và kết nối
          với cộng đồng lập trình viên Việt Nam.
        </p>
        <div className="d-flex gap-2 flex-wrap">
          {isAuthenticated ? (
            <Button variant="light" onClick={() => navigate("/create-post")}>
              ✏️ Tạo bài viết
            </Button>
          ) : (
            <>
              <Link to="/register">
                <Button variant="light">Tham gia ngay</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline-light">Đăng nhập</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { posts, loading, error } = usePosts();
  const [page, setPage] = useState(1);

  // usePosts gọi GET /posts — backend chỉ trả về approved
  const totalPages = useMemo(
    () => getTotalPages(posts.length, PAGE_SIZE),
    [posts.length]
  );
  const paginated = useMemo(
    () => paginateItems(posts, page, PAGE_SIZE),
    [posts, page]
  );

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <HeroBanner isAuthenticated={isAuthenticated} />

      {/* Section header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold mb-0 h4">Bài viết mới nhất</h2>
          {!loading && !error && (
            <p className="text-muted small mb-0 mt-1">
              {posts.length} bài viết đã được duyệt
            </p>
          )}
        </div>
        <Link to="/posts" className="text-decoration-none small fw-semibold">
          Xem tất cả →
        </Link>
      </div>

      {/* Loading */}
      {loading && <Loading text="Đang tải bài viết..." />}

      {/* Error */}
      {!loading && error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {/* Empty */}
      {!loading && !error && posts.length === 0 && (
        <EmptyState
          title="Chưa có bài viết nào"
          description="Hãy là người đầu tiên chia sẻ kiến thức với cộng đồng!"
          action={
            isAuthenticated ? (
              <Link to="/create-post">
                <Button className="mt-2">✏️ Tạo bài viết đầu tiên</Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button className="mt-2">Tham gia ngay</Button>
              </Link>
            )
          }
        />
      )}

      {/* Post grid */}
      {!loading && !error && paginated.length > 0 && (
        <>
          <div className="row g-4">
            {paginated.map((post) => (
              <div key={post._id} className="col-12 col-md-6 col-lg-4">
                <PostCard post={post} />
              </div>
            ))}
          </div>

          <div className="mt-5">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </>
  );
};

export default HomePage;
