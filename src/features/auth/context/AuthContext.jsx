import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { setUnauthorizedHandler } from "../../../app/axios.js";
import {
  clearAuthStorage,
  getAccessToken,
  getStoredUser,
  setAuthStorage,
} from "../../../utils/storage.js";
import { isTokenExpired } from "../../../utils/jwt.js";
import * as authApi from "../api/authApi.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    clearAuthStorage();
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  }, [navigate]);

  const login = useCallback(
    async (credentials) => {
      const response = await authApi.login({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      });
      const { accessToken, refreshToken, data: userData } = response;

      if (!accessToken || !userData) {
        throw new Error("Phản hồi đăng nhập không hợp lệ từ server");
      }

      setAuthStorage({ accessToken, refreshToken, user: userData });
      setUser(userData);
      setIsAuthenticated(true);
      navigate("/");
      return response;
    },
    [navigate]
  );

  const register = useCallback(async (userData) => {
    return authApi.register(userData);
  }, []);

  const refreshProfile = useCallback(async () => {
    const storedUser = getStoredUser();
    if (!storedUser?._id) return null;

    const response = await authApi.getProfile(storedUser._id);
    if (response.success && response.data) {
      setAuthStorage({
        accessToken: getAccessToken(),
        refreshToken: null,
        user: response.data,
      });
      setUser(response.data);
    }
    return response.data;
  }, []);

  useEffect(() => {
    const initAuth = () => {
      const token = getAccessToken();
      const storedUser = getStoredUser();

      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

      if (isTokenExpired(token)) {
        clearAuthStorage();
        setLoading(false);
        return;
      }

      setUser(storedUser);
      setIsAuthenticated(true);
      setLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      login,
      logout,
      register,
      refreshProfile,
      isAdmin: user?.role === "admin",
    }),
    [user, isAuthenticated, loading, login, logout, register, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
