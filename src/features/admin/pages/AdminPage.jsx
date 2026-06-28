import { useEffect, useMemo, useState } from "react";
import Loading from "../../../components/Loading";
import EmptyState from "../../../components/EmptyState";
import SearchBar from "../../../components/SearchBar";
import Pagination from "../../../components/Pagination";
import Button from "../../../components/Button";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import {
  filterBySearch,
  getTotalPages,
  paginateItems,
} from "../../../utils/pagination.js";
import * as adminApi from "../api/adminApi.js";

const PAGE_SIZE = 8;

const AdminPage = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionUser, setActionUser] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      showToast(getApiErrorMessage(error), "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(
    () =>
      filterBySearch(users, search, [
        "fullName",
        "username",
        "email",
        "role",
        "status",
      ]),
    [users, search]
  );

  const totalPages = getTotalPages(filteredUsers.length, PAGE_SIZE);
  const paginatedUsers = paginateItems(filteredUsers, page, PAGE_SIZE);

  const handleConfirm = async () => {
    if (!actionUser) return;
    setSubmitting(true);
    try {
      let response;
      if (actionType === "ban") {
        response = await adminApi.banUser(actionUser._id);
      } else if (actionType === "restore") {
        response = await adminApi.restoreUser(actionUser._id);
      } else if (actionType === "delete") {
        response = await adminApi.deleteUser(actionUser._id);
      }
      showToast(response?.message || "Thao tác thành công", "success");
      fetchUsers();
    } catch (error) {
      showToast(getApiErrorMessage(error), "danger");
    } finally {
      setSubmitting(false);
      setActionUser(null);
      setActionType(null);
    }
  };

  const getConfirmMessage = () => {
    if (actionType === "ban") return `Khóa tài khoản ${actionUser?.fullName}?`;
    if (actionType === "restore") return `Mở khóa ${actionUser?.fullName}?`;
    return `Xóa vĩnh viễn ${actionUser?.fullName}?`;
  };

  if (loading) return <Loading text="Đang tải danh sách người dùng..." />;

  return (
    <>
      <div className="mb-4">
        <h1>Quản trị người dùng</h1>
        <p className="text-muted mb-0">Quản lý tài khoản trong hệ thống</p>
      </div>

      <SearchBar
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        placeholder="Tìm theo tên, email, role..."
        className="mb-4"
      />

      {paginatedUsers.length === 0 ? (
        <EmptyState title="Không có người dùng" />
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Họ tên</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.fullName}</td>
                    <td>@{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`badge ${u.role === "admin" ? "bg-danger" : "bg-secondary"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${u.status === "active" ? "bg-success" : "bg-warning text-dark"}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-1 justify-content-end flex-wrap">
                        {u.status === "active" ? (
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => {
                              setActionUser(u);
                              setActionType("ban");
                            }}
                          >
                            Khóa
                          </Button>
                        ) : (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => {
                              setActionUser(u);
                              setActionType("restore");
                            }}
                          >
                            Mở khóa
                          </Button>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => {
                            setActionUser(u);
                            setActionType("delete");
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <ConfirmDelete
        show={!!actionUser}
        title="Xác nhận"
        message={getConfirmMessage()}
        loading={submitting}
        onConfirm={handleConfirm}
        onCancel={() => {
          setActionUser(null);
          setActionType(null);
        }}
      />
    </>
  );
};

export default AdminPage;
