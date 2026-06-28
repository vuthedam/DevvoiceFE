const Loading = ({ text = "Đang tải...", fullScreen = false }) => {
  const content = (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      {text && <p className="mt-3 text-muted mb-0">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-50">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;
