import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Public workspace creation is disabled. Please submit a service request.",
    },
    { status: 403 },
  );
}
