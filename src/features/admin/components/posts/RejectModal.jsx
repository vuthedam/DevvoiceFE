import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";

const RejectModal = ({ show, reason, submitting, onChange, onConfirm, onClose }) => {
  const isValid = reason.trim().length > 0;

  return (
    <Modal
      show={show}
      title="Từ chối bài viết"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={submitting || !isValid}>
            {submitting ? "Đang xử lý..." : "Từ chối"}
          </Button>
        </>
      }
    >
      <label className="form-label fw-semibold">
        Lý do từ chối <span className="text-danger">*</span>
      </label>
      <textarea
        className={`form-control ${!isValid && reason.length > 0 ? "is-invalid" : ""}`}
        rows={4}
        placeholder="Mô tả lý do từ chối bài viết này..."
        value={reason}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
      {!isValid && reason.length === 0 && (
        <div className="form-text text-danger">Vui lòng nhập lý do từ chối.</div>
      )}
    </Modal>
  );
};

export default RejectModal;
