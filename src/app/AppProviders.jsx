import { Outlet } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthContext.jsx";
import { ToastProvider } from "../components/Toast";

const AppProviders = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ToastProvider>
  );
};

export default AppProviders;
