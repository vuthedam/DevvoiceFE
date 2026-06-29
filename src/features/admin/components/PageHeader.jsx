const PageHeader = ({ title, subtitle, action }) => (
  <div className="d-flex align-items-start justify-content-between mb-4 gap-3 flex-wrap">
    <div>
      <h4 className="fw-bold mb-1">{title}</h4>
      {subtitle && <p className="text-muted mb-0 small">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default PageHeader;
