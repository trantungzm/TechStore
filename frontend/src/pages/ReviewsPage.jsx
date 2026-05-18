import { useEffect, useState } from "react";
import { getReviews } from "../lib/api";

function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getReviews()
      .then((rows) => {
        if (!cancelled) setReviews(rows);
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
      <h2 className="section-title">Trang Danh Gia</h2>
      {error ? <p className="status-panel error-panel">{error}</p> : null}
      <div className="card-grid">
        {reviews.map((review) => (
          <article key={review.id} className="store-card">
            <h4>{review.user_name}</h4>
            <p>San pham: {review.product_name}</p>
            <p>So sao: {review.rating}/5</p>
            <p>{review.comment}</p>
            <p>Anh review: {review.image_url || "Khong co"}</p>
          </article>
        ))}
      </div>
    </main>
  );
}

export default ReviewsPage;
