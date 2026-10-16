import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readTemperature } from "@/lib/sensor";
import { classifyTemperature } from "@/lib/classifier";

export async function POST() {
  // FIX #7
  let temperature: number;
  try {
    temperature = readTemperature();
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message, statusCode: 500 },
      { status: 500 }
    );
  }

  const thresholds = await prisma.threshold.findUniqueOrThrow({
    where: { id: "singleton" },
  });

  const state = classifyTemperature(temperature, thresholds.coldMax, thresholds.hotMin);

  const reading = await prisma.temperatureReading.create({
    data: {
      temperature,
      state,
      coldMax: thresholds.coldMax,
      hotMin: thresholds.hotMin,
    },
  });

  return NextResponse.json(
    {
      id: reading.id,
      temperature: reading.temperature,
      state: reading.state,
      coldMax: reading.coldMax,
      hotMin: reading.hotMin,
      // FIX #6 : le champ s'appelait "timestamp" ici mais "capturedAt" dans /history → même nom partout.
      capturedAt: reading.capturedAt.toISOString(),
    },
    { status: 201 }
  );
}
