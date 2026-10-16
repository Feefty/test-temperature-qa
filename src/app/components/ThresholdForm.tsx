"use client";

import { useEffect, useState } from "react";

export function ThresholdForm() {
  const [coldMax, setColdMax] = useState("");
  const [hotMin, setHotMin] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/thresholds")
      .then((res) => {
        // FIX #12 : une erreur au chargement était ignorée (champs vides sans explication).
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setColdMax(String(data.coldMax));
        setHotMin(String(data.hotMin));
      })
      .catch(() => {
        setMessage({ type: "error", text: "Unable to load thresholds." });
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // FIX #10 : un champ vide donnait parseFloat("") → NaN → envoyé comme null → 500 côté serveur.
    if (coldMax.trim() === "" || hotMin.trim() === "") {
      setMessage({ type: "error", text: "Both thresholds are required." });
      return;
    }

    setSaving(true);

    // FIX #9 : sans try/finally, si res.json() échouait (réponse 500 non-JSON),
    // setSaving(false) n'était jamais appelé → bouton bloqué sur "Saving..." pour toujours.
    try {
      const res = await fetch("/api/thresholds", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coldMax: parseFloat(coldMax), hotMin: parseFloat(hotMin) }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Thresholds updated successfully." });
      } else {
        setMessage({ type: "error", text: data.error });
      }
    } catch {
      setMessage({ type: "error", text: "Unable to save thresholds. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <div className="form-field">
          <label htmlFor="coldMax">Cold Max (°C)</label>
          <input
            id="coldMax"
            type="number"
            step="0.1"
            value={coldMax}
            onChange={(e) => setColdMax(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="hotMin">Hot Min (°C)</label>
          <input
            id="hotMin"
            type="number"
            step="0.1"
            value={hotMin}
            onChange={(e) => setHotMin(e.target.value)}
          />
        </div>
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      {message && (
        <div className={`message message--${message.type}`} aria-live="polite" role="alert">
          {message.text}
        </div>
      )}
    </form>
  );
}
