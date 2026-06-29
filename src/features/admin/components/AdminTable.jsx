import EmptyState from "../../../components/EmptyState";
import Loading from "../../../components/Loading";

const AdminTable = ({ loading, isEmpty, emptyTitle = "Không có dữ liệu", columns, children }) => {
  if (loading) return <Loading text="Đang tải..." />;
  if (isEmpty) return <EmptyState title={emptyTitle} />;

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className ?? ""} style={col.style}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default AdminTable;
