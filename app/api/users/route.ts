import { NextResponse } from "next/server";
import { getUsersStore } from "./store";

export async function GET() {
  const users = getUsersStore();
  return NextResponse.json({
    users,
    total: users.length,
  });
}
