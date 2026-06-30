import axiosInstance from "../../../app/axios.js";

export const reportPost = async (postId, payload) => {
  const { data } = await axiosInstance.post(`/reports/post/${postId}`, payload);
  return data;
};

export const reportComment = async (commentId, payload) => {
  const { data } = await axiosInstance.post(`/reports/comment/${commentId}`, payload);
  return data;
};
