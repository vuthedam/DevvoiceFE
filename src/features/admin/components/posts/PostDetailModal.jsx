import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";
import StatusBadge from "../StatusBadge";

const InfoRow = ({ label, children }) => (
  <div className="d-flex gap-3 border-bottom py-2">
    <div className="text-muted small fw-semibold flex-shrink-0" style={{ minWidth: 120 }}>
      {label}
    </div>
    <div className="small">{children ?? <span className="text-muted fst-italic">—</span>}</div>
  </div>
);

const PostDetailModal = ({ post, submitting, onClose, onApprove, onReject, onHide, onRestore, onDelete }) => {
  if (!post) return null;

  const isPending  = post.status === "pending";
  const isApproved = post.status === "approved";
  const isHidden   = post.status === "hidden";
  const isDeleted  = post.status === "deleted";
  const isRejected = post.status === "rejected";

  return (
    <Modal
      show
      title="Chi tiết bài viết"
      onClose={onClose}
      size="lg"
      centered={false}
      footer={
        <div className="d-flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={onClose}>Đóng</Button>

          {isPending && (
            <>
              <Button variant="success" disabled={submitting} onClick={onApprove}>
                ✓ Approve
              </Button>
              <Button variant="danger" disabled={submitting} onClick={onReject}>
                ✗ Reject
              </Button>
            </>
          )}

          {isRejected && (
            <Button variant="success" disabled={submitting} onClick={onApprove}>
              ✓ Approve lại
            </Button>
          )}

          {isApproved && (
            <Button variant="outline-secondary" disabled={submitting} onClick={onHide}>
              🙈 Ẩn
            </Button>
          )}

          {isHidden && (
            <Button variant="outline-success" disabled={submitting} onClick={onRestore}>
              🔁 Khôi phục
            </Button>
          )}

          {!isDeleted && (
            <Button variant="outline-danger" disabled={submitting} onClick={onDelete}>
              🗑 Xóa
            </Button>
          )}
        </div>
      }
    >
      {/* Author */}
      <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded">
        {post.userId?.avatar ? (
          <img
            src={post.userId.avatar}
            alt="avatar"
            className="rounded-circle border flex-shrink-0"
            style={{ width: 44, height: 44, objectFit: "cover" }}
          />
        ) : (
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
            style={{ width: 44, height: 44, fontSize: 16 }}
          >
            {post.userId?.fullName?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <div>
          <div className="fw-semibold">{post.userId?.fullName}</div>
          <div className="text-muted small">@{post.userId?.username}</div>
        </div>
        <div className="ms-auto">
          <StatusBadge value={post.status} />
        </div>
      </div>

      {/* Metadata */}
      <InfoRow label="Tiêu đề">
        <span className="fw-semibold">{post.title}</span>
      </InfoRow>
      <InfoRow label="Ngày tạo">
        {new Date(post.createdAt).toLocaleString("vi-VN")}
      </InfoRow>
      <InfoRow label="Like / Comment / Report">
        <div className="d-flex gap-3">
          <span>❤️ {post.likesCount ?? 0}</span>
          <span>💬 {post.commentsCount ?? 0}</span>
          <span>🚩 {post.reportsCount ?? 0}</span>
        </div>
      </InfoRow>

      {post.approvedBy && (
        <InfoRow label="Người duyệt">
          {post.approvedBy.fullName}
        </InfoRow>
      )}
      {post.approvedAt && (
        <InfoRow label="Ngày duyệt">
          {new Date(post.approvedAt).toLocaleString("vi-VN")}
        </InfoRow>
      )}
      {post.rejectReason && (
        <InfoRow label="Lý do từ chối">
          <span className="text-danger">{post.rejectReason}</span>
        </InfoRow>
      )}
      {post.hiddenReason && (
        <InfoRow label="Lý do ẩn">
          <span className="text-secondary">{post.hiddenReason}</span>
        </InfoRow>
      )}

      {/* Content */}
      <div className="mt-3">
        <div className="text-muted small fw-semibold mb-2">Nội dung</div>
        <div
          className="border rounded p-3 bg-white"
          style={{ whiteSpace: "pre-wrap", maxHeight: 320, overflowY: "auto", lineHeight: 1.7 }}
        >
          {post.content}
        </div>
      </div>
    </Modal>
  );
};

export default PostDetailModal;
