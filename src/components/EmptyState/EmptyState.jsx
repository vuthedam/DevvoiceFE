const EmptyState = ({ title = "Không có dữ liệu", description, action }) => {
  return (
    <div className="text-center py-5">
      <div className="display-6 text-muted mb-2">📭</div>
      <h5 className="text-muted">{title}</h5>
      {description && <p className="text-secondary">{description}</p>}
      {action}
    </div>
  );
};

export default EmptyState;
