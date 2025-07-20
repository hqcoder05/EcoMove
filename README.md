# EcoMove – Hệ thống mô phỏng giao thông xanh

**EcoMove** là một hệ thống mô phỏng tích hợp nhiều dịch vụ giao thông xanh tại Hà Nội, bao gồm:

- Thuê xe điện (e-bike/e-car)
- Theo dõi xe buýt điện công cộng
- Tìm kiếm trạm sạc
- Gợi ý thông minh trạm thuê/trả xe bằng AI
- Dự báo nhu cầu theo thời gian và vị trí

---

## 🚀 Kiến trúc hệ thống

```bash
ecomove-project/
├── ecomove-frontend/     # Giao diện React
├── ecomove-backend/      # Spring Boot REST API
└── ecomove-ai/           # Dịch vụ AI Flask
