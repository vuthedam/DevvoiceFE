import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Loading from "../../../components/Loading";
import EmptyState from "../../../components/EmptyState";
import Pagination from "../../../components/Pagination";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { useToast } from "../../../components/Toast";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import { getTotalPages, paginateItems } from "../../../utils/pagination.js";
import * as postApi from "../api/postApi.js";

const PAGE_SIZE = 8;

const STATUS_TABS = [
  { value: "all",      label: "Tất cả" },
  { value: "pending",  label: "⏳ Chờ duyệt" },
  { value: "approved", label: "✅ Đã duyệt" },
  { value: "rejected", label: "❌ Từ chối" },
  { value: "hidden",   label: "🙈 Đang ẩn" },
];

const STATUS_BADGE = {
  pending:  { label: "Chờ duyệt",  cls: "bg-warning text-dark" },
  approved: { label: "Đã duyệt",   cls: "bg-success" },
  rejected: { label: "Từ chối",    cls: "bg-danger" },
  hidden:   { label: "Đang ẩn",    cls: "bg-secondary" },
  deleted:  { label: "Đã xóa",     cls: "bg-dark" },
};

const PostStatusBadge = ({ status }) => {
  const { label, cls } = STATUS_BADGE[status] ?? { label: status, cls: "bg-secondary" };
  return <span className={`badge ${cls}`}>{label}</span>;
};

// ── Edit modal ────────────────────────────────────────────────────────────────
const EditModal = ({ post, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [form, setForm] = useState({ title: post?.title ?? "", content: post?.content ?? "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      showToast("Tiêu đề và nội dung không được để trống", "warning");
      return;
    }
    setSubmitting(true);
    try {
      const res = await postApi.updatePost(post._id, form);
      showToast(res?.message ?? "Cập nhật thành công", "success");
      onSuccess();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      show
      title="Chỉnh sửa bài viết"
      onClose={onClose}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Đang lưu..." : "Lưu"}
          </Button>
        </>
      }
    >
      <div className="mb-3">
        <label className="form-label fw-semibold">Tiêu đề</label>
        <input
          className="form-control"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          maxLength={255}
        />
      </div>
      <div className="mb-2">
        <label className="form-label fw-semibold">Nội dung</label>
        <textarea
          className="form-control"
          rows={10}
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
          maxLength={10000}
          style={{ resize: "vertical" }}
        />
        <div className="form-text text-end">{form.content.length}/10000</div>
      </div>
    </Modal>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const MyPostsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [editPost, setEditPost] = useState(null);
  const [deletePost, setDeletePost] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await postApi.getMyPosts();
      setPosts(res.data ?? []);
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const filtered = useMemo(
    () => activeTab === "all" ? posts : posts.filter((p) => p.status === activeTab),
    [posts, activeTab]
  );
  const totalPages = getTotalPages(filtered.length, PAGE_SIZE);
  const paginated  = paginateItems(filtered, page, PAGE_SIZE);

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await postApi.softDeletePost(deletePost._id);
      showToast(res?.message ?? "Đã xóa bài viết", "success");
      setDeletePost(null);
      fetchPosts();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async (postId) => {
    try {
      const res = await postApi.resubmitPost(postId);
      showToast(res?.message ?? "Đã gửi lại để duyệt", "success");
      fetchPosts();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    }
  };

  if (loading) return <Loading text="Đang tải bài viết..." />;

  return (
    <>
      {/* Header */}
      <div className="d-flex align-items-start justify-content-between mb-4 gap-3 flex-wrap">
        <div>
          <h2 className="fw-bold mb-1">Bài viết của tôi</h2>
          <p className="text-muted small mb-0">
            Quản lý tất cả bài viết bạn đã đăng
          </p>
        </div>
        <Button onClick={() => navigate("/create-post")}>+ Tạo bài viết</Button>
      </div>

      {/* Status tabs */}
      <div className="d-flex gap-2 flex-wrap mb-4">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setActiveTab(value); setPage(1); }}
            className={`btn btn-sm ${activeTab === value ? "btn-primary" : "btn-outline-secondary"}`}
          >
            {label}
            {value !== "all" && (
              <span className="ms-1 badge bg-white text-dark" style={{ fontSize: 10 }}>
                {posts.filter((p) => p.status === value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <EmptyState
          title="Không có bài viết nào"
          description={activeTab === "all" ? "Hãy tạo bài viết đầu tiên của bạn!" : `Không có bài viết ở trạng thái "${activeTab}"`}
          action={
            activeTab === "all" && (
              <Button onClick={() => navigate("/create-post")}>Tạo bài viết</Button>
            )
          }
        />
      )}

      {/* List */}
      {paginated.length > 0 && (
        <>
          <div className="d-flex flex-column gap-3">
            {paginated.map((post) => (
              <div key={post._id} className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex gap-3 flex-wrap">
                    {/* Content */}
                    <div className="flex-grow-1 min-w-0">
                      <div className="d-flex align-items-start gap-2 flex-wrap mb-1">
                        <PostStatusBadge status={post.status} />
                        <span className="text-muted small">
                          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      {/* Title — chỉ approved mới link được */}
                      {post.status === "approved" ? (
                        <Link
                          to={`/posts/${post._id}`}
                          className="fw-semibold text-decoration-none text-dark"
                        >
                          {post.title}
                        </Link>
                      ) : (
                        <span className="fw-semibold">{post.title}</span>
                      )}

                      <p className="text-muted small mt-1 mb-2 text-truncate-2">
                        {post.content?.slice(0, 120)}{post.content?.length > 120 ? "..." : ""}
                      </p>

                      {/* Reject reason */}
                      {post.status === "rejected" && post.rejectReason && (
                        <div className="alert alert-danger py-1 px-2 small mb-2">
                          <strong>Lý do từ chối:</strong> {post.rejectReason}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="d-flex gap-3 text-muted small">
                        <span>❤️ {post.likesCount ?? 0}</span>
                        <span>💬 {post.commentsCount ?? 0}</span>
                        <span>🚩 {post.reportsCount ?? 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex flex-column gap-1 flex-shrink-0" style={{ minWidth: 110 }}>
                      {post.status === "approved" && (
                        <Link
                          to={`/posts/${post._id}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          Xem
                        </Link>
                      )}

                      {(post.status === "pending" || post.status === "rejected") && (
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => setEditPost(post)}
                        >
                          Sửa
                        </Button>
                      )}

                      {post.status === "rejected" && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleResubmit(post._id)}
                        >
                          Gửi lại
                        </Button>
                      )}

                      {post.status !== "deleted" && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setDeletePost(post)}
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      {/* Edit modal */}
      {editPost && (
        <EditModal
          post={editPost}
          onClose={() => setEditPost(null)}
          onSuccess={() => { setEditPost(null); fetchPosts(); }}
        />
      )}

      {/* Delete confirm */}
      <ConfirmDelete
        show={!!deletePost}
        title="Xóa bài viết"
        message={`Xóa bài viết "${deletePost?.title}"?`}
        loading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setDeletePost(null)}
      />
    </>
  );
};

export default MyPostsPage;
