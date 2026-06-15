import { NextResponse } from "next/server";
import type { ResolutionAction } from "@/lib/types";
import { resolveConflictInStore } from "../../store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const VALID_ACTIONS: ResolutionAction[] = [
  "refund_commitment",
  "dismiss_report",
  "escalate",
];

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as { action?: ResolutionAction; notes?: string };
  const action = body.action;
  const notes = body.notes?.trim();

  if (!action || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "A valid resolution action is required." }, { status: 400 });
  }

  const result = resolveConflictInStore(id, action, notes);
  if (result === null) {
    return NextResponse.json({ error: "Conflict ticket not found." }, { status: 404 });
  }
  if (result === false) {
    return NextResponse.json({ error: "This ticket has already been resolved." }, { status: 400 });
  }

  return NextResponse.json({ conflict: result });
}
