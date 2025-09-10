// Dữ liệu trạm sạc 
export const stationsData = [
  { id: 1, name: 'Trạm VinFast Quận 1', address: '123 Nguyễn Huệ, Q1', capacity: 20, status: 'Hoạt động', latitude: 10.7769, longitude: 106.7009 },
  { id: 2, name: 'Trạm VinFast Quận 3', address: '321 Võ Văn Tần, Q3', capacity: 15, status: 'Hoạt động', latitude: 10.7850, longitude: 106.6928 },
  { id: 3, name: 'Trạm VinFast Quận 4', address: '654 Tôn Đản, Q4', capacity: 18, status: 'Hoạt động', latitude: 10.7597, longitude: 106.7073 },
  { id: 4, name: 'Trạm VinFast Quận 5', address: '89 An Dương Vương, Q5', capacity: 14, status: 'Hoạt động', latitude: 10.7581, longitude: 106.6786 },
  { id: 5, name: 'Trạm VinFast Quận 6', address: '76 Hậu Giang, Q6', capacity: 17, status: 'Hoạt động', latitude: 10.7525, longitude: 106.6395 },
  { id: 6, name: 'Trạm VinFast Quận 7', address: '456 Nguyễn Thị Thập, Q7', capacity: 19, status: 'Hoạt động', latitude: 10.7320, longitude: 106.7280 },
  { id: 7, name: 'Trạm VinFast Quận 8', address: '12 Tạ Quang Bửu, Q8', capacity: 16, status: 'Bảo trì', latitude: 10.7367, longitude: 106.6630 },
  { id: 8, name: 'Trạm VinFast Quận 9', address: '45 Lê Văn Việt, Q9', capacity: 13, status: 'Hoạt động', latitude: 10.8440, longitude: 106.8010 },
  { id: 9, name: 'Trạm VinFast Quận 10', address: '90 Sư Vạn Hạnh, Q10', capacity: 21, status: 'Hoạt động', latitude: 10.7670, longitude: 106.6650 },
  { id: 10, name: 'Trạm VinFast Quận 11', address: '23 3/2, Q11', capacity: 12, status: 'Hoạt động', latitude: 10.7560, longitude: 106.6370 },
  { id: 11, name: 'Trạm VinFast Quận 12', address: '56 Lê Thị Riêng, Q12', capacity: 20, status: 'Hoạt động', latitude: 10.8550, longitude: 106.6490 },
  { id: 12, name: 'Trạm VinFast Bình Thạnh', address: '987 Xô Viết Nghệ Tĩnh', capacity: 22, status: 'Hoạt động', latitude: 10.8050, longitude: 106.7020 },
  { id: 13, name: 'Trạm VinFast Tân Bình', address: '345 Trường Chinh', capacity: 15, status: 'Bảo trì', latitude: 10.7890, longitude: 106.6440 },
  { id: 14, name: 'Trạm VinFast Tân Phú', address: '123 Lũy Bán Bích', capacity: 14, status: 'Hoạt động', latitude: 10.7760, longitude: 106.6270 },
  { id: 15, name: 'Trạm VinFast Phú Nhuận', address: '456 Phan Xích Long', capacity: 10, status: 'Tạm dừng', latitude: 10.7980, longitude: 106.6860 },
  { id: 16, name: 'Trạm VinFast Gò Vấp', address: '789 Phan Huy Ích, Gò Vấp', capacity: 18, status: 'Hoạt động', latitude: 10.8420, longitude: 106.6670 },
  { id: 17, name: 'Trạm VinFast Thủ Đức', address: '234 Nguyễn Văn Bá, Thủ Đức', capacity: 20, status: 'Hoạt động', latitude: 10.8530, longitude: 106.7480 },
  { id: 18, name: 'Trạm VinFast Bình Tân', address: '567 Kinh Dương Vương, Bình Tân', capacity: 15, status: 'Hoạt động', latitude: 10.7490, longitude: 106.5980 },
  { id: 19, name: 'Trạm VinFast Nhà Bè', address: '890 Lê Văn Lương, Nhà Bè', capacity: 12, status: 'Hoạt động', latitude: 10.6650, longitude: 106.7250 },
  { id: 20, name: 'Trạm VinFast Cần Giờ', address: '123 Đào Sư Tích, Cần Giờ', capacity: 10, status: 'Hoạt động', latitude: 10.4950, longitude: 106.9180 },
  { id: 21, name: 'Trạm VinFast Hóc Môn', address: '456 Nguyễn Ảnh Thủ, Hóc Môn', capacity: 16, status: 'Bảo trì', latitude: 10.8780, longitude: 106.5980 },
  { id: 22, name: 'Trạm VinFast Củ Chi', address: '789 Trịnh Hoài Đức, Củ Chi', capacity: 14, status: 'Hoạt động', latitude: 10.9870, longitude: 106.4950 },
  { id: 23, name: 'Trạm VinFast Bình Chánh', address: '234 Quốc lộ 50, Bình Chánh', capacity: 17, status: 'Tạm dừng', latitude: 10.6720, longitude: 106.5620 },
  { id: 24, name: 'Trạm VinFast Long Thành', address: '345 Nguyễn Hữu Cảnh, Long Thành', capacity: 19, status: 'Hoạt động', latitude: 10.7800, longitude: 107.0500 },
  { id: 25, name: 'Trạm VinFast Dĩ An', address: '678 Phạm Văn Đồng, Dĩ An', capacity: 13, status: 'Bảo trì', latitude: 10.9050, longitude: 106.7950 },
];

// Cấu hình trạng thái 
export const STATUS_CONFIG = {
  'Hoạt động': { color: '#28a745', textColor: '#ffffff' },
  'Bảo trì': { color: '#ffc107', textColor: '#ffffff' },
  'Tạm dừng': { color: '#dc3545', textColor: '#ffffff' }
};

// Danh sách trạng thái 
export const STATUS_OPTIONS = Object.keys(STATUS_CONFIG);

// Utility functions tối ưu
export const stationUtils = {
  findById: id => stationsData.find(s => s.id === id), 
  getTotalStations: () => stationsData.length 
};