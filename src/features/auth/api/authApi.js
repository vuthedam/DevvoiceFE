import axiosInstance from "../../../app/axios.js";

export const login = async (credentials) => {
  const { data } = await axiosInstance.post("/auth/login", credentials);
  return data;
};

export const register = async (userData) => {
  const { data } = await axiosInstance.post("/auth/register", userData);
  return data;
};

export const getProfile = async (userId) => {
  const { data } = await axiosInstance.get(`/users/${userId}`);
  return data;
};

export const updateProfile = async (userId, payload) => {
  const { data } = await axiosInstance.patch(`/users/${userId}`, payload);
  return data;
};
