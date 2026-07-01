import { useEffect, useState } from "react";
import AuthorAvatar from "../../../components/AuthorAvatar";
import Button from "../../../components/Button";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import * as likeApi from "../../likes/api/likeApi.js";
import CommentForm from "./CommentForm.jsx";
import * as commentApi from "../api/commentApi.js";

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return "Vừa xong";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} tuần`;
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const CommentItem = ({ comment, canDelete, onDelete, level = 0, postId }) => {
  const { showToast } = useToast();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [reaction, setReaction] = useState(null);
  const [reactionLoading, setReactionLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(comment?.likesCount ?? 0);
  const [dislikesCount, setDislikesCount] = useState(comment?.dislikesCount ?? 0);
  const [localComment, setLocalComment] = useState(comment);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment?.content ?? "");
  const [savingEdit, setSavingEdit] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const author = localComment?.userId;
  const children = Array.isArray(localComment?.children) ? localComment.children : [];
  const parentAuthor =
    typeof localComment?.parentId === "object" && localComment.parentId !== null
      ? localComment.parentId.userId?.fullName ||
        localComment.parentId.userId?.username ||
        "người dùng"
      : null;
  const isReply = Boolean(parentAuthor) || level > 0;
  const canManageComment =
    typeof canDelete === "function" ? canDelete(localComment) : Boolean(canDelete);
  const isEdited =
    Boolean(localComment?.updatedAt) &&
    new Date(localComment.updatedAt).getTime() !== new Date(localComment.createdAt).getTime();

  useEffect(() => {
    setLocalComment(comment);
    setEditContent(comment?.content ?? "");
  }, [comment]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = isAdmin
        ? await commentApi.deleteComment(localComment._id)
        : await commentApi.softDeleteComment(localComment._id);
      showToast(res?.message ?? "Đã xóa bình luận", "success");
      onDelete?.();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const handleReplySuccess = async () => {
    setShowReplyForm(false);
    await onDelete?.();
  };

  const handleEditSave = async () => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      showToast("Nội dung bình luận không được để trống", "warning");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await commentApi.updateComment(localComment._id, { content: trimmed });
      setLocalComment((prev) => ({
        ...prev,
        content: trimmed,
        updatedAt: res?.updatedAt || new Date().toISOString(),
      }));
      setIsEditing(false);
      showToast(res?.message ?? "Đã cập nhật bình luận", "success");
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user?._id || !localComment?._id) {
      setReaction(null);
      return;
    }
    let isMounted = true;
    likeApi
      .getCommentReactions({ commentId: localComment._id, userId: user._id })
      .then((res) => { if (isMounted) setReaction(res.data?.[0] ?? null); })
      .catch(() => { if (isMounted) setReaction(null); });
    return () => { isMounted = false; };
  }, [localComment?._id, isAuthenticated, user?._id]);

  useEffect(() => {
    setLikesCount(localComment?.likesCount ?? 0);
    setDislikesCount(localComment?.dislikesCount ?? 0);
  }, [localComment?.likesCount, localComment?.dislikesCount]);

  const handleReaction = async (type) => {
    if (!isAuthenticated) {
      showToast("Vui lòng đăng nhập để đánh giá bình luận", "warning");
      return;
    }
    if (!user?._id || !localComment?._id) return;
    setReactionLoading(true);
    try {
      if (reaction?.type === type) {
        await likeApi.deleteCommentReaction(reaction._id);
        setReaction(null);
        if (type === "like") setLikesCount((p) => Math.max(0, p - 1));
        else setDislikesCount((p) => Math.max(0, p - 1));
        showToast(type === "like" ? "Đã bỏ thích" : "Đã bỏ không thích", "info");
      } else if (reaction) {
        const res = await likeApi.updateCommentReaction(reaction._id, { type });
        setReaction(res.data);
        if (reaction.type === "like" && type === "dislike") {
          setLikesCount((p) => Math.max(0, p - 1));
          setDislikesCount((p) => p + 1);
        } else {
          setDislikesCount((p) => Math.max(0, p - 1));
          setLikesCount((p) => p + 1);
        }
      } else {
        const res = await likeApi.createCommentReaction({
          commentId: localComment._id,
          userId: user._id,
          type,
        });
        setReaction(res.data);
        if (type === "like") setLikesCount((p) => p + 1);
        else setDislikesCount((p) => p + 1);
        showToast(type === "like" ? "Đã thích bình luận" : "Đã không thích bình luận", "success");
      }
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setReactionLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          marginLeft: level > 0 ? "clamp(20px, 4vw, 44px)" : 0,
          marginBottom: 2,
        }}
      >
        <div className="d-flex gap-2 align-items-start py-2">
          <div className="flex-shrink-0 pt-1">
            <AuthorAvatar user={author} size={level > 0 ? 28 : 34} />
          </div>

          <div className="flex-grow-1 min-w-0">
            {/* Bubble */}
            <div
              style={{
                background: level > 0 ? "#f0f4ff" : "#ffffff",
                border: `1px solid ${level > 0 ? "#c7d7fd" : "#e2e8f0"}`,
                borderRadius: 18,
                borderTopLeftRadius: 4,
                padding: "10px 14px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                position: "relative",
              }}
            >
              {/* Header */}
              <div className="d-flex justify-content-between align-items-start gap-2">
                <div>
                  <span
                    className="fw-semibold"
                    style={{ fontSize: 13, color: "#1e293b" }}
                  >
                    {author?.fullName ?? "Ẩn danh"}
                  </span>
                  {isReply && (
                    <span
                      className="ms-1"
                      style={{ fontSize: 12, color: "#6366f1" }}
                    >
                      ↩ {parentAuthor}
                    </span>
                  )}
                </div>

                {canManageComment && (
                  <div className="position-relative">
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0"
                      style={{
                        fontSize: 16,
                        lineHeight: 1,
                        textDecoration: "none",
                        color: "#94a3b8",
                        letterSpacing: 1,
                      }}
                      onClick={() => setMenuOpen((prev) => !prev)}
                    >
                      ···
                    </button>

                    {menuOpen && (
                      <div
                        className="position-absolute end-0 mt-1 rounded-3 shadow-sm"
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                          minWidth: 130,
                          zIndex: 10,
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-link btn-sm d-block w-100 text-start"
                          style={{
                            textDecoration: "none",
                            padding: "8px 14px",
                            color: "#334155",
                            fontSize: 13,
                          }}
                          onClick={() => {
                            setIsEditing(true);
                            setEditContent(localComment.content);
                            setMenuOpen(false);
                          }}
                        >
                          ✏️ Chỉnh sửa
                        </button>
                        <button
                          type="button"
                          className="btn btn-link btn-sm d-block w-100 text-start text-danger"
                          style={{
                            textDecoration: "none",
                            padding: "8px 14px",
                            fontSize: 13,
                          }}
                          onClick={() => {
                            setMenuOpen(false);
                            setShowConfirm(true);
                          }}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    className="form-control form-control-sm"
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    style={{
                      resize: "none",
                      fontSize: 13,
                      background: "#f8fafc",
                      color: "#1e293b",
                      border: "1px solid #cbd5e1",
                      borderRadius: 10,
                    }}
                  />
                  <div className="d-flex justify-content-end gap-2 mt-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                      disabled={savingEdit}
                    >
                      Hủy
                    </Button>
                    <Button size="sm" onClick={handleEditSave} disabled={savingEdit}>
                      {savingEdit ? "Đang lưu..." : "Lưu"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="mt-1 text-break"
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.65,
                    fontSize: 14,
                    color: "#334155",
                  }}
                >
                  {localComment.content}
                </div>
              )}
            </div>

            {/* Meta + Actions */}
            <div
              className="d-flex flex-wrap align-items-center gap-3 mt-1 ms-2"
              style={{ fontSize: 12 }}
            >
              <span style={{ color: "#94a3b8" }}>
                {formatRelativeTime(localComment.createdAt)}
              </span>

              {isEdited && (
                <span style={{ color: "#94a3b8" }}>• Đã chỉnh sửa</span>
              )}

              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                style={{
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  color: reaction?.type === "like" ? "#6366f1" : "#64748b",
                }}
                onClick={() => handleReaction("like")}
                disabled={reactionLoading}
              >
                👍{likesCount > 0 ? ` ${likesCount}` : ""}
              </button>

              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                style={{
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  color: reaction?.type === "dislike" ? "#ef4444" : "#64748b",
                }}
                onClick={() => handleReaction("dislike")}
                disabled={reactionLoading}
              >
                👎{dislikesCount > 0 ? ` ${dislikesCount}` : ""}
              </button>

              {isAuthenticated && level === 0 && (
                <button
                  type="button"
                  className="btn btn-link btn-sm p-0"
                  style={{
                    textDecoration: "none",
                    fontSize: 12,
                    fontWeight: 600,
                    color: showReplyForm ? "#6366f1" : "#64748b",
                  }}
                  onClick={() => setShowReplyForm((prev) => !prev)}
                >
                  {showReplyForm ? "Đóng" : "↩ Reply"}
                </button>
              )}
            </div>

            {/* Reply form */}
            {showReplyForm && (
              <div className="mt-2">
                <CommentForm
                  postId={postId}
                  parentId={localComment._id}
                  onSuccess={handleReplySuccess}
                  onCancel={() => setShowReplyForm(false)}
                  compact
                  placeholder={`Phản hồi ${author?.fullName ?? "người dùng"}...`}
                  submitLabel="Gửi"
                />
              </div>
            )}

            {/* Children */}
            {children.length > 0 && (
              <div
                className="mt-2"
                style={{
                  borderLeft: "2px solid #e0e7ff",
                  paddingLeft: 8,
                  marginLeft: 4,
                }}
              >
                {children.map((child) => (
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
