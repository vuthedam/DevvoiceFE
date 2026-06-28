import { useState } from "react";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";

const PostForm = ({ show, onClose, onSubmit, initialData, loading }) => {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    content: initialData?.content || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Modal
      show={show}
      title={initialData ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Tiêu đề"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <div className="mb-3">
          <label htmlFor="content" className="form-label">
            Nội dung <span className="text-danger">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            className="form-control"
            rows={5}
            value={form.content}
            onChange={handleChange}
            required
          />
        </div>
      </form>
    </Modal>
  );
};

export default PostForm;
