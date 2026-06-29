import { useState } from "react";
import PageHeader from "../components/PageHeader";
import Button from "../../../components/Button";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import axiosInstance from "../../../app/axios.js";

const FIELDS = [
  ["Họ tên", "fullName"],
  ["Username", "username"],
  ["Email", "email"],
  ["Vai trò", "role"],
  ["Trạng thái", "status"],
];

const AdminProfile = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fullName: "", avatar: "" });

  const startEdit = () => {
    setForm({ fullName: user?.fullName ?? "", avatar: user?.avatar ?? "" });
    setEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosInstance.patch(`/users/${user._id}`, form);
      await refreshProfile();
      showToast("Cập nhật thành công", "success");
      setEditing(false);
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Hồ sơ Admin" subtitle="Thông tin tài khoản của bạn" />

      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              {/* Avatar */}
              <div className="text-center mb-4">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="rounded-circle border"
                    style={{ width: 80, height: 80, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary text-white fw-bold d-inline-flex align-items-center justify-content-center"
                    style={{ width: 80, height: 80, fontSize: 28 }}
                  >
                    {user?.fullName?.[0]?.toUpperCase() ?? "A"}
                  </div>
                )}
                <div className="mt-2">
                  <span className="badge bg-danger">Admin</span>
                </div>
              </div>

              {editing ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Họ tên</label>
                    <input
                      className="form-control"
                      value={form.fullName}
                      onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Avatar URL</label>
                    <input
                      className="form-control"
                      value={form.avatar}
                      placeholder="https://..."
                      onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                    <Button variant="secondary" onClick={() => setEditing(false)} disabled={submitting}>
                      Hủy
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  {FIELDS.map(([label, key]) => (
                    <div key={key} className="d-flex border-bottom py-2 gap-3">
                      <div className="text-muted small fw-semibold" style={{ minWidth: 110 }}>{label}</div>
                      <div className="small">{user?.[key] ?? "—"}</div>
                    </div>
                  ))}
                  <Button className="mt-4" onClick={startEdit}>Chỉnh sửa</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProfile;
