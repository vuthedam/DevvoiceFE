import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";

const ApproveModal = ({ show, post, submitting, onConfirm, onClose }) => (
  <Modal
    show={show}
    title="Duyệt bài viết"
    onClose={onClose}
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button variant="success" onClick={onConfirm} disabled={submitting}>
          {submitting ? "Đang xử lý..." : "Approve"}
        </Button>
      </>
    }
  >
    <p className="mb-1">Bạn có chắc muốn duyệt bài viết này?</p>
    {post && (
      <div className="bg-light rounded p-2 mt-2">
        <div className="fw-semibold text-truncate">{post.title}</div>
        <div className="text-muted small">bởi {post.userId?.fullName}</div>
      </div>
    )}
  </Modal>
);

export default ApproveModal;
