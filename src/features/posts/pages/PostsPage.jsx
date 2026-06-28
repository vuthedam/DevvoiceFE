import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../../../components/Loading";
import EmptyState from "../../../components/EmptyState";
import SearchBar from "../../../components/SearchBar";
import Pagination from "../../../components/Pagination";
import Button from "../../../components/Button";
import PostCard from "../components/PostCard.jsx";
import PostForm from "../components/PostForm.jsx";
import { usePosts } from "../hooks/usePosts.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import {
  filterBySearch,
  getTotalPages,
  paginateItems,
} from "../../../utils/pagination.js";
import * as postApi from "../api/postApi.js";

const PAGE_SIZE = 6;

const PostsPage = () => {
  const { posts, loading, error, refetch } = usePosts({ status: "active" });
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredPosts = useMemo(
    () => filterBySearch(posts, search, ["title", "content", "userId.fullName"]),
    [posts, search]
  );

  const totalPages = getTotalPages(filteredPosts.length, PAGE_SIZE);
  const paginatedPosts = paginateItems(filteredPosts, page, PAGE_SIZE);

  const handleCreate = async (formData) => {
    if (!user?._id) return;
    setSubmitting(true);
    try {
      const response = await postApi.createPost({
        ...formData,
        userId: user._id,
      });
      showToast(response.message || "Tạo bài viết thành công", "success");
      setShowForm(false);
      refetch();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Đang tải bài viết..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 className="mb-1">Bài viết</h1>
          <p className="text-muted mb-0">Khám phá và chia sẻ ý tưởng</p>
        </div>
        {isAuthenticated && (
          <Button onClick={() => setShowForm(true)}>+ Tạo bài viết</Button>
        )}
      </div>

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Tìm theo tiêu đề, nội dung, tác giả..."
        className="mb-4"
      />

      {paginatedPosts.length === 0 ? (
        <EmptyState
          title="Không tìm thấy bài viết"
          description="Thử tìm kiếm với từ khóa khác hoặc tạo bài viết mới."
          action={
            isAuthenticated && (
              <Button onClick={() => setShowForm(true)}>Tạo bài viết</Button>
            )
          }
        />
      ) : (
        <>
          <div className="row g-4">
            {paginatedPosts.map((post) => (
              <div key={post._id} className="col-md-6 col-lg-4">
                <PostCard post={post} />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      <PostForm
        show={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        loading={submitting}
      />
    </>
  );
};

export default PostsPage;
