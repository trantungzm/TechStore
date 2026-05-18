import { useEffect, useState } from "react";
import { getRecommendations } from "../lib/api";

function RecommendationsPage() {
  const [data, setData] = useState({ viewed_products: [], search_history: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getRecommendations(2)
      .then((rows) => {
        if (!cancelled) setData(rows);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="screen-page detail-layout">
      {error ? <p className="status-panel error-panel">{error}</p> : null}
      <section className="store-card">
        <h2 className="section-title">San pham da xem</h2>
        {data.viewed_products.map((item) => (
          <p key={`${item.id}-${item.viewed_at}`}>{item.name}</p>
        ))}
      </section>
      <section className="store-card">
        <h2 className="section-title">Tim kiem gan day</h2>
        {data.search_history.map((keyword) => (
          <p key={`${keyword.keyword}-${keyword.created_at}`}>{keyword.keyword}</p>
        ))}
      </section>
    </main>
  );
}

export default RecommendationsPage;
