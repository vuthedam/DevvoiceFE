const Footer = () => (
  <footer className="border-top py-4 mt-auto" style={{ background: "#f8f9fa" }}>
    <div className="container">
      <div className="row align-items-center g-3">
        <div className="col-md-4">
          <span className="fw-bold text-dark">⚡ DevVoice</span>
          <p className="text-muted small mb-0 mt-1">
            Nền tảng chia sẻ kiến thức lập trình
          </p>
        </div>
        <div className="col-md-4 text-md-center">
          <div className="d-flex justify-content-md-center gap-3">
            <a href="/" className="text-muted text-decoration-none small">Trang chủ</a>
            <a href="/posts" className="text-muted text-decoration-none small">Bài viết</a>
            <a href="/register" className="text-muted text-decoration-none small">Đăng ký</a>
          </div>
        </div>
        <div className="col-md-4 text-md-end">
          <p className="text-muted small mb-0">
            © {new Date().getFullYear()} DevVoice — MERN Stack
          </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
