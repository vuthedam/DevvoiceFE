import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";

const Register = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Họ tên là bắt buộc";
    if (!form.username.trim()) nextErrors.username = "Username là bắt buộc";
    if (!form.email.trim()) nextErrors.email = "Email là bắt buộc";
    if (!form.password) nextErrors.password = "Mật khẩu là bắt buộc";
    else if (form.password.length < 6)
      nextErrors.password = "Mật khẩu tối thiểu 6 ký tự";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await register({
        ...form,
        username: form.username.toLowerCase(),
        email: form.email.toLowerCase(),
      });
      showToast(response.message || "Đăng ký thành công", "success");
      navigate("/login");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Đăng ký thất bại"), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-7 col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h2 className="card-title text-center mb-4">Đăng ký</h2>
            <form onSubmit={handleSubmit} noValidate>
              <Input
                label="Họ và tên"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                error={errors.fullName}
                required
              />
              <Input
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                error={errors.username}
                placeholder="chỉ chữ thường, số và _"
                required
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
              <Input
                label="Mật khẩu"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                required
              />
              <Button type="submit" className="w-100" disabled={submitting}>
                {submitting ? "Đang đăng ký..." : "Đăng ký"}
              </Button>
            </form>
            <p className="text-center mt-3 mb-0">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
