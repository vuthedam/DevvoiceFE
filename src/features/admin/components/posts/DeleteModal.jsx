import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";

const DeleteModal = ({ show, post, submitting, onConfirm, onClose }) => (
  <Modal
    show={show}
    title="Xóa bài viết"
    onClose={onClose}
    footer={
      <>
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Hủy
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={submitting}>
          {submitting ? "Đang xóa..." : "Xóa"}
        </Button>
      </>
    }
  >
    <p className="mb-2">Bạn có chắc muốn xóa bài viết này?</p>
    {post && (
      <div className="bg-light rounded p-2">
        <div className="fw-semibold text-truncate">{post.title}</div>
        <div className="text-muted small">bởi {post.userId?.fullName}</div>
      </div>
    )}
    <p className="text-danger small mt-2 mb-0">⚠️ Hành động này không thể hoàn tác.</p>
  </Modal>
);

export default DeleteModal;
