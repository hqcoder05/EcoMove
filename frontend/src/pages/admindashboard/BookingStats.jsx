import React, { useState, useEffect, useRef } from 'react';
import { bookings } from './datathuexe.js'; // Nhập dữ liệu bookings
import { searchData } from './datatramsac.js'; // Nhập dữ liệu tìm kiếm
import './BookingStats.css'; // Nhập stylesheet
import Chart from 'chart.js/auto'; // Nhập Chart.js

// Component chính BookingStats
const BookingStats = () => {
  // State cho dữ liệu và bộ lọc
  const [bookingsData] = useState(bookings); // Dữ liệu bookings
  const [fromDate, setFromDate] = useState(''); // Ngày bắt đầu bộ lọc
  const [toDate, setToDate] = useState(''); // Ngày kết thúc bộ lọc
  const [reportType, setReportType] = useState('doanhthu'); // Loại báo cáo mặc định

  // Ref cho các canvas biểu đồ
  const revenueChartRef = useRef(null); // Biểu đồ doanh thu theo tháng
  const vehicleTypeChartRef = useRef(null); // Biểu đồ doanh thu theo dòng xe
  const paymentChartRef = useRef(null); // Biểu đồ phương thức thanh toán
  const searchChartRef = useRef(null); // Biểu đồ lượt dò theo tháng

  // Hàm lọc dữ liệu theo khoảng thời gian
  const filterDataByDate = (data, dateField = 'startDate') => {
    if (!fromDate && !toDate) return data; // Trả về toàn bộ nếu không có ngày lọc
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      const from = fromDate ? new Date(fromDate) : new Date('2025-01-01');
      const to = toDate ? new Date(toDate) : new Date('2025-12-31');
      return itemDate >= from && itemDate <= to; // Lọc trong khoảng thời gian
    });
  };

  // Hàm tạo biểu đồ kết hợp (cột + đường) cho doanh thu theo tháng
  const createComboChart = (canvas) => {
    if (canvas) {
      if (canvas.chartInstance) canvas.chartInstance.destroy(); 
      const months = ['TH1', 'TH2', 'TH3', 'TH4', 'TH5', 'TH6', 'TH7', 'TH8', 'TH9', 'TH10', 'TH11', 'TH12'];
      const filteredBookings = filterDataByDate(bookingsData);
      const monthlyRevenue = filteredBookings.reduce((acc, b) => {
        const month = new Date(b.startDate).getMonth();
        acc[month] = (acc[month] || 0) + b.revenue; // Tính doanh thu theo tháng
        return acc;
      }, {});
      const sortedData = months.map((_, index) => monthlyRevenue[index] || 0);

      const newChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              type: 'bar',
              label: 'Doanh thu (VNĐ)',
              data: sortedData,
              backgroundColor: '#4CAF50',
              borderColor: '#4CAF50',
              borderWidth: 1,
              barPercentage: 0.7,
            },
            {
              type: 'line',
              label: 'Doanh thu (VNĐ)',
              data: sortedData,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: '#FF6384',
              borderWidth: 2,
              fill: false,
              tension: 0.4,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Doanh thu (VNĐ)', color: '#000000', font: { size: 14 } },
              ticks: { font: { size: 12 }, color: '#000000' },
              grid: { color: '#E0E0E0' },
            },
            x: {
              title: { display: false }, 
              ticks: { font: { size: 12 }, color: '#000000' }
            }
          },
          plugins: {
            legend: { position: 'top', labels: { font: { size: 14 }, color: '#000000' } },
            tooltip: { mode: 'index', intersect: false },
          },
          maintainAspectRatio: false,
          responsive: true,
          aspectRatio: 1.1,
        },
      });
      canvas.chartInstance = newChartInstance; // Lưu instance để hủy sau này
    }
  };

  // Hàm tạo biểu đồ cột cho doanh thu theo dòng xe
  const createBarChart = (canvas, data) => {
    if (canvas) {
      if (canvas.chartInstance) canvas.chartInstance.destroy(); 
      const newChartInstance = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [{
            label: 'Doanh thu (VNĐ)',
            data: data.datasets[0].data,
            backgroundColor: '#0B6E4F',
            borderColor: '#0B6E4F',
            borderWidth: 1,
          }],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Doanh thu (VNĐ)', color: '#000000', font: { size: 14 } },
              ticks: { font: { size: 12 }, color: '#000000' }
            },
            x: {
              title: { display: false }, 
              ticks: { font: { size: 12 }, color: '#000000' }
            }
          },
          plugins: {
            legend: { position: 'top', labels: { font: { size: 14 }, color: '#000000' } },
            tooltip: { mode: 'index', intersect: false }
          },
          maintainAspectRatio: false,
          responsive: true,
          aspectRatio: 1.1,
        },
      });
      canvas.chartInstance = newChartInstance;
    }
  };

  // Hàm tạo biểu đồ tròn cho phương thức thanh toán
  const createPieChart = (canvas, data) => {
    if (canvas) {
      if (canvas.chartInstance) canvas.chartInstance.destroy(); 
      const newChartInstance = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: data.labels,
          datasets: [{
            data: data.datasets[0].data,
            backgroundColor: ['#588157', '#5A9F68', '#BBD58E'],
          }],
        },
        options: {
          plugins: {
            legend: { position: 'top', labels: { font: { size: 14 }, color: '#000000' } },
            tooltip: { mode: 'index', intersect: false }
          },
          maintainAspectRatio: false,
          responsive: true,
          aspectRatio: 1.1,
        },
      });
      canvas.chartInstance = newChartInstance;
    }
  };

  // Hàm tạo biểu đồ vùng cho lượt dò theo tháng
  const createAreaChart = (canvas) => {
    if (canvas) {
      if (canvas.chartInstance) canvas.chartInstance.destroy(); 
      const months = ['TH1', 'TH2', 'TH3', 'TH4', 'TH5', 'TH6', 'TH7', 'TH8', 'TH9', 'TH10', 'TH11', 'TH12'];
      const filteredSearches = filterDataByDate(searchData, 'searchDate');
      const monthlySearches = filteredSearches.reduce((acc, s) => {
        const month = new Date(s.searchDate).getMonth();
        acc[month] = (acc[month] || 0) + 1; // Đếm lượt dò theo tháng
        return acc;
      }, {});
      const sortedData = months.map((_, index) => monthlySearches[index] || 0);

      const newChartInstance = new Chart(canvas, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Lượt dò',
            data: sortedData,
            backgroundColor: 'rgba(78, 113, 69, 0.2)',
            borderColor: '#4E7145',
            borderWidth: 2,
            fill: true,
          }],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Số lượt dò', color: '#000000', font: { size: 14 } },
              ticks: { font: { size: 12 }, color: '#000000' }
            },
            x: {
              title: { display: false }, // Loại bỏ nhãn "Tháng"
              ticks: { font: { size: 12 }, color: '#000000' }
            }
          },
          plugins: {
            legend: { position: 'top', labels: { font: { size: 14 }, color: '#000000' } },
            tooltip: { mode: 'index', intersect: false }
          },
          maintainAspectRatio: false,
          responsive: true,
          aspectRatio: 1.1,
        },
      });
      canvas.chartInstance = newChartInstance;
    }
  };

  // Component báo cáo doanh thu thuê xe
  const RentalRevenueReport = () => {
    const filteredBookings = filterDataByDate(bookingsData).filter(b => b.status !== 'Đã hủy');
    const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.revenue, 0); // Tổng doanh thu
    const totalRentals = filteredBookings.length; // Tổng lượt thuê
    const avgRentalDuration = filteredBookings.length > 0 ? filteredBookings.reduce((sum, b) => sum + b.duration, 0) / filteredBookings.length : 0; // Thời gian thuê trung bình

    // Dữ liệu cho biểu đồ doanh thu theo dòng xe
    const vehicleTypeRevenue = filteredBookings.reduce((acc, b) => {
      acc[b.vehicle] = (acc[b.vehicle] || 0) + b.revenue;
      return acc;
    }, {});
    const barChartData = {
      labels: Object.keys(vehicleTypeRevenue),
      datasets: [{ data: Object.values(vehicleTypeRevenue), label: 'Doanh thu' }],
    };

    // Dữ liệu cho biểu đồ phương thức thanh toán
    const paymentRevenue = filteredBookings.reduce((acc, b) => {
      acc[b.paymentMethod] = (acc[b.paymentMethod] || 0) + b.revenue;
      return acc;
    }, {});
    const pieChartData = {
      labels: ['Chuyển khoản', 'Ví điện tử', 'Tiền mặt'],
      datasets: [{ data: ['Chuyển khoản', 'Ví điện tử', 'Tiền mặt'].map(m => paymentRevenue[m] || 0) }],
    };

    // Tạo các biểu đồ
    useEffect(() => {
      createComboChart(revenueChartRef.current); // Biểu đồ doanh thu theo tháng
      createBarChart(vehicleTypeChartRef.current, barChartData); // Biểu đồ doanh thu theo dòng xe
      createPieChart(paymentChartRef.current, pieChartData); // Biểu đồ phương thức thanh toán
    }, [fromDate, toDate]);

    return (
      <div className="report-content">
        <div className="report-header">
          <h2>BÁO CÁO DOANH THU THUÊ XE</h2>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Tổng doanh thu</h4>
            <p className="stat-value">{totalRevenue.toLocaleString('vi-VN')} VNĐ</p>
          </div>
          <div className="stat-card">
            <h4>Tổng lượt thuê</h4>
            <p className="stat-value">{totalRentals}</p>
          </div>
          <div className="stat-card">
            <h4>Thời gian thuê TB</h4>
            <p className="stat-value">{avgRentalDuration.toFixed(1)} ngày</p>
          </div>
        </div>
        <div className="charts-container">
          <div className="chart-row">
            <div className="chart-card">
              <h3>Doanh thu theo tháng</h3>
              <canvas ref={revenueChartRef} id="revenueChart"></canvas>
            </div>
          </div>
          <div className="chart-row">
            <div className="chart-card">
              <h3>Doanh thu theo dòng xe</h3>
              <canvas ref={vehicleTypeChartRef} id="vehicleTypeChart"></canvas>
            </div>
          </div>
          <div className="chart-row">
            <div className="chart-card">
              <h3>Phương thức thanh toán</h3>
              <canvas ref={paymentChartRef} id="paymentChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component báo cáo dò trạm sạc
  const StationSearchReport = () => {
    const filteredSearches = filterDataByDate(searchData, 'searchDate');
    const totalSearches = filteredSearches.length; // Tổng lượt dò
    const avgSearchTime = 7; // Thời gian dò trung bình
    const conversionRate = filteredSearches.length > 0 ? (filteredSearches.filter(s => s.convertedToRental).length / filteredSearches.length) * 100 : 0; // Tỷ lệ chuyển đổi

    useEffect(() => {
      createAreaChart(searchChartRef.current); // Biểu đồ lượt dò theo tháng
    }, [fromDate, toDate]);

    return (
      <div className="report-content">
        <div className="report-header">
          <h2>BÁO CÁO DÒ TRẠM SẠC</h2>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <h4>Tổng lượt dò</h4>
            <p className="stat-value">{totalSearches}</p>
          </div>
          <div className="stat-card">
            <h4>Thời gian dò TB</h4>
            <p className="stat-value">{avgSearchTime} phút</p>
          </div>
          <div className="stat-card">
            <h4>Tỷ lệ chuyển đổi</h4>
            <p className="stat-value">{conversionRate.toFixed(1)}%</p>
          </div>
        </div>
        <div className="charts-container">
          <div className="chart-row">
            <div className="chart-card">
              <h3>Lượt dò theo tháng</h3>
              <canvas ref={searchChartRef} id="searchChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Giao diện chính với bộ lọc và báo cáo
  return (
    <div className="main-container">
      <div className="filter-section">
        <span style={{ fontWeight: 'bold', color: '#000000' }}>FROM DATE:</span>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <span style={{ fontWeight: 'bold', color: '#000000' }}>TO DATE:</span>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <div className="status-filter">
          <button
            onClick={() => setReportType('doanhthu')}
            style={{ backgroundColor: reportType === 'doanhthu' ? '#1A4D23' : '#2E7D32', color: '#ffffff', padding: '8px 16px', margin: '0 8px', border: '1px solid #2E7D32', borderRadius: '6px', transition: 'all 0.3s' }}
          >
            DOANH THU THUÊ XE
          </button>
          <button
            onClick={() => setReportType('dotramsac')}
            style={{ backgroundColor: reportType === 'dotramsac' ? '#1A4D23' : '#2E7D32', color: '#ffffff', padding: '8px 16px', margin: '0 8px', border: '1px solid #2E7D32', borderRadius: '6px', transition: 'all 0.3s' }}
          >
            DÒ TRẠM SẠC
          </button>
        </div>
      </div>
      {reportType === 'doanhthu' ? <RentalRevenueReport /> : <StationSearchReport />}
    </div>
  );
};

export default BookingStats;