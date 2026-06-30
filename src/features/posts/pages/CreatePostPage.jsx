import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/Button";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import * as postApi from "../api/postApi.js";

const CreatePostPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ title: "", content: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Tiêu đề là bắt buộc";
    if (!form.content.trim()) e.content = "Nội dung là bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await postApi.createPost({ ...form, userId: user._id });
      showToast(res.message ?? "Bài viết đã được gửi, chờ Admin duyệt", "success");
      navigate("/my-posts");
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="mb-4">
          <h2 className="fw-bold mb-1">Tạo bài viết mới</h2>
          <p className="text-muted small mb-0">
            Bài viết sẽ được gửi cho Admin kiểm duyệt trước khi hiển thị công khai.
          </p>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit} noValidate>
              {/* Title */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Tiêu đề <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control ${errors.title ? "is-invalid" : ""}`}
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề bài viết..."
                  maxLength={255}
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                <div className="form-text text-end">{form.title.length}/255</div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Nội dung <span className="text-danger">*</span>
                </label>
                <textarea
                  className={`form-control ${errors.content ? "is-invalid" : ""}`}
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  rows={12}
                  placeholder="Viết nội dung bài viết..."
                  maxLength={10000}
                  style={{ resize: "vertical" }}
                />
                {errors.content && <div className="invalid-feedback">{errors.content}</div>}
                <div className="form-text text-end">{form.content.length}/10000</div>
              </div>

              {/* Info */}
              <div className="alert alert-info py-2 small mb-4">
                ℹ️ Bài viết sẽ ở trạng thái <strong>Chờ duyệt</strong> cho đến khi Admin xem xét.
              </div>

              <div className="d-flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Đang gửi..." : "Gửi bài viết"}
                </Button>
                <Button variant="secondary" onClick={() => navigate(-1)} disabled={submitting}>
                  Hủy
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;
