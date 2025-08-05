=======
# EcoMove – Hệ thống mô phỏng giao thông xanh

**EcoMove** là một hệ thống mô phỏng tích hợp nhiều dịch vụ giao thông xanh tại Hà Nội, bao gồm:

- Thuê xe điện (e-bike/e-car)
- Theo dõi xe buýt điện công cộng
- Tìm kiếm trạm sạc
- Gợi ý thông minh trạm thuê/trả xe bằng AI
- Dự báo nhu cầu theo thời gian và vị trí

---

## 🚀 Kiến trúc hệ thống
ecomove-project/
├── ecomove-frontend/     # Giao diện React
├── ecomove-backend/      # Spring Boot REST API
└── ecomove-ai/           # Dịch vụ AI Flask

ai_service/
├── app.py                   # ✅ Điểm khởi chạy FastAPI (đổi từ Flask sang FastAPI)
├── model/                   # ✅ Logic AI
│   ├── suggest_station.py   # Gợi ý trạm thay thế khi gần full
│   ├── predict_demand.py    # Dự đoán nhu cầu sạc
│   └── __init__.py
├── data/
│   └── station_bookings.csv # Dữ liệu huấn luyện mẫu
├── utils/
│   └── preprocess.py        # Tiền xử lý (chuẩn hóa, encode, fill missing...)
├── schemas/
│   └── demand.py            # ✅ Pydantic schemas cho API input/output
├── routers/
│   ├── train.py             # ✅ API endpoint huấn luyện mô hình
│   ├── predict.py           # ✅ API endpoint dự đoán nhu cầu
│   ├── suggest.py           # ✅ API endpoint gợi ý trạm
│   └── health.py            # Kiểm tra tình trạng API
├── models/                  # (tuỳ chọn) ORM nếu sau này gắn DB
├── .env                     # Config bí mật
└── requirements.txt         # Thư viện cần cài