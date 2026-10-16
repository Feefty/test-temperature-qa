"use client";

import { useState } from "react";
import { TemperatureDisplay } from "./TemperatureDisplay";
import { SensorState } from "@/lib/types";

interface CaptureResult {
  temperature: number;
  state: SensorState;
}

interface CaptureButtonProps {
  onCapture: () => void;
}

export function CaptureButton({ onCapture }: CaptureButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CaptureResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/temperature/capture", { method: "POST" });
      // FIX #11 : res.ok n'était jamais vérifié. Une réponse d'erreur JSON (sans "state")
      
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult({ temperature: data.temperature, state: data.state });
      onCapture();
    } catch {
      setResult(null);
      // FIX #11 : l'échec était silencieux → on informe l'utilisateur.
      setError("Capture failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        className="btn-primary"
        onClick={handleCapture}
        disabled={loading}
        aria-label="Capture temperature"
      >
        {loading ? "Capturing..." : "Capture Temperature"}
      </button>
      {result && (
        <div className="capture-result" aria-live="polite">
          <TemperatureDisplay temperature={result.temperature} state={result.state} />
        </div>
      )}
      {error && (
        <div className="message message--error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
