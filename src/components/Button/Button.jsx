const Button = ({
  children,
  type = "button",
  variant = "primary",
  size,
  className = "",
  disabled = false,
  onClick,
  ...rest
}) => {
  const sizeClass = size ? `btn-${size}` : "";
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${sizeClass} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
