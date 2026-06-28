import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/Button";
import Loading from "../../../components/Loading";
import PostCard from "../components/PostCard.jsx";
import * as postApi from "../api/postApi.js";
import { getApiErrorMessage } from "../../../utils/apiError.js";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await postApi.getPosts({ status: "active" });
        setPosts((response.data || []).slice(0, 3));
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchRecentPosts();
  }, []);

  return (
    <>
      <section className="bg-primary text-white rounded-3 p-4 p-md-5 mb-5">
        <h1 className="display-5 fw-bold">DevVoice</h1>
        <p className="lead mb-3">
          Nền tảng chia sẻ kiến thức lập trình — đăng bài, bình luận và tương
          tác với cộng đồng developer.
        </p>
        <div className="d-flex gap-2 flex-wrap">
          <Link to="/posts">
            <Button variant="light">Xem tất cả bài viết</Button>
          </Link>
          <Link to="/register">
            <Button variant="outline-light">Tham gia ngay</Button>
          </Link>
        </div>
      </section>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Bài viết mới nhất</h2>
        <Link to="/posts" className="text-decoration-none">
          Xem thêm →
        </Link>
      </div>

      {loading && <Loading text="Đang tải bài viết..." />}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && (
        <div className="row g-4">
          {posts.map((post) => (
            <div key={post._id} className="col-md-4">
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default HomePage;
