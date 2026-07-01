import { useState } from "react";
import AuthorAvatar from "../../../components/AuthorAvatar";
import Button from "../../../components/Button";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import * as commentApi from "../api/commentApi.js";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const CommentItem = ({ comment, canDelete, onDelete }) => {
  const { showToast } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting]       = useState(false);

  const author = comment.userId;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await commentApi.deleteComment(comment._id);
      showToast(res?.message ?? "Đã xóa bình luận", "success");
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
          <div className="d-flex align-items-start justify-content-between gap-2 mb-1 flex-wrap">
            <div>
              <span className="fw-semibold me-2" style={{ fontSize: 14 }}>
                {author?.fullName ?? "Ẩn danh"}
              </span>
              <span className="text-muted" style={{ fontSize: 12 }}>
                @{author?.username ?? "unknown"}
              </span>
              <span className="text-muted ms-2" style={{ fontSize: 12 }}>
                · {formatDate(comment.createdAt)}
              </span>
            </div>

            {canDelete && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => setShowConfirm(true)}
                style={{ fontSize: 11, padding: "1px 8px", lineHeight: 1.8 }}
              >
                Xóa
              </Button>
            )}
          </div>

          {/* Content */}
          <p
            className="mb-0 text-dark"
            style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
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

export default CommentItem;
