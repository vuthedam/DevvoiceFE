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

const CommentForm = ({ postId, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [content, setContent]     = useState("");
  const [error, setError]         = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div
        className="rounded-3 p-4 text-center mb-4"
        style={{ background: "#f8f9fa", border: "1px dashed #dee2e6" }}
      >
        <p className="text-muted mb-3 small">
          Đăng nhập để tham gia bình luận cùng cộng đồng
        </p>
        <Link to="/login" className="btn btn-primary btn-sm px-4">
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
        content: content.trim(),
      });
      showToast(res?.message ?? "Bình luận thành công!", "success");
      setContent("");
      onSuccess();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = MAX_LENGTH - content.length;
  const isNearLimit = remaining <= 100;

  return (
    <form onSubmit={handleSubmit} className="mb-4" noValidate>
      <div className="d-flex gap-3 align-items-start">
        <AuthorAvatar user={user} size={38} />

        <div className="flex-grow-1">
          <textarea
            className={`form-control ${error ? "is-invalid" : ""}`}
            rows={3}
            placeholder="Viết bình luận của bạn..."
            value={content}
            onChange={handleChange}
            maxLength={MAX_LENGTH}
            disabled={submitting}
            style={{ resize: "none", fontSize: 14 }}
          />

          {/* Validation error */}
          {error && (
            <div className="invalid-feedback d-block" style={{ fontSize: 12 }}>
              {error}
            </div>
          )}

          {/* Footer: char count + submit */}
          <div className="d-flex align-items-center justify-content-between mt-2">
            <span
              className={`small ${isNearLimit ? "text-warning fw-semibold" : "text-muted"}`}
              style={{ fontSize: 12 }}
            >
              {content.length}/{MAX_LENGTH}
            </span>

            <Button
              type="submit"
              size="sm"
              disabled={submitting || !content.trim()}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Đang gửi...
                </>
              ) : (
                "Gửi bình luận"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
