const fs = require('fs');

// Danh sách xe từ VehicleList.jsx, lấy giá chính xác (bỏ dấu chấm và chuyển thành số)
const vehicles = [
  { name: 'VinFast VF3', price: 590000 },
  { name: 'VinFast VF7 Eco', price: 1200000 },
  { name: 'VinFast VF7 Plus', price: 1300000 },
  { name: 'VinFast VF9 Eco', price: 1800000 },
  { name: 'VinFast VF9 Plus', price: 1900000 },
  { name: 'VinFast VF8 Eco', price: 1500000 },
  { name: 'VinFast VF8 Plus', price: 1600000 },
  { name: 'Tesla Model 3', price: 1500000 },
  { name: 'BYD Seal', price: 1350000 },
  { name: 'BYD Atto 3', price: 1150000 },
  { name: 'BYD Sealion 6', price: 1250000 },
];

// Danh sách trạng thái với phân bổ (20 Đã hủy, 15 Đang thuê, 345 Hoàn thành)
const statuses = [
  { name: 'Đã hủy', weight: 20 }, // 20 bản ghi
  { name: 'Hoàn thành', weight: 345 }, // 345 bản ghi
  { name: 'Đang thuê', weight: 15 } // 15 bản ghi (sau 10/9)
];

// Danh sách phương thức thanh toán
const paymentMethods = ['Chuyển khoản', 'Ví điện tử', 'Tiền mặt'];

// Hàm tạo tên ngẫu nhiên
function generateRandomName() {
  const firstNames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vu', 'Do', 'Bui', 'Ngo', 'Phan'];
  const lastNames = ['Van', 'Thi', 'Duc', 'Hong', 'Minh', 'Anh', 'Tuan', 'Hanh', 'Quang', 'Lan'];
  const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]} ${randomChar}${randomChar}`;
}

// Hàm tạo ID ngẫu nhiên (10 chữ số)
function generateRandomId() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Hàm tạo ngày ngẫu nhiên từ 01/01/2025 đến 10/09/2025
function generateRandomDate(minDate = new Date('2025-01-01'), maxDate = new Date('2025-09-10')) {
  const randomTime = minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime());
  return new Date(randomTime);
}

// Hàm tính toán số lượng booking mỗi ngày dựa trên ngày (ảnh hưởng đến doanh thu)
function calculateDailyBookings(date, totalDays, totalTarget) {
  const startDate = new Date('2025-01-01');
  const currentDate = new Date(date);
  const daysSinceStart = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
  let baseBookings = Math.floor(totalTarget / totalDays); // Số booking cơ bản mỗi ngày

  // Giai đoạn đầu (0-31 ngày, tháng 1/2025): Ít booking (20-40% của cơ bản)
  if (daysSinceStart < 31) {
    return Math.floor(baseBookings * (0.2 + Math.random() * 0.2));
  }

  // Tăng dần từ tháng 2/2025 (31-60 ngày): 50-80% của cơ bản
  if (daysSinceStart < 61) {
    return Math.floor(baseBookings * (0.5 + Math.random() * 0.3));
  }

  // Ngày bình thường: Biến động 80-120% của cơ bản
  let normalVariation = baseBookings * (0.8 + Math.random() * 0.4);

  // Tăng mạnh vào các dịp lễ - Tết
  const holidays = [
    new Date('2025-01-28'), // Tết Nguyên Đán (ước tính)
    new Date('2025-01-29'),
    new Date('2025-01-30'),
    new Date('2025-04-30'), // 30/4
    new Date('2025-05-01'), // 1/5
    new Date('2025-09-02')  // 2/9
  ];

  if (holidays.some(holiday => Math.abs(holiday - currentDate) / (1000 * 60 * 60 * 24) < 1)) {
    normalVariation *= 2.5; // Tăng 2.5 lần vào dịp lễ
  }

  return Math.max(1, Math.floor(normalVariation)); // Đảm bảo ít nhất 1 booking
}

// Hàm chọn trạng thái ngẫu nhiên, đảm bảo 15 Đang thuê sau 10/9
function getRandomStatus(date) {
  const totalWeight = statuses.reduce((sum, s) => sum + s.weight, 0);
  const random = Math.random() * totalWeight;
  let weightSum = 0;
  for (const status of statuses) {
    weightSum += status.weight;
    if (random <= weightSum) {
      // Đảm bảo 15 booking Đang thuê từ 10/9 trở đi
      if (status.name === 'Đang thuê' && new Date(date) < new Date('2025-09-10')) {
        return 'Hoàn thành'; // Chuyển sang Hoàn thành nếu trước 10/9
      }
      return status.name;
    }
  }
}

// Hàm tạo dữ liệu booking với doanh thu chính xác, giới hạn 20 ngày
function generateRandomBooking(date) {
  const startDate = new Date(date).toISOString().split('T')[0];
  const duration = Math.floor(Math.random() * 20) + 1; // 1-20 ngày
  const endDate = new Date(new Date(startDate).setDate(new Date(startDate).getDate() + duration))
    .toISOString().split('T')[0];
  const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
  const pricePerDay = vehicle.price;
  const revenue = pricePerDay * duration;
  const status = getRandomStatus(startDate);
  const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

  return {
    id: generateRandomId(),
    user: generateRandomName(),
    startDate,
    endDate,
    vehicle: vehicle.name,
    duration,
    revenue,
    status,
    paymentMethod
  };
}

// Tạo 380 bản ghi với phân bố theo ngày
const startDate = new Date('2025-01-01');
const endDate = new Date('2025-09-10');
const totalDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
const totalTarget = 380;
const allBookings = [];

// Đảm bảo 15 booking Đang thuê sau 10/9
const afterSept10Start = new Date('2025-09-10');
const afterSept10End = new Date('2025-09-10');
for (let i = 0; i < 15; i++) {
  const date = generateRandomDate(afterSept10Start, afterSept10End);
  allBookings.push(generateRandomBooking(date));
}

// Tạo phần còn lại trước 10/9, đảm bảo tổng số 380
let currentDate = new Date(startDate);
let remainingBookings = totalTarget - 15; // Loại trừ 15 Đang thuê
while (allBookings.length < totalTarget) {
  if (new Date(currentDate) >= afterSept10Start) break;
  const dailyBookings = calculateDailyBookings(currentDate, totalDays, remainingBookings);
  const bookingsForDay = Math.min(dailyBookings, remainingBookings - allBookings.length);

  for (let j = 0; j < bookingsForDay; j++) {
    allBookings.push(generateRandomBooking(currentDate));
  }

  currentDate.setDate(currentDate.getDate() + 1);
}

// Đảm bảo đúng 20 bản ghi Đã hủy
const canceledBookings = allBookings.filter(b => b.status === 'Đã hủy');
const otherBookings = allBookings.filter(b => b.status !== 'Đã hủy');
if (canceledBookings.length < 20) {
  const additionalCanceled = otherBookings.splice(0, 20 - canceledBookings.length);
  additionalCanceled.forEach(b => b.status = 'Đã hủy');
  allBookings.length = 0; // Xóa mảng cũ
  allBookings.push(...canceledBookings, ...additionalCanceled, ...otherBookings);
}

// Kiểm tra và bổ sung nếu thiếu (đảm bảo 380)
while (allBookings.length < totalTarget) {
  const date = generateRandomDate(startDate, new Date('2025-09-09')); // Bổ sung trước 10/9
  allBookings.push(generateRandomBooking(date));
}

// Sắp xếp theo trạng thái Đang thuê và startDate giảm dần
allBookings.sort((a, b) => {
  if (a.status === 'Đang thuê' && b.status !== 'Đang thuê') return -1;
  if (a.status !== 'Đang thuê' && b.status === 'Đang thuê') return 1;
  return new Date(b.startDate) - new Date(a.startDate);
});

// Lưu vào file datathuexe.js trong cùng thư mục
fs.writeFileSync('datathuexe.js', `export const bookings = ${JSON.stringify(allBookings, null, 2)};`);
console.log(`Đã tạo ${allBookings.length} lượt thuê và lưu vào datathuexe.js - generateBookings.js:181`);