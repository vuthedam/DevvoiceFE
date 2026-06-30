const AuthorAvatar = ({ user, size = 40 }) => {
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user?.fullName ?? "avatar"}
        className="rounded-circle object-fit-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: Math.floor(size * 0.38) }}
    >
      {user?.fullName?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
};

export default AuthorAvatar;
