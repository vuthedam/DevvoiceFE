import { useState } from "react";
import Modal from "../../../../components/Modal";
import Button from "../../../../components/Button";

const REASONS = [
  { value: "spam",           label: "Spam" },
  { value: "harassment",     label: "Quấy rối / Bắt nạt" },
  { value: "hate_speech",    label: "Ngôn từ thù địch" },
  { value: "misinformation", label: "Thông tin sai lệch" },
  { value: "other",          label: "Lý do khác" },
];

const ReportModal = ({ show, title = "Báo cáo vi phạm", submitting, onConfirm, onClose }) => {
  const [reason, setReason]           = useState("");
  const [description, setDescription] = useState("");

  const handleClose = () => {
    setReason("");
    setDescription("");
    onClose();
  };

  const handleConfirm = () => {
    if (!reason) return;
    onConfirm({ reason, description: description.trim() || null });
    setReason("");
    setDescription("");
  };

  return (
    <Modal
      show={show}
      title={title}
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirm} disabled={submitting || !reason}>
            {submitting ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </>
      }
    >
      <div className="mb-3">
        <label className="form-label fw-semibold">
          Lý do <span className="text-danger">*</span>
        </label>
        <div className="d-flex flex-column gap-2">
          {REASONS.map(({ value, label }) => (
            <label key={value} className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
              <input
                type="radio"
                name="report-reason"
                value={value}
                checked={reason === value}
                onChange={() => setReason(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label fw-semibold">
          Mô tả thêm <span className="text-muted fw-normal">(tùy chọn)</span>
        </label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Mô tả chi tiết về vi phạm..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
        />
      </div>
    </Modal>
  );
};

export default ReportModal;
