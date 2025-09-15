import React, { useEffect, useState } from 'react'; // Nhập useState từ React để quản lý trạng thái
import { Plus, Edit, Trash2 } from 'lucide-react'; // Nhập các icon từ lucide-react
import './VehicleList.css'; // Nhập file CSS cho danh sách xe

// Dữ liệu mẫu các xe điện, dùng để hiển thị danh sách ban đầu
const initialVehicles = [
  { id: 1, name: 'VinFast VF3', image: '/images/vinfastvf3.jpg', price: '590.000', type: 'Minicar', range: '210km', seats: '4 chỗ', trunk: '285L', status: 'rented' },
  { id: 2, name: 'VinFast VF7 Eco', image: '/images/vinfastvf7-eco.png', price: '1.200.000', type: 'Crossover', range: '390km', seats: '5 chỗ', trunk: '400L', status: 'available' },
  { id: 3, name: 'VinFast VF7 Plus', image: '/images/vinfastvf7-plus.jpg', price: '1.300.000', type: 'Crossover', range: '400km', seats: '5 chỗ', trunk: '410L', status: 'rented' },
  { id: 4, name: 'VinFast VF9 Eco', image: '/images/vinfastvf9-eco.jpg', price: '1.800.000', type: 'E-SUV', range: '500km', seats: '7 chỗ', trunk: '450L', status: 'rented' },
  { id: 5, name: 'VinFast VF9 Plus', image: '/images/vinfastvf9-plus.png', price: '1.900.000', type: 'E-SUV', range: '510km', seats: '7 chỗ', trunk: '470L', status: 'rented' },
  { id: 6, name: 'VinFast VF8 Eco', image: '/images/vinfastvf8-eco.jpg', price: '1.500.000', type: 'D-SUV', range: '470km', seats: '5 chỗ', trunk: '420L', status: 'rented' },
  { id: 7, name: 'VinFast VF8 Plus', image: '/images/vinfastvf8-plus.jpg', price: '1.600.000', type: 'D-SUV', range: '480km', seats: '5 chỗ', trunk: '425L', status: 'rented' },
  { id: 8, name: 'Tesla Model 3', image: '/images/tesla.png', price: '1.500.000', type: 'Sedan', range: '500km', seats: '5 chỗ', trunk: '430L', status: 'maintenance' },
  { id: 9, name: 'BYD Seal', image: '/images/bydseal.jpg', price: '1.350.000', type: 'Sedan', range: '550km', seats: '5 chỗ', trunk: '440L', status: 'rented' },
  { id: 10, name: 'BYD Atto 3', image: '/images/byd-atto3.jpg', price: '1.150.000', type: 'SUV', range: '420km', seats: '5 chỗ', trunk: '410L', status: 'rented' },
  { id: 11, name: 'BYD Sealion 6', image: '/images/byd-sealion6.jpg', price: '1.250.000', type: 'SUV', range: '460km', seats: '5 chỗ', trunk: '430L', status: 'available', isHybrid: true },
];

// Component tái sử dụng cho input/select để giảm lặp code trong form
const FormInput = ({ id, label, type = 'text', value, onChange, placeholder, required, options }) => (
  <div className="form-group-improved">
    <label htmlFor={id} className="label-improved">
      {label} {required && <span className="required">*</span>}
    </label>
    {options ? (
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="select-improved"
        required={required}
      >
        {options.map(opt => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    ) : (
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-improved"
        required={required}
      />
    )}
  </div>
);

// Component chính quản lý danh sách xe và modal thêm/sửa
const VehicleList = () => {
  // State để quản lý danh sách xe, modal, và dữ liệu form
  // const [vehicles, setVehicles] = useState(initialVehicles);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    price: '',
    type: '',
    range: '',
    seats: '',
    trunk: '',
    status: 'available',
  });

  // Hàm ánh xạ trạng thái sang text tiếng Việt
  const getStatusText = (status) => ({
    rented: 'Đang thuê',
    available: 'Có sẵn',
    maintenance: 'Bảo trì'
  }[status] || 'Có sẵn');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:8080/api/vehicles", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách xe');
      }
      
      const data = await response.json();
      // Backend trả về List<VehicleResponse> trực tiếp, không có wrapper
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi kết nối backend:", error);
      alert("Lỗi kết nối server: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý submit form (thêm hoặc cập nhật xe)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    const url = editingVehicle
    ? `http://localhost:8080/api/vehicles/${editingVehicle.id}`
    : 'http://localhost:8080/api/vehicles';
    const method = editingVehicle ? 'PUT' : 'POST';
    try{
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error('Thêm/cập nhật xe thất bại');
      }

      const savedVehicle = await response.json();

      const vehicle = savedVehicle;
      if (editingVehicle) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === editingVehicle.id ? savedVehicle : v))
        );
        alert('Cập nhật xe thành công!');
      } else {
        setVehicles((prev) => [...prev, savedVehicle]);
        alert('Thêm xe mới thành công!');
      }

      handleCloseModal();
    } catch (error) {
      console.error("Lỗi khi kết nối backend:", error);
      alert("Lỗi kết nối server");
    }
  };

  // Xử lý xóa xe với xác nhận
  const handleDelete = async (vehicleId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa xe này?')) {
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error('Xóa xe thất bại');
      };

      setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
      alert('Xóa xe thành công!');
    } catch (error) {
      console.error("Lỗi khi kết nối backend:", error);
      alert("Lỗi kết nối server");
    }
  };

  // Xử lý mở modal chỉnh sửa
  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({ 
      name: vehicle.name || '',
      image: vehicle.image || '',
      price: vehicle.price || '',
      type: vehicle.type || '',
      range: vehicle.range || '',
      seats: vehicle.seats || '',
      trunk: vehicle.trunk || '',
      status: vehicle.status || 'available', 
    });
    setShowModal(true);
  };

  // Xử lý mở modal thêm xe mới
  const handleAddClick = () => {
    setEditingVehicle(null);
    setFormData({
      name: '',
      image: '',
      price: '',
      type: '',
      range: '',
      seats: '',
      trunk: '',
      status: 'available',
    });
    setShowModal(true);
  };

  // Đóng modal và reset form
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
    setFormData({
      name: '',
      image: '',
      price: '',
      type: '',
      range: '',
      seats: '',
      trunk: '',
      status: 'available',
    });
  };

  // Hàm xử lý thay đổi input/select
  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };
  
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Render giao diện
  return (
    <div className="station-list">
      {/* Header với tiêu đề và nút thêm xe */}
      <div className="list-header">
        <h2 className="title-black">Danh sách xe điện ({vehicles.length}) {loading && <span className="loading-text"> - Đang tải...</span>} </h2>
        <button className="add-btn" onClick={handleAddClick} disabled={loading}>
          <Plus size={14} /> Thêm xe mới
        </button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang xử lý...</p>
        </div>
      )}

      {/* Lưới hiển thị danh sách xe */}
      <div className="vehicle-grid">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="vehicle-card">
            <div className="image-container">
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="vehicle-image"
                onError={(e) => {
                  console.log(`Lỗi tải ảnh cho ${vehicle.name}: ${e.target.src} - VehicleList.jsx:162`);
                  e.target.src = 'https://via.placeholder.com/180';
                  e.target.alt = 'Ảnh không tải được';
                }}
              />
              <span className={`status-badge status-${vehicle.status}`}>
                {getStatusText(vehicle.status)}
              </span>
            </div>

            <div className="vehicle-info-box">
              <div className="vehicle-info-content">
                <span className="vehicle-name-black">{vehicle.name}</span>
                <span className="price-info">
                  <span className="price-label-black">Giá thuê: </span>
                  <span className="price-black">{vehicle.price}</span>
                  <span className="price-unit-black"> VNĐ/Ngày</span>
                </span>
              </div>
            </div>

            {/* Thông tin xe, căn lề trái trong CSS */}
            <div className="vehicle-details">
              <p><span className="detail-label">Loại xe:</span> {vehicle.type}</p>
              <p><span className="detail-label">Quãng đường:</span> {vehicle.range}</p>
              <p><span className="detail-label">Số chỗ:</span> {vehicle.seats}</p>
              <p><span className="detail-label">Cốp:</span> {vehicle.trunk}</p>
              <p><span className="detail-label">Miễn phí sạc</span></p>
            </div>

            <div className="vehicle-actions">
              <button className="btn-edit" onClick={() => handleEdit(vehicle)}>
                <Edit size={16} /> Sửa
              </button>
              <button className="btn-delete" onClick={() => handleDelete(vehicle.id)}>
                <Trash2 size={16} /> Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal thêm/sửa xe */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content-improved" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-improved">
              <h3 className="modal-title">
                {editingVehicle ? 'Chỉnh sửa thông tin xe' : 'Thêm xe mới'}
              </h3>
              <button className="close-btn-improved" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="station-form-improved">
              <div className="form-section">
                <h4 className="section-title">Thông tin cơ bản</h4>
                <div className="form-row">
                  <FormInput
                    id="name"
                    label="Tên xe"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    placeholder="VD: VinFast VF8"
                    required
                  />
                  <FormInput
                    id="type"
                    label="Loại xe"
                    value={formData.type}
                    onChange={handleInputChange('type')}
                    required
                    options={[
                      { value: '', label: 'Chọn loại xe' },
                      { value: 'Minicar', label: 'Minicar' },
                      { value: 'Sedan', label: 'Sedan' },
                      { value: 'SUV', label: 'SUV' },
                      { value: 'Crossover', label: 'Crossover' },
                      { value: 'E-SUV', label: 'E-SUV' },
                      { value: 'D-SUV', label: 'D-SUV' },
                    ]}
                  />
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title">Giá và trạng thái</h4>
                <div className="form-row">
                  <FormInput
                    id="price"
                    label="Giá thuê (VNĐ/ngày)"
                    value={formData.price}
                    onChange={handleInputChange('price')}
                    placeholder="VD: 1.200.000"
                    required
                  />
                  <FormInput
                    id="status"
                    label="Trạng thái"
                    value={formData.status}
                    onChange={handleInputChange('status')}
                    required
                    options={[
                      { value: 'available', label: 'Có sẵn' },
                      { value: 'rented', label: 'Đang thuê' },
                      { value: 'maintenance', label: 'Bảo trì' },
                    ]}
                  />
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title">Thông số kỹ thuật</h4>
                <div className="form-row">
                  <FormInput
                    id="range"
                    label="Quãng đường (km)"
                    value={formData.range}
                    onChange={handleInputChange('range')}
                    placeholder="VD: 450km"
                    required
                  />
                  <FormInput
                    id="seats"
                    label="Số chỗ ngồi"
                    value={formData.seats}
                    onChange={handleInputChange('seats')}
                    required
                    options={[
                      { value: '', label: 'Chọn số chỗ' },
                      { value: '2 chỗ', label: '2 chỗ' },
                      { value: '4 chỗ', label: '4 chỗ' },
                      { value: '5 chỗ', label: '5 chỗ' },
                      { value: '7 chỗ', label: '7 chỗ' },
                    ]}
                  />
                </div>
                <div className="form-row">
                  <FormInput
                    id="trunk"
                    label="Dung tích cốp (L)"
                    value={formData.trunk}
                    onChange={handleInputChange('trunk')}
                    placeholder="VD: 450L"
                    required
                  />
                  <FormInput
                    id="image"
                    label="URL hình ảnh"
                    type="url"
                    value={formData.image}
                    onChange={handleInputChange('image')}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="form-actions-improved">
                <button type="button" className="btn-cancel-improved" onClick={handleCloseModal} disabled={loading}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit-improved" disabled={loading}>
                  {loading ? 'Đang xử lý...' : (editingVehicle ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList; 