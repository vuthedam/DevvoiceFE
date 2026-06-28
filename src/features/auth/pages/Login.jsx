import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { useAuth } from "../hooks/useAuth.js";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email) nextErrors.email = "Email là bắt buộc";
    if (!form.password) nextErrors.password = "Mật khẩu là bắt buộc";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await login(form);
      showToast(response.message || "Đăng nhập thành công", "success");
    } catch (error) {
      showToast(getApiErrorMessage(error, "Đăng nhập thất bại"), "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h2 className="card-title text-center mb-4">Đăng nhập</h2>
            <form onSubmit={handleSubmit} noValidate>
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
              <Button
                type="submit"
                className="w-100"
                disabled={submitting}
              >
                {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>
            </form>
            <p className="text-center mt-3 mb-0">
              Chưa có tài khoản?{" "}
              <Link to="/register">Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
