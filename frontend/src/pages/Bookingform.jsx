import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaBolt, FaArrowLeft, FaMapMarkerAlt } from "react-icons/fa";

const BookingForm = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    pickupTime: "",
    returnTime: "",
    pickupArea: "",
    returnArea: "",
  });

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/api/vehicles/${vehicleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Không thể lấy thông tin xe");
        }
        const data = await response.json();
        setVehicle(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin xe:", error);
        alert("Không thể tải thông tin xe");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId, navigate]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ định vị");
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const address = await reverseGeocode(latitude, longitude);
          setFormData(prev => ({
            ...prev,
            pickupArea: address
          }));
        } catch (error) {
          console.error("Lỗi khi lấy địa chỉ:", error);
          alert("Không thể lấy địa chỉ từ vị trí hiện tại");
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error("Lỗi định vị:", error);
        let message = "Không thể lấy vị trí hiện tại";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Bạn đã từ chối quyền truy cập vị trí";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Thông tin vị trí không khả dụng";
            break;
          case error.TIMEOUT:
            message = "Yêu cầu lấy vị trí hết thời gian";
            break;
        }

        alert(message);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=vi`
      );

      if (!response.ok) {
        throw new Error("Không thể lấy địa chỉ");
      }

      const data = await response.json();
      const address = data.address;
      let formattedAddress = "";

      if (address.house_number) formattedAddress += address.house_number + " ";
      if (address.road) formattedAddress += address.road + ", ";
      if (address.suburb || address.neighbourhood) formattedAddress += (address.suburb || address.neighbourhood) + ", ";
      if (address.city_district || address.county) formattedAddress += (address.city_district || address.county) + ", ";
      if (address.city || address.town) formattedAddress += (address.city || address.town);

      return formattedAddress || data.display_name;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return `Vĩ độ: ${lat.toFixed(6)}, Kinh độ: ${lng.toFixed(6)}`;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn cần đăng nhập để đặt xe.");
      navigate("/login");
      return;
    }

    try {
      const payload = {
        ...formData,
        vehicleTypeId: vehicleId
      };

      const response = await fetch("http://localhost:8080/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const message = data.message || "Đặt xe thành công!";
        alert(message);
        navigate("/history");
      } else {
        try {
          const errorData = await response.json();
          alert(errorData.message || `HTTP ${response.status}: Đặt xe thất bại`);
        } catch {
          const errorText = await response.text();
          alert(`HTTP ${response.status}: ${errorText || "Đặt xe thất bại"}`);
        }
      }
    } catch (error) {
      console.error("Lỗi khi kết nối backend:", error);
      alert("Lỗi kết nối server");
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:8080/api/auth/sign-out", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
      alert("Không thể đăng xuất. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#14452F'
      }}>
        <div>Đang tải thông tin xe...</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#14452F'
      }}>
        <div>Không tìm thấy thông tin xe.</div>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Segoe UI', sans-serif",
      background: "#fff",
      minHeight: "100vh"
    }}>
      <style>{`
        .booking-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 5%;
          background: #14452F;
          color: white;
        }
        
        .navbar-brand {
          display: flex;
          align-items: center;
          font-size: 1.5rem;
          font-weight: bold;
        }
        
        .navbar-brand h2 {
          margin: 0;
          display: flex;
          align-items: center;
        }
        
        .navbar-menu {
          display: flex;
          gap: 24px;
        }
        
        .menu-item {
          color: white;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.3s;
        }
        
        .menu-item:hover {
          opacity: 0.8;
        }
        
        .logout-btn {
          background: transparent;
          border: 1px solid white;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }
        
        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .booking-container {
          display: flex;
          max-width: 1200px;
          margin: 40px auto;
          gap: 30px;
          padding: 0 20px;
        }
        
        .car-summary {
          flex: 1;
          background: #fff;
          padding: 25px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          text-align: center;
          border: 2px solid #A5D6A7;
        }
        
        .car-img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 20px;
        }
        
        .car-title { 
          font-size: 1.5rem; 
          margin-bottom: 12px; 
          color: #14452F; 
          font-weight: 700;
        }
        
        .car-price { 
          color: #e63946; 
          font-size: 1.3rem; 
          margin-bottom: 20px; 
          font-weight: 600;
        }
        
        .car-info { 
          list-style: none; 
          padding: 0; 
          margin: 0; 
          color: #444; 
          text-align: left;
        }
        
        .car-info li { 
          margin: 10px 0; 
          font-size: 1rem; 
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .booking-form-container {
          flex: 1;
          background: #fff;
          padding: 25px;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 2px solid #A5D6A7;
        }
        
        .booking-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .booking-title {
          font-size: 1.5rem;
          color: #14452F;
          margin: 0;
          font-weight: 700;
        }
        
        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #6c757d;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          font-weight: 500;
        }
        
        .back-btn:hover {
          background: #5a6268;
        }
        
        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .form-label {
          font-weight: 600;
          color: #14452F;
          font-size: 1rem;
        }
        
        .form-input {
          padding: 12px 16px;
          border: 1px solid #ccc;
          border-radius: 8px;
          outline: none;
          transition: all 0.3s;
          font-size: 1rem;
        }
        
        .form-input:focus {
          border-color: #14452F;
          box-shadow: 0 0 0 2px rgba(20, 69, 47, 0.2);
        }
        
        .form-row {
          display: flex;
          gap: 15px;
        }
        
        .location-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
          white-space: nowrap;
        }
        
        .location-btn:hover {
          background: #218838;
        }
        
        .location-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .submit-btn {
          background: linear-gradient(45deg, #14452F, #2E7D32);
          color: white;
          padding: 14px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 600;
          transition: all 0.3s;
          margin-top: 10px;
        }
        
        .submit-btn:hover {
          background: linear-gradient(45deg, #0d301f, #1b5e20);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .footer {
          background: #14452F;
          color: #ffffff;
          text-align: center;
          padding: 24px 16px;
          margin-top: 60px;
          font-weight: 500;
        }
        
        @media (max-width: 968px) {
          .booking-container {
            flex-direction: column;
            margin: 20px auto;
            gap: 20px;
          }
          
          .form-row {
            flex-direction: column;
            gap: 20px;
          }
        }
        
        @media (max-width: 768px) {
          .booking-navbar {
            flex-direction: column;
            gap: 15px;
            padding: 15px 5%;
          }
          
          .navbar-menu {
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
          }
          
          .booking-container {
            padding: 0 15px;
          }
          
          .car-summary, .booking-form-container {
            padding: 20px;
          }
        }
        
        @media (max-width: 480px) {
          .navbar-menu {
            flex-direction: column;
            align-items: center;
            gap: 10px;
          }
          
          .car-title {
            font-size: 1.3rem;
          }
          
          .car-price {
            font-size: 1.1rem;
          }
          
          .booking-title {
            font-size: 1.3rem;
          }
        }
      `}</style>

      {/* Navbar */}
      <nav className="booking-navbar">
        <div className="navbar-brand">
          <h2><FaBolt style={{ marginRight: "8px", color: "#fbc02d" }} />EcoMove</h2>
        </div>
        <div className="navbar-menu">
          <a href="/" className="menu-item">Trang chủ</a>
          <a href="/dashboard" className="menu-item">Thuê xe</a>
          <a href="/map" className="menu-item">Gợi ý trạm sạc</a>
          <a href="/history" className="menu-item">Lịch sử thuê xe</a>
        </div>
        <div className="navbar-user">
          <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
        </div>
      </nav>

      <div className="booking-container">
        {/* Thông tin xe */}
        <div className="car-summary">
          <img
            src={vehicle.image || '/images/default-car.jpg'}
            alt={vehicle.name}
            className="car-img"
            onError={(e) => {
              e.target.src = '/images/default-car.jpg';
            }}
          />
          <h2 className="car-title">{vehicle.name}</h2>
          <p className="car-price">{vehicle.price} VNĐ / ngày</p>
          <ul className="car-info">
            <li>🚗 {vehicle.type}</li>
            <li>👥 {vehicle.seats} chỗ</li>
            <li>⚡ {vehicle.range} km</li>
            <li>🧳 Cốp {vehicle.trunk}</li>
            <li>🔑 Số tự động</li>
          </ul>
        </div>

        {/* Form đặt xe */}
        <div className="booking-form-container">
          <div className="booking-header">
            <h2 className="booking-title">Đặt xe ngay</h2>
            <button className="back-btn" onClick={() => navigate("/dashboard")}>
              <FaArrowLeft /> Quay lại
            </button>
          </div>
          
          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                type="text"
                className="form-input"
                placeholder="Nhập họ tên của bạn"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                type="tel"
                className="form-input"
                placeholder="Nhập số điện thoại"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
                className="form-input"
                placeholder="example@email.com"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">Ngày nhận xe</label>
                <input
                  name="pickupTime"
                  value={formData.pickupTime}
                  onChange={handleChange}
                  type="date"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group" style={{flex: 1}}>
                <label className="form-label">Ngày trả xe</label>
                <input
                  name="returnTime"
                  value={formData.returnTime}
                  onChange={handleChange}
                  type="date"
                  className="form-input"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Địa điểm nhận xe</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  name="pickupArea"
                  value={formData.pickupArea}
                  onChange={handleChange}
                  type="text"
                  className="form-input"
                  placeholder="Nhập địa chỉ hoặc sử dụng vị trí hiện tại"
                  required
                  style={{flex: 1}}
                />
                <button
                  type="button"
                  className="location-btn"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                >
                  <FaMapMarkerAlt /> {gettingLocation ? 'Đang lấy...' : 'Vị trí hiện tại'}
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Địa điểm trả xe</label>
              <input
                name="returnArea"
                value={formData.returnArea}
                onChange={handleChange}
                type="text"
                className="form-input"
                placeholder="Nhập địa chỉ trả xe"
              />
            </div>
            
            <button type="submit" className="submit-btn">
              Xác nhận đặt xe
            </button>
          </form>
        </div>
      </div>
      
      <div className="footer">
        © 2025 EcoMove. Liên hệ: support@ecomove.com
      </div>
    </div>
  );
};

export default BookingForm;