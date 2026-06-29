import { useEffect, useMemo, useState } from "react";
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import SearchBar from "../../../components/SearchBar";
import Pagination from "../../../components/Pagination";
import Button from "../../../components/Button";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import { filterBySearch, getTotalPages, paginateItems } from "../../../utils/pagination.js";
import * as adminApi from "../api/adminApi.js";

const PAGE_SIZE = 10;
const STATUS_FILTERS = ["all", "active", "hidden", "deleted"];

const COLUMNS = [
  { key: "content", label: "Nội dung" },
  { key: "author",  label: "Tác giả" },
  { key: "status",  label: "Trạng thái" },
  { key: "date",    label: "Ngày tạo" },
  { key: "action",  label: "Thao tác", className: "text-end" },
];

const AdminComments = () => {
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? { status: statusFilter } : {};
      const res = await adminApi.getAdminComments(params);
      setComments(res.data ?? []);
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComments(); }, [statusFilter]);

  const filtered = useMemo(
    () => filterBySearch(comments, search, ["content", "userId.fullName", "userId.username"]),
    [comments, search]
  );
  const totalPages = getTotalPages(filtered.length, PAGE_SIZE);
  const paginated = paginateItems(filtered, page, PAGE_SIZE);

  const act = async (fn, ...args) => {
    setSubmitting(true);
    try {
      const res = await fn(...args);
      showToast(res?.message ?? "Thành công", "success");
      fetchComments();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Quản lý bình luận" subtitle="Tất cả bình luận trong hệ thống" />

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex gap-2 flex-wrap mb-3">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`btn btn-sm ${statusFilter === s ? "btn-primary" : "btn-outline-secondary"}`}
              >
                {s === "all" ? "Tất cả" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Tìm theo nội dung, tác giả..."
            className="mb-3"
          />

          <AdminTable
            loading={loading}
            isEmpty={!loading && paginated.length === 0}
            emptyTitle="Không có bình luận nào"
            columns={COLUMNS}
          >
            {paginated.map((c) => (
              <tr key={c._id}>
                <td style={{ maxWidth: 320 }}>
                  <div className="text-truncate" title={c.content}>{c.content}</div>
                  {c.reportsCount > 0 && (
                    <span className="badge bg-danger-subtle text-danger mt-1">
                      🚩 {c.reportsCount} report
                    </span>
                  )}
                </td>
                <td>
                  <div className="small fw-semibold">{c.userId?.fullName}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>@{c.userId?.username}</div>
                </td>
                <td><StatusBadge value={c.status} /></td>
                <td className="text-muted small">
                  {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="text-end">
                  <div className="d-flex gap-1 justify-content-end flex-wrap">
                    {c.status === "active" && (
                      <Button variant="outline-secondary" size="sm" disabled={submitting}
                        onClick={() => act(adminApi.hideComment, c._id, {})}>
                        Ẩn
                      </Button>
                    )}
                    {c.status === "hidden" && (
                      <Button variant="outline-success" size="sm" disabled={submitting}
                        onClick={() => act(adminApi.restoreComment, c._id)}>
                        Khôi phục
                      </Button>
                    )}
                    {c.status !== "deleted" && (
                      <Button variant="outline-danger" size="sm"
                        onClick={() => setDeleteTarget(c)}>
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

      <ConfirmDelete
        show={!!deleteTarget}
        title="Xóa bình luận"
        message="Xóa vĩnh viễn bình luận này?"
        loading={submitting}
        onConfirm={async () => {
          await act(adminApi.deleteComment, deleteTarget._id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default AdminComments;
