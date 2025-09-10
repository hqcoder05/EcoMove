import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import AdminNavbar from './AdminNavbar';
import StationList from './StationList';
import VehicleList from './VehicleList';
import BookingTable from './BookingTable';
import BookingStats from './BookingStats';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { setIsAuthenticated } = useContext(AuthContext);
  const [adminInfo, setAdminInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('stations');
  const navigate = useNavigate();

  useEffect(() => {
    const storedAdminInfo = localStorage.getItem('adminInfo');
    console.log('AdminInfo từ localStorage: - AdminDashboard.jsx:19', storedAdminInfo);
    if (storedAdminInfo) {
      setAdminInfo(JSON.parse(storedAdminInfo));
    } else {
      console.log('Không tìm thấy adminInfo, kiểm tra lại token - AdminDashboard.jsx:23');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setIsAuthenticated(false);
    navigate('/admin/login');
    console.log('Đăng xuất thành công, token đã xóa - AdminDashboard.jsx:32');
  };

  return (
    <div className="app-content">
      <div className="content">
        {adminInfo ? (
          <div>
            <AdminNavbar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
            <div className="tab-content">
              {activeTab === 'stations' && <StationList />}
              {activeTab === 'vehicles' && <VehicleList />}
              {activeTab === 'bookings' && <BookingTable />}
              {activeTab === 'stats' && <BookingStats />}
            </div>
          </div>
        ) : (
          <p>Đang tải thông tin admin...</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;