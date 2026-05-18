import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderDetail } from "../lib/api";

function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getOrderDetail(id)
      .then((data) => {
        if (!cancelled) {
          setOrder(data.order);
          setItems(data.items);
          setTimeline(data.timeline);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!order) {
    return (
      <main className="screen-page">
        <p className={error ? "status-panel error-panel" : "status-panel"}>
          {error || "Dang tai chi tiet don hang..."}
        </p>
      </main>
    );
  }

  return (
    <main className="screen-page detail-layout">
      <section className="store-card">
        <h2 className="section-title">Chi Tiet Don Hang #{order.id}</h2>
        {items.map((item) => (
          <p key={item.name}>
            {item.name} - {item.quantity} x {item.price.toLocaleString("vi-VN")} VND
          </p>
        ))}
      </section>
      <section className="store-card">
        <h3 className="section-title small">Timeline trang thai</h3>
        <ul className="timeline-list">
            {timeline.map((step, index) => (
            <li key={`${step.status}-${index}`}>{step.status}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default OrderDetailPage;
