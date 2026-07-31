import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode },
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : "Internal server error" },
    { status: 500 },
  );
}
