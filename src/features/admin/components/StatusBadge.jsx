const STATUS_MAP = {
  // post
  pending:  { label: "Chờ duyệt",  cls: "bg-warning text-dark" },
  approved: { label: "Đã duyệt",   cls: "bg-success" },
  rejected: { label: "Từ chối",    cls: "bg-danger" },
  hidden:   { label: "Đã ẩn",      cls: "bg-secondary" },
  deleted:  { label: "Đã xóa",     cls: "bg-dark" },
  // user
  active:   { label: "Hoạt động",  cls: "bg-success" },
  banned:   { label: "Bị khóa",    cls: "bg-danger" },
  // report
  resolved: { label: "Đã xử lý",  cls: "bg-success" },
  // role
  admin:    { label: "Admin",      cls: "bg-danger" },
  user:     { label: "User",       cls: "bg-secondary" },
};

const StatusBadge = ({ value }) => {
  const { label, cls } = STATUS_MAP[value] ?? { label: value, cls: "bg-secondary" };
  return <span className={`badge ${cls}`}>{label}</span>;
};

export default StatusBadge;
