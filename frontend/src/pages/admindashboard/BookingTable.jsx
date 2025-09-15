import React, { useState, useEffect } from 'react'; // Import React và hook useState
import './BookingTable.css'; // Import file CSS
import { bookings } from './datathuexe.js'; // Import dữ liệu booking từ file bên ngoài

// Component chính hiển thị bảng đặt xe
const BookingTable = () => {
  // Các state quản lý trạng thái component
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState(bookings); // Danh sách booking đã lọc
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState(''); // Ngày bắt đầu để lọc
  const [toDate, setToDate] = useState(''); // Ngày kết thúc để lọc  
  const [filterUser, setFilterUser] = useState(''); // Tên người dùng để tìm kiếm
  const [selectedBooking, setSelectedBooking] = useState(null); // Booking được chọn để hiển thị chi tiết
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại, thêm state cho phân trang
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try{
      setLoading(true);

      const token = localStorage.getItem('token'); // Lấy token từ localStorage

      if(!token){
        setError('Chưa đăng nhập. Vui lòng đăng nhập lại.');
        return;
      }

      const response = await fetch('http://localhost:8080/api/bookings/get-all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Thêm token vào header Authorization
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        // Có thể redirect về login page
        return;
      }

      if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.code === 200 && data.result) {
        console.log('API Response:', data.result); // Debug: kiểm tra cấu trúc dữ liệu
        console.log('First booking:', data.result[0]); // Debug: kiểm tra booking đầu tiên
        setBookings(data.result);
        setFilteredBookings(data.result);
      } else {
        setError(data.message || 'Không thể tải dữ liệu');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const updateBookingStatus = async (booking, newStatus) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Chưa đăng nhập. Vui lòng đăng nhập lại.');
      return;
    }

    // Sử dụng bookingId từ object booking
    const bookingId = booking.bookingId || booking.id;
    
    if (!bookingId) {
      alert('Không tìm thấy ID booking hợp lệ');
      console.error('Booking object:', booking);
      return;
    }

    console.log('Updating booking with ID:', bookingId); // Debug

    // Set loading state cho booking cụ thể (sử dụng booking.id để track UI)
    setUpdatingStatus(prev => ({ ...prev, [booking.id]: true }));

    try {
      let endpoint;
      
      // Xác định endpoint dựa trên trạng thái mới
      if (newStatus === 'CONFIRMED') {
        endpoint = `http://localhost:8080/api/bookings/${bookingId}/confirm`;
      } else if (newStatus === 'CANCLED') {
        endpoint = `http://localhost:8080/api/bookings/${bookingId}/cancel`;
      } else {
        throw new Error('Trạng thái không hợp lệ');
      }

      console.log('Calling endpoint:', endpoint); // Debug

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.code === 200) {
        // Cập nhật trạng thái trong state local
        const updateBookingsList = (bookingsList) => 
          bookingsList.map(b => 
            (b.id === booking.id || b.bookingId === booking.bookingId) 
              ? { ...b, status: newStatus }
              : b
          );

        setBookings(updateBookingsList);
        setFilteredBookings(updateBookingsList);

        // Cập nhật selectedBooking nếu đang hiển thị modal
        if (selectedBooking && (selectedBooking.id === booking.id || selectedBooking.bookingId === booking.bookingId)) {
          setSelectedBooking(prev => ({ ...prev, status: newStatus }));
        }

        alert(data.result || 'Cập nhật trạng thái thành công!');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      // Remove loading state
      setUpdatingStatus(prev => {
        const newState = { ...prev };
        delete newState[booking.id];
        return newState;
      });
    }
  };

  const handleStatusChange = (booking, newStatus) => {
    if (booking.status === newStatus) {
      return; // Không thay đổi nếu trạng thái giống nhau
    }

    // Xác nhận trước khi thay đổi
    const statusText = getStatusText(newStatus);
    const confirmMessage = `Bạn có chắc chắn muốn thay đổi trạng thái thành "${statusText}"?`;
    
    if (window.confirm(confirmMessage)) {
      updateBookingStatus(booking, newStatus);
    }
  };

  // Hàm trả về style màu cho trạng thái booking
  const getStatusStyle = (status) => {
    const styles = {
      'PENDING': { backgroundColor: '#ffc107', color: '#000000' },
      'CONFIRMED': { backgroundColor: '#28a745', color: '#ffffff' },
      'CANCELLED': { backgroundColor: '#dc3545', color: '#ffffff' },
      'CANCLED': { backgroundColor: '#dc3545', color: '#ffffff' }, // Typo trong backend
      'COMPLETED': { backgroundColor: '#17a2b8', color: '#ffffff' }
    };
    return styles[status] || { backgroundColor: '#6c757d', color: '#ffffff' };
  };

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'CANCELLED': 'Đã hủy',
      'CANCLED': 'Đã hủy', // Typo trong backend
      'COMPLETED': 'Hoàn thành'
    };
    return statusMap[status] || status;
  };

  const canChangeStatus = (currentStatus, targetStatus) => {
    if (currentStatus === 'PENDING') {
      return targetStatus === 'CONFIRMED' || targetStatus === 'CANCLED';
    }
    if (currentStatus === 'CONFIRMED') {
      return targetStatus === 'CANCLED';
    }
    return false; // Không thể thay đổi từ CANCLED hoặc COMPLETED
  };

  // Hàm xử lý lọc dữ liệu theo các điều kiện
  const handleFilter = () => {
    const filtered = bookings.filter(booking => {
      // Kiểm tra điều kiện ngày bắt đầu
      const isFromDateValid = !fromDate || booking.pickupTime >= fromDate;
      // Kiểm tra điều kiện ngày kết thúc
      const isToDateValid = !toDate || booking.returnTime <= toDate;

      // Kiểm tra điều kiện tên người dùng (không phân biệt hoa thường)
      const isUserMatch = !filterUser || 
        booking.user?.name?.toLowerCase().includes(filterUser.toLowerCase()) ||
        booking.user?.username?.toLowerCase().includes(filterUser.toLowerCase());
      
      return isFromDateValid && isToDateValid && isUserMatch;
    });
    setFilteredBookings(filtered); // Cập nhật danh sách đã lọc
    setCurrentPage(1); // Đặt lại trang về 1 khi lọc
  };
  

  // Hàm chuyển đổi định dạng ngày từ YYYY-MM-DD sang DD-MM-YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return amount.toLocaleString('vi-VN');
  };

  // Tính toán số lượng trang dựa trên số dữ liệu và giới hạn 100 bản ghi/trang
  const itemsPerPage = 10; // Số lượng bản ghi trên mỗi trang
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage); // Tổng số trang
  // Lấy dữ liệu cho trang hiện tại
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Hàm chuyển đến trang trước
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Hàm chuyển đến trang tiếp theo
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (loading) {
    return (
      <div className="booking-table">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #14452F',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-table">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px' 
        }}>
          <div style={{ textAlign: 'center', color: '#dc3545' }}>
            <p>{error}</p>
            <button 
              onClick={fetchBookings} 
              className="filter-btn"
              style={{ marginTop: '10px' }}
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render giao diện chính
  return (
    <div className="booking-table">
      {/* Phần bộ lọc và tìm kiếm */}
      <div className="filter-section">
        <label>FROM DATE:</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <label>TO DATE:</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Tìm người dùng..."
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="search-input"
        />
        <button onClick={handleFilter} className="filter-btn">
          Lọc
        </button>
        <button onClick={fetchBookings} className="filter-btn">
          Refresh
        </button>
      </div>

      {/* Phần hiển thị bảng dữ liệu */}
      <div className="table-wrapper">
        <table className="booking-table-content">
          <thead>
            <tr>
              <th>STT</th> {/* Thêm cột số thứ tự */}
              <th>Số điện thoại</th>
              <th>ID Người dùng</th>
              <th>Họ và tên</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Tên xe</th>
              <th>Ngày</th>
              <th>Doanh thu (VNĐ)</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {/* Lặp qua danh sách booking đã lọc để hiển thị */}
            {paginatedBookings.map((booking, index) => (
              <tr key={booking.id} className="table-row">
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td> {/* Hiển thị số thứ tự */}
                <td>{booking.user?.phone || booking.user?.phoneNumber || 'N/A'}</td>
                <td>{booking.bookingId?.slice(0, 8)}</td>
                <td>{booking.user?.name || booking.user?.username || 'N/A'}</td>
                <td>{formatDate(booking.pickupTime)}</td>
                <td>{formatDate(booking.returnTime)}</td>
                <td>{booking.vehicle?.name || 'N/A'}</td>
                <td>{booking.durationDays || 'N/A'} ngày</td>
                <td>{formatCurrency(booking.totalPrice)}</td>
                <td>
                  {/* Dropdown để thay đổi trạng thái */}
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusChange(booking, e.target.value)}
                    disabled={updatingStatus[booking.id]}
                    style={{
                      ...getStatusStyle(booking.status),
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: updatingStatus[booking.id] ? 'wait' : 'pointer'
                    }}
                  >
                    <option value="PENDING">Chờ xác nhận</option>
                    <option 
                      value="CONFIRMED"
                      disabled={!canChangeStatus(booking.status, 'CONFIRMED')}
                    >
                      Đã xác nhận
                    </option>
                    <option 
                      value="CANCLED"
                      disabled={!canChangeStatus(booking.status, 'CANCLED')}
                    >
                      Đã hủy
                    </option>
                  </select>

                  {updatingStatus[booking.id] && (
                    <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                      Đang cập nhật...
                    </div>
                  )}
                </td>
                <td>
                  {/* Nút mở modal chi tiết */}
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="detail-btn"
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Phần phân trang */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Quay lại
            </button>
            <span>
              Trang {currentPage} / {totalPages} (Tổng: {filteredBookings.length} đơn)
            </span>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Tiếp theo
            </button>
          </div>
        )}
      </div>

      {/* Modal hiển thị chi tiết booking - chỉ hiện khi có selectedBooking */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Chi tiết đặt xe</h3>
            <p><strong>Mã đặt xe:</strong> {selectedBooking.bookingId}</p>
            <p><strong>Người dùng:</strong> {selectedBooking.user?.name || selectedBooking.user?.username || 'N/A'}</p>
            <p><strong>Username:</strong> {selectedBooking.user?.username || 'N/A'}</p>
            <p><strong>Xe:</strong> {selectedBooking.vehicle?.name || 'N/A'}</p>
            <p><strong>Loại xe:</strong> {selectedBooking.vehicle?.type || 'N/A'}</p>
            <p><strong>Thời gian:</strong> {formatDate(selectedBooking.pickupTime)} - {formatDate(selectedBooking.returnTime)}</p>
            <p><strong>Số ngày:</strong> {selectedBooking.durationDays} ngày</p>
            <p><strong>Địa điểm nhận:</strong> {selectedBooking.pickupArea || 'N/A'}</p>
            <p><strong>Địa điểm trả:</strong> {selectedBooking.returnArea || 'N/A'}</p>
            <p><strong>Doanh thu:</strong> {formatCurrency(selectedBooking.totalPrice)} VNĐ</p>
            <p>
              <strong>Trạng thái:</strong>
              {/* Hiển thị trạng thái trong modal với màu tương ứng */}
              <span
                className="booking-status"
                style={getStatusStyle(selectedBooking.status)}
              >
                {getStatusText(selectedBooking.status)}
              </span>
            </p>
            <p><strong>Phương thức thanh toán:</strong> {selectedBooking.paymentMethod}</p>
            {/* Nút đóng modal */}
            <button
              onClick={() => setSelectedBooking(null)}
              className="modal-close-btn"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTable;