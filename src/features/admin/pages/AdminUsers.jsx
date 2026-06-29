import { useEffect, useMemo, useState } from "react";
import AdminTable from "../components/AdminTable";
import StatusBadge from "../components/StatusBadge";
import PageHeader from "../components/PageHeader";
import SearchBar from "../../../components/SearchBar";
import Pagination from "../../../components/Pagination";
import Button from "../../../components/Button";
import ConfirmDelete from "../../../components/ConfirmDelete";
import { useToast } from "../../../components/Toast";
import { getApiErrorMessage } from "../../../utils/apiError.js";
import { filterBySearch, getTotalPages, paginateItems } from "../../../utils/pagination.js";
import * as adminApi from "../api/adminApi.js";

const PAGE_SIZE = 10;

const COLUMNS = [
  { key: "name",   label: "Họ tên" },
  { key: "user",   label: "Username" },
  { key: "email",  label: "Email" },
  { key: "role",   label: "Role" },
  { key: "status", label: "Trạng thái" },
  { key: "action", label: "Thao tác", className: "text-end" },
];

const AdminUsers = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState({ user: null, type: null });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data ?? []);
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(
    () => filterBySearch(users, search, ["fullName", "username", "email", "role", "status"]),
    [users, search]
  );
  const totalPages = getTotalPages(filtered.length, PAGE_SIZE);
  const paginated = paginateItems(filtered, page, PAGE_SIZE);

  const openDialog = (user, type) => setDialog({ user, type });
  const closeDialog = () => setDialog({ user: null, type: null });

  const handleConfirm = async () => {
    const { user, type } = dialog;
    setSubmitting(true);
    try {
      const fn = type === "ban" ? adminApi.banUser : type === "restore" ? adminApi.restoreUser : adminApi.deleteUser;
      const res = await fn(user._id);
      showToast(res?.message ?? "Thành công", "success");
      fetchUsers();
    } catch (err) {
      showToast(getApiErrorMessage(err), "danger");
    } finally {
      setSubmitting(false);
      closeDialog();
    }
  };

  const confirmMsg = () => {
    const name = dialog.user?.fullName;
    if (dialog.type === "ban")     return `Khóa tài khoản "${name}"?`;
    if (dialog.type === "restore") return `Mở khóa tài khoản "${name}"?`;
    return `Xóa vĩnh viễn tài khoản "${name}"?`;
  };

  return (
    <>
      <PageHeader title="Quản lý người dùng" subtitle="Danh sách tất cả tài khoản trong hệ thống" />

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setPage(1); }}
            placeholder="Tìm theo tên, email, role..."
            className="mb-3"
          />

          <AdminTable
            loading={loading}
            isEmpty={!loading && paginated.length === 0}
            emptyTitle="Không có người dùng nào"
            columns={COLUMNS}
          >
            {paginated.map((u) => (
              <tr key={u._id}>
                <td className="fw-semibold">{u.fullName}</td>
                <td className="text-muted">@{u.username}</td>
                <td>{u.email}</td>
                <td><StatusBadge value={u.role} /></td>
                <td><StatusBadge value={u.status} /></td>
                <td className="text-end">
                  <div className="d-flex gap-1 justify-content-end flex-wrap">
                    {u.status === "active" ? (
                      <Button variant="outline-warning" size="sm" onClick={() => openDialog(u, "ban")}>
                        Khóa
                      </Button>
                    ) : (
                      <Button variant="outline-success" size="sm" onClick={() => openDialog(u, "restore")}>
                        Mở khóa
                      </Button>
                    )}
                    <Button variant="outline-danger" size="sm" onClick={() => openDialog(u, "delete")}>
                      Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>

          <div className="mt-3">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>

      <ConfirmDelete
        show={!!dialog.user}
        title="Xác nhận"
        message={confirmMsg()}
        loading={submitting}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </>
  );
};

export default AdminUsers;
