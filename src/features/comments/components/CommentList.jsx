import Loading from "../../../components/Loading";
import EmptyState from "../../../components/EmptyState";
import CommentForm from "./CommentForm.jsx";
import CommentItem from "./CommentItem.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useComments } from "../hooks/useComments.js";

const CommentList = ({ postId }) => {
  const { user, isAdmin } = useAuth();
  const { comments, loading, error, refetch } = useComments(postId);

  const canDelete = (comment) =>
    isAdmin ||
    comment.userId?._id === user?._id ||
    comment.userId === user?._id;

  return (
    <section className="mt-2">
      {/* Header */}
      <h5 className="fw-bold mb-4">
        Bình luận
        {!loading && !error && (
          <span
            className="badge bg-secondary fw-normal ms-2"
            style={{ fontSize: 13, verticalAlign: "middle" }}
          >
            {comments.length}
          </span>
        )}
      </h5>

      {/* Form */}
      <CommentForm postId={postId} onSuccess={refetch} />

      {/* States */}
      {loading && <Loading text="Đang tải bình luận..." />}

      {!loading && error && (
        <div className="alert alert-danger">{error}</div>
      )}

      {!loading && !error && comments.length === 0 && (
        <EmptyState
          title="Chưa có bình luận nào"
          description="Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!"
        />
      )}

      {/* List */}
      {!loading && !error && comments.length > 0 && (
        <div>
          {comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              canDelete={canDelete(c)}
              onDelete={refetch}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentList;
