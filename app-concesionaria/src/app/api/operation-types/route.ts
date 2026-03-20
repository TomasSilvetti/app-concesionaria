import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { OPERATION_TYPES } from "@/lib/operation-types";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  return NextResponse.json({ types: OPERATION_TYPES });
}
