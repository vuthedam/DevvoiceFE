import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import SearchBar from "../../../components/SearchBar";
import Pagination from "../../../components/Pagination";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import { filterBySearch, getTotalPages, paginateItems } from "../../../utils/pagination.js";
import * as adminApi from "../api/adminApi.js";

const PAGE_SIZE = 10;
const STATUS_FILTERS = ["all", "pending", "approved", "rejected", "hidden", "deleted"];

const COLUMNS = [
  { key: "title",   label: "Tiêu đề" },
  { key: "author",  label: "Tác giả" },
  { key: "status",  label: "Trạng thái" },
  { key: "date",    label: "Ngày tạo" },
  { key: "action",  label: "Thao tác", className: "text-end" },
];

const AdminPosts = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [rejectModal, setRejectModal] = useState({ show: false, postId: null, reason: "" });

  const activeStatus = searchParams.get("status") ?? "all";

  const setStatus = (s) => {
    setPage(1);
    setSearchParams(s === "all" ? {} : { status: s });
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = activeStatus !== "all" ? { status: activeStatus } : {};
      const res = await adminApi.getAdminPosts(params);
      setPosts(res.data ?? []);
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [activeStatus]);

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
      <PageHeader title="Quản lý bài viết" subtitle="Tất cả bài viết trong hệ thống" />

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {/* Filter tabs */}
          <div className="d-flex gap-2 flex-wrap mb-3">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`btn btn-sm ${activeStatus === s ? "btn-primary" : "btn-outline-secondary"}`}
              >
                {s === "all" ? "Tất cả" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Tìm theo tiêu đề, tác giả..."
            className="mb-3"
          />

          <AdminTable
            loading={loading}
            isEmpty={!loading && paginated.length === 0}
            emptyTitle="Không có bài viết nào"
            columns={COLUMNS}
          >
            {paginated.map((p) => (
              <tr key={p._id}>
                <td style={{ maxWidth: 260 }}>
                  <div className="text-truncate fw-semibold" title={p.title}>{p.title}</div>
                  {p.rejectReason && (
                    <div className="text-danger small mt-1">
                      Lý do: {p.rejectReason}
                    </div>
                  )}
                </td>
                <td>
                  <div className="small fw-semibold">{p.userId?.fullName}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>@{p.userId?.username}</div>
                </td>
                <td><StatusBadge value={p.status} /></td>
                <td className="text-muted small">
                  {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="text-end">
                  <div className="d-flex gap-1 justify-content-end flex-wrap">
                    {p.status === "pending" && (
                      <>
                        <Button variant="success" size="sm" disabled={submitting}
                          onClick={() => act(adminApi.approvePost, p._id)}>
                          Duyệt
                        </Button>
                        <Button variant="danger" size="sm"
                          onClick={() => setRejectModal({ show: true, postId: p._id, reason: "" })}>
                          Từ chối
                        </Button>
                      </>
                    )}
                    {p.status === "approved" && (
                      <Button variant="outline-secondary" size="sm" disabled={submitting}
                        onClick={() => act(adminApi.hidePost, p._id, {})}>
                        Ẩn
                      </Button>
                    )}
                    {p.status === "hidden" && (
                      <Button variant="outline-success" size="sm" disabled={submitting}
                        onClick={() => act(adminApi.restorePost, p._id)}>
                        Khôi phục
                      </Button>
                    )}
                    {p.status !== "deleted" && (
                      <Button variant="outline-danger" size="sm"
                        onClick={() => setDeleteTarget(p)}>
                        Xóa
                      </Button>
                    )}
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
              {submitting ? "Đang xử lý..." : "Từ chối"}
            </Button>
          </>
        }
      >
        <label className="form-label fw-semibold">Lý do từ chối <span className="text-danger">*</span></label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Nhập lý do từ chối..."
          value={rejectModal.reason}
          onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
        />
      </Modal>

      <ConfirmDelete
        show={!!deleteTarget}
        title="Xóa bài viết"
        message={`Xóa vĩnh viễn bài viết "${deleteTarget?.title}"?`}
        loading={submitting}
        onConfirm={async () => {
          await act(adminApi.deletePost, deleteTarget._id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default AdminPosts;
