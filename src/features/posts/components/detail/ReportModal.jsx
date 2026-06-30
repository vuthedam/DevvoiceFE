import { useState } from "react";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";

const REASONS = [
  { value: "spam",           label: "🗑 Spam" },
  { value: "harassment",     label: "😡 Quấy rối / Bắt nạt" },
  { value: "hate_speech",    label: "⚠️ Ngôn từ thù địch" },
  { value: "misinformation", label: "❌ Thông tin sai lệch" },
  { value: "other",          label: "📋 Lý do khác" },
];

const ReportModal = ({
  show,
  title = "Báo cáo vi phạm",
  submitting,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason]           = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setReason("");
    setDescription("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleConfirm = () => {
    if (!reason || submitting) return;
    onConfirm({ reason, description: description.trim() || null });
    // không reset ở đây — chờ onClose từ parent sau khi API xong
  };

  return (
    <Modal
      show={show}
      title={title}
      onClose={handleClose}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={submitting || !reason}
          >
            {submitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Đang gửi...
              </>
            ) : (
              "Gửi báo cáo"
            )}
          </Button>
        </>
      }
    >
      {/* Reason */}
      <div className="mb-4">
        <label className="form-label fw-semibold">
          Lý do <span className="text-danger">*</span>
        </label>
        <div className="d-flex flex-column gap-2">
          {REASONS.map(({ value, label }) => (
            <label
              key={value}
              className={`d-flex align-items-center gap-3 p-2 rounded border ${
                reason === value
                  ? "border-danger bg-danger bg-opacity-10"
                  : "border-light"
              }`}
              style={{ cursor: "pointer", transition: "all .15s" }}
            >
              <input
                type="radio"
                name="report-reason"
                value={value}
                checked={reason === value}
                onChange={() => setReason(value)}
                className="form-check-input mt-0 flex-shrink-0"
              />
              <span style={{ fontSize: 14 }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="form-label fw-semibold">
          Mô tả thêm{" "}
          <span className="text-muted fw-normal small">(không bắt buộc)</span>
        </label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Mô tả chi tiết về vi phạm để Admin xem xét..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
          style={{ resize: "none" }}
        />
        <div className="form-text text-end">{description.length}/1000</div>
      </div>
    </Modal>
  );
};

export default ReportModal;
