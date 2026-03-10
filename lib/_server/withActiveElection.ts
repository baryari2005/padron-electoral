import { NextRequest, NextResponse } from "next/server";
import { getActiveElection } from "@/lib/elections/getActiveElection";
import { formatApiMessage } from "@/lib/utils/formatters";

type Context = {
  params?: Record<string, string>;
};

type HandlerWithElection = (
  req: NextRequest,
  context: Context & {
    election: NonNullable<Awaited<ReturnType<typeof getActiveElection>>>;
  }
) => Promise<NextResponse>;

export function withActiveElection(handler: HandlerWithElection) {
  return async function (
    req: NextRequest,
    context: Context
  ): Promise<NextResponse> {
    const election = await getActiveElection();

    if (!election) {
      return NextResponse.json(
        { error: formatApiMessage("errors.electionNotFound") },
        { status: 409 }
      );
    }

    return handler(req, { ...context, election });
  };
}