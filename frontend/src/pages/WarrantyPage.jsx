import { useEffect, useState } from "react";
import { getWarranties } from "../lib/api";

function WarrantyPage() {
  const [warranties, setWarranties] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getWarranties()
      .then((rows) => {
        if (!cancelled) setWarranties(rows);
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
      <h2 className="section-title">Trang Bao Hanh</h2>
      {error ? <p className="status-panel error-panel">{error}</p> : null}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Serial</th>
              <th>Thoi gian bao hanh</th>
              <th>Nguoi dung</th>
              <th>Trang thai</th>
            </tr>
          </thead>
          <tbody>
            {warranties.map((item) => (
              <tr key={item.id}>
                <td>{item.serial_number}</td>
                <td>
                  {String(item.start_date).slice(0, 10)} - {String(item.end_date).slice(0, 10)}
                </td>
                <td>{item.user_name || "N/A"}</td>
                <td>{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default WarrantyPage;
