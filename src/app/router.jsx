import { createBrowserRouter } from "react-router-dom";
import AppProviders from "./AppProviders.jsx";
import MainLayout from "../layouts/MainLayout.jsx";
import ProtectedRoute from "../features/auth/components/ProtectedRoute.jsx";
import HomePage from "../features/posts/pages/HomePage.jsx";
import PostsPage from "../features/posts/pages/PostsPage.jsx";
import PostDetailPage from "../features/posts/pages/PostDetailPage.jsx";
import Login from "../features/auth/pages/Login.jsx";
import Register from "../features/auth/pages/Register.jsx";
import Profile from "../features/auth/pages/Profile.jsx";
import AdminPage from "../features/admin/pages/AdminPage.jsx";
import NotFoundPage from "../pages/NotFoundPage.jsx";

const router = createBrowserRouter([
  {
    element: <AppProviders />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "posts", element: <PostsPage /> },
          { path: "posts/:id", element: <PostDetailPage /> },
          { path: "login", element: <Login /> },
          { path: "register", element: <Register /> },
          {
            path: "profile",
            element: (
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            ),
          },
          {
            path: "admin",
            element: (
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            ),
          },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

export default router;
