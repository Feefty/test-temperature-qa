import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const thresholds = await prisma.threshold.findUniqueOrThrow({
    where: { id: "singleton" },
  });

  return NextResponse.json({
    coldMax: thresholds.coldMax,
    hotMin: thresholds.hotMin,
  });
}

export async function PUT(request: NextRequest) {
  // FIX #4 : un corps qui n'est pas du JSON valide faisait planter request.json() → 500.
  
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON", statusCode: 400 },
      { status: 400 }
    );
  }

  // FIX #1/#2/#3 : body peut valoir null (JSON "null") → on évite le crash à la déstructuration.
  const { coldMax, hotMin } = (body ?? {}) as Record<string, unknown>;

  // FIX #1/#2/#3 : aucune vérification de type avant. Conséquences :

  if (
    typeof coldMax !== "number" || !Number.isFinite(coldMax) ||
    typeof hotMin !== "number" || !Number.isFinite(hotMin)
  ) {
    return NextResponse.json(
      { error: "coldMax and hotMin are required and must be numbers", statusCode: 400 },
      { status: 400 }
    );
  }

  if (coldMax >= hotMin) {
    return NextResponse.json(
      { error: "coldMax must be strictly less than hotMin", statusCode: 400 },
      { status: 400 }
    );
  }

  // FIX #5 : erreur d'arrondi des flottants. 2.3 - 0.3 = 1.9999999999999998 < 2 → écart valide rejeté.
 
  if (Math.round((hotMin - coldMax) * 1000) / 1000 < 2) {
    return NextResponse.json(
      { error: "Minimum gap between coldMax and hotMin must be 2°C", statusCode: 400 },
      { status: 400 }
    );
  }

  const updated = await prisma.threshold.update({
    where: { id: "singleton" },
    data: { coldMax, hotMin },
  });

  return NextResponse.json({
    coldMax: updated.coldMax,
    hotMin: updated.hotMin,
  });
}
