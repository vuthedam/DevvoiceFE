import { Link } from "react-router-dom";
import Button from "../components/Button";

const NotFoundPage = () => {
  return (
    <div className="text-center py-5">
      <h1 className="display-1 text-muted">404</h1>
      <h2 className="mb-3">Trang không tồn tại</h2>
      <p className="text-muted mb-4">
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
      </p>
      <Link to="/">
        <Button>Về trang chủ</Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
