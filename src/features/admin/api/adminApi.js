import axiosInstance from "../../../app/axios.js";

export const getUsers = async () => {
  const { data } = await axiosInstance.get("/users");
  return data;
};

export const getUserById = async (id) => {
  const { data } = await axiosInstance.get(`/users/${id}`);
  return data;
};

export const updateUser = async (id, payload) => {
  const { data } = await axiosInstance.patch(`/users/${id}`, payload);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await axiosInstance.delete(`/users/${id}`);
  return data;
};

export const banUser = async (id) => {
  const { data } = await axiosInstance.delete(`/users/soft-delete/${id}`);
  return data;
};

export const restoreUser = async (id) => {
  const { data } = await axiosInstance.patch(`/users/restore/${id}`);
  return data;
};

export const createUser = async (payload) => {
  const { data } = await axiosInstance.post("/users", payload);
  return data;
};
