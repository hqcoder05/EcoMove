import React from 'react';
import EVBookingForm from './EVBookingForm';
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleSearch = (data) => {
    console.log("Tìm xe với thông tin:", data);
  };

  return ( 
    <div
      style={{
        backgroundColor: "#A5D6A7",
        minHeight: "100vh",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <EVBookingForm onSearch={handleSearch} />  
    </div>
  );
};

export default UserDashboard;
