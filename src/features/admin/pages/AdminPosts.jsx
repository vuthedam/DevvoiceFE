import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

// shared components
import PageHeader from "../components/PageHeader";
import AdminTable from "../components/AdminTable";
import SearchBar from "../../../components/SearchBar";
import Pagination from "../../../components/Pagination";
import { useToast } from "../../../components/Toast";

// post-specific components
import FilterBar from "../components/posts/FilterBar";
import PostRow from "../components/posts/PostRow";
import PostDetailModal from "../components/posts/PostDetailModal";
import ApproveModal from "../components/posts/ApproveModal";
import RejectModal from "../components/posts/RejectModal";
import DeleteModal from "../components/posts/DeleteModal";

// utils & api
import { getApiErrorMessage } from "../../../utils/apiError.js";
import { filterBySearch, getTotalPages, paginateItems } from "../../../utils/pagination.js";
import { filterByDateRange } from "../../../utils/dateFilter.js";
import * as adminApi from "../api/adminApi.js";

const PAGE_SIZE = 10;

const COLUMNS = [
  { key: "title",    label: "Tiêu đề" },
  { key: "author",   label: "Tác giả" },
  { key: "status",   label: "Trạng thái" },
  { key: "likes",    label: "Likes",    className: "text-center" },
  { key: "comments", label: "Comments", className: "text-center" },
  { key: "reports",  label: "Reports",  className: "text-center" },
  { key: "date",     label: "Ngày tạo" },
  { key: "action",   label: "Thao tác", className: "text-end" },
];

// ─── modal initial states ────────────────────────────────────────────────────
const DETAIL_INIT  = null;
const APPROVE_INIT = null;
const REJECT_INIT  = { post: null, reason: "" };
const DELETE_INIT  = null;

const AdminPosts = () => {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);
  const [dateRange, setDateRange] = useState("all");

  // modals
  const [detailPost, setDetailPost]   = useState(DETAIL_INIT);
  const [approvePost, setApprovePost] = useState(APPROVE_INIT);
  const [rejectState, setRejectState] = useState(REJECT_INIT);
  const [deletePost, setDeletePost]   = useState(DELETE_INIT);

  const activeStatus = searchParams.get("status") ?? "all";

  const setStatus = (s) => {
    setPage(1);
    setSearchParams(s === "all" ? {} : { status: s });
  };

  // ─── fetch ────────────────────────────────────────────────────────────────
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

  // ─── filter ───────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const bySearch = filterBySearch(posts, search, ["title", "userId.fullName", "userId.username"]);
    return filterByDateRange(bySearch, dateRange);
  }, [posts, search, dateRange]);

  const totalPages = getTotalPages(filtered.length, PAGE_SIZE);
  const paginated  = paginateItems(filtered, page, PAGE_SIZE);

  // ─── generic action helper ────────────────────────────────────────────────
  const act = async (apiFn, ...args) => {
    setSubmitting(true);
    try {
      const res = await apiFn(...args);
      showToast(res?.message ?? "Thành công", "success");
      fetchPosts();
      return true;
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // ─── action handlers ──────────────────────────────────────────────────────
  const handleApproveConfirm = async () => {
    const ok = await act(adminApi.approvePost, approvePost._id);
    if (ok) {
      setApprovePost(APPROVE_INIT);
      if (detailPost?._id === approvePost._id) setDetailPost(DETAIL_INIT);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectState.reason.trim()) {
      showToast("Vui lòng nhập lý do từ chối", "warning");
      return;
    }
    const ok = await act(adminApi.rejectPost, rejectState.post._id, { rejectReason: rejectState.reason });
    if (ok) {
      setRejectState(REJECT_INIT);
      if (detailPost?._id === rejectState.post._id) setDetailPost(DETAIL_INIT);
    }
  };

  const handleHide = async (post) => {
    await act(adminApi.hidePost, post._id, {});
    if (detailPost?._id === post._id) setDetailPost(DETAIL_INIT);
  };

  const handleRestore = async (post) => {
    await act(adminApi.restorePost, post._id);
    if (detailPost?._id === post._id) setDetailPost(DETAIL_INIT);
  };

  const handleDeleteConfirm = async () => {
    const ok = await act(adminApi.deletePost, deletePost._id);
    if (ok) {
      setDeletePost(DELETE_INIT);
      if (detailPost?._id === deletePost._id) setDetailPost(DETAIL_INIT);
    }
  };

  // ─── helpers để mở modal approve/reject/delete từ cả row lẫn detail ──────
  const openApprove = (post) => { setApprovePost(post); };
  const openReject  = (post) => { setRejectState({ post, reason: "" }); };
  const openDelete  = (post) => { setDeletePost(post); };

  return (
    <>
      <PageHeader title="Quản lý bài viết" subtitle="Tất cả bài viết trong hệ thống" />

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <FilterBar
            activeStatus={activeStatus}
            activeDateRange={dateRange}
            onStatusChange={setStatus}
            onDateRangeChange={(v) => { setDateRange(v); setPage(1); }}
          />

          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Tìm theo tiêu đề, tên tác giả, username..."
            className="mb-3"
          />

          <AdminTable
            loading={loading}
            isEmpty={!loading && paginated.length === 0}
            emptyTitle="Không có bài viết nào"
            columns={COLUMNS}
          >
            {paginated.map((p) => (
              <PostRow
                key={p._id}
                post={p}
                submitting={submitting}
                onView={() => setDetailPost(p)}
                onApprove={() => openApprove(p)}
                onReject={() => openReject(p)}
                onHide={() => handleHide(p)}
                onRestore={() => handleRestore(p)}
                onDelete={() => openDelete(p)}
              />
            ))}
          </AdminTable>

          <div className="mt-3">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      <PostDetailModal
        post={detailPost}
        submitting={submitting}
        onClose={() => setDetailPost(DETAIL_INIT)}
        onApprove={() => openApprove(detailPost)}
        onReject={() => openReject(detailPost)}
        onHide={() => handleHide(detailPost)}
        onRestore={() => handleRestore(detailPost)}
        onDelete={() => openDelete(detailPost)}
      />

      <ApproveModal
        show={!!approvePost}
        post={approvePost}
        submitting={submitting}
        onConfirm={handleApproveConfirm}
        onClose={() => setApprovePost(APPROVE_INIT)}
      />

      <RejectModal
        show={!!rejectState.post}
        reason={rejectState.reason}
        submitting={submitting}
        onChange={(v) => setRejectState((prev) => ({ ...prev, reason: v }))}
        onConfirm={handleRejectConfirm}
        onClose={() => setRejectState(REJECT_INIT)}
      />

      <DeleteModal
        show={!!deletePost}
        post={deletePost}
        submitting={submitting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletePost(DELETE_INIT)}
      />
    </>
  );
};

export default AdminPosts;
