import AuthorAvatar from "../../../../components/AuthorAvatar";

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

export default AuthorInfo;
