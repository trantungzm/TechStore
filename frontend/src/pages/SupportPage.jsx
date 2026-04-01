import { useEffect, useState } from "react";
import { getSupportTickets } from "../lib/api";

function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getSupportTickets()
      .then((rows) => {
        if (!cancelled) setTickets(rows);
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
      <h2 className="section-title">Trang Ho Tro</h2>
      {error ? <p className="status-panel error-panel">{error}</p> : null}
      <div className="card-grid">
        {tickets.map((ticket) => (
          <article key={ticket.id} className="store-card">
            <h4>{ticket.subject}</h4>
            <p>{ticket.message}</p>
            <p>Nguoi gui: {ticket.user_name || "N/A"}</p>
            <p>Trang thai: {ticket.status}</p>
          </article>
        ))}
        {!tickets.length ? <p className="status-panel">Chua co ticket nao.</p> : null}
      </div>
    </main>
  );
}

export default SupportPage;
