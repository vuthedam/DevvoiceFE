const STATUS_OPTIONS = [
  { value: "all",      label: "Tất cả" },
  { value: "pending",  label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "hidden",   label: "Hidden" },
  { value: "deleted",  label: "Deleted" },
];

const DATE_OPTIONS = [
  { value: "all",   label: "Mọi thời gian" },
  { value: "today", label: "Hôm nay" },
  { value: "week",  label: "Tuần này" },
  { value: "month", label: "Tháng này" },
];

const FilterBar = ({ activeStatus, activeDateRange, onStatusChange, onDateRangeChange }) => (
  <div className="d-flex flex-wrap gap-3 align-items-center mb-3">
    {/* Status tabs */}
    <div className="d-flex flex-wrap gap-1">
      {STATUS_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onStatusChange(value)}
          className={`btn btn-sm ${activeStatus === value ? "btn-primary" : "btn-outline-secondary"}`}
        >
          {label}
        </button>
      ))}
    </div>

    {/* Divider */}
    <div className="vr d-none d-md-block" />

    {/* Date range */}
    <div className="d-flex flex-wrap gap-1">
      {DATE_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onDateRangeChange(value)}
          className={`btn btn-sm ${activeDateRange === value ? "btn-info text-white" : "btn-outline-secondary"}`}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

export default FilterBar;
