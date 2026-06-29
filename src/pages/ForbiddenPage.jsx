import { Link } from "react-router-dom";
import Button from "../components/Button";

const ForbiddenPage = () => (
  <div className="text-center py-5">
    <div className="display-1 text-danger mb-2">403</div>
    <h2 className="mb-2">Không có quyền truy cập</h2>
    <p className="text-muted mb-4">Trang này chỉ dành cho Admin.</p>
    <Link to="/">
      <Button>Về trang chủ</Button>
    </Link>
  </div>
);

export default ForbiddenPage;
