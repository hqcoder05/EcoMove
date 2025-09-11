// src/pages/VehicleList.jsx
import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './VehicleList.css';

// ================== Cấu hình API ==================
const API_BASE = 'http://localhost:8080/api'; // sửa nếu backend của bạn có prefix khác
const VEHICLE_URL = `${API_BASE}/vehicles`;

// ================== Helpers ==================
const toInt = (v) => {
  if (v == null || v === '') return null;
  const n = Number(String(v).replace(/[^\d]/g, ''));
  return Number.isFinite(n) ? n : null;
};

// FE đang hiển thị status dạng "available" | "rented" | "maintenance"
// Khi gửi về BE (VehicleRequest) thường là enum → để chắc chắn thì upper-case
const toApiStatus = (s) => (s ? String(s).toUpperCase() : 'AVAILABLE');

// Map response (VehicleResponse đã ở dạng UI-friendly) -> object cho UI
const mapResponseToUI = (r) => ({
  id: r.id,                  // UUID (đÃ đồng bộ)
  name: r.name ?? '',
  image: r.image ?? '',
  price: r.price ?? '',      // ví dụ: "1.200.000"
  type: r.type ?? '',
  range: r.range ?? '',      // ví dụ: "450km"
  seats: r.seats ?? '',      // ví dụ: "5 chỗ"
  trunk: r.trunk ?? '',      // ví dụ: "450L"
  status: r.status ?? 'available', // "available" | "rented" | "maintenance"
});

// Map dữ liệu form UI -> VehicleRequest cho backend (raw number + enum)
const mapFormToRequest = (f) => ({
  name: f.name?.trim() ?? '',
  type: f.type ?? '',
  imageUrl: f.image?.trim() || null,
  pricePerDay: toInt(f.price),     // Long
  rangeKm: toInt(f.range),         // Integer
  seats: toInt(f.seats),           // Integer
  trunkLiters: toInt(f.trunk),     // Integer
  status: toApiStatus(f.status),   // enum UPPERCASE
});

// Hiển thị text tiếng Việt cho badge trạng thái
const getStatusText = (status) =>
  ({ rented: 'Đang thuê', available: 'Có sẵn', maintenance: 'Bảo trì' }[status] || 'Có sẵn');

// ================== Form input tái sử dụng ==================
const FormInput = ({ id, label, type = 'text', value, onChange, placeholder, required, options }) => (
  <div className="form-group-improved">
    <label htmlFor={id} className="label-improved">
      {label} {required && <span className="required">*</span>}
    </label>
    {options ? (
      <select id={id} value={value} onChange={onChange} className="select-improved" required={required}>
        {options.map((opt) => (
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

// ================== Component chính ==================
const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]); // dữ liệu từ API
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Dữ liệu form (UI-friendly)
  const emptyForm = {
    name: '',
    image: '',
    price: '',
    type: '',
    range: '',
    seats: '',
    trunk: '',
    status: 'available',
  };
  const [formData, setFormData] = useState(emptyForm);

  // ====== API calls ======
  const loadVehicles = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(VEHICLE_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
      const data = await res.json(); // List<VehicleResponse>
      setVehicles(data.map(mapResponseToUI));
    } catch (e) {
      console.error(e);
      setErr(`Không tải được danh sách xe: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createVehicle = async (payload) => {
    const res = await fetch(VEHICLE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return res.json(); // VehicleResponse
  };

  const updateVehicle = async (id, payload) => {
    const res = await fetch(`${VEHICLE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return res.json(); // VehicleResponse
  };

  const deleteVehicle = async (id) => {
    const res = await fetch(`${VEHICLE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return true;
  };

  // ====== effects ======
  useEffect(() => {
    loadVehicles();
    
  }, []);

  // ====== handlers ======
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const payload = mapFormToRequest(formData);
      // validate tối thiểu
      if (!payload.name || !payload.type || !payload.pricePerDay) {
        throw new Error('Vui lòng nhập Tên xe, Loại xe và Giá thuê.');
      }

      if (editingVehicle?.id) {
        const updated = await updateVehicle(editingVehicle.id, payload);
        setVehicles((prev) =>
          prev.map((v) => (v.id === editingVehicle.id ? mapResponseToUI(updated) : v))
        );
      } else {
        const created = await createVehicle(payload);
        setVehicles((prev) => [mapResponseToUI(created), ...prev]);
      }
      handleCloseModal();
    } catch (e2) {
      console.error(e2);
      setErr(`Lưu dữ liệu thất bại: ${e2.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!id) {
      setErr('Xóa thất bại: id không hợp lệ.');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa xe này?')) return;
    setErr('');
    try {
      await deleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (e) {
      console.error(e);
      setErr(`Xóa thất bại: ${e.message}`);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    // Đưa UI object (đang là chuỗi “xxx km”, “yyyL”, “4 chỗ”) về formData
    setFormData({
      name: vehicle.name || '',
      image: vehicle.image || '',
      price: vehicle.price || '',
      type: vehicle.type || '',
      range: toInt(vehicle.range) || '',
      seats: toInt(vehicle.seats) || '',
      trunk: toInt(vehicle.trunk) || '',
      status: vehicle.status || 'available',
    });
    setShowModal(true);
  };

  const handleAddClick = () => {
    setEditingVehicle(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
    setFormData(emptyForm);
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // ====== render ======
  return (
    <div className="station-list">
      <div className="list-header">
        <h2 className="title-black">Danh sách xe điện ({vehicles.length})</h2>
        <button className="add-btn" onClick={handleAddClick}>
          <Plus size={14} /> Thêm xe mới
        </button>
      </div>

      {err && <div className="error-banner">{err}</div>}
      {loading && <div className="loading-banner">Đang tải…</div>}

      <div className="vehicle-grid">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="vehicle-card">
            <div className="image-container">
              <img
                src={vehicle.image || 'https://via.placeholder.com/180'}
                alt={vehicle.name}
                className="vehicle-image"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/180';
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

            <div className="vehicle-details">
              <p><span className="detail-label">Loại xe:</span> {vehicle.type || '-'}</p>
              <p><span className="detail-label">Quãng đường:</span> {vehicle.range || '-'}</p>
              <p><span className="detail-label">Số chỗ:</span> {vehicle.seats || '-'}</p>
              <p><span className="detail-label">Cốp:</span> {vehicle.trunk || '-'}</p>
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
        {!loading && vehicles.length === 0 && (
          <div style={{ gridColumn: '1/-1', opacity: 0.7 }}>Chưa có dữ liệu xe.</div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content-improved" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-improved">
              <h3 className="modal-title">
                {editingVehicle ? 'Chỉnh sửa thông tin xe' : 'Thêm xe mới'}
              </h3>
              <button className="close-btn-improved" onClick={handleCloseModal}>✕</button>
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
                    placeholder="VD: 450"
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
                      { value: '2', label: '2' },
                      { value: '4', label: '4' },
                      { value: '5', label: '5' },
                      { value: '7', label: '7' },
                    ]}
                  />
                </div>
                <div className="form-row">
                  <FormInput
                    id="trunk"
                    label="Dung tích cốp (L)"
                    value={formData.trunk}
                    onChange={handleInputChange('trunk')}
                    placeholder="VD: 450"
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
                <button type="button" className="btn-cancel-improved" onClick={handleCloseModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit-improved">
                  {editingVehicle ? 'Cập nhật' : 'Thêm mới'}
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
