import { useState } from "react";
import Button from "../../../components/Button";
import ConfirmDelete from "../../../components/ConfirmDelete";
import Loading from "../../../components/Loading";
import EmptyState from "../../../components/EmptyState";
import AuthorAvatar from "../../../components/AuthorAvatar";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useComments } from "../hooks/useComments.js";
import * as commentApi from "../api/commentApi.js";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";

// ── CommentForm ───────────────────────────────────────────────────────────────
const CommentForm = ({ postId, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [content, setContent]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="rounded-3 p-3 text-center" style={{ background: "#f8f9fa" }}>
        <p className="text-muted mb-2 small">Đăng nhập để tham gia bình luận</p>
        <a href="/login" className="btn btn-sm btn-primary">Đăng nhập</a>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await commentApi.createComment({
        postId,
        userId: user._id,
        content: content.trim(),
      });
      showToast(res.message ?? "Bình luận thành công", "success");
      setContent("");
      onSuccess();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="d-flex gap-3">
        <AuthorAvatar user={user} size={36} />
        <div className="flex-grow-1">
          <textarea
            className="form-control mb-2"
            rows={3}
            placeholder="Viết bình luận của bạn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            required
            style={{ resize: "none" }}
          />
          <div className="d-flex align-items-center justify-content-between">
            <span className="text-muted" style={{ fontSize: 12 }}>
              {content.length}/2000
            </span>
            <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
              {submitting ? "Đang gửi..." : "Gửi bình luận"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

// ── CommentItem ───────────────────────────────────────────────────────────────
const CommentItem = ({ comment, canDelete, onDelete }) => {
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting]       = useState(false);

  const author = comment.userId;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await commentApi.deleteComment(comment._id);
      showToast(res.message ?? "Đã xóa bình luận", "success");
      onDelete();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div className="d-flex gap-3 py-3 border-bottom">
        <AuthorAvatar user={author} size={36} />

        <div className="flex-grow-1 min-w-0">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap mb-1">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-semibold" style={{ fontSize: 14 }}>
                {author?.fullName ?? "Ẩn danh"}
              </span>
              <span className="text-muted" style={{ fontSize: 12 }}>
                @{author?.username ?? "unknown"}
              </span>
              <span className="text-muted" style={{ fontSize: 12 }}>
                ·{" "}
                {new Date(comment.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </span>
            </div>

            {canDelete && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setShowConfirm(true)}
                style={{ fontSize: 11, padding: "2px 8px" }}
              >
                Xóa
              </Button>
            )}
          </div>

          {/* Content */}
          <p className="mb-0 text-dark" style={{ fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
            {comment.content}
          </p>
        </div>
      </div>

      <ConfirmDelete
        show={showConfirm}
        title="Xóa bình luận"
        message="Bạn có chắc muốn xóa bình luận này?"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

// ── CommentList ───────────────────────────────────────────────────────────────
const CommentList = ({ postId }) => {
  const { user, isAdmin } = useAuth();
  const { comments, loading, error, refetch } = useComments(postId);

  const canDeleteComment = (comment) =>
    isAdmin ||
    comment.userId?._id === user?._id ||
    comment.userId === user?._id;

  return (
    <section>
      <h5 className="fw-bold mb-4">
        Bình luận{" "}
        {!loading && !error && (
          <span className="badge bg-secondary fw-normal ms-1" style={{ fontSize: 13 }}>
            {comments.length}
          </span>
        )}
      </h5>

      <CommentForm postId={postId} onSuccess={refetch} />

      {loading && <Loading text="Đang tải bình luận..." />}
      {!loading && error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && comments.length === 0 && (
        <EmptyState
          title="Chưa có bình luận nào"
          description="Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!"
        />
      )}

      {!loading && !error && comments.length > 0 && (
        <div>
          {comments.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              canDelete={canDeleteComment(c)}
              onDelete={refetch}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentList;
