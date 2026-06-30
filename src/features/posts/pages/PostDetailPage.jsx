import { Link, useParams } from "react-router-dom";
import Loading from "../../../components/Loading";
import CommentList from "../../comments/components/CommentList.jsx";
import AuthorInfo from "../components/detail/AuthorInfo.jsx";
import PostActions from "../components/detail/PostActions.jsx";
import { usePost } from "../hooks/usePosts.js";

// ── Breadcrumb ────────────────────────────────────────────────────────────────
const Breadcrumb = ({ title }) => (
  <nav aria-label="breadcrumb" className="mb-4">
    <ol className="breadcrumb mb-0">
      <li className="breadcrumb-item">
        <Link to="/" className="text-decoration-none">Trang chủ</Link>
      </li>
      <li className="breadcrumb-item">
        <Link to="/posts" className="text-decoration-none">Bài viết</Link>
      </li>
      <li
        className="breadcrumb-item active text-truncate"
        style={{ maxWidth: 260 }}
        title={title}
      >
        {title}
      </li>
    </ol>
  </nav>
);

// ── PostBody ──────────────────────────────────────────────────────────────────
const PostBody = ({ post, onLikeSuccess }) => (
  <article className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
    <div className="card-body p-4 p-md-5">

      {/* Author + Date */}
      <div className="mb-4">
        <AuthorInfo user={post.userId} date={post.createdAt} size={46} />
      </div>

      {/* Title */}
      <h1
        className="fw-bold mb-4 lh-sm"
        style={{ fontSize: "clamp(1.4rem, 4vw, 2rem)" }}
      >
        {post.title}
      </h1>

      {/* Divider */}
      <hr className="mb-4" />

      {/* Content */}
      <div
        className="text-dark mb-5"
        style={{
          fontSize: 16,
          lineHeight: 1.8,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {post.content}
      </div>

      {/* Actions */}
      <div className="pt-3 border-top">
        <PostActions post={post} onLikeSuccess={onLikeSuccess} />
      </div>
    </div>
  </article>
);

// ── PostDetailPage ────────────────────────────────────────────────────────────
const PostDetailPage = () => {
  const { id } = useParams();
  const { post, loading, error, refetch } = usePost(id);

  if (loading) return <Loading text="Đang tải bài viết..." />;

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2">
        ⚠️ {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="alert alert-warning">
        Không tìm thấy bài viết này.
      </div>
    );
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8 col-xl-7">
        <Breadcrumb title={post.title} />
        <PostBody post={post} onLikeSuccess={refetch} />
        <CommentList postId={id} />
      </div>
    </div>
  );
};

export default PostDetailPage;
