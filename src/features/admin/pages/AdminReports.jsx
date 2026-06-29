import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
const STATUS_FILTERS = ["all", "pending", "resolved", "rejected"];

const COLUMNS = [
  { key: "target",   label: "Đối tượng" },
  { key: "reporter", label: "Người report" },
  { key: "reason",   label: "Lý do" },
  { key: "status",   label: "Trạng thái" },
  { key: "date",     label: "Ngày" },
  { key: "action",   label: "Thao tác", className: "text-end" },
];

const REASON_LABEL = {
  spam: "Spam",
  harassment: "Quấy rối",
  hate_speech: "Ngôn từ thù địch",
  misinformation: "Sai thông tin",
  other: "Khác",
};

const AdminReports = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const activeStatus = searchParams.get("status") ?? "all";

  const setStatus = (s) => {
    setPage(1);
    setSearchParams(s === "all" ? {} : { status: s });
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = activeStatus !== "all" ? { status: activeStatus } : {};
      const res = await adminApi.getAdminReports(params);
      setReports(res.data ?? []);
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [activeStatus]);

  const filtered = useMemo(
    () => filterBySearch(reports, search, [
      "reporterId.fullName",
      "reporterId.username",
      "reason",
    ]),
    [reports, search]
  );
  const totalPages = getTotalPages(filtered.length, PAGE_SIZE);
  const paginated = paginateItems(filtered, page, PAGE_SIZE);

  const act = async (fn, id) => {
    setSubmitting(true);
    try {
      const res = await fn(id);
      showToast(res?.message ?? "Thành công", "success");
      fetchReports();
      if (detail?._id === id) setDetail(null);
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const getTargetLabel = (r) => {
    if (r.postId)    return { type: "Bài viết", text: r.postId.title ?? r.postId._id };
    if (r.commentId) return { type: "Bình luận", text: r.commentId.content ?? r.commentId._id };
    return { type: "?", text: "—" };
  };

  return (
    <>
      <PageHeader title="Quản lý Reports" subtitle="Danh sách tất cả báo cáo vi phạm" />

      <div className="card border-0 shadow-sm">
        <div className="card-body">
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
            placeholder="Tìm theo người report, lý do..."
            className="mb-3"
          />

          <AdminTable
            loading={loading}
            isEmpty={!loading && paginated.length === 0}
            emptyTitle="Không có report nào"
            columns={COLUMNS}
          >
            {paginated.map((r) => {
              const target = getTargetLabel(r);
              return (
                <tr key={r._id}>
                  <td style={{ maxWidth: 200 }}>
                    <span className="badge bg-light text-dark border me-1">{target.type}</span>
                    <span className="text-truncate d-inline-block align-middle" style={{ maxWidth: 140 }} title={target.text}>
                      {target.text}
                    </span>
                  </td>
                  <td>
                    <div className="small fw-semibold">{r.reporterId?.fullName}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>@{r.reporterId?.username}</div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {REASON_LABEL[r.reason] ?? r.reason}
                    </span>
                  </td>
                  <td><StatusBadge value={r.status} /></td>
                  <td className="text-muted small">
                    {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="text-end">
                    <div className="d-flex gap-1 justify-content-end flex-wrap">
                      <Button variant="outline-primary" size="sm" onClick={() => setDetail(r)}>
                        Chi tiết
                      </Button>
                      {r.status === "pending" && (
                        <>
                          <Button variant="success" size="sm" disabled={submitting}
                            onClick={() => act(adminApi.resolveReport, r._id)}>
                            Xử lý
                          </Button>
                          <Button variant="outline-danger" size="sm" disabled={submitting}
                            onClick={() => act(adminApi.rejectReport, r._id)}>
                            Bỏ qua
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </AdminTable>

          <div className="mt-3">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <Modal
          show
          title="Chi tiết Report"
          onClose={() => setDetail(null)}
          size="lg"
          footer={
            detail.status === "pending" ? (
              <>
                <Button variant="secondary" onClick={() => setDetail(null)}>Đóng</Button>
                <Button variant="danger" disabled={submitting}
                  onClick={() => act(adminApi.rejectReport, detail._id)}>
                  Bỏ qua
                </Button>
                <Button variant="success" disabled={submitting}
                  onClick={() => act(adminApi.resolveReport, detail._id)}>
                  Đánh dấu đã xử lý
                </Button>
              </>
            ) : undefined
          }
        >
          <div className="row g-3">
            <div className="col-sm-6">
              <div className="text-muted small mb-1">Người report</div>
              <div className="fw-semibold">{detail.reporterId?.fullName}</div>
              <div className="text-muted small">@{detail.reporterId?.username}</div>
            </div>
            <div className="col-sm-6">
              <div className="text-muted small mb-1">Trạng thái</div>
              <StatusBadge value={detail.status} />
              {detail.handledBy && (
                <div className="text-muted small mt-1">
                  Xử lý bởi: {detail.handledBy.fullName}
                </div>
              )}
            </div>
            <div className="col-sm-6">
              <div className="text-muted small mb-1">Lý do</div>
              <span className="badge bg-warning text-dark">
                {REASON_LABEL[detail.reason] ?? detail.reason}
              </span>
            </div>
            <div className="col-sm-6">
              <div className="text-muted small mb-1">Thời gian</div>
              <div className="small">{new Date(detail.createdAt).toLocaleString("vi-VN")}</div>
            </div>
            {detail.description && (
              <div className="col-12">
                <div className="text-muted small mb-1">Mô tả</div>
                <div className="bg-light rounded p-2 small">{detail.description}</div>
              </div>
            )}
            {detail.postId && (
              <div className="col-12">
                <div className="text-muted small mb-1">Bài viết bị report</div>
                <div className="border rounded p-2">
                  <div className="fw-semibold">{detail.postId.title}</div>
                  <div className="d-flex gap-2 mt-1">
                    <StatusBadge value={detail.postId.status} />
                    <span className="text-muted small">
                      bởi {detail.postId.userId?.fullName ?? detail.postId.userId}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {detail.commentId && (
              <div className="col-12">
                <div className="text-muted small mb-1">Bình luận bị report</div>
                <div className="border rounded p-2">
                  <div>{detail.commentId.content}</div>
                  <div className="d-flex gap-2 mt-1">
                    <StatusBadge value={detail.commentId.status} />
                    <span className="text-muted small">
                      bởi {detail.commentId.userId?.fullName ?? detail.commentId.userId}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default AdminReports;
