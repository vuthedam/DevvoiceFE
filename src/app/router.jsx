import { createBrowserRouter, Navigate } from "react-router-dom";
import AppProviders from "./AppProviders.jsx";
import UserLayout from "../layouts/UserLayout.jsx";
import AdminLayout from "../layouts/AdminLayout.jsx";
import ProtectedRoute from "../features/auth/components/ProtectedRoute.jsx";

import HomePage from "../features/posts/pages/HomePage.jsx";
import PostsPage from "../features/posts/pages/PostsPage.jsx";
import PostDetailPage from "../features/posts/pages/PostDetailPage.jsx";
import CreatePostPage from "../features/posts/pages/CreatePostPage.jsx";
import MyPostsPage from "../features/posts/pages/MyPostsPage.jsx";
import Login from "../features/auth/pages/Login.jsx";
import Register from "../features/auth/pages/Register.jsx";
import Profile from "../features/auth/pages/Profile.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";
import ForbiddenPage from "../pages/ForbiddenPage.jsx";

import Dashboard from "../features/admin/pages/Dashboard.jsx";
import AdminUsers from "../features/admin/pages/AdminUsers.jsx";
import AdminPosts from "../features/admin/pages/AdminPosts.jsx";
import AdminPendingPosts from "../features/admin/pages/AdminPendingPosts.jsx";
import AdminComments from "../features/admin/pages/AdminComments.jsx";
import AdminReports from "../features/admin/pages/AdminReports.jsx";
import AdminProfile from "../features/admin/pages/AdminProfile.jsx";

const AdminGuard = ({ children }) => (
  <ProtectedRoute adminOnly>{children}</ProtectedRoute>
);

const router = createBrowserRouter([
  {
    element: <AppProviders />,
    children: [
      // ── User / Public routes (UserLayout) ────────────────────────────────
      {
        path: "/",
        element: <UserLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "posts", element: <PostsPage /> },
          { path: "posts/:id", element: <PostDetailPage /> },
          { path: "login", element: <Login /> },
          { path: "register", element: <Register /> },
          {
            path: "profile",
            element: <ProtectedRoute><Profile /></ProtectedRoute>,
          },
          {
            path: "create-post",
            element: <ProtectedRoute><CreatePostPage /></ProtectedRoute>,
          },
          {
            path: "my-posts",
            element: <ProtectedRoute><MyPostsPage /></ProtectedRoute>,
          },
          { path: "403", element: <ForbiddenPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },

      // ── Admin routes (AdminLayout) ────────────────────────────────────────
      {
        path: "/admin",
        element: (
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        ),
        children: [
          { index: true,     element: <Dashboard /> },
          { path: "users",   element: <AdminUsers /> },
          { path: "posts",   element: <AdminPosts /> },
          { path: "pending", element: <AdminPendingPosts /> },
          { path: "comments",element: <AdminComments /> },
          { path: "reports", element: <AdminReports /> },
          { path: "profile", element: <AdminProfile /> },
          { path: "*",       element: <Navigate to="/admin" replace /> },
        ],
      },
    ],
  },
]);

export default router;
