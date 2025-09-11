// src/pages/StationList.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Trash2, Plus } from 'lucide-react';
import { STATUS_CONFIG, STATUS_OPTIONS } from './stationData.js';
import './StationList.css';

// =============== Cấu hình API ===============
const API_BASE = 'http://localhost:8080/api'; // khớp application.yml (context-path: /api)
const STATION_URL = `${API_BASE}/stations`;

// =============== Helpers chung ===============
const toInt = (v) => {
  if (v == null || v === '') return null;
  const n = Number(String(v).replace(/[^\d\-]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const toFloat = (v) => {
  if (v == null || v === '') return null;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(n) ? n : null;
};
const fmtCoord = (v) => (Number.isFinite(v) ? v.toFixed(6) : '-');

// Map EN⇄VI cho status
const API_TO_UI_STATUS = {
  ACTIVE: 'Hoạt động',
  MAINTENANCE: 'Bảo trì',
  FULL: 'Đầy chỗ',
  INACTIVE: 'Tạm dừng',
};
const UI_TO_API_STATUS = {
  'Hoạt động': 'ACTIVE',
  'Bảo trì': 'MAINTENANCE',
  'Đầy chỗ': 'FULL',
  'Tạm dừng': 'INACTIVE',
};

// Map entity từ BE -> UI row (ÉP SỐ cho lat/lon)
const mapStationFromApi = (r) => {
  const lat = r.lat ?? r.latitude ?? null;
  const lon = r.lon ?? r.longitude ?? null;
  return {
    id: r.stationId || r.id || r.uuid,                 // UUID dùng nội bộ (không hiển thị)
    name: r.stationName ?? r.name ?? '',
    address: r.address ?? '',
    capacity: r.totalSlots ?? r.capacity ?? 0,
    status: API_TO_UI_STATUS[r.status] || r.status || 'Hoạt động',
    latitude: lat != null ? Number(lat) : null,        // number | null
    longitude: lon != null ? Number(lon) : null,       // number | null
    availableSlots: r.availableSlots ?? null,
  };
};

// Map dữ liệu form -> payload gửi BE (ĐÚNG key BE)
const mapFormToRequest = (f, editingRow) => {
  const total = toInt(f.capacity);
  const available = editingRow?.availableSlots != null ? editingRow.availableSlots : total;
  return {
    stationName: f.name?.trim() ?? '',
    address: f.address?.trim() ?? '',
    totalSlots: total,
    availableSlots: available,
    status: UI_TO_API_STATUS[f.status] || 'ACTIVE',
    lat: toFloat(f.latitude),
    lon: toFloat(f.longitude),
  };
};

// =============== API client ===============
const stationAPI = {
  async getPaged(page = 0, size = 20) {
    const res = await fetch(`${STATION_URL}?page=${page}&size=${size}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const data = await res.json();
    const content = Array.isArray(data.content) ? data.content.map(mapStationFromApi) : [];
    return {
      content,
      totalElements: data.totalElements ?? content.length,
      totalPages: data.totalPages ?? 1,
      page: data.number ?? page,
      size: data.size ?? size,
      empty: data.empty ?? content.length === 0,
    };
  },

  async create(payload) {
    const res = await fetch(STATION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const data = await res.json();
    return mapStationFromApi(data);
  },

  async update(id, payload) {
    const res = await fetch(`${STATION_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const data = await res.json();
    return mapStationFromApi(data);
  },

  async delete(id) {
    const res = await fetch(`${STATION_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return true;
  },
};

// =============== UI components nhỏ ===============
const StationStatus = ({ status }) => {
  const config = STATUS_CONFIG[status] || {};
  return (
    <span
      className="station-status-indicator"
      style={{ backgroundColor: config.color || '#6c757d', color: config.textColor || 'white' }}
      title={status || 'Không xác định'}
    >
      {status || 'Không xác định'}
    </span>
  );
};

const FormInput = ({ id, label, type = 'text', value, onChange, placeholder, required, options, step }) => (
  <div className="form-group-improved">
    <label htmlFor={id} className="label-improved">
      {label} {required && <span className="required">*</span>}
    </label>
    {options ? (
      <select id={id} name={id} value={value} onChange={onChange} className="select-improved" required={required}>
        {options.map((opt) => (
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
        step={step}
      />
    )}
  </div>
);

// =============== Component chính ===============
const StationList = () => {
  // danh sách + phân trang
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // modal & form
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const emptyForm = {
    name: '',
    address: '',
    capacity: '',
    status: STATUS_OPTIONS?.[0] || 'Hoạt động',
    latitude: '',
    longitude: '',
  };
  const [formData, setFormData] = useState(emptyForm);

  const pageLabel = useMemo(() => `${page + 1} / ${Math.max(totalPages, 1)}`, [page, totalPages]);

  // ====== load list ======
  const loadStations = async (p = page, s = size) => {
    setLoading(true);
    setErr('');
    try {
      const data = await stationAPI.getPaged(p, s);
      setRows(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setPage(data.page);
      setSize(data.size);
    } catch (e) {
      console.error(e);
      setErr(`Không tải được danh sách trạm: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations(0, size);
    
  }, [size]);

  // ====== handlers ======
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'capacity') {
      const n = toInt(value);
      if (value !== '' && (n == null || n < 0)) return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const payload = mapFormToRequest(formData, editing);
      if (!payload.stationName || !payload.address || payload.totalSlots == null || payload.lat == null || payload.lon == null) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc.');
      }

      if (editing?.id) {
        const updated = await stationAPI.update(editing.id, payload);
        setRows((prev) => prev.map((r) => (r.id === editing.id ? updated : r)));
      } else {
        const created = await stationAPI.create(payload);
        setRows((prev) => [created, ...prev]);
        setTotalElements((t) => t + 1);
      }
      closeModal();
    } catch (e2) {
      console.error(e2);
      setErr(`Lưu thất bại: ${e2.message}`);
    }
  };

  const handleEdit = (row) => {
    setEditing(row);
    setFormData({
      name: row.name || '',
      address: row.address || '',
      capacity: row.capacity?.toString() || '',
      status: row.status || (STATUS_OPTIONS?.[0] || 'Hoạt động'),
      latitude: row.latitude != null ? String(row.latitude) : '',
      longitude: row.longitude != null ? String(row.longitude) : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!id) {
      setErr('Xóa thất bại: id không hợp lệ.');
      return;
    }
    if (!window.confirm('Bạn có chắc chắn muốn xóa trạm này?')) return;
    setErr('');
    try {
      await stationAPI.delete(id);
      const remaining = rows.filter((r) => r.id !== id).length;
      if (remaining === 0 && page > 0) {
        await loadStations(page - 1, size);
      } else {
        setRows((prev) => prev.filter((r) => r.id !== id));
        setTotalElements((t) => Math.max(0, t - 1));
      }
    } catch (e) {
      console.error(e);
      setErr(`Xóa thất bại: ${e.message}`);
    }
  };

  const openCreateModal = () => {
    setEditing(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData(emptyForm);
  };

  const gotoPrev = () => {
    if (page <= 0) return;
    loadStations(page - 1, size);
  };
  const gotoNext = () => {
    if (page + 1 >= totalPages) return;
    loadStations(page + 1, size);
  };

  // =============== render ===============
  return (
    <div className="station-list">
      <div className="list-header">
        <h2 className="title-black">Danh sách trạm sạc ({totalElements})</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label className="label-improved" htmlFor="pageSize">Mỗi trang:</label>
          <select
            id="pageSize"
            className="select-improved"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {[5,10,20,50,100].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="add-btn" onClick={openCreateModal}>
            <Plus size={14} /> Thêm trạm mới
          </button>
        </div>
      </div>

      {err && <div className="error-banner">{err}</div>}
      {loading && <div className="loading-banner">Đang tải…</div>}

      <div className="stations-table">
        <table>
          <thead>
            <tr>
              <th>ID</th> {/* STT tăng dần theo trang */}
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
            {rows.map((station, idx) => (
              <tr key={station.id}>
                {/* STT: tính từ page & size */}
                <td className="centered-text">{page * size + idx + 1}</td>

                <td className="centered-text nowrap">{station.name}</td>
                <td className="centered-text nowrap">{station.address}</td>
                <td className="centered-text nowrap">{station.capacity} xe</td>
                <td className="centered-text nowrap">
                  <StationStatus status={station.status} />
                </td>
                <td className="centered-text nowrap">{fmtCoord(station.longitude)}</td> {/* lon */}
                <td className="centered-text nowrap">{fmtCoord(station.latitude)}</td>  {/* lat */}
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
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', opacity: 0.7, padding: 16 }}>
                  Chưa có dữ liệu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-bar">
        <button className="btn-outline" onClick={gotoPrev} disabled={page <= 0}>
          ◀ Trang trước
        </button>
        <span style={{ minWidth: 80, textAlign: 'center' }}>{pageLabel}</span>
        <button className="btn-outline" onClick={gotoNext} disabled={page + 1 >= totalPages}>
          Trang sau ▶
        </button>
      </div>

      {/* Modal thêm/sửa trạm */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-content-improved">
            <div className="modal-header-improved">
              <h3 className="modal-title">{editing ? 'Chỉnh sửa trạm' : 'Thêm trạm mới'}</h3>
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
                    options={STATUS_OPTIONS /* ['Hoạt động','Bảo trì','Đầy chỗ','Tạm dừng'] */}
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
                    placeholder="VD: 106.700000"
                    required
                  />
                  <FormInput
                    id="latitude"
                    label="Vĩ độ"
                    type="number"
                    step="0.000001"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="VD: 10.770000"
                    required
                  />
                </div>
              </div>

              <div className="form-actions-improved">
                <button type="button" className="btn-cancel-improved" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn-submit-improved">
                  {editing ? 'Cập nhật' : 'Thêm mới'}
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
