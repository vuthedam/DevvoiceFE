import StatusBadge from "../StatusBadge";
import Button from "../../../../components/Button";
import ReportBadge from "./ReportBadge";

const PostRow = ({ post, submitting, onView, onApprove, onReject, onHide, onRestore, onDelete }) => {
  const { status } = post;

  return (
    <tr>
      {/* Tiêu đề */}
      <td style={{ maxWidth: 220 }}>
        <button
          className="btn btn-link p-0 text-start fw-semibold text-truncate d-block text-dark"
          style={{ maxWidth: "100%" }}
          title={post.title}
          onClick={onView}
        >
          {post.title}
        </button>
        {post.rejectReason && (
          <div className="text-danger mt-1" style={{ fontSize: 11 }}>
            ✗ {post.rejectReason}
          </div>
        )}
      </td>

      {/* Tác giả */}
      <td>
        <div className="small fw-semibold">{post.userId?.fullName}</div>
        <div className="text-muted" style={{ fontSize: 11 }}>@{post.userId?.username}</div>
      </td>

      {/* Trạng thái */}
      <td><StatusBadge value={status} /></td>

      {/* Likes */}
      <td className="text-center">
        <span className="text-muted small">❤️ {post.likesCount ?? 0}</span>
      </td>

      {/* Comments */}
      <td className="text-center">
        <span className="text-muted small">💬 {post.commentsCount ?? 0}</span>
      </td>

      {/* Reports */}
      <td className="text-center">
        <ReportBadge count={post.reportsCount ?? 0} postId={post._id} />
      </td>

      {/* Ngày tạo */}
      <td className="text-muted small">
        {new Date(post.createdAt).toLocaleDateString("vi-VN")}
      </td>

      {/* Thao tác */}
      <td className="text-end" style={{ minWidth: 180 }}>
        <div className="d-flex gap-1 justify-content-end flex-wrap">
          <Button variant="outline-primary" size="sm" onClick={onView}>
            Xem
          </Button>

          {status === "pending" && (
            <>
              <Button variant="success" size="sm" disabled={submitting} onClick={onApprove}>
                Duyệt
              </Button>
              <Button variant="danger" size="sm" onClick={onReject}>
                Từ chối
              </Button>
            </>
          )}

          {status === "rejected" && (
            <Button variant="outline-success" size="sm" disabled={submitting} onClick={onApprove}>
              Duyệt lại
            </Button>
          )}

          {status === "approved" && (
            <Button variant="outline-secondary" size="sm" disabled={submitting} onClick={onHide}>
              Ẩn
            </Button>
          )}

          {status === "hidden" && (
            <Button variant="outline-success" size="sm" disabled={submitting} onClick={onRestore}>
              Khôi phục
            </Button>
          )}

          {status !== "deleted" && (
            <Button variant="outline-danger" size="sm" onClick={onDelete}>
              Xóa
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PostRow;
