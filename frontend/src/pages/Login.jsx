import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const responseData = await response.json();

      if(!response.ok) {
        throw new Error(responseData.message || 'Đăng nhập thất bại');
      }

      const token = responseData.result?.token;

      if (!token) {
        throw new Error("Không nhận được token từ server");
      }

      localStorage.setItem("token", token);

      const frofileResponse = await fetch("http://localhost:8080/api/users/get-user-profile", {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
      });
      
      const profileData = await frofileResponse.json();

      if(!frofileResponse.ok) {
        throw new Error(profileData.message || 'Lỗi khi lấy thông tin người dùng');
      }

      const roles = profileData.result.roles || [];
      
      if (Array.isArray(roles) && roles.includes("ADMIN")) {
        localStorage.setItem("userRole", "admin"); 
        localStorage.setItem("adminInfo", JSON.stringify(profileData.result));
        window.location.href = "/admin/dashboard";
      } else {
        localStorage.setItem("userRole", "user");
        window.location.href = "/dashboard";
      }

    } catch (error) {
      console.error("Lỗi khi kết nối backend:", error);
      alert("Lỗi kết nối server");
    }
  }

  return (
    <div className="container">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #2d7a2d, #1e5e1e);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 20px;
        }

        .login-box {
          background: white;
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 450px;
        }

        .logo {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 24px;
        }

        .logo-icon {
          font-size: 28px;
        }

        .logo-text {
          font-size: 26px;
          font-weight: bold;
          color: #2d7a2d;
          margin-left: 10px;
        }

        h2 {
          text-align: center;
          color: #2d7a2d;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 2px solid #ccc;
          border-radius: 10px;
          font-size: 14px;
        }

        .form-group input:focus {
          border-color: #2d7a2d;
          outline: none;
          box-shadow: 0 0 5px rgba(45, 122, 45, 0.3);
        }

        .btn-login, .btn-google, .btn-admin {
          width: 100%;
          padding: 12px;
          margin-top: 10px;
          border: none;
          border-radius: 10px;
          font-weight: bold;
          font-size: 14px;
          cursor: pointer;
        }

        .btn-login {
          background-color: #2d7a2d;
          color: white;
        }

        .btn-login:hover {
          background-color: #246824;
        }

        .btn-google {
          background-color: white;
          border: 2px solid #ccc;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-admin {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          color: white;
        }

        .extra-links {
          display: flex;
          justify-content: space-between;
          margin-top: 12px;
          font-size: 13px;
        }

        .extra-links a {
          color: #2d7a2d;
          text-decoration: none;
        }

        .extra-links a:hover {
          text-decoration: underline;
        }

        .welcome-message {
          text-align: center;
          margin-top: 30px;
          font-size: 14px;
          color: #444;
        }

        @media screen and (max-width: 600px) {
          .login-box {
            padding: 20px;
          }

          .welcome-message {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="login-box">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">EcoMove</span>
        </div>
        <h2>Đăng nhập</h2>
        <div className="form-group">
          <input
            type="username"
            placeholder="Vui lòng nhập tên tài khoản của bạn"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn-login" onClick={handleLogin}>Đăng nhập</button>
        <div className="extra-links">
          <a href="#">Quên mật khẩu?</a>
          <Link to="/auth">Đăng ký tài khoản</Link>
        </div>
        <button className="btn-google">
          <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" width="18" height="18" alt="Google" />
          Đăng nhập bằng Google
        </button>
        {/* <button className="btn-admin" onClick={() => handleLogin("admin")}>
          🔑 Đăng nhập Admin
        </button> */}

        <div className="welcome-message">
          <h4>Chào mừng!</h4>
          <p>Hệ thống quản lý xe điện hiện đại và thân thiện với môi trường.<br/>Đăng nhập để trải nghiệm những tính năng tuyệt vời.</p>
        </div>
      </div>
    </div>
  );
}
