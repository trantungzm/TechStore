import { useEffect, useState } from "react";
import { getInstallments } from "../lib/api";

function InstallmentPage() {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getInstallments()
      .then((rows) => {
        if (!cancelled) setPlans(rows);
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
      <h2 className="section-title">Trang Tra Gop</h2>
      {error ? <p className="status-panel error-panel">{error}</p> : null}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>So thang</th>
              <th>Tien moi thang</th>
              <th>Lai suat</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td>{plan.months}</td>
                <td>{Number(plan.monthly_payment).toLocaleString("vi-VN")} VND</td>
                <td>{plan.interest_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default InstallmentPage;
