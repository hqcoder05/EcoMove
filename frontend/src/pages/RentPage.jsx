import React from "react";
import { useParams } from "react-router-dom";
import bydseal from '../assets/bydseal.jpg';
import klara from '../assets/klara.jpg';
import tesla from '../assets/tesla.jpg';
import vf9 from '../assets/vinfast-vf9.jpg';
import vf8 from '../assets/vinfast8.jpg'; 

const carData = [
  { name: "VinFast VF 3", img: vf8 },
  { name: "VinFast VF 6 Plus", img: vf9 },
  { name: "Tesla Model 3", img: tesla },
  { name: "BYD Seal", img: bydseal },
  { name: "VinFast Klara", img: klara }
];

const RentPage = () => {
  const { carId } = useParams();
  const car = carData[carId];

  if (!car) return <div>Không tìm thấy xe!</div>;

  return (
    <>
      <style>{`
        .rent-container {
          max-width: 1100px;
          margin: auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        /* --- Layout Desktop --- */
        .rent-top {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .rent-images {
          flex: 1;
          min-width: 300px;
        }
        .main-img {
          width: 100%;
          border-radius: 10px;
        }
        .thumbnail-list {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .thumbnail {
          width: 80px;
          height: 60px;
          object-fit: cover;
          border-radius: 6px;
          cursor: pointer;
          border: 2px solid transparent;
        }
        .thumbnail:hover {
          border-color: #007bff;
        }
        .rent-info {
          flex: 1;
          min-width: 280px;
          background: #f9f9f9;
          padding: 15px;
          border-radius: 10px;
        }
        .car-name {
          font-size: 24px;
          margin-bottom: 10px;
        }
        .price {
          font-size: 18px;
          color: red;
          margin-bottom: 10px;
        }
        .car-specs {
          list-style: none;
          padding: 0;
          margin-bottom: 15px;
        }
        .car-specs li {
          padding: 5px 0;
          border-bottom: 1px solid #ddd;
        }
        .rent-btn {
          background: #007bff;
          color: white;
          padding: 10px 15px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
        }
        .rent-btn:hover {
          background: #0056b3;
        }
        .rent-section {
          margin-top: 20px;
          background: #fff;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0px 2px 8px rgba(0,0,0,0.1);
        }
        .rent-section h3 {
          margin-bottom: 10px;
        }
        .rent-section h4 {
          margin-top: 10px;
        }
        .rent-section ul {
          list-style: none;
          padding: 0;
        }
        .rent-section li {
          padding: 4px 0;
        }

        /* --- Responsive cho Mobile --- */
        @media (max-width: 768px) {
          .rent-top {
            flex-direction: column;
          }
          .thumbnail-list {
            justify-content: center;
          }
          .rent-info {
            margin-top: 20px;
          }
          .car-name {
            font-size: 20px;
          }
          .price {
            font-size: 16px;
          }
        }
      `}</style>

      <div className="rent-container">
        <div className="rent-top">
          <div className="rent-images">
            <img src={car.img} alt={car.name} className="main-img" />
            <div className="thumbnail-list">
              {[vf8, vf9, tesla, bydseal, klara].map((imgSrc, idx) => (
                <img key={idx} src={imgSrc} alt={`Thumbnail ${idx + 1}`} className="thumbnail" />
              ))}
            </div>
          </div>

          <div className="rent-info">
            <h2 className="car-name">{car.name}</h2>
            <p className="price">590.000 VNĐ/Ngày</p>
            <ul className="car-specs">
              <li>4 chỗ</li>
              <li>Số tự động</li>
              <li>43 HP</li>
              <li>285L</li>
              <li>210km (NEDC)</li>
              <li>1 túi khí</li>
              <li>Minicar</li>
              <li>Giới hạn di chuyển 300 km/ngày</li>
            </ul>
            <button 
              className="rent-btn" 
              onClick={() => window.location.href = "/booking-form"}
            >
              Đặt xe
            </button>
          </div>
        </div>

        <div className="rent-section">
          <h3>Các tiện nghi khác</h3>
          <ul>
            <li>Màn hình giải trí 10 inch</li>
            <li>La-zăng 16 inch</li>
          </ul>
        </div>

        <div className="rent-section">
          <h3>Điều kiện thuê xe</h3>
          <h4>Thông tin cần có khi nhận xe</h4>
          <ul>
            <li>CCCD hoặc hộ chiếu còn thời hạn</li>
            <li>Bằng lái hợp lệ, còn thời hạn</li>
          </ul>
          <h4>Hình thức thanh toán</h4>
          <ul>
            <li>Trả trước</li>
            <li>Đặt cọc giữ xe thanh toán 100% khi kí hợp đồng và nhận xe</li>
          </ul>
          <h4>Chính sách đặt cọc</h4>
          <p>Khách hàng phải thanh toán số tiền cọc là 5.000.000đ</p>
        </div>
      </div>
    </>
  );
};

export default RentPage;
