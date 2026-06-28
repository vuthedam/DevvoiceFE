export const getApiErrorMessage = (error, fallback = "Đã xảy ra lỗi") => {
  if (!error.response) {
    if (error.code === "ERR_NETWORK") {
      return "Không kết nối được backend. Kiểm tra server Express đang chạy tại http://localhost:3000";
    }
    return error.message || fallback;
  }

  const { status, data } = error.response;

  if (status === 500) {
    return (
      data?.message ||
      "Lỗi server (500). Kiểm tra cấu hình backend (ví dụ JWT_SECRET trong .env)."
    );
  }

  return data?.message || data?.error || fallback;
};
