import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { stationsData, STATUS_CONFIG, STATUS_OPTIONS } from './stationData.js';
import './StationList.css';

// Sao chép dữ liệu để tránh mutate dữ liệu gốc
let mockStations = [...stationsData];

// API đơn giản để quản lý trạm sạc
const stationAPI = {
  getAll: () => mockStations,
  create: data => {
    const maxId = Math.max(...mockStations.map(s => s.id), 0);
    mockStations.push({ id: maxId + 1, ...data });
  },
  update: (id, data) => {
    const idx = mockStations.findIndex(s => s.id === id);
    if (idx >= 0) mockStations[idx] = { ...mockStations[idx], ...data };
  },
  delete: id => mockStations = mockStations.filter(s => s.id !== id)
};

// Component hiển thị trạng thái trạm sạc
const StationStatus = ({ status }) => {
  const config = STATUS_CONFIG[status];
  // Fallback nếu trạng thái không xác định
  return (
    <span
      className="station-status-indicator"
      style={{
        backgroundColor: config?.color || '#6c757d',
        color: config?.textColor || 'white'
      }}
    >
      {status || 'Không xác định'}
    </span>
  );
};

// Component tái sử dụng cho input/select để tối ưu form
const FormInput = ({ id, label, type = 'text', value, onChange, placeholder, required, options }) => (
  <div className="form-group-improved">
    <label htmlFor={id} className="label-improved">
      {label} {required && <span className="required">*</span>}
    </label>
    {options ? (
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className="select-improved"
        required={required}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    ) : (
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-improved"
        required={required}
        min={type === 'number' ? 1 : undefined}
        max={type === 'number' ? 100 : undefined}
      />
    )}
  </div>
);

// Component chính quản lý danh sách trạm sạc và modal
const StationList = () => {
  // State quản lý danh sách trạm, modal, và dữ liệu form
  const [stations, setStations] = useState(mockStations);
  const [showModal, setShowModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: '',
    status: 'Hoạt động',
    latitude: '',
    longitude: ''
  });

  // Load dữ liệu ban đầu khi component mount
  useEffect(() => setStations(stationAPI.getAll()), []);

  // Xử lý thay đổi input với validation
  const handleInputChange = e => {
    const { name, value } = e.target;
    if (name === 'capacity') {
      const numValue = parseInt(value);
      if (value && (isNaN(numValue) || numValue < 1)) return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý submit form (thêm hoặc cập nhật trạm)
  const handleSubmit = e => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.capacity || !formData.latitude || !formData.longitude) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    const submitData = {
      ...formData,
      capacity: parseInt(formData.capacity),
      status: formData.status || 'Hoạt động',
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude)
    };
    editingStation ? stationAPI.update(editingStation.id, submitData) : stationAPI.create(submitData);
    setStations(stationAPI.getAll());
    closeModal();
  };

  // Mở modal chỉnh sửa trạm
  const handleEdit = station => {
    setEditingStation(station);
    setFormData({
      name: station.name || '',
      address: station.address || '',
      capacity: station.capacity?.toString() || '',
      status: station.status || 'Hoạt động',
      latitude: station.latitude?.toString() || '',
      longitude: station.longitude?.toString() || ''
    });
    setShowModal(true);
  };

  // Xóa trạm với xác nhận
  const handleDelete = id => {
    if (window.confirm('Bạn có chắc chắn muốn xóa trạm này?')) {
      stationAPI.delete(id);
      setStations(stationAPI.getAll());
    }
  };

  // Mở modal thêm trạm mới
  const openCreateModal = () => {
    setEditingStation(null);
    setFormData({
      name: '',
      address: '',
      capacity: '',
      status: 'Hoạt động',
      latitude: '',
      longitude: ''
    });
    setShowModal(true);
  };

  // Đóng modal và reset form
  const closeModal = () => {
    setShowModal(false);
    setEditingStation(null);
    setFormData({ name: '', address: '', capacity: '', status: 'Hoạt động', latitude: '', longitude: '' });
  };

  // Render giao diện
  return (
    <div className="station-list">
      {/* Header với tiêu đề và nút thêm trạm */}
      <div className="list-header">
        <h2 className="title-black">Danh sách trạm sạc ({stations.length})</h2>
        <button className="add-btn" onClick={openCreateModal}>
          <Plus size={14} /> Thêm trạm mới
        </button>
      </div>

      {/* Bảng hiển thị danh sách trạm sạc */}
      <div className="stations-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên trạm</th>
              <th>Địa chỉ</th>
              <th>Sức chứa</th>
              <th>Trạng thái</th>
              <th>Kinh độ</th>
              <th>Vĩ độ</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {stations.map(station => (
              <tr key={station.id}>
                <td className="centered-text">{station.id}</td>
                <td className="centered-text nowrap">{station.name}</td>
                <td className="centered-text nowrap">{station.address}</td>
                <td className="centered-text nowrap">{station.capacity} xe</td>
                <td className="centered-text nowrap"><StationStatus status={station.status} /></td>
                <td className="centered-text nowrap">{station.longitude?.toFixed(6)}</td>
                <td className="centered-text nowrap">{station.latitude?.toFixed(6)}</td>
                <td>
                  <div className="station-actions">
                    <button className="btn-edit" onClick={() => handleEdit(station)}>
                      <Edit size={16} /> Sửa
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(station.id)}>
                      <Trash2 size={16} /> Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa trạm */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-content-improved">
            <div className="modal-header-improved">
              <h3 className="modal-title">
                {editingStation ? 'Chỉnh sửa trạm' : 'Thêm trạm mới'}
              </h3>
              <button className="close-btn-improved" onClick={closeModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="station-form-improved">
              <div className="form-section">
                <h4 className="section-title">Thông tin cơ bản</h4>
                <div className="form-row">
                  <FormInput
                    id="name"
                    label="Tên trạm"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="VD: Trạm VinFast Quận 1"
                    required
                  />
                  <FormInput
                    id="address"
                    label="Địa chỉ"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="VD: 123 Nguyễn Huệ, Q1"
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title">Thông số kỹ thuật</h4>
                <div className="form-row">
                  <FormInput
                    id="capacity"
                    label="Sức chứa (xe)"
                    type="number"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="VD: 20"
                    required
                  />
                  <FormInput
                    id="status"
                    label="Trạng thái"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    options={STATUS_OPTIONS}
                  />
                </div>
              </div>

              <div className="form-section">
                <h4 className="section-title">Tọa độ</h4>
                <div className="form-row">
                  <FormInput
                    id="longitude"
                    label="Kinh độ"
                    type="number"
                    step="0.000001"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="VD: 106.7000"
                    required
                  />
                  <FormInput
                    id="latitude"
                    label="Vĩ độ"
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="VD: 10.7700"
                    required
                  />
                </div>
              </div>

              <div className="form-actions-improved">
                <button type="button" className="btn-cancel-improved" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit-improved">
                  {editingStation ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationList;