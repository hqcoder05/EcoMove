import React, { useState } from 'react'; // Import React và hook useState
import './BookingTable.css'; // Import file CSS
import { bookings } from './datathuexe.js'; // Import dữ liệu booking từ file bên ngoài

// Component chính hiển thị bảng đặt xe
const BookingTable = () => {
  // Các state quản lý trạng thái component
  const [filteredBookings, setFilteredBookings] = useState(bookings); // Danh sách booking đã lọc
  const [fromDate, setFromDate] = useState(''); // Ngày bắt đầu để lọc
  const [toDate, setToDate] = useState(''); // Ngày kết thúc để lọc  
  const [filterUser, setFilterUser] = useState(''); // Tên người dùng để tìm kiếm
  const [selectedBooking, setSelectedBooking] = useState(null); // Booking được chọn để hiển thị chi tiết
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại, thêm state cho phân trang

  // Hàm trả về style màu cho trạng thái booking
  const getStatusStyle = (status) => {
    const styles = {
      'Đang thuê': { backgroundColor: '#dc3545', color: '#ffffff' }, // Màu đỏ với chữ trắng
      'Hoàn thành': { backgroundColor: '#28a745', color: '#ffffff' }, // Màu xanh với chữ trắng  
      'Đã hủy': { backgroundColor: '#ffc107', color: '#ffffff' } // Màu vàng với chữ trắng
    };
    return styles[status] || { backgroundColor: '#6c757d', color: '#ffffff' }; // Mặc định màu xám
  };

  // Hàm xử lý lọc dữ liệu theo các điều kiện
  const handleFilter = () => {
    const filtered = bookings.filter(booking => {
      // Kiểm tra điều kiện ngày bắt đầu
      const isFromDateValid = !fromDate || booking.startDate >= fromDate;
      // Kiểm tra điều kiện ngày kết thúc
      const isToDateValid = !toDate || booking.endDate <= toDate;
      // Kiểm tra điều kiện tên người dùng (không phân biệt hoa thường)
      const isUserMatch = !filterUser || booking.user.toLowerCase().includes(filterUser.toLowerCase());
      
      return isFromDateValid && isToDateValid && isUserMatch;
    });
    setFilteredBookings(filtered); // Cập nhật danh sách đã lọc
    setCurrentPage(1); // Đặt lại trang về 1 khi lọc
  };

  // Hàm chuyển đổi định dạng ngày từ YYYY-MM-DD sang DD-MM-YYYY
  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  // Tính toán số lượng trang dựa trên số dữ liệu và giới hạn 100 bản ghi/trang
  const itemsPerPage = 100; // Số lượng bản ghi trên mỗi trang
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
      </div>

      {/* Phần hiển thị bảng dữ liệu */}
      <div className="table-wrapper">
        <table className="booking-table-content">
          <thead>
            <tr>
              <th>STT</th> {/* Thêm cột số thứ tự */}
              <th>Số điện thoại</th>
              <th>Người dùng</th>
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
                <td>{booking.id}</td>
                <td>{booking.user}</td>
                <td>{formatDate(booking.startDate)}</td>
                <td>{formatDate(booking.endDate)}</td>
                <td>{booking.vehicle}</td>
                <td>{booking.duration} ngày</td>
                <td>{booking.revenue.toLocaleString()}</td>
                <td>
                  {/* Hiển thị trạng thái với màu tương ứng */}
                  <span
                    className="booking-status"
                    style={getStatusStyle(booking.status)}
                  >
                    {booking.status}
                  </span>
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
        <div className="pagination">
          {/* Nút quay lại trang trước */}
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Quay lại
          </button>
          {/* Hiển thị trang hiện tại và tổng số trang */}
          <span>
            Trang {currentPage} / {totalPages}
          </span>
          {/* Nút chuyển đến trang tiếp theo */}
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Tiếp theo
          </button>
        </div>
      </div>

      {/* Modal hiển thị chi tiết booking - chỉ hiện khi có selectedBooking */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Chi tiết đặt xe</h3>
            <p><strong>SĐT:</strong> {selectedBooking.id}</p>
            <p><strong>Người dùng:</strong> {selectedBooking.user}</p>
            <p><strong>Xe:</strong> {selectedBooking.vehicle}</p>
            <p><strong>Thời gian:</strong> {formatDate(selectedBooking.startDate)} - {formatDate(selectedBooking.endDate)}</p>
            <p><strong>Số ngày:</strong> {selectedBooking.duration} ngày</p>
            <p><strong>Doanh thu:</strong> {selectedBooking.revenue.toLocaleString()} VNĐ</p>
            <p>
              <strong>Trạng thái:</strong>
              {/* Hiển thị trạng thái trong modal với màu tương ứng */}
              <span
                className="booking-status"
                style={getStatusStyle(selectedBooking.status)}
              >
                {selectedBooking.status}
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