import { useEffect, useMemo, useState } from "react";
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import SearchBar from "../../../components/SearchBar";
import Pagination from "../../../components/Pagination";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import { filterBySearch, getTotalPages, paginateItems } from "../../../utils/pagination.js";
import * as adminApi from "../api/adminApi.js";

const PAGE_SIZE = 10;

const COLUMNS = [
  { key: "title",   label: "Tiêu đề" },
  { key: "author",  label: "Tác giả" },
  { key: "date",    label: "Ngày tạo" },
  { key: "action",  label: "Thao tác", className: "text-end" },
];

const AdminPendingPosts = () => {
  const { showToast } = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [rejectModal, setRejectModal] = useState({ show: false, postId: null, reason: "" });
  const [previewPost, setPreviewPost] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPendingPosts();
      setPosts(res.data ?? []);
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const filtered = useMemo(
    () => filterBySearch(posts, search, ["title", "userId.fullName", "userId.username"]),
    [posts, search]
  );
  const totalPages = getTotalPages(filtered.length, PAGE_SIZE);
  const paginated = paginateItems(filtered, page, PAGE_SIZE);

  const act = async (fn, ...args) => {
    setSubmitting(true);
    try {
      const res = await fn(...args);
      showToast(res?.message ?? "Thành công", "success");
      fetchPosts();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModal.reason.trim()) {
      showToast("Vui lòng nhập lý do từ chối", "warning");
      return;
    }
    await act(adminApi.rejectPost, rejectModal.postId, { rejectReason: rejectModal.reason });
    setRejectModal({ show: false, postId: null, reason: "" });
  };

  return (
    <>
      <PageHeader
        title="Bài viết chờ duyệt"
        subtitle={`${posts.length} bài viết đang chờ xem xét`}
      />

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Tìm theo tiêu đề, tác giả..."
            className="mb-3"
          />

          <AdminTable
            loading={loading}
            isEmpty={!loading && paginated.length === 0}
            emptyTitle="Không có bài viết nào đang chờ duyệt 🎉"
            columns={COLUMNS}
          >
            {paginated.map((p) => (
              <tr key={p._id}>
                <td style={{ maxWidth: 300 }}>
                  <button
                    className="btn btn-link p-0 text-start fw-semibold text-truncate d-block"
                    style={{ maxWidth: "100%" }}
                    onClick={() => setPreviewPost(p)}
                    title={p.title}
                  >
                    {p.title}
                  </button>
                  <div className="text-muted small text-truncate" style={{ maxWidth: 280 }}>
                    {p.content?.slice(0, 80)}...
                  </div>
                </td>
                <td>
                  <div className="small fw-semibold">{p.userId?.fullName}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>@{p.userId?.username}</div>
                </td>
                <td className="text-muted small">
                  {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="text-end">
                  <div className="d-flex gap-2 justify-content-end">
                    <Button variant="success" size="sm" disabled={submitting}
                      onClick={() => act(adminApi.approvePost, p._id)}>
                      ✓ Duyệt
                    </Button>
                    <Button variant="danger" size="sm"
                      onClick={() => setRejectModal({ show: true, postId: p._id, reason: "" })}>
                      ✗ Từ chối
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>

          <div className="mt-3">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <Modal
        show={!!previewPost}
        title={previewPost?.title ?? ""}
        onClose={() => setPreviewPost(null)}
        size="lg"
      >
        <div className="d-flex align-items-center gap-2 mb-3">
          <StatusBadge value="pending" />
          <span className="text-muted small">
            bởi <strong>{previewPost?.userId?.fullName}</strong> —{" "}
            {previewPost && new Date(previewPost.createdAt).toLocaleString("vi-VN")}
          </span>
        </div>
        <div style={{ whiteSpace: "pre-wrap", maxHeight: 400, overflowY: "auto" }}>
          {previewPost?.content}
        </div>
      </Modal>

      {/* Reject modal */}
      <Modal
        show={rejectModal.show}
        title="Từ chối bài viết"
        onClose={() => setRejectModal({ show: false, postId: null, reason: "" })}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectModal({ show: false, postId: null, reason: "" })}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleRejectSubmit} disabled={submitting}>
              {submitting ? "Đang xử lý..." : "Xác nhận từ chối"}
            </Button>
          </>
        }
      >
        <label className="form-label fw-semibold">
          Lý do từ chối <span className="text-danger">*</span>
        </label>
        <textarea
          className="form-control"
          rows={4}
          placeholder="Mô tả lý do từ chối bài viết này..."
          value={rejectModal.reason}
          onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
        />
      </Modal>
    </>
  );
};

export default AdminPendingPosts;
