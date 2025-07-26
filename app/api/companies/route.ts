// // /app/api/companies/route.ts (o usa /pages/api si estás en ese modelo)

// import { NextResponse } from "next/server";
// import { db } from "@/lib/db";
// import { auth } from "@clerk/nextjs";

// export async function GET() {
//   const { userId } = auth();

//   if (!userId) return NextResponse.json([], { status: 200 });

//   const companies = await db.company.findMany({
//     where: { userId },
//     orderBy: { createAt: "desc" },
//   });

//   return NextResponse.json(companies);
// }


