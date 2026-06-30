import { Link } from "react-router-dom";

const AuthorAvatar = ({ user }) => {
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.fullName}
        className="rounded-circle object-fit-cover flex-shrink-0"
        style={{ width: 36, height: 36 }}
      />
    );
  }
  return (
    <div
      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
      style={{ width: 36, height: 36, fontSize: 14 }}
    >
      {user?.fullName?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
};

const PostCard = ({ post }) => {
  const author = post.userId;
  const preview = post.content?.length > 160
    ? `${post.content.slice(0, 160)}...`
    : post.content;

  return (
    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 12 }}>
      <div className="card-body d-flex flex-column p-4">

        {/* Author + Date */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <AuthorAvatar user={author} />
          <div className="min-w-0">
            <div className="fw-semibold text-dark lh-1 text-truncate" style={{ fontSize: 14 }}>
              {author?.fullName ?? "Ẩn danh"}
            </div>
            <div className="text-muted" style={{ fontSize: 12 }}>
              @{author?.username ?? "unknown"} ·{" "}
              {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Title */}
        <h5 className="fw-bold mb-2 lh-sm" style={{ fontSize: "1rem" }}>
          <Link
            to={`/posts/${post._id}`}
            className="text-decoration-none text-dark stretched-link-title"
          >
            {post.title}
          </Link>
        </h5>

        {/* Preview */}
        <p className="text-muted flex-grow-1 mb-3" style={{ fontSize: 14, lineHeight: 1.6 }}>
          {preview}
        </p>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
          <div className="d-flex align-items-center gap-3 text-muted" style={{ fontSize: 13 }}>
            <span>❤️ {post.likesCount ?? 0}</span>
            <span>💬 {post.commentsCount ?? 0}</span>
          </div>
          <Link
            to={`/posts/${post._id}`}
            className="btn btn-sm btn-outline-primary"
            style={{ fontSize: 12 }}
          >
            Xem chi tiết →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
