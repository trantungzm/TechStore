import { useEffect, useState } from "react";
import { getCoupons } from "../lib/api";

function PromotionsPage() {
  const [coupons, setCoupons] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getCoupons()
      .then((rows) => {
        if (!cancelled) setCoupons(rows);
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
      <h2 className="section-title">Trang Khuyen Mai</h2>
      {error ? <p className="status-panel error-panel">{error}</p> : null}
      <div className="card-grid">
        {coupons.map((coupon) => (
          <article key={coupon.code} className="store-card">
            <h4>{coupon.code}</h4>
            <p>Gia tri giam: {coupon.discount}</p>
            <p>Han su dung: {String(coupon.expired_at).slice(0, 10)}</p>
          </article>
        ))}
      </div>
    </main>
  );
}

export default PromotionsPage;
