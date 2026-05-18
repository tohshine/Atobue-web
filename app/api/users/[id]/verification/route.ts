import { NextResponse } from "next/server";
import { updateUserVerificationInStore, UserVerificationStatus } from "../../store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  const body = (await request.json()) as { status?: UserVerificationStatus };
  const status = body.status;

  if (!status || !["pending", "approved", "denied"].includes(status)) {
    return NextResponse.json({ error: "Invalid verification status." }, { status: 400 });
  }

  const updated = updateUserVerificationInStore(id, status);
  if (!updated) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({ user: updated });
}
