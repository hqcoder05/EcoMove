import React, { useState } from 'react'; // Nhập useState từ React
import { FaBolt } from 'react-icons/fa'; // Nhập icon sấm sét
import { FaUserShield } from 'react-icons/fa'; // Nhập icon khiên người dùng
import './AdminNavbar.css'; // Nhập file CSS cho navbar

const AdminNavbar = ({ activeTab, setActiveTab, onLogout }) => {
  const [showAdminInfo, setShowAdminInfo] = useState(false); // Khởi tạo state để quản lý hiển thị dropdown

  const menuItems = [
    { id: 'stations', label: 'Quản lý trạm sạc' }, // Mục menu cho quản lý trạm sạc
    { id: 'vehicles', label: 'Quản lý xe điện' }, // Mục menu cho quản lý xe điện
    { id: 'bookings', label: 'Danh sách đặt xe' }, // Mục menu cho danh sách đặt xe
    { id: 'stats', label: 'Quản lý báo cáo' }, // Mục menu cho quản lý báo cáo
  ];

  return (
    <nav className="admin-navbar">
      <div className="navbar-brand">
        <h2><FaBolt style={{ marginRight: '8px', color: '#fbc02d' }} />EcoMove</h2> {/* Hiển thị logo và tên ứng dụng */}
      </div>
      <div className="navbar-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="menu-label">{item.label}</span> {/* Hiển thị nhãn của từng tab */}
          </button>
        ))}
      </div>
      <div className="navbar-user">
        <span className="admin-user" onClick={() => setShowAdminInfo(!showAdminInfo)}>
          <FaUserShield style={{ marginRight: '6px' }} /> Admin User {/* Hiển thị thông tin admin */}
        </span>
        {showAdminInfo && (
          <div className="admin-info-dropdown">
            <p><strong style={{ color: 'black' }}>Email:</strong> camtuN15@gmail.com</p> {/* Hiển thị email với chữ đen và in đậm */}
            <p><strong style={{ color: 'black' }}>Quyền:</strong> Admin</p> {/* Hiển thị quyền với chữ đen và in đậm */}
          </div>
        )}
        <button className="logout-btn" onClick={onLogout}>Đăng xuất</button> {/* Nút đăng xuất */}
      </div>
    </nav>
  );
};

export default AdminNavbar; // Xuất component để sử dụng ở nơi khác