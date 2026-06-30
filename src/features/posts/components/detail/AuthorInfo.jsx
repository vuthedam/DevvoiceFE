const AuthorAvatar = ({ user, size = 44 }) => {
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.fullName}
        className="rounded-circle object-fit-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {user?.fullName?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
};

const AuthorInfo = ({ user, date, size = 44 }) => (
  <div className="d-flex align-items-center gap-3">
    <AuthorAvatar user={user} size={size} />
    <div>
      <div className="fw-semibold text-dark lh-1" style={{ fontSize: 15 }}>
        {user?.fullName ?? "Ẩn danh"}
      </div>
      <div className="text-muted mt-1" style={{ fontSize: 13 }}>
        @{user?.username ?? "unknown"}
        {date && (
          <>
            {" · "}
            {new Date(date).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </>
        )}
      </div>
    </div>
  </div>
);

export { AuthorAvatar };
export default AuthorInfo;
