import axiosInstance from "../../../app/axios.js";

export const getPosts = async (params = {}) => {
  const { data } = await axiosInstance.get("/posts", { params });
  return data;
};

export const getPostById = async (id) => {
  const { data } = await axiosInstance.get(`/posts/${id}`);
  return data;
};

export const createPost = async (payload) => {
  const { data } = await axiosInstance.post("/posts", payload);
  return data;
};

export const updatePost = async (id, payload) => {
  const { data } = await axiosInstance.patch(`/posts/${id}`, payload);
  return data;
};

export const deletePost = async (id) => {
  const { data } = await axiosInstance.delete(`/posts/${id}`);
  return data;
};

export const softDeletePost = async (id) => {
  const { data } = await axiosInstance.delete(`/posts/soft-delete/${id}`);
  return data;
};

export const restorePost = async (id) => {
  const { data } = await axiosInstance.patch(`/posts/restore/${id}`);
  return data;
};
