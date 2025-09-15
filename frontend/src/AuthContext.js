import React, { createContext, useState, useEffect, useMemo } from 'react'; // Nhập React và hook

// Hàm kiểm tra xác thực (thay cho isAdminAuthenticated)
const isAdminAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) return false;
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.payload.exp > currentTime; // Kiểm tra thời gian hết hạn
  } catch (e) {
    return false;
  }
};

// Hàm lưu session (thay cho saveAdminSession)
export const saveAdminSession = (response) => {
  localStorage.setItem('adminToken', response.token);
  localStorage.setItem('adminInfo', JSON.stringify(response.adminInfo));
};

// Tạo context cho trạng thái đăng nhập
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // State toàn cục

  useEffect(() => {
    const token = localStorage.getItem('adminToken'); // Lấy token từ localStorage
    console.log('Kiểm tra token toàn cục khi mount: - AuthContext.js:30', token); // Debug
    setIsAuthenticated(isAdminAuthenticated()); // Cập nhật trạng thái ban đầu
  }, []); // Dependency rỗng để chỉ chạy khi mount

  const value = useMemo(() => ({ isAuthenticated, setIsAuthenticated }), [isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};