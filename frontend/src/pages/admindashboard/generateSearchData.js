import { stationsData } from './StationData.js';
import fs from 'fs';

function generateRandomUsername() {
  const firstNames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vu', 'Do', 'Bui', 'Ngo', 'Phan'];
  const lastNames = ['Van', 'Thi', 'Duc', 'Hong', 'Minh', 'Anh', 'Tuan', 'Hanh', 'Quang', 'Lan'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
}

// Hàm tạo giờ ngẫu nhiên trong ngày
function generateRandomTime() {
  const hour = Math.floor(Math.random() * 24); // Giờ từ 0-23
  const minute = Math.floor(Math.random() * 60); // Phút từ 0-59
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// Hàm tạo thời gian dò trạm sạc trung bình 7 phút (dao động 5-9 phút)
function generateSearchTime() {
  return Math.floor(5 + Math.random() * 4); // Dao động từ 5-9 phút
}

// Hàm tính toán số lượt dò dựa trên ngày, tạo sự biến động
function calculateDailySearches(date, totalDays, totalTarget) {
  const startDate = new Date('2025-01-01');
  const currentDate = new Date(date);
  const daysSinceStart = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
  let baseSearches = Math.floor(totalTarget / totalDays); // Lượt dò cơ bản mỗi ngày

  // Giai đoạn đầu (tháng 1/2025, 0-31 ngày): Lượt dò thấp (20-40% của cơ bản)
  if (daysSinceStart < 31) {
    return Math.floor(baseSearches * (0.2 + Math.random() * 0.2));
  }

  // Tăng dần từ tháng 2/2025 (31-60 ngày): 50-80% của cơ bản
  if (daysSinceStart < 61) {
    return Math.floor(baseSearches * (0.5 + Math.random() * 0.3));
  }

  // Ngày bình thường: Biến động 80-120% của cơ bản
  let normalVariation = baseSearches * (0.8 + Math.random() * 0.4);

  // Tăng mạnh vào các dịp lễ - Tết
  const holidays = [
    new Date('2025-01-28'), // Tết Nguyên Đán (ước tính khoảng 28/01/2025)
    new Date('2025-01-29'),
    new Date('2025-01-30'),
    new Date('2025-04-30'), // 30/4
    new Date('2025-05-01'), // 1/5
    new Date('2025-09-02')  // 2/9
  ];

  if (holidays.some(holiday => Math.abs(holiday - currentDate) / (1000 * 60 * 60 * 24) < 1)) {
    normalVariation *= 2.5; // Tăng 2.5 lần vào dịp lễ
  }

  return Math.max(1, Math.floor(normalVariation)); // Đảm bảo ít nhất 1 lượt
}

function generateSearchData(startDate, endDate, totalTarget) {
  const data = [];
  let userId = 1;
  const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  let currentDate = new Date(startDate);

  while (currentDate <= endDate && data.length < totalTarget) {
    const dailySearches = calculateDailySearches(currentDate, totalDays, totalTarget);
    const searchesForDay = Math.min(dailySearches, totalTarget - data.length);

    for (let j = 0; j < searchesForDay; j++) {
      const station = stationsData[Math.floor(Math.random() * stationsData.length)];
      const searchTimeMinutes = generateSearchTime(); // Thời gian dò trung bình 7 phút (5-9 phút)
      const searchHourMinute = generateRandomTime();
      const formattedDate = currentDate.toISOString().split('T')[0];

      data.push({
        userId: userId++,
        username: generateRandomUsername(),
        stationId: station.id,
        stationName: station.name,
        searchDate: formattedDate,
        searchTime: searchTimeMinutes, // Thời gian dò (phút)
        searchHourMinute: searchHourMinute, // Giờ và phút tìm kiếm
        convertedToRental: Math.random() < 0.3 // Tỷ lệ chuyển đổi 30%
      });

      if (userId > 1000) userId = 1; // Reset userId nếu vượt quá 1000
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Đảm bảo đủ số lượng người dùng
  while (data.length < totalTarget) {
    const randomDay = Math.floor(Math.random() * totalDays);
    const extraDate = new Date(startDate);
    extraDate.setDate(extraDate.getDate() + randomDay);
    const station = stationsData[Math.floor(Math.random() * stationsData.length)];
    const searchTimeMinutes = generateSearchTime();
    const searchHourMinute = generateRandomTime();
    const formattedDate = extraDate.toISOString().split('T')[0];

    data.push({
      userId: userId++,
      username: generateRandomUsername(),
      stationId: station.id,
      stationName: station.name,
      searchDate: formattedDate,
      searchTime: searchTimeMinutes,
      searchHourMinute: searchHourMinute,
      convertedToRental: Math.random() < 0.3
    });

    if (userId > 1000) userId = 1;
  }

  return data;
}

// Cấu hình ngày bắt đầu và kết thúc
const startDate = new Date('2025-01-01');
const endDate = new Date('2025-09-10'); // Từ 1/1/2025 đến 10/9/2025
const totalTarget = 12650; // Tổng số lượt dò
const searchData = generateSearchData(startDate, endDate, totalTarget);

fs.writeFileSync('datatramsac.js', `export const searchData = ${JSON.stringify(searchData, null, 2)};`);
console.log(`Đã tạo ${searchData.length} lượt tìm kiếm và lưu vào datatramsac.js - generateSearchData.js:126`);