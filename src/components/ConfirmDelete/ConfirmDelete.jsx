import Modal from "../Modal";
import Button from "../Button";

const ConfirmDelete = ({
  show,
  title = "Xác nhận xóa",
  message = "Bạn có chắc chắn muốn xóa? Hành động này không thể hoàn tác.",
  confirmText = "Xóa",
  cancelText = "Hủy",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      show={show}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Đang xóa..." : confirmText}
          </Button>
        </>
      }
    >
      <p className="mb-0">{message}</p>
    </Modal>
  );
};

export default ConfirmDelete;
