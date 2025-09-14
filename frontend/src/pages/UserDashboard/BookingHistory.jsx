import React, { useEffect, useState } from "react";
import { FaBolt, FaCar, FaClock, FaEdit, FaTrash, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./BookingHistory.css";

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("User");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookingHistory = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8080/api/bookings/get-all-user-booking", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok) {
          setBookings(data.result || []);
        } else {
          console.error("Lỗi lấy dữ liệu:", data.message);
        }
      } catch (error) {
        console.error("Lỗi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    const storedUser = localStorage.getItem("adminInfo") || localStorage.getItem("userInfo");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUsername(parsed?.name || "User");
    }

    fetchBookingHistory();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleCancel = async (bookingId) => {
    if(window.confirm("Bạn có chắc chắn muốn hủy đặt xe này?")) {
      // Gọi API hủy đặt xe ở đây
      try{
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}/cancel`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if(response.ok) {
          alert("Hủy đặt xe thành công!");
          setBookings(prev => prev.map(booking => 
            booking.bookingId === bookingId 
              ? {...booking, status: 'CANCELLED'} 
              : booking
          ));  
        }
        else {
          alert("Không thể hủy đặt xe. Vui lòng thử lại.");
        }
      } catch(error) {
        console.error("Lỗi gọi API:", error);
        alert("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    }
  };

  const handleViewDetails = async (bookingId) => {
    try{
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}/get-booking`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Hiển thị modal hoặc navigate đến trang chi tiết
        console.log("Booking details:", data.result);
        showBookingDetails(data.result);
      } else {
        alert("Không thể tải thông tin chi tiết. Vui lòng thử lại.");
      }
    } catch(error) {
      console.error("Lỗi gọi API:", error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại.");
    }
  }

  // const showBookingDetails = (bookingData) => {
  //   const details = `
  //   Chi tiết đặt xe:
  //   - Mã đặt: ${bookingData.bookingId || 'N/A'}
  //   - Xe: ${bookingData.vehicle?.name || 'N/A'}
  //   - Ngày thuê: ${bookingData.pickupTime || 'N/A'}
  //   - Ngày trả: ${bookingData.returnTime || 'N/A'}
  //   - Địa điểm thuê: ${bookingData.pickupArea || 'N/A'}
  //   - Địa điểm trả: ${bookingData.returnArea || 'N/A'}
  //   - Tổng tiền: ${formatPrice(bookingData.totalPrice)}
  //   - Trạng thái: ${getStatusText(bookingData.status)}
  //       `;
  //       alert(details);
  // }

  const showBookingDetails = (bookingData) => {
    if (!bookingData) {
      alert("Không có dữ liệu booking để hiển thị.");
      return;
    }
    
    setSelectedBooking(bookingData);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const calculateDays = (pickupTime, returnTime) => {
    const pickup = new Date(pickupTime);
    const returnDate = new Date(returnTime);
    const diffTime = Math.abs(returnDate - pickup);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // Tối thiểu 1 ngày
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã huỷ";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "status-pending";
      case "CONFIRMED":
        return "status-confirmed";
      case "CANCELLED":
        return "status-cancelled";
      case "COMPLETED":
        return "status-completed";
      default:
        return "status-default";
    }
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat('vi-VN').format(price) + " VNĐ";
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "50px",
            height: "50px", 
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #14452F",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }}></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: 0 }}>

      <div className="navbar">
        <div className="navbar-left">
          <FaBolt style={{ marginRight: '8px', color: '#fbc02d' }} />EcoMove
        </div>
        <div className="navbar-menu">
          <button onClick={() => navigate("/")}>Trang chủ</button>
          <button onClick={() => navigate("/dashboard")}>Xe Điện</button>
          <button onClick={() => navigate("/map")}>Trạm sạc</button>
          <button onClick={() => navigate("/history")}>Lịch sử thuê xe</button>
        </div>
        <div className="navbar-right">
          <span><FaUser /> {username}</span>
          <button onClick={handleLogout}>Đăng Xuất</button>
        </div>
      </div>

      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Lịch Sử Thuê Xe</h1>
          <p className="page-subtitle">Quản lý và theo dõi các đơn thuê xe của bạn</p>
        </div>

        {bookings.length === 0 ? (
          <div className="no-data-container">
            <FaCar className="no-data-icon" />
            <div className="no-data-text">Chưa có lịch sử thuê xe</div>
            <div className="no-data-subtext">Hãy đặt xe điện đầu tiên của bạn!</div>
          </div>
        ) : (
          <div className="booking-table-container">
            <table className="booking-table">
              <thead>
                <tr>
                  <th style={{width: '60px'}}>STT</th>
                  <th style={{width: '180px'}}>Tên Xe</th>
                  <th style={{width: '120px'}}>Ngày Thuê</th>
                  <th style={{width: '120px'}}>Ngày Trả</th>
                  <th style={{width: '100px'}}>Thời Gian</th>
                  <th style={{width: '120px'}}>Tổng Tiền</th>
                  <th style={{width: '200px'}}>Địa Điểm</th>
                  <th style={{width: '140px'}}>Trạng Thái</th>
                  <th style={{width: '120px'}}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={booking.bookingId || index}>
                    <td>
                      <div className="booking-id">{index + 1}</div>
                    </td>
                    <td>
                      <div className="vehicle-info">
                        <FaCar className="vehicle-icon" />
                        <div className="vehicle-name">{booking.vehicle?.name || "N/A"}</div>
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <div className="date-value">{booking.pickupTime}</div>
                        <FaCalendarAlt className="date-icon" />
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <div className="date-value">{booking.returnTime}</div>
                        <FaCalendarAlt className="date-icon" />
                      </div>
                    </td>
                    <td>
                      <div className="duration-info">
                        <div className="duration-value">
                          {booking.durationDays || calculateDays(booking.pickupTime, booking.returnTime)}
                        </div>
                        <div className="duration-label">
                          <FaClock style={{marginRight: '4px'}} />
                          ngày
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="price-info">
                        {formatPrice(booking.totalPrice)}
                      </div>
                    </td>
                    <td>
                      <div className="location-info">
                        <div className="location-item">
                          <FaMapMarkerAlt className="location-icon" />
                          <div className="location-text" title={booking.pickupArea}>
                            {booking.pickupArea || "N/A"}
                          </div>
                        </div>
                        <div className="location-item">
                          <FaMapMarkerAlt className="location-icon" />
                          <div className="location-text" title={booking.returnArea}>
                            {booking.returnArea || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="status-container">
                        <span className={`status-badge ${getStatusClass(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="actions-container">
                        {booking.status === "PENDING" && (
                          <>
                            <button className="action-btn edit-btn" onClick={() => handleViewDetails(booking.bookingId)}>
                              <FaEdit />
                              Xem chi tiết
                            </button>
                            <button className="action-btn cancel-btn" onClick={() => handleCancel(booking.bookingId)}>
                              <FaTrash />
                              Hủy đặt xe
                            </button>
                          </>
                        )}
                        {booking.status !== "PENDING" && (
                          <button className="action-btn detail-btn" onClick={() => handleViewDetails(booking.bookingId)}>
                            <FaEye />
                            Chi tiết
                          </button>
                        )}
                      </div>

                      {showModal && selectedBooking && (
                        <div className="modal-overlay" onClick={closeModal}>
                          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                              <h2 className="modal-title">Chi Tiết Đặt Xe</h2>
                              <button className="modal-close-btn" onClick={closeModal}>×</button>
                            </div>
                            
                            <div className="modal-body">
                              <div className="detail-section">
                                <h3 className="section-title">Thông Tin Đơn Đặt</h3>
                                <div className="detail-grid-2col">
                                  <div className="detail-item">
                                    <span className="detail-label">Mã đặt xe:</span>
                                    <span className="detail-value">{selectedBooking.bookingId}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Trạng thái:</span>
                                    <span className="detail-value">
                                      <span className={`modal-status ${getStatusClass(selectedBooking.status)}`}>
                                        {getStatusText(selectedBooking.status)}
                                      </span>
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Thời gian thuê:</span>
                                    <span className="detail-value">
                                      {selectedBooking.durationDays || calculateDays(selectedBooking.pickupTime, selectedBooking.returnTime)} ngày
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Tổng tiền:</span>
                                    <span className="detail-value total-price">{formatPrice(selectedBooking.totalPrice)}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="detail-section">
                                <h3 className="section-title">Thông Tin Xe</h3>
                                <div className="detail-grid-2col">
                                  <div className="detail-item">
                                    <span className="detail-label">Tên xe:</span>
                                    <span className="detail-value">{selectedBooking.vehicle?.name || 'N/A'}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Loại xe:</span>
                                    <span className="detail-value">{selectedBooking.vehicle?.type || 'N/A'}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Biển số:</span>
                                    <span className="detail-value">{selectedBooking.vehicle?.range || 'N/A'}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Số chỗ ngồi:</span>
                                    <span className="detail-value">{selectedBooking.vehicle?.seats || 'N/A'} chỗ</span>
                                  </div>
                                </div>
                              </div>

                              <div className="detail-section">
                                <h3 className="section-title">Thời Gian & Địa Điểm</h3>
                                <div className="detail-grid-2col">
                                  <div className="detail-item">
                                    <span className="detail-label">Ngày thuê:</span>
                                    <span className="detail-value">{selectedBooking.pickupTime}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Ngày trả:</span>
                                    <span className="detail-value">{selectedBooking.returnTime}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Địa điểm nhận xe:</span>
                                    <span className="detail-value">{selectedBooking.pickupArea || 'N/A'}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="detail-label">Địa điểm trả xe:</span>
                                    <span className="detail-value">{selectedBooking.returnArea || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>

                              {selectedBooking.user && (
                                <div className="detail-section">
                                  <h3 className="section-title">Thông Tin Khách Hàng</h3>
                                  <div className="detail-grid-2col">
                                    <div className="detail-item">
                                      <span className="detail-label">Tên khách hàng:</span>
                                      <span className="detail-value">{selectedBooking.user.name || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item">
                                      <span className="detail-label">Username:</span>
                                      <span className="detail-value">{selectedBooking.user.username || 'N/A'}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="modal-footer">
                              <button className="btn-secondary" onClick={closeModal}>Đóng</button>
                              {selectedBooking.status === "PENDING" && (
                                <button 
                                  className="btn-danger" 
                                  onClick={() => {
                                    closeModal();
                                    handleCancel(selectedBooking.bookingId);
                                  }}
                                >
                                  Hủy Đặt Xe
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookingHistory;