import { useState } from "react";
import Modal from "../../../../components/Modal";
import StatusBadge from "../StatusBadge";
import * as adminApi from "../../api/adminApi.js";
import { useToast } from "../../../../components/Toast";
import { getApiErrorMessage } from "../../../../utils/apiError.js";

const REASON_LABEL = {
  spam: "Spam",
  harassment: "Quấy rối",
  hate_speech: "Ngôn từ thù địch",
  misinformation: "Sai thông tin",
  other: "Khác",
};

const ReportBadge = ({ count, postId }) => {
  const { showToast } = useToast();
  const [show, setShow] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = async (e) => {
    e.stopPropagation();
    if (count === 0) return;
    setShow(true);
    setLoading(true);
    try {
      const res = await adminApi.getPostReports(postId);
      setReports(res.data ?? []);
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <span
        onClick={handleOpen}
        className={`badge ${count > 0 ? "bg-danger" : "bg-secondary"}`}
        style={{ cursor: count > 0 ? "pointer" : "default" }}
        title={count > 0 ? "Xem danh sách report" : "Chưa có report"}
      >
        🚩 {count ?? 0}
      </span>

      <Modal
        show={show}
        title={`Danh sách Reports (${reports.length})`}
        onClose={() => setShow(false)}
        size="lg"
      >
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" />
            <p className="text-muted small mt-2 mb-0">Đang tải...</p>
          </div>
        ) : reports.length === 0 ? (
          <p className="text-muted text-center py-3 mb-0">Không có report nào.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Người report</th>
                  <th>Lý do</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="small fw-semibold">{r.reporterId?.fullName ?? "—"}</div>
                      <div className="text-muted" style={{ fontSize: 11 }}>
                        @{r.reporterId?.username}
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-warning text-dark">
                        {REASON_LABEL[r.reason] ?? r.reason}
                      </span>
                    </td>
                    <td className="text-muted small" style={{ maxWidth: 200 }}>
                      {r.description ?? <span className="fst-italic">Không có</span>}
                    </td>
                    <td><StatusBadge value={r.status} /></td>
                    <td className="text-muted small">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ReportBadge;
