
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUpForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const response = await fetch("http://localhost:8080/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.result && data.result.token) {
          localStorage.setItem("token", data.result.token);
        }

        alert("Đăng ký thành công!");
        window.location.href = "/dashboard";;
      }
      else{
        const errorData = await response.json();
        alert("Lỗi đăng ký: " + errorData.message);
      }
    } catch (error) {
      console.error("Lỗi khi kết nối backend:", error);
      alert("Lỗi kết nối server");
    }
    // navigate("/dashboard");
  };

  return (
    <div className="signup-wrapper">
      <style>{`
        body {
          margin: 0;
          font-family: 'Segoe UI', sans-serif;
        }

        .signup-wrapper {
          min-height: 100vh;
          background: linear-gradient(to right, #2d7a2d, #1e5e1e);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .signup-box {
          background: white;
          padding: 40px 48px;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          width: 100%;
          max-width: 550px;
          position: relative;
        }

        .back-button {
          position: absolute;
          left: 24px;
          top: 24px;
          font-size: 20px;
          background: none;
          border: none;
          cursor: pointer;
          color: #2e7d32;
        }

        .signup-box h2 {
          text-align: center;
          color: #2e7d32;
          margin-bottom: 32px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        .form-label {
          font-weight: 600;
          margin-bottom: 6px;
          color: #2e7d32;
        }

        .form-control {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 16px;
        }

        .password-wrapper {
          position: relative;
          width: 100%;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background-color: #2e7d32;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
        }

        @media (max-width: 480px) {
          .signup-box {
            padding: 24px 16px;
          }
        }
      `}</style>

      <form className="signup-box" onSubmit={handleSubmit}>
        <button className="back-button" onClick={() => navigate(-1)} type="button">←</button>
        <h2>Đăng ký</h2>

        <div className="form-group">
          <label className="form-label">Số điện thoại của bạn?</label>
          <input
            type="tel"
            name="phoneNumber"
            className="form-control"
            placeholder="+84 Nhập số điện thoại"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email của bạn?</label>
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Nhập email của bạn (*)"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tên đầy đủ</label>
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="Nhập họ và tên"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tên đăng nhập</label>
          <input
            type="text"
            name="username"
            className="form-control"
            placeholder="Nhập tên tài khoản"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mật khẩu (*)</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="form-control"
              placeholder="Nhập mật khẩu (*)"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <button type="submit" className="submit-btn">Đăng ký</button>
      </form>
    </div>
  );
}

