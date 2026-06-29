const StatCard = ({ label, value, icon, color = "primary", onClick }) => (
  <div
    className={`card border-0 shadow-sm h-100 ${onClick ? "cursor-pointer" : ""}`}
    style={{ cursor: onClick ? "pointer" : "default" }}
    onClick={onClick}
  >
    <div className="card-body d-flex align-items-center gap-3">
      <div className={`fs-2 text-${color}`}>{icon}</div>
      <div>
        <div className="fw-bold fs-4 lh-1">{value ?? "—"}</div>
        <div className="text-muted small mt-1">{label}</div>
      </div>
    </div>
  </div>
);

export default StatCard;
