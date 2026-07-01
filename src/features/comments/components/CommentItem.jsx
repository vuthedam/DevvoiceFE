import { useState } from "react";
import AuthorAvatar from "../../../components/AuthorAvatar";
import Button from "../../../components/Button";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import CommentForm from "./CommentForm.jsx";
import * as commentApi from "../api/commentApi.js";

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const CommentItem = ({ comment, canDelete, onDelete, level = 0, postId }) => {
  const { showToast } = useToast();
  const { isAuthenticated, isAdmin } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const author = comment.userId;
  const children = Array.isArray(comment.children) ? comment.children : [];
  const parentAuthor =
    typeof comment.parentId === "object" && comment.parentId !== null
      ? comment.parentId.userId?.fullName ||
        comment.parentId.userId?.username ||
        "người dùng"
      : null;
  const isReply = Boolean(parentAuthor) || level > 0;
  const hasManyReplies = children.length >= 3;
  const visibleChildren =
    hasManyReplies && !expanded ? children.slice(0, 2) : children;
  const canManageComment =
    typeof canDelete === "function" ? canDelete(comment) : Boolean(canDelete);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = isAdmin
        ? await commentApi.deleteComment(comment._id)
        : await commentApi.softDeleteComment(comment._id);
      showToast(res?.message ?? "Đã xóa bình luận", "success");
      onDelete();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleReplySuccess = async () => {
    setShowReplyForm(false);
    await onDelete();
  };

  return (
    <>
      <div
        className="position-relative"
        style={{
          marginLeft: level > 0 ? "clamp(12px, 3vw, 32px)" : 0,
          paddingLeft: level > 0 ? "10px" : 0,
        }}
      >
        {level > 0 && (
          <div
            className="position-absolute"
            style={{
              left: 0,
              top: 6,
              bottom: 6,
              width: "2px",
              background: "#dfe5ec",
              borderRadius: "999px",
            }}
          />
        )}

        <div
          className="d-flex gap-2 gap-md-3 py-3 border-bottom"
          style={{
            borderLeft: level > 0 ? "2px solid #e9edf3" : "none",
            paddingLeft: level > 0 ? "12px" : "0px",
            borderBottomColor: level > 0 ? "#f1f4f8" : undefined,
          }}
        >
          <AuthorAvatar user={author} size={level > 0 ? 30 : 36} />

          <div className="flex-grow-1 min-w-0">
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

              {canManageComment && (
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

            {isReply && (
              <div
                className="mb-2 text-primary d-inline-flex align-items-center gap-1"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                <span style={{ fontSize: 13 }}>↳</span>
                <span>Phản hồi cho {parentAuthor}</span>
              </div>
            )}

            <p
              className="mb-2 text-dark"
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {comment.content}
            </p>

            {isAuthenticated && (
              <div className="d-flex flex-wrap gap-2 mb-2">
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0 text-primary"
                  style={{ fontSize: 13, textDecoration: "none" }}
                  onClick={() => setShowReplyForm((prev) => !prev)}
                >
                  {showReplyForm ? "Đóng" : "Reply"}
                </button>
              </div>
            )}

            {showReplyForm && (
              <CommentForm
                postId={postId}
                parentId={comment._id}
                onSuccess={handleReplySuccess}
                onCancel={() => setShowReplyForm(false)}
                compact
                placeholder={`Phản hồi ${author?.fullName ?? "người dùng"}...`}
                submitLabel="Submit"
              />
            )}

            {children.length > 0 && (
              <div className="mt-2">
                {hasManyReplies && (
                  <button
                    type="button"
                    className="btn btn-sm mb-2"
                    style={{
                      fontSize: 12,
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: "#eef4ff",
                      color: "#2563eb",
                      border: "1px solid #d7e7ff",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => setExpanded((prev) => !prev)}
                  >
                    {expanded
                      ? "Thu gọn phản hồi"
                      : `Xem thêm ${children.length} phản hồi`}
                  </button>
                )}

                <div
                  style={{
                    overflow: "hidden",
                    transition: "max-height 0.25s ease, opacity 0.2s ease",
                    maxHeight: hasManyReplies && !expanded ? "220px" : "1200px",
                    opacity: hasManyReplies && !expanded ? 0.95 : 1,
                  }}
                >
                  {visibleChildren.map((child) => (
                    <CommentItem
                      key={child._id}
                      comment={child}
                      canDelete={canDelete}
                      onDelete={onDelete}
                      level={level + 1}
                      postId={postId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
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
