import { NextResponse } from "next/server";
import { getConflictsStore } from "./store";

export async function GET() {
  const conflicts = getConflictsStore();
  return NextResponse.json({
    conflicts,
    total: conflicts.length,
    open: conflicts.filter((item) => item.status === "open").length,
    resolved: conflicts.filter((item) => item.status === "resolved").length,
  });
}
