import axiosInstance from "../../../app/axios.js";

export const getPostReactions = async (params = {}) => {
  const { data } = await axiosInstance.get("/post-reactions", { params });
  return data;
};

export const createPostReaction = async (payload) => {
  const { data } = await axiosInstance.post("/post-reactions", payload);
  return data;
};

export const deletePostReaction = async (id) => {
  const { data } = await axiosInstance.delete(`/post-reactions/${id}`);
  return data;
};

export const getCommentReactions = async (params = {}) => {
  const { data } = await axiosInstance.get("/comment-reactions", { params });
  return data;
};

export const createCommentReaction = async (payload) => {
  const { data } = await axiosInstance.post("/comment-reactions", payload);
  return data;
};

export const deleteCommentReaction = async (id) => {
  const { data } = await axiosInstance.delete(`/comment-reactions/${id}`);
  return data;
};
