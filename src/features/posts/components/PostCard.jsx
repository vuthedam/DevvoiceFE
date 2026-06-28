import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  const author = post.userId?.fullName || "Ẩn danh";

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">
          <Link to={`/posts/${post._id}`} className="text-decoration-none">
            {post.title}
          </Link>
        </h5>
        <p className="card-text text-muted flex-grow-1">
          {post.content?.length > 150
            ? `${post.content.slice(0, 150)}...`
            : post.content}
        </p>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <small className="text-secondary">Bởi {author}</small>
          <div>
            <span className="badge bg-light text-dark me-1">
              ❤️ {post.likesCount}
            </span>
            <span className="badge bg-light text-dark">
              💬 {post.commentsCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
