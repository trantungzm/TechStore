import { useEffect, useState } from "react";
import { getProfile } from "../lib/api";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getProfile(2)
      .then((row) => {
        if (!cancelled) setProfile(row);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!profile) {
    return (
      <main className="screen-page">
        <p className={error ? "status-panel error-panel" : "status-panel"}>
          {error || "Dang tai profile..."}
        </p>
      </main>
    );
  }

  return (
    <main className="screen-page">
      <h2 className="section-title">Trang Profile Nguoi Dung</h2>
      <section className="store-card">
        <p>Ten: {profile.name}</p>
        <p>Email: {profile.email}</p>
        <p>SDT: {profile.phone}</p>
        <p>Vai tro: {profile.role}</p>
        <p>Dia chi: {profile.addresses?.[0]?.address || "Chua cap nhat"}</p>
      </section>
    </main>
  );
}

export default ProfilePage;
