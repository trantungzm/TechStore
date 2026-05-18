import { useEffect, useState } from "react";
import { getPayments } from "../lib/api";

function PaymentPage() {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getPayments()
      .then((rows) => {
        if (!cancelled) setPayments(rows);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="screen-page">
      <h2 className="section-title">Trang Thanh Toan</h2>
      {error ? <p className="status-panel error-panel">{error}</p> : null}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>So tien</th>
              <th>Phuong thuc</th>
              <th>Trang thai</th>
              <th>Ma giao dich</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>#{payment.order_id}</td>
                <td>{Number(payment.amount).toLocaleString("vi-VN")} VND</td>
                <td>{payment.payment_method}</td>
                <td>{payment.status}</td>
                <td>{payment.transaction_code || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default PaymentPage;
