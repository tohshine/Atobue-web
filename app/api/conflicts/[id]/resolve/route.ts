import { NextResponse } from "next/server";
import { resolveConflictInStore } from "../../store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as { source?: string };
  const source = body.source?.trim();

  if (!source) {
    return NextResponse.json({ error: "Source is required." }, { status: 400 });
  }

  const result = resolveConflictInStore(id, source);
  if (result === null) {
    return NextResponse.json({ error: "Conflict not found." }, { status: 404 });
  }
  if (result === false) {
    return NextResponse.json({ error: "Invalid source for this conflict." }, { status: 400 });
  }

  return NextResponse.json({ conflict: result });
}
