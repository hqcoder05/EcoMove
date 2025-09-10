import React, { useState, useEffect, useContext, useRef } from 'react'; // Thêm useRef để kiểm tra focus
import { useNavigate } from 'react-router-dom'; // Hook để điều hướng
import './AdminLogin.css'; // Nhập CSS
import { AuthContext, saveAdminSession } from '../AuthContext'; // Nhập context và saveAdminSession

const AdminLogin = () => {
  const { setIsAuthenticated } = useContext(AuthContext); // Lấy hàm setIsAuthenticated từ context
  const [formData, setFormData] = useState({ username: '', password: '' }); // Khởi tạo state cho form
  const [isLoading, setIsLoading] = useState(false); // Quản lý trạng thái loading
  const [error, setError] = useState(''); // Quản lý thông báo lỗi
  const navigate = useNavigate(); // Hook để điều hướng
  const usernameRef = useRef(null); // Ref cho input username
  const passwordRef = useRef(null); // Ref cho input password

  // Kiểm tra đăng nhập tự động khi tải trang
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken'); // Lấy token từ localStorage
    console.log('Kiểm tra token khi tải trang: - AdminLogin.jsx:18', adminToken); // Debug token
    if (adminToken) {
      setIsAuthenticated(true); // Cập nhật trạng thái đăng nhập
      navigate('/admin/dashboard'); // Chuyển hướng nếu đã đăng nhập
    }
    if (usernameRef.current) usernameRef.current.focus();
  }, [navigate, setIsAuthenticated]);

  // Xử lý thay đổi giá trị input
  const handleInputChange = (e) => {
    const { name, value } = e.target; // Lấy tên và giá trị từ input
    setFormData((prev) => ({ ...prev, [name]: value })); // Cập nhật state
    if (error) setError(''); // Xóa lỗi khi nhập lại
  };

  // Kiểm tra hợp lệ của form
  const validateForm = () => {
    const { username, password } = formData; // Lấy dữ liệu form
    if (!username.trim() || username.trim().length < 3 || !/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setError('Tên đăng nhập phải có ít nhất 3 ký tự và chỉ chứa chữ, số, dấu gạch dưới'); // Thông báo lỗi
      return false;
    }
    if (!password || password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự'); // Thông báo lỗi
      return false;
    }
    return true; // Trả về true nếu hợp lệ
  };

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault(); // Ngăn chặn reload trang
    console.log('Bắt đầu xử lý đăng nhập: - AdminLogin.jsx:50', formData); // Debug bắt đầu
    if (!validateForm() || isLoading) return; // Thoát nếu không hợp lệ hoặc đang tải

    setIsLoading(true); // Bật trạng thái loading
    setError(''); // Xóa lỗi cũ

    try {
      const response = await simulateApiCall(formData); // Gọi hàm giả lập API
      console.log('Kết quả API: - AdminLogin.jsx:58', response); // Debug kết quả
      if (response.success) {
        saveAdminSession(response); // Lưu session (đã import từ AuthContext)
        setIsAuthenticated(true); // Cập nhật trạng thái đăng nhập
        console.log('Trạng thái đăng nhập cập nhật, token: - AdminLogin.jsx:62', localStorage.getItem('adminToken')); // Debug token
        navigate('/admin/dashboard'); // Chuyển hướng
      } else {
        setError(response.message); // Hiển thị thông báo lỗi
      }
    } catch (err) {
      console.error('Lỗi đăng nhập: - AdminLogin.jsx:68', err); // Debug lỗi
      setError('Lỗi kết nối. Vui lòng thử lại.'); // Xử lý lỗi kết nối
    } finally {
      setIsLoading(false); // Tắt trạng thái loading
    }
  };

  // Hàm giả lập API call
  const simulateApiCall = (credentials) => {
    return new Promise((resolve) => {
      const validCredentials = { username: 'admin', password: 'SecurePass2025!' }; // Thông tin đăng nhập hợp lệ
      if (credentials.username === validCredentials.username && credentials.password === validCredentials.password) {
        const tokenPayload = {
          exp: Math.floor(Date.now() / 1000) + 86400, // Hết hạn sau 24 giờ
          iat: Math.floor(Date.now() / 1000), // Thời gian phát hành
          sub: credentials.username, // Chủ thể
          role: 'super_admin', // Quyền
        };
        const token = btoa(JSON.stringify({
          header: { alg: 'HS256', typ: 'JWT' }, // Header JWT
          payload: tokenPayload, // Payload
          signature: 'demo-signature', // Chữ ký giả lập
        }));
        resolve({
          success: true, // Thành công
          token, // Token
          adminInfo: {
            id: 1, // ID
            username: credentials.username, // Tên đăng nhập
            name: 'Quản trị viên', // Tên
            email: 'admin@company.com', // Email
            role: 'super_admin', // Quyền
            avatar: '', // Loại bỏ sticker
          },
        });
      } else {
        resolve({ success: false, message: 'Thông tin đăng nhập không chính xác' }); // Lỗi đăng nhập
      }
    });
  };

  return (
    <div className="admin-login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>EcoMove</h1>
          <p>ĐĂNG NHẬP HỆ THỐNG</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="error-message" role="alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              ref={usernameRef}
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Nhập tên đăng nhập"
              disabled={isLoading}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              ref={passwordRef}
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Nhập mật khẩu"
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="login-footer">
          <p>Thông tin demo: Tên: admin, Mật khẩu: SecurePass2025!</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;