import { NextRequest, NextResponse } from "next/server";
// import { checkUserRole } from "@/lib/auth/checkUserRole";
import { formatApiMessage } from "@/lib/utils/formatters";

// export async function requireAdmin(req: NextRequest) {
//   return await checkUserRole(req, ["ADMINISTRADOR"]);
// }

export function handleError(error: unknown) {
  console.error(error);
  return NextResponse.json(
    { error: formatApiMessage("errors.internal") },
    { status: 500 }
  );
}
