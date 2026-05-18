import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../lib/api";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getOrders()
      .then((rows) => {
        if (!cancelled) setOrders(rows);
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
      <h2 className="section-title">Trang Danh Sach Don Hang</h2>
      {error ? <p className="status-panel error-panel">{error}</p> : null}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Ma don hang</th>
              <th>Tong tien</th>
              <th>Trang thai</th>
              <th>Ngay dat</th>
              <th>Chi tiet</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.total.toLocaleString("vi-VN")} VND</td>
                <td>{order.status}</td>
                <td>{String(order.created_at).slice(0, 10)}</td>
                <td>
                  <Link className="link-inline" to={`/orders/${order.id}`}>
                    Xem
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default OrdersPage;
