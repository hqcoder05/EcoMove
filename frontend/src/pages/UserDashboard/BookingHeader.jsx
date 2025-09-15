import React from 'react';
import { FaMotorcycle, FaCar, FaChargingStation } from 'react-icons/fa';

const BookingHeader = () => {
  return (
    <div style={{
      backgroundColor: '#d0e8f2',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <input
        type="text"
        placeholder="Tìm địa điểm..."
        style={{
          flex: 1,
          padding: '0.5rem',
          borderRadius: '8px',
          border: '1px solid #ccc',
          marginRight: '1rem'
        }}
      />
      <FaMotorcycle size={24} style={{ margin: '0 10px', cursor: 'pointer' }} />
      <FaCar size={24} style={{ margin: '0 10px', cursor: 'pointer' }} />
      <FaChargingStation size={24} style={{ margin: '0 10px', cursor: 'pointer' }} />
    </div>
  );
};

export default BookingHeader;
