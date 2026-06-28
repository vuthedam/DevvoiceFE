import axiosInstance from "../../../app/axios.js";

export const getComments = async (params = {}) => {
  const { data } = await axiosInstance.get("/comments", { params });
  return data;
};

export const getCommentById = async (id) => {
  const { data } = await axiosInstance.get(`/comments/${id}`);
  return data;
};

export const createComment = async (payload) => {
  const { data } = await axiosInstance.post("/comments", payload);
  return data;
};

export const updateComment = async (id, payload) => {
  const { data } = await axiosInstance.patch(`/comments/${id}`, payload);
  return data;
};

export const deleteComment = async (id) => {
  const { data } = await axiosInstance.delete(`/comments/${id}`);
  return data;
};

export const softDeleteComment = async (id) => {
  const { data } = await axiosInstance.delete(`/comments/soft-delete/${id}`);
  return data;
};

export const restoreComment = async (id) => {
  const { data } = await axiosInstance.patch(`/comments/restore/${id}`);
  return data;
};
