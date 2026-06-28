import { useState } from "react";
import Button from "../../../components/Button";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useComments } from "../hooks/useComments.js";
import * as commentApi from "../api/commentApi.js";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";

const CommentForm = ({ postId, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <p className="text-muted">
        Vui lòng đăng nhập để bình luận.
      </p>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const response = await commentApi.createComment({
        postId,
        userId: user._id,
        content: content.trim(),
      });
      showToast(response.message || "Bình luận thành công", "success");
      setContent("");
      onSuccess();
    } catch (error) {
      showToast(getApiErrorMessage(error), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-2">
        <textarea
          className="form-control"
          rows={3}
          placeholder="Viết bình luận..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <Button type="submit" size="sm" disabled={submitting}>
        {submitting ? "Đang gửi..." : "Gửi bình luận"}
      </Button>
    </form>
  );
};

const CommentItem = ({ comment, onDelete, canDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await commentApi.deleteComment(comment._id);
      showToast(response.message || "Xóa bình luận thành công", "success");
      onDelete();
    } catch (error) {
      showToast(getApiErrorMessage(error), "danger");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div className="border rounded p-3 mb-2">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <strong>{comment.userId?.fullName || "Ẩn danh"}</strong>
            <small className="text-muted ms-2">
              @{comment.userId?.username}
            </small>
          </div>
          {canDelete && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => setShowConfirm(true)}
            >
              Xóa
            </Button>
          )}
        </div>
        <p className="mb-0 mt-2">{comment.content}</p>
      </div>
      <ConfirmDelete
        show={showConfirm}
        message="Bạn có chắc muốn xóa bình luận này?"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
};

const CommentList = ({ postId }) => {
  const { comments, loading, error, refetch } = useComments(postId);
  const { user, isAdmin } = useAuth();

  if (loading) return <p className="text-muted">Đang tải bình luận...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h4 className="mb-3">Bình luận ({comments.length})</h4>
      <CommentForm postId={postId} onSuccess={refetch} />
      {comments.length === 0 ? (
        <p className="text-muted">Chưa có bình luận nào.</p>
      ) : (
        comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            onDelete={refetch}
            canDelete={
              isAdmin || comment.userId?._id === user?._id || comment.userId === user?._id
            }
          />
        ))
      )}
    </div>
  );
};

export default CommentList;
