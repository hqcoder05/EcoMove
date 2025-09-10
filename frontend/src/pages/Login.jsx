import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (role = "user") => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", role);
    if (role === "admin") {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="login-container">
      <style>{`
        .login-container {
          display: flex;
          min-height: 100vh;
          font-family: Arial, sans-serif;
          flex-direction: row;
        }
        .login-left {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
          background: #fff;
        }
        .login-form {
          width: 100%;
          max-width: 380px;
        }
        .logo {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          gap: 10px;
        }
        .logo-text {
          font-size: 24px;
          font-weight: bold;
          color: #207da3; /* Màu chủ đạo */
        }
        h2 {
          margin-bottom: 20px;
          font-size: 28px;
          font-weight: 700;
          color: #207da3;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
          color: #444;
        }
        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 14px;
        }
        .btn-login {
          width: 100%;
          padding: 12px;
          background: #207da3;
          color: white;
          font-weight: bold;
          font-size: 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 8px;
        }
        .btn-login:hover {
          background: #186483;
        }
        .extra-links {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          margin-top: 10px;
        }
        .extra-links a {
          color: #207da3;
          text-decoration: none;
        }
        .divider {
          text-align: center;
          margin: 20px 0;
          color: #999;
          position: relative;
        }
        .divider::before, .divider::after {
          content: "";
          position: absolute;
          height: 1px;
          width: 40%;
          background: #ddd;
          top: 50%;
        }
        .divider::before { left: 0; }
        .divider::after { right: 0; }
        .btn-google {
          width: 100%;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 6px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          cursor: pointer;
          background: #fff;
        }
        .btn-google img {
          width: 18px;
          height: 18px;
        }
        .login-right {
          flex: 1;
          background: url("https://img.vinfastauto.com/v1/images/original/car-vf9-exterior-01.png") no-repeat center center;
          background-size: cover;
          position: relative;
        }
        .login-right::after {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(32,125,163,0.3); /* overlay nhẹ màu chủ đạo */
        }
        @media (max-width: 900px) {
          .login-container {
            flex-direction: column;
          }
          .login-right {
            display: none; /* Ẩn hình trên mobile */
          }
          .login-left {
            flex: none;
            width: 100%;
            padding: 20px;
          }
        }
      `}</style>

      {/* Khối Form */}
      <div className="login-left">
        <div className="login-form">
          <div className="logo">
            🚗 <span className="logo-text">xedienvip</span>
          </div>
          <h2>Đăng nhập</h2>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Vui lòng nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn-login" onClick={() => handleLogin("user")}>
            Đăng nhập
          </button>
          <div className="extra-links">
            <a href="#">Quên mật khẩu</a>
            <a href="#">Đăng ký tài khoản</a>
          </div>
          <div className="divider">Hoặc</div>
          <button className="btn-google">
            <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google" />
            Đăng nhập bằng Google
          </button>
          {/* Nút test Admin */}
          <button
            style={{ marginTop: "12px", background: "#207da3", color: "#fff", padding: "10px", borderRadius: "6px" }}
            onClick={() => handleLogin("admin")}
          >
            
          </button>
        </div>
      </div>

      {/* Khối hình minh hoạ */}
      <div className="login-right"></div>
    </div>
  );
}
