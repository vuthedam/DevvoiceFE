import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../../components/Button";
import ReportModal from "./ReportModal.jsx";
import { useAuth } from "../../../auth/hooks/useAuth.js";
import { useToast } from "../../../../components/Toast";
import { getApiErrorMessage } from "../../../../utils/apiError.js";
import * as likeApi from "../../../likes/api/likeApi.js";
import * as reportApi from "../../api/reportApi.js";

const PostActions = ({ post, onLikeSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [reaction, setReaction]         = useState(null);
  const [likeLoading, setLikeLoading]   = useState(false);
  const [likesCount, setLikesCount]     = useState(post?.likesCount ?? 0);
  const [showReport, setShowReport]     = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // fetch reaction của user hiện tại
  useEffect(() => {
    if (!user?._id || !post?._id) return;
    likeApi
      .getPostReactions({ postId: post._id, userId: user._id })
      .then((res) => setReaction(res.data?.[0] ?? null))
      .catch(() => setReaction(null));
  }, [post?._id, user?._id]);

  // sync khi post prop thay đổi
  useEffect(() => {
    setLikesCount(post?.likesCount ?? 0);
  }, [post?.likesCount]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      showToast("Vui lòng đăng nhập để thích bài viết", "warning");
      return;
    }
    setLikeLoading(true);
    try {
      if (reaction) {
        await likeApi.deletePostReaction(reaction._id);
        setReaction(null);
        setLikesCount((n) => Math.max(0, n - 1));
      } else {
        const res = await likeApi.createPostReaction({
          postId: post._id,
          userId: user._id,
          type: "like",
        });
        setReaction(res.data);
        setLikesCount((n) => n + 1);
      }
      onLikeSuccess?.();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setLikeLoading(false);
    }
  };

  const handleReport = async ({ reason, description }) => {
    setReportSubmitting(true);
    try {
      const res = await reportApi.reportPost(post._id, { reason, description });
      showToast(res?.message ?? "Đã gửi báo cáo thành công", "success");
      setShowReport(false);
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center gap-2 flex-wrap">
        {/* Like */}
        <Button
          variant={reaction ? "danger" : "outline-danger"}
          size="sm"
          onClick={handleLike}
          disabled={likeLoading}
        >
          {reaction ? "❤️" : "🤍"} {likesCount}
        </Button>

        {/* Comment count */}
        <span className="btn btn-sm btn-outline-secondary pe-none">
          💬 {post?.commentsCount ?? 0}
        </span>

        {/* Report */}
        {isAuthenticated ? (
          <Button
            variant="outline-warning"
            size="sm"
            onClick={() => setShowReport(true)}
          >
            🚩 Báo cáo
          </Button>
        ) : (
          <Link to="/login" className="btn btn-sm btn-outline-warning">
            🚩 Báo cáo
          </Link>
        )}
      </div>

      <ReportModal
        show={showReport}
        title="Báo cáo bài viết"
        submitting={reportSubmitting}
        onConfirm={handleReport}
        onClose={() => setShowReport(false)}
      />
    </>
  );
};

export default PostActions;
