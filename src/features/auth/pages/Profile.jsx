import { useEffect, useState } from "react";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Loading from "../../../components/Loading";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import * as authApi from "../api/authApi.js";

const Profile = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    avatar: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await refreshProfile();
        if (profile) {
          setForm({
            fullName: profile.fullName || "",
            username: profile.username || "",
            email: profile.email || "",
            avatar: profile.avatar || "",
            password: "",
          });
        }
      } catch (error) {
        showToast(getApiErrorMessage(error), "danger");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [refreshProfile, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?._id) return;

    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName,
        username: form.username.toLowerCase(),
        email: form.email.toLowerCase(),
        avatar: form.avatar || null,
      };
      if (form.password) payload.password = form.password;

      const response = await authApi.updateProfile(user._id, payload);
      showToast(response.message || "Cập nhật thành công", "success");
      await refreshProfile();
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (error) {
      showToast(getApiErrorMessage(error), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Đang tải hồ sơ..." />;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h2 className="mb-1">Hồ sơ cá nhân</h2>
            <p className="text-muted mb-4">
              Vai trò: <span className="badge bg-secondary">{user?.role}</span>{" "}
              | Trạng thái:{" "}
              <span className="badge bg-info">{user?.status}</span>
            </p>
            <form onSubmit={handleSubmit}>
              <Input
                label="Họ và tên"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
              />
              <Input
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Avatar URL"
                name="avatar"
                value={form.avatar}
                onChange={handleChange}
              />
              <Input
                label="Mật khẩu mới"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Để trống nếu không đổi"
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
