import axiosInstance from "../../../app/axios.js";

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = () => axiosInstance.get("/users").then((r) => r.data);
export const getUserById = (id) => axiosInstance.get(`/users/${id}`).then((r) => r.data);
export const banUser = (id) => axiosInstance.delete(`/users/soft-delete/${id}`).then((r) => r.data);
export const restoreUser = (id) => axiosInstance.patch(`/users/restore/${id}`).then((r) => r.data);
export const deleteUser = (id) => axiosInstance.delete(`/users/${id}`).then((r) => r.data);

// ── Posts ─────────────────────────────────────────────────────────────────────
export const getAdminPosts = (params) => axiosInstance.get("/admin/posts", { params }).then((r) => r.data);
export const getAdminPostStats = () => axiosInstance.get("/admin/posts/stats").then((r) => r.data);
export const getPendingPosts = () => axiosInstance.get("/admin/posts/pending").then((r) => r.data);
export const getRejectedPosts = () => axiosInstance.get("/admin/posts/rejected").then((r) => r.data);
export const approvePost = (id) => axiosInstance.patch(`/admin/posts/${id}/approve`).then((r) => r.data);
export const rejectPost = (id, payload) => axiosInstance.patch(`/admin/posts/${id}/reject`, payload).then((r) => r.data);
export const hidePost = (id, payload) => axiosInstance.patch(`/admin/posts/${id}/hide`, payload).then((r) => r.data);
export const restorePost = (id) => axiosInstance.patch(`/admin/posts/${id}/restore`).then((r) => r.data);
export const deletePost = (id) => axiosInstance.delete(`/admin/posts/${id}`).then((r) => r.data);

// ── Comments ──────────────────────────────────────────────────────────────────
export const getAdminComments = (params) => axiosInstance.get("/comments/admin/all", { params }).then((r) => r.data);
export const hideComment = (id, payload) => axiosInstance.patch(`/comments/admin/${id}/hide`, payload).then((r) => r.data);
export const restoreComment = (id) => axiosInstance.patch(`/comments/admin/${id}/restore`).then((r) => r.data);
export const deleteComment = (id) => axiosInstance.delete(`/comments/admin/${id}`).then((r) => r.data);

// ── Reports ───────────────────────────────────────────────────────────────────
export const getAdminReports = (params) => axiosInstance.get("/admin/reports", { params }).then((r) => r.data);
export const getReportDetail = (id) => axiosInstance.get(`/admin/reports/${id}`).then((r) => r.data);
export const getReportStats = () => axiosInstance.get("/admin/reports/stats").then((r) => r.data);
export const resolveReport = (id) => axiosInstance.patch(`/admin/reports/${id}/resolve`).then((r) => r.data);
export const rejectReport = (id) => axiosInstance.patch(`/admin/reports/${id}/reject`).then((r) => r.data);
