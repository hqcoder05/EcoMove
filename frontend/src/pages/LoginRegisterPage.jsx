import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import carImage from './assets/vinfast8.jpg'; 

export default function LoginRegisterPage() {
  const [tab, setTab] = useState("login");
  const [phone, setPhone] = useState("");
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
    <div className="auth-bg">
      <style>{`
        .auth-bg {
          min-height: 100vh;
          background: linear-gradient(135deg, #ff8000 60%, #3ec6f3 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-container {
          display: flex;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.08);
          width: 100%;
          max-width: 900px;
          overflow: hidden;
        }

        .auth-left {
          flex: 1;
          padding: 32px 24px 24px 24px;
          box-sizing: border-box;
        }

        .auth-right {
          flex: 1;
          background: url(${carImage}) center/cover no-repeat;
        }

        .auth-tabs {
          display: flex;
          gap: 24px;
          margin-bottom: 0;
        }
        .auth-tabs button {
          background: none;
          border: none;
          font-size: 1.2rem;
          font-weight: 600;
          color: #888;
          cursor: pointer;
          padding: 0 0 8px 0;
          outline: none;
        }
        .auth-tabs .active {
          color: #222;
        }
        .auth-tab-underline {
          height: 2px;
          background: #eee;
          margin-bottom: 24px;
          position: relative;
        }
        .underline {
          position: absolute;
          bottom: 0;
          height: 2px;
          width: 50%;
          background: #ff8000;
          transition: left 0.2s;
        }
        .underline.login { left: 0; }
        .underline.register { left: 50%; }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .auth-form input {
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
        }
        .auth-btn {
          background: #ff8000;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 8px;
        }
        .auth-or {
          text-align: center;
          color: #888;
          margin: 16px 0 8px 0;
          font-size: 1rem;
        }
        .auth-social {
          width: 100%;
          display: flex;
          align-items: center;
          background: #f5f5f5;
          border: none;
          border-radius: 6px;
          padding: 10px 0;
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 10px;
          cursor: pointer;
          justify-content: center;
        }
        .auth-social.fb { color: #1877f3; }
        .auth-social.gg { color: #ea4335; }

        /* --- Responsive cho Mobile --- */
        @media (max-width: 768px) {
          .auth-container {
            flex-direction: column;
            max-width: 98vw;
          }
          .auth-right {
            display: none;
          }
          .auth-left {
            padding: 24px 12px 24px 12px;
          }
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-left">
          <img
            src="https://static.ahamove.com/logo_full.svg"
            alt="Ahamove"
            style={{ width: 180, margin: "0 auto 24px", display: "block" }}
          />
          <div className="auth-tabs">
            <button
              className={tab === "login" ? "active" : ""}
              onClick={() => setTab("login")}
            >
              Đăng nhập
            </button>
            <button
              className={tab === "register" ? "active" : ""}
              onClick={() => setTab("register")}
            >
              Đăng ký
            </button>
          </div>
          <div className="auth-tab-underline">
            <div className={tab === "login" ? "underline login" : "underline register"} />
          </div>
          <form className="auth-form" onSubmit={e => e.preventDefault()}>
            <input
              type="tel"
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
            <button
              className="auth-btn"
              type="submit"
              onClick={() => handleLogin("user")}
            >
              {tab === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
          </form>

          <div className="auth-or">Hoặc</div>
          <button className="auth-social fb">
            <img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" alt="" width={20} style={{marginRight:8}} />
            Đăng nhập với Facebook
          </button>
          <button className="auth-social gg">
            <img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="" width={20} style={{marginRight:8}} />
            Đăng nhập với Google
          </button>

          <button
            style={{ marginTop: 12, background: "#1976d2", color: "#fff", padding: "10px", borderRadius: 6 }}
            onClick={() => handleLogin("./pages/AdminLogin")}
          >
            🔑 Đăng nhập Admin (test)
          </button>
        </div>

        {/* Cột ảnh xe */}
        <div className="auth-right"></div>
      </div>
    </div>
  );
}
