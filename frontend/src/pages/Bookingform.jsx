import React from "react";

const BookingForm = () => {
  return (
    <div>
      <style>{`
        .booking-container {
          display: flex;
          max-width: 1000px;
          margin: 40px auto;
          gap: 30px;
          font-family: Arial, sans-serif;
        }
        .car-summary {
          flex: 1;
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          text-align: center;
        }
        .car-img {
          width: 100%;
          height: auto; /* giữ tỉ lệ ảnh */
          border-radius: 10px;
          margin-bottom: 15px;
        }
        .car-title { font-size: 22px; margin-bottom: 8px; color: #222; }
        .car-price { color: #e63946; font-size: 18px; margin-bottom: 15px; }
        .car-info { list-style: none; padding: 0; margin: 0; color: #444; }
        .car-info li { margin: 6px 0; font-size: 15px; }
        .booking-form {
          flex: 1;
          background: #fff;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .booking-form h2 { margin-bottom: 20px; color: #007bff; }
        .booking-form form { display: flex; flex-direction: column; gap: 15px; }
        .booking-form label { display: flex; flex-direction: column; font-weight: bold; color: #333; }
        .booking-form input { padding: 10px; margin-top: 6px; border: 1px solid #ccc; border-radius: 8px; outline: none; transition: border 0.3s; }
        .booking-form input:focus { border: 1px solid #007bff; }
        .form-row { display: flex; gap: 15px; }
        .submit-btn { background: linear-gradient(45deg, #007bff, #00c6ff); color: white; padding: 12px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; transition: background 0.3s, transform 0.2s; }
        .submit-btn:hover { background: linear-gradient(45deg, #0056b3, #0099cc); transform: translateY(-2px); }
      `}</style>

      <div className="booking-container">
        {/* Thông tin xe */}
        <div className="car-summary">
          <img
  src="https://vinfast-vn.vn/wp-content/uploads/2023/10/vinfast-vf8-1-1-1024x426.png"
  alt="VinFast VF 8"
  className="car-img"
/>
          <h2 className="car-title">VinFast VF 8</h2>
          <p className="car-price">1.200.000 VNĐ / ngày</p>
          <ul className="car-info">
            <li>🧑‍🤝‍🧑 5 chỗ</li>
            <li>⚡ 400km/1 lần sạc</li>
            <li>🔑 Số tự động</li>
          </ul>
        </div>

        {/* Form đặt xe */}
        <div className="booking-form">
          <h2>Đặt xe ngay</h2>
          <form>
            <label>
              Họ và tên
              <input type="text" placeholder="Nhập họ tên của bạn" required />
            </label>
            <label>
              Số điện thoại
              <input type="tel" placeholder="Nhập số điện thoại" required />
            </label>
            <label>
              Email
              <input type="email" placeholder="example@email.com" required />
            </label>
            <div className="form-row">
              <label>
                Ngày nhận xe
                <input type="date" required />
              </label>
              <label>
                Ngày trả xe
                <input type="date" required />
              </label>
            </div>
            <label>
              Địa điểm nhận xe
              <input type="text" placeholder="VD: Hà Nội, TP.HCM..." />
            </label>
            <button type="submit" className="submit-btn">
              Xác nhận đặt xe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
