import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Loading from "../../../components/Loading";
import Button from "../../../components/Button";
import ConfirmDelete from "../../../components/ConfirmDelete";
import PostForm from "../components/PostForm.jsx";
import CommentList from "../../comments/components/CommentList.jsx";
import { usePost } from "../hooks/usePosts.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import * as postApi from "../api/postApi.js";
import * as likeApi from "../../likes/api/likeApi.js";

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { post, loading, error, refetch } = usePost(id);
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [userReaction, setUserReaction] = useState(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const postUserId = post?.userId?._id || post?.userId;
  const canModify = isAdmin || postUserId === user?._id;

  useEffect(() => {
    const fetchReaction = async () => {
      if (!user?._id || !id) return;
      try {
        const response = await likeApi.getPostReactions({
          postId: id,
          userId: user._id,
        });
        setUserReaction(response.data?.[0] || null);
      } catch {
        setUserReaction(null);
      }
    };
    fetchReaction();
  }, [id, user?._id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      showToast("Vui lòng đăng nhập để thích bài viết", "warning");
      return;
    }

    setLikeLoading(true);
    try {
      if (userReaction) {
        const response = await likeApi.deletePostReaction(userReaction._id);
        showToast(response.message || "Đã bỏ thích", "info");
        setUserReaction(null);
      } else {
        const response = await likeApi.createPostReaction({
          postId: id,
          userId: user._id,
          type: "like",
        });
        setUserReaction(response.data);
        showToast(response.message || "Đã thích bài viết", "success");
      }
      refetch();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    setSubmitting(true);
    try {
      const response = await postApi.updatePost(id, formData);
      showToast(response.message || "Cập nhật thành công", "success");
      setShowEdit(false);
      refetch();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const response = await postApi.deletePost(id);
      showToast(response.message || "Xóa bài viết thành công", "success");
      navigate("/posts");
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSubmitting(false);
      setShowDelete(false);
    }
  };

  if (loading) return <Loading text="Đang tải bài viết..." />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!post) return <div className="alert alert-warning">Không tìm thấy bài viết</div>;

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Trang chủ</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/posts">Bài viết</Link>
          </li>
          <li className="breadcrumb-item active">{post.title}</li>
        </ol>
      </nav>

      <article className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <h1 className="h2">{post.title}</h1>
          <p className="text-muted">
            Bởi {post.userId?.fullName || "Ẩn danh"} (@
            {post.userId?.username || "unknown"})
          </p>
          <div className="mb-4" style={{ whiteSpace: "pre-wrap" }}>
            {post.content}
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Button
              variant={userReaction ? "danger" : "outline-danger"}
              onClick={handleLike}
              disabled={likeLoading}
            >
              {userReaction ? "❤️ Đã thích" : "🤍 Thích"} ({post.likesCount})
            </Button>
            <span className="badge bg-secondary">
              💬 {post.commentsCount} bình luận
            </span>
            {canModify && (
              <>
                <Button variant="outline-primary" onClick={() => setShowEdit(true)}>
                  Sửa
                </Button>
                <Button variant="outline-danger" onClick={() => setShowDelete(true)}>
                  Xóa
                </Button>
              </>
            )}
          </div>
        </div>
      </article>

      <CommentList postId={id} />

      <PostForm
        show={showEdit}
        onClose={() => setShowEdit(false)}
        onSubmit={handleUpdate}
        initialData={post}
        loading={submitting}
      />

      <ConfirmDelete
        show={showDelete}
        title="Xóa bài viết"
        message="Bạn có chắc muốn xóa bài viết này?"
        loading={submitting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
};

export default PostDetailPage;
