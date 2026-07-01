import { useMemo, useState } from "react";
import Loading from "../../../components/Loading";
import EmptyState from "../../../components/EmptyState";
import CommentForm from "./CommentForm.jsx";
import CommentItem from "./CommentItem.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useComments } from "../hooks/useComments.js";

const INITIAL_TOP_LEVEL_COUNT = 5;

const getCommentParentId = (comment) => {
  const parentRef = comment.parentId || comment.parentComment || null;
  if (typeof parentRef === "string") return parentRef;
  if (parentRef && typeof parentRef === "object")
    return parentRef._id || parentRef.id || null;
  return null;
};

const buildCommentTree = (comments = []) => {
  const map = new Map();
  const roots = [];

  comments.forEach((comment) => {
    map.set(comment._id, { ...comment, children: [] });
  });

  comments.forEach((comment) => {
    const node = map.get(comment._id);
    const parentId = getCommentParentId(comment);

    if (parentId && map.has(parentId)) {
      map.get(parentId).children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortByDate = (items = []) =>
    [...items].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const attachChildren = (nodes = []) => {
    const sortedNodes = sortByDate(nodes);
    sortedNodes.forEach((node) => {
      node.children = attachChildren(node.children);
    });
    return sortedNodes;
  };

  return attachChildren(roots);
};

const CommentList = ({ postId }) => {
  const { user, isAdmin } = useAuth();
  const { comments, loading, error, refetch } = useComments(postId);
  const [showAllTopLevel, setShowAllTopLevel] = useState(false);

  const tree = useMemo(() => buildCommentTree(comments), [comments]);
  const visibleTopLevelComments = useMemo(() => {
    if (showAllTopLevel || tree.length <= INITIAL_TOP_LEVEL_COUNT) return tree;
    return tree.slice(0, INITIAL_TOP_LEVEL_COUNT);
  }, [showAllTopLevel, tree]);

  const canDelete = (comment) =>
    isAdmin ||
    comment.userId?._id === user?._id ||
    comment.userId === user?._id;

  return (
    <section className="mt-2">
      <h5 className="fw-bold mb-4">
        Bình luận
        {!loading && !error && (
          <span
            className="badge bg-secondary fw-normal ms-2"
            style={{ fontSize: 13, verticalAlign: "middle" }}
          >
            {comments.length}
          </span>
        )}
      </h5>

      <CommentForm postId={postId} onSuccess={refetch} />

      {loading && <Loading text="Đang tải bình luận..." />}

      {!loading && error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && comments.length === 0 && (
        <EmptyState
          title="Chưa có bình luận nào"
          description="Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!"
        />
      )}

      {!loading && !error && comments.length > 0 && (
        <div>
          {visibleTopLevelComments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              canDelete={canDelete}
              onDelete={refetch}
              postId={postId}
            />
          ))}

          {tree.length > INITIAL_TOP_LEVEL_COUNT && (
            <div className="mt-3 text-center">
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  borderRadius: 999,
                  padding: "7px 14px",
                  background: "#1f2937",
                  color: "#f9fafb",
                  border: "1px solid #374151",
                }}
                onClick={() => setShowAllTopLevel((prev) => !prev)}
              >
                {showAllTopLevel
                  ? "Thu gọn bình luận"
                  : `Xem thêm bình luận (${tree.length - INITIAL_TOP_LEVEL_COUNT})`}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CommentList;
