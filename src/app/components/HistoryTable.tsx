"use client";

import { useEffect, useState } from "react";
import { TemperatureReading } from "@/lib/types";

interface HistoryTableProps {
  refreshKey: number;
}

export function HistoryTable({ refreshKey }: HistoryTableProps) {
  const [readings, setReadings] = useState<TemperatureReading[]>([]);
  // FIX #13 : sans état de chargement, "No readings yet" s'affichait avant la réponse de l'API.
  const [loading, setLoading] = useState(true);
  // FIX #14 : une erreur de l'API était ignorée silencieusement.
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/temperature/history")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setReadings(data.readings);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (error) {
    return (
      <p className="message message--error" role="alert">
        Unable to load history.
      </p>
    );
  }

  if (loading) {
    return <p>Loading history...</p>;
  }

  if (readings.length === 0) {
    return <p>No readings yet. Capture a temperature to get started.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Temperature</th>
          <th>State</th>
          <th>Cold Max</th>
          <th>Hot Min</th>
          <th>Captured At</th>
        </tr>
      </thead>
      <tbody>
        {readings.map((r) => (
          <tr key={r.id}>
            <td>{r.temperature}°C</td>
            <td>
              <span className={`badge badge--${r.state.toLowerCase()}`}>{r.state}</span>
            </td>
            <td>{r.coldMax}°C</td>
            <td>{r.hotMin}°C</td>
            {/* FIX #15 : toLocaleString() sans locale → format différent selon le navigateur.
                On fixe la locale pour un affichage cohérent. */}
            <td>{new Date(r.capturedAt).toLocaleString("en-GB")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
