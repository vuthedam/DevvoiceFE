import Button from "../Button";

const Modal = ({
  show,
  title,
  children,
  onClose,
  footer,
  size,
  centered = true,
}) => {
  if (!show) return null;

  const dialogClass = size ? `modal-${size}` : "";

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div
          className={`modal-dialog ${centered ? "modal-dialog-centered" : ""} ${dialogClass}`}
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>
            <div className="modal-body">{children}</div>
            {footer !== undefined ? (
              <div className="modal-footer">{footer}</div>
            ) : (
              <div className="modal-footer">
                <Button variant="secondary" onClick={onClose}>
                  Đóng
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

export default Modal;
