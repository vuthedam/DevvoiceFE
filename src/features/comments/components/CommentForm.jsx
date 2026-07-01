import { useState } from "react";
import { Link } from "react-router-dom";
import AuthorAvatar from "../../../components/AuthorAvatar";
import Button from "../../../components/Button";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import * as commentApi from "../api/commentApi.js";

const MIN_LENGTH = 2;
const MAX_LENGTH = 2000;

const CommentForm = ({
  postId,
  onSuccess,
  parentId = null,
  placeholder = "Viết bình luận của bạn...",
  submitLabel = "Gửi bình luận",
  compact = false,
  onCancel,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div
        className="rounded-4 p-4 text-center mb-4"
        style={{
          background: "#f8fafc",
          border: "1.5px dashed #cbd5e1",
          color: "#334155",
        }}
      >
        <p className="mb-3 small" style={{ color: "#64748b" }}>
          Đăng nhập để tham gia bình luận cùng cộng đồng
        </p>
        <Link to="/login" className="btn btn-primary btn-sm px-4 rounded-pill">
          Đăng nhập
        </Link>
      </div>
    );
  }

  const validate = (value) => {
    if (!value.trim()) return "Bình luận không được để trống.";
    if (value.trim().length < MIN_LENGTH)
      return `Bình luận phải có ít nhất ${MIN_LENGTH} ký tự.`;
    return "";
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setContent(val);
    if (error) setError(validate(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate(content);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await commentApi.createComment({
        postId,
        parentId,
        content: content.trim(),
      });
      showToast(res?.message ?? "Bình luận thành công!", "success");
      setContent("");
      if (onSuccess) await onSuccess();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = MAX_LENGTH - content.length;
  const isNearLimit = remaining <= 100;

  return (
    <form onSubmit={handleSubmit} className={compact ? "mt-1 mb-2" : "mb-4"} noValidate>
      <div className="d-flex gap-2 align-items-start">
        <div className="flex-shrink-0 pt-1">
          <AuthorAvatar user={user} size={compact ? 28 : 34} />
        </div>

        <div className="flex-grow-1 min-w-0">
          <div
            style={{
              background: "#ffffff",
              border: `1.5px solid ${error ? "#ef4444" : "#e2e8f0"}`,
              borderRadius: 18,
              borderTopLeftRadius: 4,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              transition: "border-color 0.15s",
            }}
          >
            <textarea
              rows={compact ? 2 : 3}
              placeholder={placeholder}
              value={content}
              onChange={handleChange}
              maxLength={MAX_LENGTH}
              disabled={submitting}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                resize: "none",
                fontSize: 14,
                background: "transparent",
                color: "#1e293b",
                padding: "10px 14px",
                lineHeight: 1.6,
              }}
            />

            <div
              className="d-flex align-items-center justify-content-between px-3 py-2"
              style={{
                borderTop: "1px solid #f1f5f9",
                background: "#f8fafc",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: isNearLimit ? "#f59e0b" : "#94a3b8",
                  fontWeight: isNearLimit ? 600 : 400,
                }}
              >
                {content.length}/{MAX_LENGTH}
              </span>

              <div className="d-flex gap-2">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline-secondary"
                    size="sm"
                    onClick={onCancel}
                    disabled={submitting}
                    style={{ borderRadius: 999, fontSize: 12 }}
                  >
                    Hủy
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting || !content.trim()}
                  style={{ borderRadius: 999, fontSize: 12 }}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                      />
                      Đang gửi...
                    </>
                  ) : (
                    submitLabel
                  )}
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4, paddingLeft: 4 }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
