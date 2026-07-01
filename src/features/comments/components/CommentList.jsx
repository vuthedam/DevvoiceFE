import { useMemo } from "react";
import Loading from "../../../components/Loading";
import EmptyState from "../../../components/EmptyState";
import CommentForm from "./CommentForm.jsx";
import CommentItem from "./CommentItem.jsx";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useComments } from "../hooks/useComments.js";

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

  const tree = useMemo(() => buildCommentTree(comments), [comments]);

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
          {tree.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              canDelete={canDelete}
              onDelete={refetch}
              postId={postId}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default CommentList;
