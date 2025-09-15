import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const PaymentPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:8080/bookings/${bookingId}/payments`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error("Không thể tải danh sách thanh toán");
        const data = await res.json();
        setPayments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchPayments();
    }
  }, [bookingId]);

  const handlePayCash = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/bookings/${bookingId}/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 150000, // số tiền từ booking (có thể fetch booking để lấy)
          currency: "VND",
          method: "CASH",
          description: "Thanh toán tại quầy",
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      if (!res.ok) throw new Error("Không thể tạo payment");
      const newPayment = await res.json();
      setPayments([...payments, newPayment]);
      alert("Thanh toán tiền mặt thành công!");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div>Đang tải thanh toán...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h2>Thanh toán cho đơn #{bookingId}</h2>

      <button onClick={handlePayCash} style={{ marginBottom: "20px" }}>
        💰 Thanh toán tiền mặt
      </button>

      <h3>Lịch sử thanh toán</h3>
      {payments.length === 0 ? (
        <p>Chưa có giao dịch thanh toán nào.</p>
      ) : (
        <table border="1" cellPadding="8" width="100%">
          <thead>
            <tr>
              <th>Mã Payment</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.paymentId}>
                <td>{p.paymentId}</td>
                <td>{p.amount.toLocaleString()} {p.currency}</td>
                <td>{p.method}</td>
                <td>{p.status}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button style={{ marginTop: "20px" }} onClick={() => navigate("/dashboard")}>
        ← Quay lại Dashboard
      </button>
    </div>
  );
};

export default PaymentPage;
